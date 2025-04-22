import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TChatMessage } from "@/types/chat";
import { useSessionStore } from "@/store/chat";
import { useChatSessionQuery } from "../query";

export function useSessionHooks() {
  const { sessionId } = useParams();


  const {
    sessions,
    currentSession,
    isGenerating,
    isAllSessionLoading,
    isCurrentSessionLoading,
    setSessions,
    setCurrentSession,
    setGenerating,
    setAllSessionLoading,
    setCurrentSessionLoading,
  } = useSessionStore();

  // 获取数据处理方法
  const {
    sessionsQuery,
    createNewSessionMutation,
    removeMessageByIdMutation,
    addMessageToSessionMutation,
    getSessionByIdMutation,
    getSessionByIdQuery,
  } = useChatSessionQuery(sessionId?.toString());

  // 监听所有会话数据变化
  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data);
      setAllSessionLoading(sessionsQuery.isLoading);
    }

  }, [
    sessionsQuery.data,
    sessionsQuery.isLoading,
  ]);

  // 监听当前会话数据变化
  useEffect(() => {
    if (getSessionByIdQuery.data) {
      setCurrentSession(getSessionByIdQuery.data);
      setCurrentSessionLoading(getSessionByIdQuery.isLoading);
    }

  }, [
    getSessionByIdQuery.data,
    getSessionByIdQuery.isLoading,

  ]);

  // 如果当前会话不存在，创建新会话
  useEffect(() => {
    if (getSessionByIdQuery.error && sessionId) {
      createSession({ redirect: true });
    }
  }, [getSessionByIdQuery.error, sessionId]);

  // 创建新会话
  const createSession = async (options?: { redirect?: boolean }) => {
    try {
      const newSession = await createNewSessionMutation.mutateAsync(undefined);

      if (options?.redirect && newSession) {
        // 使用客户端导航而不是刷新整个页面
        window.open(`/chat/${newSession.id}`, "_self");
      }

      return newSession;
    } catch (error) {
      console.error("Failed to create session:", error);
      return undefined;
    }
  };

  // 从会话中移除消息
  const removeMessage = async (messageId: string) => {
    if (!currentSession?.id) {
      return;
    }

    try {
      await removeMessageByIdMutation.mutateAsync({
        sessionId: currentSession.id,
        messageId,
      });

      // 重新获取当前会话以刷新数据
      getSessionByIdQuery.refetch();
    } catch (error) {
      console.error("Failed to remove message:", error);
    }
  };

  // 向会话添加消息
  const addMessageToSession = async (
    sessionId: string,
    message: TChatMessage
  ) => {
    try {
      await addMessageToSessionMutation.mutateAsync({
        sessionId,
        message,
      });

    } catch (error) {
      console.error("Failed to add message:", error);
    }
  };

  // 通过ID获取会话
  const getSessionById = async (id: string) => {
    try {
      return await getSessionByIdMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to get session:", error);
      return undefined;
    }
  };



  return {
    sessions,
    currentSession,
    isGenerating,
    isAllSessionLoading,
    isCurrentSessionLoading,
    createSession,
    removeMessage,
    addMessageToSession,
    getSessionById,
    setCurrentSession,
    setGenerating,
    refetchSessions: sessionsQuery.refetch,
    refetchCurrentSession: getSessionByIdQuery.refetch,
  };
}
