import { create } from 'zustand';
import { TAssistant } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";


// 定义助手状态类型
interface AssistantState {
    // UI状态
    isAssistantOpen: boolean;
    openCreateAssistant: boolean;
    updateAssistant?: TAssistant;
    selectedAssistantKey: string; // 记录选中的助手key

    // UI操作方法
    open: () => void;
    dismiss: () => void;
    setOpenCreateAssistant: (isOpen: boolean) => void;
    setUpdateAssistant: (assistant?: TAssistant) => void;
    setSelectedAssistantKey: (key: string) => void;
}

// 创建Zustand store
export const useAssistantStore = create<AssistantState>((set) => ({
    // 初始状态
    isAssistantOpen: false,
    openCreateAssistant: false,
    updateAssistant: undefined,
    selectedAssistantKey: defaultPreferences.defaultAssistant,

    // 操作方法
    open: () => set({ isAssistantOpen: true }),
    dismiss: () => set({ isAssistantOpen: false }),
    setOpenCreateAssistant: (isOpen) => set({ openCreateAssistant: isOpen }),
    setUpdateAssistant: (assistant) => set({ updateAssistant: assistant }),
    setSelectedAssistantKey: (key) => set({ selectedAssistantKey: key }),
}));
