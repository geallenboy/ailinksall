import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { TChatMessage } from "@/types/chat";
import { useSessionStore } from "@/store/chat";
import { useChatSessionQuery } from "../query";
import { createLogger } from "@/utils/logger";

// 创建会话管理的日志记录器
const logger = createLogger("useSessionHooks");

export function useSessionHooks() {
  // 使用 useRef 避免重复初始化
  const initialized = useRef(false);

  if (!initialized.current) {
    logger.info("🚀 初始化 useSessionHooks");
  }

  // 记录调用次数以便调试
  const renderCount = useRef(0);
  renderCount.current += 1;
  try {
    const { sessionId } = useParams();
    logger.debug("获取路由参数", { sessionId });
  } catch (error) {
    logger.warn("无法获取路由参数，可能不在路由环境中");
  }

  // 尝试获取路由参数，处理可能的异常
  let sessionId;
  try {
    const params = useParams();
    sessionId = params?.sessionId;
    logger.debug("路由参数获取成功", { sessionId });
  } catch (error) {
    logger.warn("无法获取路由参数，可能不在路由环境中");
  }

  // 使用更细粒度的选择器从 store 获取状态
  logger.debug("获取 store 状态");
  const sessions = useSessionStore(state => state.sessions);
  const currentSession = useSessionStore(state => state.currentSession);
  const isGenerating = useSessionStore(state => state.isGenerating);

  logger.debug("当前状态", {
    sessionsCount: sessions.length,
    currentSessionId: currentSession?.id,
    isGenerating
  });

  // 获取状态更新函数
  logger.debug("获取 store 更新函数");
  const setSessions = useSessionStore(state => state.setSessions);
  const setCurrentSession = useSessionStore(state => state.setCurrentSession);
  const setGenerating = useSessionStore(state => state.setGenerating);
  const setAllSessionLoading = useSessionStore(state => state.setAllSessionLoading);
  const setCurrentSessionLoading = useSessionStore(state => state.setCurrentSessionLoading);

  // 获取数据处理方法
  logger.debug("初始化查询", { sessionId });
  const {
    sessionsQuery,
    createNewSessionMutation,
    removeMessageByIdMutation,
    addMessageToSessionMutation,
    getSessionByIdMutation,
    getSessionByIdQuery,
  } = useChatSessionQuery(sessionId?.toString());
  const currentSessionQuery = getSessionByIdQuery;

  logger.debug("查询状态", {
    sessionsLoading: sessionsQuery?.isLoading,
    sessionsError: !!sessionsQuery?.error,
    currentSessionLoading: currentSessionQuery?.isLoading,
    currentSessionError: !!currentSessionQuery?.error,
  });

  // 监听所有会话数据变化
  useEffect(() => {
    logger.debug("会话数据变化", {
      hasData: !!sessionsQuery?.data,
      count: sessionsQuery?.data?.length
    });

    if (sessionsQuery?.data) {
      logger.info("更新所有会话", { count: sessionsQuery.data.length });
      setSessions(sessionsQuery.data || []);
    }
  }, [sessionsQuery?.data, setSessions]);

  // 监听当前会话数据变化
  useEffect(() => {
    logger.debug("当前会话数据变化", {
      hasData: !!currentSessionQuery?.data,
      id: currentSessionQuery?.data?.id
    });

    if (currentSessionQuery?.data) {
      logger.info("更新当前会话", {
        id: currentSessionQuery.data.id,
        messageCount: currentSessionQuery.data.messages?.length
      });
      setCurrentSession(currentSessionQuery.data || []);
    }
  }, [currentSessionQuery?.data, setCurrentSession]);

  // 监听所有会话加载状态
  useEffect(() => {
    logger.debug("所有会话加载状态变化", {
      isLoading: sessionsQuery?.isLoading
    });

    if (sessionsQuery?.isLoading !== undefined) {
      setAllSessionLoading(sessionsQuery.isLoading);
    }
  }, [sessionsQuery?.isLoading, setAllSessionLoading]);

  // 监听当前会话加载状态
  useEffect(() => {
    logger.debug("当前会话加载状态变化", {
      isLoading: currentSessionQuery?.isLoading
    });

    if (currentSessionQuery?.isLoading !== undefined) {
      setCurrentSessionLoading(currentSessionQuery.isLoading);
    }
  }, [currentSessionQuery?.isLoading, setCurrentSessionLoading]);

  // 如果当前会话不存在，创建新会话
  useEffect(() => {
    if (currentSessionQuery?.error) {
      logger.warn("当前会话不存在或加载失败", {
        error: currentSessionQuery.error
      });
      createSession({ redirect: true });
    }
  }, [currentSessionQuery?.error]);

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

  // 记录完成初始化
  if (!initialized.current) {
    logger.info("✅ useSessionHooks 初始化完成");
    initialized.current = true;
  }

  return {
    sessions,
    currentSession,
    isGenerating,

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
