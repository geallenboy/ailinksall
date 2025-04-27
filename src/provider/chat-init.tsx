"use client";

import { useEffect, useRef } from "react";
import { usePreferenceHooks, useSessionHooks } from "@/hooks/chat";
import { useChatHooks } from "@/hooks/chat/use-chat-hooks";

export function ChatInit() {
  // 直接在组件顶层调用 Hooks
  const sessionHooks = useSessionHooks();
  const preferenceHooks = usePreferenceHooks();
  const chatHooks = useChatHooks();

  // 使用 ref 记录初始化状态
  const initialized = useRef(false);

  useEffect(() => {
    // 在这里执行额外的初始化逻辑（如果需要）
    initialized.current = true;
  }, []);

  // 不渲染任何内容
  return null;
}
