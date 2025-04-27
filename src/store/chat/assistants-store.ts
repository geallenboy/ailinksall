import { create } from 'zustand';
import { TAssistant } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";

/**
 * 助手状态管理
 * 仅负责状态存储和基本状态更新，不包含业务逻辑和副作用
 */
interface AssistantState {
    // 状态
    isAssistantOpen: boolean;
    openCreateAssistant: boolean;
    updateAssistant?: TAssistant;
    selectedAssistantKey: string;

    // 基础状态更新方法
    open: () => void;
    dismiss: () => void;
    setOpenCreateAssistant: (isOpen: boolean) => void;
    setUpdateAssistant: (assistant?: TAssistant) => void;
    setSelectedAssistantKey: (key: string) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
    // 初始状态
    isAssistantOpen: false,
    openCreateAssistant: false,
    updateAssistant: undefined,
    selectedAssistantKey: defaultPreferences.defaultAssistant,

    // 操作方法 - 只做简单的状态更新
    open: () => set({ isAssistantOpen: true }),
    dismiss: () => set({ isAssistantOpen: false }),
    setOpenCreateAssistant: (isOpen) => set({ openCreateAssistant: isOpen }),
    setUpdateAssistant: (assistant) => set({ updateAssistant: assistant }),
    setSelectedAssistantKey: (key) => set({ selectedAssistantKey: key }),
}));