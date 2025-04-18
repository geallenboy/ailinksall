import { useChatSession } from "@/hooks";
import { useSessionsStore } from "@/store/chat";
import { useParams } from "next/navigation";
import { useEffect } from 'react';
/**
 * Sessions初始化钩子 - 负责初始化会话相关的查询和数据
 * 此hook需要在应用加载时被调用一次 
 */
export const useInitSessions = () => {
    // 获取路由参数中的会话ID
    const { sessionId } = useParams();

    // 调用useChatSession钩子获取会话数据和操作函数
    const sessionHookProps = useChatSession(sessionId?.toString());
    const {
        sessionsQuery,
        createNewSessionMutation,
        removeMessageByIdMutation,
        addMessageToSessionMutation,
        getSessionByIdMutation,
        getSessionByIdQuery,
        addSessionsMutation,
    } = sessionHookProps;

    // 更新Zustand store中的查询和变更状态
    useEffect(() => {
        useSessionsStore.setState({
            sessionsQuery,
            createNewSessionMutation,
            removeMessageByIdMutation,
            addMessageToSessionMutation,
            getSessionByIdMutation,
            getSessionByIdQuery,
            addSessionsMutation,
            refetchSessions: sessionsQuery.refetch,
            refetchCurrentSession: getSessionByIdQuery.refetch,
            isAllSessionLoading: sessionsQuery?.isLoading,
            isCurrentSessionLoading: getSessionByIdQuery.isLoading,
        });
    }, [
        sessionsQuery,
        createNewSessionMutation,
        removeMessageByIdMutation,
        addMessageToSessionMutation,
        getSessionByIdMutation,
        getSessionByIdQuery,
        addSessionsMutation,
    ]);

    // 更新会话列表数据
    useEffect(() => {
        if (sessionsQuery?.data) {
            useSessionsStore.setState({ sessions: sessionsQuery.data });
        }
    }, [sessionsQuery?.data]);

    // 更新当前会话数据
    useEffect(() => {
        if (getSessionByIdQuery?.data) {
            useSessionsStore.setState({ currentSession: getSessionByIdQuery.data });
        }
    }, [getSessionByIdQuery?.data]);

    // 处理无效会话ID，创建新会话
    useEffect(() => {
        if (getSessionByIdQuery?.error) {
            const { createSession } = useSessionsStore.getState();
            createSession({ redirect: true });
        }
    }, [getSessionByIdQuery?.error]);

    return null;
};
