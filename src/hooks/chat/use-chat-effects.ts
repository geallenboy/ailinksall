import { useChatStore, useSessionsStore } from "@/store/chat";
import { useEffect } from "react";

/**
 * 使用副作用监听当前消息和工具状态变化
 * 此hook需要在应用初始化时调用
 */
export const useChatEffects = () => {
    const { currentMessage, currentTools } = useChatStore();
    const { setCurrentSession, addMessageToSession } = useSessionsStore();

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
                                tools: currentTools
                            };
                        }
                        return message;
                    }),
                };
            } else {
                updatedSession = {
                    ...updatedSession,
                    messages: [...updatedSession.messages, { ...props, tools: currentTools }],
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
