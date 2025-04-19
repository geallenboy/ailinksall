import { create } from 'zustand';
import { TChatMessage, TChatSession } from "@/types/chat/chat.type";
import { useChatSessionDB } from "@/hooks";

// 定义会话状态接口
interface SessionState {
    // 会话列表
    sessions: TChatSession[];
    // 当前活跃会话
    currentSession?: TChatSession;
    // 是否正在生成回复
    isGenerating: boolean;
    // 是否加载所有会话中
    isAllSessionLoading: boolean;
    // 是否加载当前会话中
    isCurrentSessionLoading: boolean;

    // 创建新会话
    createSession: (props: { redirect?: boolean }) => Promise<void>;
    // 设置当前会话
    setCurrentSession: (session?: TChatSession) => void;
    // 从会话中移除特定消息
    removeMessage: (messageId: string) => void;
    // 重新获取会话列表
    refetchSessions: () => void;
    // 重新获取当前会话
    refetchCurrentSession: () => void;
    // 向会话添加消息
    addMessageToSession: (sessionId: string, message: TChatMessage) => Promise<void>;
    // 根据ID获取会话
    getSessionById: (id: string) => Promise<TChatSession | undefined>;
    // 设置是否正在生成回复的状态
    setGenerating: (value: boolean) => void;
    // 初始化会话状态
    initializeSessionState: (sessionId?: string) => void;
}

// 创建会话状态存储
export const useSessionStore = create<SessionState>((set, get) => {
    // 获取会话数据库操作函数
    const chatSessionDB = useChatSessionDB();

    return {
        // 初始状态
        sessions: [],
        currentSession: undefined,
        isGenerating: false,
        isAllSessionLoading: true,
        isCurrentSessionLoading: true,

        // 设置生成状态
        setGenerating: (value: boolean) => set({ isGenerating: value }),

        // 设置当前会话
        setCurrentSession: (session?: TChatSession) => set({ currentSession: session }),

        // 初始化会话状态
        initializeSessionState: async (sessionId?: string) => {
            // 获取会话数据库操作函数
            const {
                sessionsQuery,
                getSessionByIdQuery,
            } = useChatSessionDB(sessionId);

            // 设置加载状态
            set({
                isAllSessionLoading: sessionsQuery.isLoading,
                isCurrentSessionLoading: getSessionByIdQuery.isLoading
            });

            // 获取所有会话
            if (sessionsQuery.data) {
                set({ sessions: sessionsQuery.data });
            }

            // 获取当前会话
            if (getSessionByIdQuery.data) {
                set({ currentSession: getSessionByIdQuery.data });
            }

            // 如果获取当前会话失败，创建新会话
            if (getSessionByIdQuery.error) {
                get().createSession({ redirect: true });
            }
        },

        // 创建新会话
        createSession: async (props: { redirect?: boolean }) => {
            const { redirect } = props;
            const { createNewSessionMutation } = chatSessionDB;

            await createNewSessionMutation.mutateAsync(undefined, {
                onSuccess: (data) => {
                    if (redirect) {
                        // 重定向到新会话页面
                        window.open(`/chat/${data.id}`, "_self");
                    }
                },
            });
        },

        // 移除消息
        removeMessage: (messageId: string) => {
            const { currentSession } = get();
            const { removeMessageByIdMutation, getSessionByIdQuery } = chatSessionDB;

            if (!currentSession?.id) {
                return;
            }

            removeMessageByIdMutation.mutate(
                {
                    sessionId: currentSession.id,
                    messageId,
                },
                {
                    onSuccess: () => {
                        // 重新获取当前会话
                        getSessionByIdQuery?.refetch();
                    },
                }
            );
        },

        // 重新获取会话列表
        refetchSessions: () => {
            const { sessionsQuery } = chatSessionDB;
            sessionsQuery?.refetch();
        },

        // 重新获取当前会话
        refetchCurrentSession: () => {
            const { getSessionByIdQuery } = chatSessionDB;
            getSessionByIdQuery?.refetch();
        },

        // 向会话添加消息
        addMessageToSession: async (sessionId: string, message: TChatMessage) => {
            const { addMessageToSessionMutation } = chatSessionDB;

            await addMessageToSessionMutation.mutateAsync({
                sessionId,
                message,
            });
        },

        // 根据ID获取会话
        getSessionById: async (id: string) => {
            const { getSessionByIdMutation } = chatSessionDB;
            return await getSessionByIdMutation.mutateAsync(id);
        }
    };
});

