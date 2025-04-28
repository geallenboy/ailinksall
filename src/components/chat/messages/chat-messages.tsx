"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { TChatMessage } from "@/types/chat/chat.type";
import { useSessionHooks } from "@/hooks/chat";
import { AIMessage } from "./ai-message";
import { HumanMessage } from "./human-message";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ChatMessages");

export const ChatMessages = memo(() => {
  logger.debug("ChatMessages 渲染");

  const { currentSession } = useSessionHooks();
  const chatContainer = useRef<HTMLDivElement>(null);

  // 使用防抖函数优化滚动
  const scrollToBottom = useCallback(() => {
    if (!chatContainer.current) return;

    // 使用requestAnimationFrame优化滚动性能
    requestAnimationFrame(() => {
      chatContainer.current!.scrollTop = chatContainer.current!.scrollHeight;
    });
  }, []);

  // 监听消息变化自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, scrollToBottom]);

  // 优化消息渲染，避免不必要的重渲染
  const renderMessage = useCallback(
    (message: TChatMessage, isLast: boolean) => {
      return (
        <div className="flex flex-col gap-1 items-end w-full" key={message.id}>
          <HumanMessage chatMessage={message} isLast={isLast} />
          <AIMessage chatMessage={message} isLast={isLast} />
        </div>
      );
    },
    []
  );

  return (
    <div
      className="flex flex-col w-full items-center h-[100dvh] overflow-y-auto no-scrollbar pt-[60px] pb-[200px]"
      ref={chatContainer}
      id="chat-container"
    >
      <div className="w-full md:w-[700px] lg:w-[720px] p-2 flex flex-1 flex-col gap-24">
        <div className="flex flex-col gap-8 w-full items-start">
          {currentSession?.messages?.map((message, index) =>
            renderMessage(
              message,
              currentSession?.messages.length - 1 === index
            )
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessages.displayName = "ChatMessages";
