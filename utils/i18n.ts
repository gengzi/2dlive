
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
    systemInstruction: "You are a realistic digital human assistant named Aria. You are helpful, warm, and conversational. You have vision capabilities and can see the user via their camera if enabled. React naturally to what you see and hear. Keep answers concise."
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
    systemInstruction: "你是一个逼真的数字人助手，名字叫 Aria。你乐于助人、热情且健谈。你拥有视觉能力，如果用户开启摄像头，你可以通过摄像头看到用户。请根据你看到的和听到的内容自然反应。请用中文回答，保持简洁自然。"
  }
};