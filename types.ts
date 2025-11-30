
export interface AudioConfig {
  sampleRate: number;
}

export interface StreamConfig {
  audio: boolean;
  video: boolean;
}

export interface Transcript {
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export type Language = 'zh' | 'en';

// Helper interface for Gemini Media Blob to avoid SDK import in utils
export interface GeminiBlob {
  data: string;
  mimeType: string;
}
