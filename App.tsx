import React, { useState, useRef, useEffect } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import Avatar from './components/Avatar';
import ChatLog from './components/ChatLog';
import { ConnectionState, Language } from './types';
import { translations } from './utils/i18n';
import { Video, Mic, StopCircle, PlayCircle, AlertCircle, Send, MicOff, Keyboard, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [useVideo, setUseVideo] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  const { 
    connect, 
    disconnect, 
    connectionState, 
    transcripts, 
    audioLevel,
    errorMsg,
    isAudioInputAvailable,
    sendText
  } = useGeminiLive({ language });

  const handleToggleConnect = () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      disconnect();
    } else {
      connect(useVideo);
    }
  };

  const handleSendText = () => {
    if (inputText.trim()) {
        sendText(inputText);
        setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendText();
  };

  const toggleLanguage = () => {
    if (connectionState === ConnectionState.DISCONNECTED) {
        setLanguage(prev => prev === 'en' ? 'zh' : 'en');
    }
  };

  // Focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) {
        inputRef.current.focus();
    }
  }, [showInput]);

  const isConnected = connectionState === ConnectionState.CONNECTED;

  // Connection Status Display Text
  let statusText = t.status.disconnected;
  if (connectionState === ConnectionState.CONNECTED) statusText = t.status.connected;
  if (connectionState === ConnectionState.CONNECTING) statusText = t.status.connecting;
  if (connectionState === ConnectionState.ERROR) statusText = t.status.error;

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center font-sans overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             {/* Deep atmospheric gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-900/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-900/10 rounded-full blur-[150px]" />
            
            {/* Grid overlay for subtle tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        </div>

        {/* Header Status */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
            <h1 className="text-xl font-medium tracking-tight text-white/80">
                {t.title} <span className="text-white/40 text-sm">{t.subtitle}</span>
            </h1>
            <div className="flex items-center gap-2">
                <span className={`block w-1.5 h-1.5 rounded-full ${
                    connectionState === ConnectionState.CONNECTED ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    connectionState === ConnectionState.CONNECTING ? 'bg-amber-500 animate-pulse' : 
                    'bg-zinc-600'
                }`} />
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                    {statusText}
                </span>
            </div>
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button 
                onClick={toggleLanguage}
                disabled={connectionState !== ConnectionState.DISCONNECTED}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium tracking-wide ${
                    connectionState !== ConnectionState.DISCONNECTED 
                    ? 'opacity-50 cursor-not-allowed border-zinc-800 text-zinc-500' 
                    : 'border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
            >
                <Globe size={12} />
                <span>{language === 'en' ? 'EN' : '中'}</span>
            </button>
        </div>

        {/* Main Avatar Area - Adjusted flex-1 to allow space for controls */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full h-full p-4 mb-32">
            <Avatar 
                audioLevel={audioLevel} 
                isConnected={connectionState === ConnectionState.CONNECTED} 
            />
            {/* Chat Logs positioned relative to avatar but below it */}
            <div className="w-full max-w-2xl h-48 relative mt-8">
                 <ChatLog transcripts={transcripts} readyMessage={t.chatLog.ready} />
            </div>
        </div>

        {/* Notification Toast */}
        {errorMsg && (
            <div className="absolute top-20 bg-red-900/80 border border-red-500/30 text-red-200 px-6 py-3 rounded-xl flex items-center gap-3 animate-fade-in backdrop-blur-md z-50 shadow-lg max-w-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
            </div>
        )}

        {/* Mic Status Warning */}
        {connectionState === ConnectionState.CONNECTED && !isAudioInputAvailable && (
             <div className="absolute top-20 bg-amber-900/60 border border-amber-500/30 text-amber-200 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md z-40 text-xs font-medium">
                <MicOff size={14} />
                <span>{t.toast.micUnavailable}</span>
            </div>
        )}


        {/* Interaction Controls */}
        <div className="absolute bottom-0 w-full z-40 flex flex-col items-center pb-8 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent">
            
            {/* Text Input Area (Slide Up) */}
            <div className={`w-full max-w-xl px-4 mb-4 transition-all duration-300 ease-out ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
                <div className={`relative flex items-center backdrop-blur-xl rounded-2xl border transition-all shadow-2xl ${
                    isConnected 
                    ? 'bg-zinc-900/80 border-blue-500/30' 
                    : 'bg-zinc-800/80 border-zinc-700/50 focus-within:border-blue-500/50'
                }`}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isConnected ? t.input.placeholderActive : t.input.placeholderIdle}
                        className="w-full bg-transparent text-white px-4 py-3 rounded-2xl focus:outline-none font-light placeholder-zinc-500"
                    />
                    <button 
                        onClick={handleSendText}
                        className="p-3 mr-1 transition-colors text-zinc-400 hover:text-white"
                    >
                        <Send size={18} />
                    </button>
                </div>
                {isConnected && (
                    <div className="text-center mt-2 text-xs text-zinc-500">
                        {t.input.hint}
                    </div>
                )}
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/5 shadow-2xl">
                
                {/* Toggle Input */}
                <button 
                    onClick={() => setShowInput(!showInput)}
                    className={`p-3 rounded-full transition-all duration-300 ${
                        showInput 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                    title={t.buttons.toggleKeyboard}
                >
                    <Keyboard size={20} />
                </button>

                {/* Video Toggle */}
                <button 
                    onClick={() => connectionState === ConnectionState.DISCONNECTED && setUseVideo(!useVideo)}
                    disabled={connectionState !== ConnectionState.DISCONNECTED}
                    className={`p-3 rounded-full transition-all duration-300 ${
                        useVideo 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                    } ${connectionState !== ConnectionState.DISCONNECTED ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title={connectionState === ConnectionState.DISCONNECTED ? t.buttons.toggleCamera : t.buttons.cameraLocked}
                >
                    <Video size={20} />
                </button>

                <div className="w-px h-6 bg-zinc-700 mx-2" />

                {/* Main Action Button */}
                <button 
                    onClick={handleToggleConnect}
                    className={`flex items-center gap-3 px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-95 ${
                        connectionState === ConnectionState.CONNECTED
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : connectionState === ConnectionState.CONNECTING
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                    }`}
                >
                    {connectionState === ConnectionState.CONNECTED ? (
                        <>
                            <StopCircle size={20} className="animate-pulse" />
                            <span>{t.buttons.endSession}</span>
                        </>
                    ) : connectionState === ConnectionState.CONNECTING ? (
                        <>
                            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            <span>{t.buttons.syncing}</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle size={20} />
                            <span>{t.buttons.connect}</span>
                        </>
                    )}
                </button>
            </div>
            
            {/* Footer Hint */}
            <div className="mt-4 text-xs text-zinc-600 font-medium tracking-wider">
                {t.footer}
            </div>
        </div>
    </div>
  );
};

export default App;