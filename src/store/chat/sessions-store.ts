/**
 * 会话状态管理
 * 用于处理聊天会话的创建、获取和操作
 */
import { create } from 'zustand';
import { TChatMessage, TChatSession } from "@/types/chat.type";


/**
 * 会话状态接口定义
 * 包含会话列表、当前会话、加载状态和操作方法
 */
interface SessionsState {
    // 会话数据
    sessions: TChatSession[];                          // 所有会话列表
    currentSession?: TChatSession;                     // 当前活动会话
    isGenerating: boolean;                            // 是否正在生成回复
    isAllSessionLoading: boolean;                     // 会话列表是否加载中
    isCurrentSessionLoading: boolean;                 // 当前会话是否加载中

    // 会话操作方法
    setGenerating: (value: boolean) => void;          // 设置生成状态
    setSessions: (sessions: TChatSession[]) => void;  // 更新会话列表
    setCurrentSession: (session?: TChatSession) => void; // 设置当前会话

    // 会话查询相关
    refetchSessions?: () => void;                    // 重新获取所有会话
    refetchCurrentSession?: () => void;              // 重新获取当前会话

    // 会话CRUD操作
    createSession: (props: { redirect?: boolean }) => Promise<void>; // 创建新会话
    removeMessage: (messageId: string) => void;                     // 删除消息
    addMessageToSession: (sessionId: string, message: TChatMessage) => Promise<void>; // 添加消息
    getSessionById: (id: string) => Promise<TChatSession | undefined>; // 获取特定会话

    // 聊天会话hook返回的其他属性
    sessionsQuery?: any;                              // 会话查询结果
    createNewSessionMutation?: any;                   // 创建会话变更
    removeMessageByIdMutation?: any;                  // 删除消息变更
    addMessageToSessionMutation?: any;                // 添加消息变更
    getSessionByIdMutation?: any;                     // 获取会话变更
    getSessionByIdQuery?: any;                        // 获取会话查询
    addSessionsMutation?: any;                        // 添加会话变更
}

/**
 * 创建会话状态管理 store
 */
export const useSessionsStore = create<SessionsState>((set, get) => ({
    // 初始状态
    sessions: [],
    isGenerating: false,
    isAllSessionLoading: true,
    isCurrentSessionLoading: true,

    // 设置状态的方法
    setGenerating: (value: boolean) => set({ isGenerating: value }),
    setSessions: (sessions: TChatSession[]) => set({ sessions }),
    setCurrentSession: (session?: TChatSession) => set({ currentSession: session }),

    // 会话操作方法（初始为空函数，将在初始化时赋值）
    refetchSessions: undefined,
    refetchCurrentSession: undefined,

    // 创建新会话
    createSession: async ({ redirect = false }) => {
        const { createNewSessionMutation } = get();

        if (!createNewSessionMutation) {
            console.error("createNewSessionMutation is not initialized");
            return;
        }

        await createNewSessionMutation.mutateAsync(undefined, {
            onSuccess: (data: TChatSession) => {
                if (redirect) {
                    // 使用 _self 在当前窗口打开，避免打开新标签
                    window.open(`/chat/${data.id}`, "_self");
                }
            }
        });
    },

    // 删除消息
    removeMessage: (messageId: string) => {
        const { currentSession, removeMessageByIdMutation, refetchCurrentSession } = get();

        if (!currentSession?.id || !removeMessageByIdMutation) {
            console.error("Either currentSession or removeMessageByIdMutation is not initialized");
            return;
        }

        removeMessageByIdMutation.mutate({
            sessionId: currentSession.id,
            messageId
        }, {
            onSuccess: () => {
                // 重新获取当前会话数据以更新界面
                refetchCurrentSession?.();
            }
        });
    },

    // 添加消息到会话
    addMessageToSession: async (sessionId: string, message: TChatMessage) => {
        const { addMessageToSessionMutation } = get();

        if (!addMessageToSessionMutation) {
            console.error("addMessageToSessionMutation is not initialized");
            return;
        }

        await addMessageToSessionMutation.mutateAsync({
            sessionId,
            message
        });
    },

    // 根据ID获取会话
    getSessionById: async (id: string) => {
        const { getSessionByIdMutation } = get();

        if (!getSessionByIdMutation) {
            console.error("getSessionByIdMutation is not initialized");
            return undefined;
        }

        return await getSessionByIdMutation.mutateAsync(id);
    },
}));
