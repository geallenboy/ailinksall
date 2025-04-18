import { create } from 'zustand';
import { TPrompt } from '@/hooks/db/use-prompts';


// 定义Zustand store的状态类型
interface PromptsState {
    // 对话框状态
    isPromptOpen: boolean;
    showCreatePrompt: boolean;
    tab: "public" | "local";
    editablePrompt?: TPrompt;

    // 方法
    open: (action?: "public" | "local" | "create") => void;
    dismiss: () => void;
    setTab: (tab: "public" | "local") => void;
    setShowCreatePrompt: (show: boolean) => void;
    setEditablePrompt: (prompt?: TPrompt) => void;
}

// 创建Zustand store
export const usePromptsStore = create<PromptsState>((set) => ({
    // 初始状态
    isPromptOpen: false,
    showCreatePrompt: false,
    tab: "public",
    editablePrompt: undefined,

    // 方法
    open: (action) => set(state => {
        // 如果action是create,显示创建提示界面
        if (action === "create") {
            return {
                isPromptOpen: true,
                showCreatePrompt: true
            };
        } else {
            // 否则打开提示库并设置对应标签
            return {
                isPromptOpen: true,
                ...(action ? { tab: action } : {})
            };
        }
    }),

    dismiss: () => set({ isPromptOpen: false }),
    setTab: (tab) => set({ tab }),
    setShowCreatePrompt: (show) => set({ showCreatePrompt: show }),
    setEditablePrompt: (prompt) => set({ editablePrompt: prompt }),
}));
