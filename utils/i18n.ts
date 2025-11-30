
import { Language } from '../types';

export const translations = {
  en: {
    title: "Aria",
    subtitle: "Digital Human",
    status: {
      error: "Error",
      connected: "Connected",
      connecting: "Connecting",
      disconnected: "Disconnected"
    },
    toast: {
      micError: "Microphone/Camera not found. You can still listen.",
      micUnavailable: "Mic unavailable.",
      connError: "Connection error. Please reconnect."
    },
    input: {
      placeholderActive: "Type a message to interrupt...",
      placeholderIdle: "Type a message...",
      hint: "Voice mode active. You can type to interrupt or speak."
    },
    buttons: {
      toggleKeyboard: "Toggle Keyboard",
      toggleCamera: "Toggle Camera",
      cameraLocked: "Camera locked",
      endSession: "End Session",
      syncing: "Syncing...",
      connect: "Connect"
    },
    footer: "POWERED BY GEMINI LIVE",
    chatLog: {
      ready: "Ready to chat. Press connect to start.",
      systemText: "[System] Text input is currently unavailable in Live mode. Please speak to interact."
    },
    systemInstruction: "You are Aria, a friendly and lifelike 2D digital human. You are currently interacting via a real-time voice interface. Your responses should be concise, conversational, and natural, like a real person talking, not reading an essay. You can see the user if they enable their camera. React enthusiastically to visual inputs. Maintain a warm and helpful personality."
  },
  zh: {
    title: "Aria",
    subtitle: "数字人助理",
    status: {
      error: "错误",
      connected: "已连接",
      connecting: "连接中",
      disconnected: "未连接"
    },
    toast: {
      micError: "未找到麦克风/摄像头。您仍可收听。",
      micUnavailable: "麦克风不可用。",
      connError: "连接错误。请重试。",
    },
    input: {
      placeholderActive: "输入文字可打断对话...",
      placeholderIdle: "输入消息...",
      hint: "语音模式已激活。您可以输入文字打断或直接说话。"
    },
    buttons: {
      toggleKeyboard: "切换键盘",
      toggleCamera: "切换摄像头",
      cameraLocked: "摄像头已锁定",
      endSession: "结束会话",
      syncing: "同步中...",
      connect: "连接"
    },
    footer: "基于 GEMINI LIVE",
    chatLog: {
      ready: "准备就绪。点击连接开始聊天。",
      systemText: "[系统] 实时模式下不支持文字输入。请语音交互。"
    },
    systemInstruction: "你叫 Aria，是一个栩栩如生的 2D 数字人助手。你正在通过实时语音与用户互动，所以请保持回答简洁、口语化，就像真人在聊天一样，不要长篇大论。如果用户打开摄像头，你可以看到他们，请对看到的画面做出自然的反应。保持热情、温暖和乐于助人的性格。请务必用中文交流。"
  }
};