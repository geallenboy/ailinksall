"use client";

import { useEffect } from "react";
import { useSessionHooks } from "@/hooks/chat";
import { useChatHooks } from "@/hooks/chat/use-chat-hooks";

export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const { setCurrentSession, currentSession } = useSessionHooks();
  const { currentMessage, currentTools } = useChatHooks();

  useEffect(() => {
    console.log("currentMessage", currentMessage);
    const props = currentMessage;

    if (props) {
      if (currentSession) {
        const exisingMessage = currentSession.messages.find(
          (message) => message.id === props.id
        );

        let updatedSession;
        if (exisingMessage) {
          updatedSession = {
            ...currentSession,
            messages: currentSession.messages.map((message) => {
              if (message.id === props.id) {
                return { message, ...{ ...props, tools: currentTools } };
              }
              return message;
            }),
          };
        } else {
          updatedSession = {
            ...currentSession,
            messages: [
              ...currentSession.messages,
              { ...props, tools: currentTools },
            ],
          };
        }

        // 更新会话
        setCurrentSession(updatedSession);
      }
    }
  }, [currentMessage, currentTools]);

  return <>{children}</>;
};
