import { create } from "zustand";
import { TChatMessage, TLLMInputProps, TToolResponse } from "@/types/chat";

interface ChatState {
    // 状态
    contextValue: string;
    isGenerating: boolean;
    openPromptsBotCombo: boolean;
    currentMessage?: TChatMessage;
    currentTools: TToolResponse[];
    abortController?: AbortController;

    // 基础状态更新方法
    setContextValue: (value: string) => void;
    setIsGenerating: (value: boolean) => void;
    setOpenPromptsBotCombo: (value: boolean) => void;
    setCurrentMessage: (message?: TChatMessage) => void;
    updateCurrentMessage: (update: Partial<TChatMessage>) => void;
    setCurrentTools: (tools: TToolResponse[] | ((prev: TToolResponse[]) => TToolResponse[])) => void;
    setAbortController: (controller?: AbortController) => void;

}

export const useChatStore = create<ChatState>()((set, get) => ({
    // 初始状态
    contextValue: '',
    isGenerating: false,
    openPromptsBotCombo: false,
    currentTools: [],
    currentMessage: undefined,

    // 基础状态更新方法
    setContextValue: (value) => set({ contextValue: value }),
    setIsGenerating: (value) => set({ isGenerating: value }),
    setOpenPromptsBotCombo: (value) => set({ openPromptsBotCombo: value }),
    setCurrentMessage: (message) => set({ currentMessage: message }),
    updateCurrentMessage: (update) => set((state) => ({
        currentMessage: state.currentMessage
            ? { ...state.currentMessage, ...update }
            : undefined
    })),
    setCurrentTools: (tools) => set((state) => ({
        currentTools: typeof tools === 'function' ? tools(state.currentTools) : tools
    })),
    setAbortController: (controller) => set({ abortController: controller })
}));