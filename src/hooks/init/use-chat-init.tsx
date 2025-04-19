import { useEffect } from "react";
import { useChatStore, useSessionsStore } from "@/store/chat";

/**
 * 初始化聊天功能的hook
 * 可以在任何组件中调用一次
 */
export const useChatInit = () => {
  const { initEditor } = useChatStore();
  const { currentMessage, currentTools } = useChatStore();
  const { setCurrentSession, addMessageToSession } = useSessionsStore();
  // 初始化编辑器
  useEffect(() => {
    initEditor();
  }, [initEditor]);

  // 启用副作用监听
  // 监听当前消息状态变化
  useEffect(() => {
    const props = currentMessage;

    if (props && setCurrentSession) {
      const currentSession = useSessionsStore.getState().currentSession;
      if (!currentSession) return;

      let updatedSession = { ...currentSession };
      const existingMessage = updatedSession.messages.find(
        (message: any) => message.id === props.id
      );

      if (existingMessage) {
        updatedSession = {
          ...updatedSession,
          messages: updatedSession.messages.map((message: any) => {
            if (message.id === props.id) {
              // 修复展开语法
              return {
                ...message, // 注意这里是message而不是{message}
                ...props,
                tools: currentTools,
              };
            }
            return message;
          }),
        };
      } else {
        updatedSession = {
          ...updatedSession,
          messages: [
            ...updatedSession.messages,
            { ...props, tools: currentTools },
          ],
        };
      }

      setCurrentSession(updatedSession);
    }

    if (currentMessage?.stop) {
      currentMessage?.sessionId &&
        addMessageToSession(currentMessage?.sessionId, {
          ...currentMessage,
          isLoading: false,
          tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
        });
      useChatStore.setState({ isGenerating: false });
    }
  }, [currentMessage, currentTools, setCurrentSession, addMessageToSession]);
};
