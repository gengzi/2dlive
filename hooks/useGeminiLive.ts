import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData, blobToBase64 } from '../utils/audioUtils';
import { Transcript, ConnectionState, Language } from '../types';
import { translations } from '../utils/i18n';

export interface UseGeminiLiveProps {
  language: Language;
}

export const useGeminiLive = ({ language }: UseGeminiLiveProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAudioInputAvailable, setIsAudioInputAvailable] = useState<boolean>(true);

  // Refs for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Video processing refs
  const videoIntervalRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  // Session promise ref for sending data
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Track if the hook is currently "active" (connected or connecting) to prevent race conditions
  const isSessionActiveRef = useRef<boolean>(false);

  const stopAudioPlayback = useCallback(() => {
    // Stop all currently playing audio
    audioQueueRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    audioQueueRef.current = [];
    
    // Reset cursor to current time to avoid large delays when resuming
    if (audioContextRef.current) {
        nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
    setAudioLevel(0);
  }, []);

  const cleanup = useCallback(() => {
    isSessionActiveRef.current = false;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    if (videoElementRef.current) {
        videoElementRef.current.pause();
        videoElementRef.current = null;
    }
    
    stopAudioPlayback();
    
    setConnectionState(ConnectionState.DISCONNECTED);
    setIsAudioInputAvailable(true); // Reset to optimistic true
    setAudioLevel(0);
    sessionPromiseRef.current = null;
  }, [stopAudioPlayback]);

  const connect = useCallback(async (videoEnabled: boolean) => {
    const t = translations[language];

    try {
      isSessionActiveRef.current = true;
      setConnectionState(ConnectionState.CONNECTING);
      setErrorMsg(null);

      // 1. Initialize Audio Output
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 }); 
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      // 2. Try to get User Media (Microphone/Camera)
      let stream: MediaStream | null = null;
      let inputCtx: AudioContext | null = null;
      let canUseMic = true; // Local variable to track availability synchronously

      try {
        const constraints: MediaStreamConstraints = { 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            video: videoEnabled ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } } : false
        };
        
        // Check if cancelled before requesting media
        if (!isSessionActiveRef.current) return;
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Check if cancelled after requesting media
        if (!isSessionActiveRef.current) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }

        streamRef.current = stream;
        
        // Only create input context if we have a stream
        inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputAudioContextRef.current = inputCtx;
        setIsAudioInputAvailable(true);
      } catch (err) {
        if (!isSessionActiveRef.current) return;
        console.warn("Microphone/Camera access denied or device not found.", err);
        setErrorMsg(t.toast.micError);
        canUseMic = false;
        setIsAudioInputAvailable(false);
      }

      // 3. Connect to Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: t.systemInstruction,
      };
      
      // Use local variable canUseMic instead of state to ensure correct config immediately
      if (canUseMic) {
          config.inputAudioTranscription = {};
      }
      
      config.outputAudioTranscription = {};

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config,
        callbacks: {
          onopen: () => {
            if (!isSessionActiveRef.current) return;
            setConnectionState(ConnectionState.CONNECTED);
            
            // Audio Output Resume (browser policy)
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            // Setup Input Processing
            if (stream && inputCtx) {
                // --- Audio Input ---
                const source = inputCtx.createMediaStreamSource(stream);
                inputSourceRef.current = source;
                
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;
                
                processor.onaudioprocess = (e) => {
                    if (!isSessionActiveRef.current) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                source.connect(processor);
                const silence = inputCtx.createGain();
                silence.gain.value = 0;
                processor.connect(silence);
                silence.connect(inputCtx.destination);

                // --- Video Input ---
                if (videoEnabled) {
                     const videoTrack = stream.getVideoTracks()[0];
                     if (videoTrack) {
                         const videoEl = document.createElement('video');
                         videoEl.autoplay = true;
                         videoEl.muted = true;
                         videoEl.srcObject = stream;
                         videoEl.play().catch(e => console.warn("Video play error", e));
                         videoElementRef.current = videoEl;

                         const canvasEl = document.createElement('canvas');
                         canvasEl.width = 640;
                         canvasEl.height = 480;
                         canvasElementRef.current = canvasEl;
                         const ctx = canvasEl.getContext('2d');

                         // Increased framerate to ~5 FPS (200ms) for smoother response
                         videoIntervalRef.current = window.setInterval(async () => {
                             if (!isSessionActiveRef.current || !ctx || !videoEl) return;
                             ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
                             
                             canvasEl.toBlob(async (blob) => {
                                 if (blob && isSessionActiveRef.current) {
                                     const base64 = await blobToBase64(blob);
                                     sessionPromise.then(session => {
                                         session.sendRealtimeInput({ 
                                             media: { 
                                                 mimeType: 'image/jpeg', 
                                                 data: base64 
                                             } 
                                         });
                                     });
                                 }
                             }, 'image/jpeg', 0.5); 
                         }, 200); 
                     }
                }
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
             if (!isSessionActiveRef.current) return;

             // 1. Handle Interruption
             if (msg.serverContent?.interrupted) {
                 stopAudioPlayback();
             }

             // 2. Handle Audio Output
             const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
                 const ctx = audioContextRef.current;
                 const buffer = await decodeAudioData(decode(base64Audio), ctx);
                 
                 const source = ctx.createBufferSource();
                 source.buffer = buffer;
                 source.connect(ctx.destination);
                 
                 // Audio Analysis for Lip Sync
                 const analyzer = ctx.createAnalyser();
                 analyzer.fftSize = 256; 
                 source.connect(analyzer);
                 
                 const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                 
                 const updateLevel = () => {
                     if (!source || !isSessionActiveRef.current) return; 
                     try {
                        analyzer.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for(let i=0; i < dataArray.length; i++) sum += dataArray[i];
                        const avg = sum / dataArray.length;
                        setAudioLevel(avg / 255.0);
                        
                        if (audioQueueRef.current.includes(source)) {
                             requestAnimationFrame(updateLevel);
                        }
                     } catch (e) {
                         // ignore cleanup errors
                     }
                 };
                 
                 source.onended = () => {
                     const idx = audioQueueRef.current.indexOf(source);
                     if (idx > -1) {
                         audioQueueRef.current.splice(idx, 1);
                     }
                     if (audioQueueRef.current.length === 0) {
                         setAudioLevel(0);
                     }
                 };

                 if (nextStartTimeRef.current < ctx.currentTime) {
                     nextStartTimeRef.current = ctx.currentTime;
                 }
                 
                 source.start(nextStartTimeRef.current);
                 
                 // Fix: Use setTimeout to trigger visualization as onstarted is not supported
                 const delay = (nextStartTimeRef.current - ctx.currentTime) * 1000;
                 setTimeout(() => requestAnimationFrame(updateLevel), Math.max(0, delay));
                 
                 nextStartTimeRef.current += buffer.duration;
                 audioQueueRef.current.push(source);
             }
             
             // 3. Handle Transcriptions
             if (msg.serverContent?.outputTranscription) {
                const text = msg.serverContent.outputTranscription.text;
                if (text) {
                    setTranscripts(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === 'model' && !last.isFinal) {
                            return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                        }
                        return [...prev, { role: 'model', text, isFinal: false }];
                    });
                }
             }
             if (msg.serverContent?.turnComplete) {
                 setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                        return [...prev.slice(0, -1), { ...last, isFinal: true }];
                    }
                    return prev;
                 });
             }
             
             if (msg.serverContent?.inputTranscription) {
                 const text = msg.serverContent.inputTranscription.text;
                 if (text) {
                     setTranscripts(prev => {
                         const last = prev[prev.length - 1];
                         if (last && last.role === 'user' && !last.isFinal) {
                             return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                         }
                         return [...prev, { role: 'user', text, isFinal: false }];
                     });
                 }
             }
          },
          onclose: () => {
            console.log("Session closed");
            // Only cleanup if we are still considering this session active
            // This prevents loops if we disconnected manually
            if (isSessionActiveRef.current) {
                cleanup();
            }
          },
          onerror: (err) => {
            console.error("Session error", err);
            if (isSessionActiveRef.current) {
                setConnectionState(ConnectionState.ERROR);
                setErrorMsg(t.toast.connError);
                cleanup();
            }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error: any) {
      console.error("Connection logic failed", error);
      if (isSessionActiveRef.current) {
          setConnectionState(ConnectionState.ERROR);
          setErrorMsg(error.message || t.toast.connError);
          cleanup();
      }
    }
  }, [cleanup, language, isAudioInputAvailable, stopAudioPlayback]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const sendText = useCallback(async (text: string) => {
      // Optimistically update UI
      setTranscripts(prev => [...prev, { role: 'user', text: text, isFinal: true }]);
      
      // CRITICAL: Stop audio immediately to simulate "interruption"
      stopAudioPlayback();

      // Attempt to send to Gemini Live
      if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
              // Note: Live API "text" injection via clientContent turns
              session.send({
                  clientContent: {
                      turns: [{
                          role: 'user',
                          parts: [{ text }]
                      }],
                      turnComplete: true
                  }
              });
          }).catch(e => console.error("Failed to send text", e));
      }
  }, [stopAudioPlayback]);

  // Cleanup on unmount
  useEffect(() => {
      return () => cleanup();
  }, [cleanup]);

  return {
    connect,
    disconnect,
    connectionState,
    transcripts,
    audioLevel,
    errorMsg,
    isAudioInputAvailable,
    sendText
  };
};