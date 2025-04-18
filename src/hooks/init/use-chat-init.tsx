import { useChatStore } from "@/store/chat";
import { useEffect } from "react";
import { useChatEffects } from "./use-chat-effects";

/**
 * 初始化聊天功能的hook
 * 可以在任何组件中调用一次
 */
export const useChatInit = () => {
  const { initEditor } = useChatStore();

  // 初始化编辑器
  useEffect(() => {
    initEditor();
  }, [initEditor]);

  // 启用副作用监听
  useChatEffects();
};
