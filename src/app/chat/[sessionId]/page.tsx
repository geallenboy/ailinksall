"use client";
import { ChatInput } from "@/components/chat/chat/chat-input";
import { Navbar } from "@/components/chat/layout/navbar";
import { ChatMessages } from "@/components/chat/messages/chat-messages";
import Spinner from "@/components/ui/loading-spinner";
import { useSessionStore } from "@/store/chat";

const ChatSessionPage = () => {
  const { isCurrentSessionLoading, isAllSessionLoading } = useSessionStore();

  const renderLoader = () => {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner />
      </div>
    );
  };

  const isLoading = isCurrentSessionLoading || isAllSessionLoading;
  return (
    <div className="w-full h-[100%] bg-white dark:bg-zinc-800 rounded-xl flex flex-row relative overflow-hidden">
      <Navbar />
      {isLoading && renderLoader()}
      {!isLoading && (
        <>
          <ChatMessages />
          <ChatInput />
        </>
      )}
    </div>
  );
};

export default ChatSessionPage;
