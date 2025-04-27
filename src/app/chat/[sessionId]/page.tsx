"use client";
import { memo, useCallback } from "react";
import { ChatInput } from "@/components/chat/chat/chat-input";
import { Navbar } from "@/components/chat/layout/navbar";
import { ChatMessages } from "@/components/chat/messages/chat-messages";
import Spinner from "@/components/ui/loading-spinner";
import { useSessionStore } from "@/store/chat";
import { useParams } from "next/navigation";

// 使用 memo 优化子组件
const MemoizedChatMessages = memo(ChatMessages);
const MemoizedChatInput = memo(ChatInput);
const MemoizedNavbar = memo(Navbar);

const ChatSessionPage = () => {
  // 直接获取组合后的加载状态
  const isLoading = useSessionStore(
    (state) => state.isCurrentSessionLoading || state.isAllSessionLoading
  );

  const { sessionId } = useParams();

  // 使用 useCallback 缓存渲染函数
  const renderLoader = useCallback(
    () => (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner />
      </div>
    ),
    []
  );

  return (
    <div className="w-full h-[100%] bg-white dark:bg-zinc-800 rounded-xl flex flex-row relative overflow-hidden">
      <MemoizedNavbar />
      {isLoading && renderLoader()}
      {!isLoading && (
        <>
          <MemoizedChatMessages key={`messages-${sessionId}`} />
          <MemoizedChatInput key={`input-${sessionId}`} />
        </>
      )}
    </div>
  );
};

export default ChatSessionPage;
