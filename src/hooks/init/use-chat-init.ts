"use client";

import { useEffect } from "react";
import { useChatHooks } from "../chat/use-chat-hooks";


export const ChatInitializer: React.FC = () => {
  const { editor } = useChatHooks();

  // 此组件可以进行任何需要的初始化操作
  useEffect(() => {
    // 初始化操作，例如清空编辑器等
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  return null;
};