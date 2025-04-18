import { create } from 'zustand';
import { TAssistant } from "@/types/chat.type";
import { TModel } from "@/hooks/use-model-list";

type AssistantStore = {
    isAssistantOpen: boolean;
    openCreateAssistant: boolean;
    updateAssistant?: TAssistant;
    selectedAssistantKey: string;
    assistants: TAssistant[];

    // 操作方法
    open: () => void;
    dismiss: () => void;
    setOpenCreateAssistant: (isOpen: boolean) => void;
    setUpdateAssistant: (assistant?: TAssistant) => void;
    setSelectedAssistantKey: (key: string) => void;
    setAssistants: (assistants: TAssistant[]) => void;

    // 获取当前选中的助手和对应的模型
    // getSelectedAssistant: () => { assistant: TAssistant; model: TModel } | undefined;
};

export const useAssistantStore = create<AssistantStore>((set, get) => ({
    isAssistantOpen: false,
    openCreateAssistant: false,
    selectedAssistantKey: "",
    assistants: [],

    open: () => set({ isAssistantOpen: true }),
    dismiss: () => set({ isAssistantOpen: false }),
    setOpenCreateAssistant: (isOpen) => set({ openCreateAssistant: isOpen }),
    setUpdateAssistant: (assistant) => set({ updateAssistant: assistant }),
    setSelectedAssistantKey: (key) => set({ selectedAssistantKey: key }),
    setAssistants: (assistants) => set({ assistants }),

    // getSelectedAssistant: () => {
    //     const { assistants, selectedAssistantKey } = get();
    //     const assistant = assistants.find(a => a.key === selectedAssistantKey);
    //     if (!assistant) return undefined;

    //     // 这里假设每个助手关联一个模型，根据实际情况修改
    //     const model = {
    //         id: assistant.modelId || '',
    //         name: assistant.modelName || '',
    //         // 根据你的TModel类型添加其他必要字段
    //     } as TModel;

    //     return { assistant, model };
    // }
}));