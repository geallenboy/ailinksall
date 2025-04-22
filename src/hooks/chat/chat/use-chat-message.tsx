"use client";

import { useChatStore } from "@/store/chat/chat-store";

/**
 * 消息处理Hook
 * 负责消息状态的处理、更新和同步
 */
export function useChatMessage() {
  // 获取消息相关状态
  const {
    currentMessage,
    currentTools,
    abortController,

    updateCurrentMessage,
  } = useChatStore();

  /**
   * 停止生成
   * 中止当前进行中的AI请求
   */
  const stopGeneration = () => {
    abortController?.abort("cancel");
  };

  return {
    currentMessage,
    currentTools,
    stopGeneration,
    updateCurrentMessage,
  };
}
