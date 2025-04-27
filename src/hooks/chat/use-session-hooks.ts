import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { TChatMessage } from "@/types/chat";
import { useSessionStore } from "@/store/chat";
import { useChatSessionQuery } from "../query";
import { createLogger } from "@/utils/logger";

// 创建会话管理的日志记录器
const logger = createLogger("useSessionHooks");

export function useSessionHooks() {
  const { sessionId } = useParams();
  const setAllSessionLoading = useSessionStore(state => state.setAllSessionLoading);
  const setCurrentSessionLoading = useSessionStore(state => state.setCurrentSessionLoading);
  const sessions = useSessionStore(state => state.sessions);
  const currentSession = useSessionStore(state => state.currentSession);
  const isGenerating = useSessionStore(state => state.isGenerating);
  const setSessions = useSessionStore(state => state.setSessions);
  const setCurrentSession = useSessionStore(state => state.setCurrentSession);
  const setGenerating = useSessionStore(state => state.setGenerating);

  const {
    sessionsQuery,
    createNewSessionMutation,
    removeMessageByIdMutation,
    addMessageToSessionMutation,
    getSessionByIdMutation,
    getSessionByIdQuery,
  } = useChatSessionQuery(sessionId?.toString());
  const currentSessionQuery = getSessionByIdQuery;


  // 创建新会话 
  const createSession = async (props: { redirect?: boolean }) => {
    const { redirect } = props;
    logger.info("创建新会话", { redirect });

    try {
      await createNewSessionMutation.mutateAsync(undefined, {
        onSuccess: (data) => {
          logger.info("会话创建成功", { id: data.id });
          if (redirect) {
            logger.debug("重定向到新会话");
            window.open(`/chat/${data.id}`, "_self");
          }
        },
        onError: (error) => {
          logger.error("会话创建失败", { error });
        }
      });
    } catch (error) {
      logger.error("会话创建过程出错", { error });
    }
  };

  // 从会话中移除消息
  const removeMessage = (messageId: string) => {
    logger.info("移除消息", { messageId });

    if (!currentSession?.id) {
      logger.warn("无法移除消息，当前无活动会话");
      return;
    }

    try {
      removeMessageByIdMutation.mutate(
        {
          sessionId: currentSession?.id,
          messageId,
        },
        {
          onSuccess: () => {
            logger.info("消息移除成功", { messageId });
            currentSessionQuery?.refetch();
          },
          onError: (error) => {
            logger.error("消息移除失败", { error, messageId });
          }
        }
      );
    } catch (error) {
      logger.error("移除消息过程出错", { error, messageId });
    }
  };

  // 向会话添加消息
  const addMessageToSession = async (
    sessionId: string,
    message: TChatMessage
  ) => {
    logger.info("添加消息到会话", {
      sessionId,
      messageId: message.id,
      messageType: message?.rawHuman ? "人类" : "AI"
    });

    try {
      await addMessageToSessionMutation.mutateAsync({
        sessionId,
        message,
      });
      logger.info("消息添加成功", { messageId: message.id });
    } catch (error) {
      logger.error("消息添加失败", {
        error,
        sessionId,
        messageId: message.id
      });
    }
  };

  // 通过ID获取会话 
  const getSessionById = async (id: string) => {
    logger.info("获取会话", { id });

    try {
      const session = await getSessionByIdMutation.mutateAsync(id);
      logger.info("会话获取成功", {
        id,
        title: session?.title,
        messageCount: session?.messages?.length
      });
      return session;
    } catch (error) {
      logger.error("会话获取失败", { error, id });
      return null;
    }
  };



  return {
    sessions,
    setAllSessionLoading,
    setCurrentSessionLoading,
    currentSession,
    isGenerating,
    setSessions,
    createSession,
    removeMessage,
    addMessageToSession,
    getSessionById,
    setCurrentSession,
    setGenerating,
    refetchSessions: () => {
      logger.debug("手动刷新所有会话");
      return sessionsQuery.refetch();
    },
    refetchCurrentSession: () => {
      logger.debug("手动刷新当前会话");
      return currentSessionQuery.refetch();
    }
  };
}
