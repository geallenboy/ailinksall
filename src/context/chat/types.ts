import { TAssistant, TChatMessage, TLLMInputProps, TToolResponse } from "@/types/chat";
import { useEditor } from "@tiptap/react";
import { AgentExecutor } from "langchain/agents";

export type TChatContext = {
    editor: ReturnType<typeof useEditor>;
    sendMessage: () => void;
    handleRunModel: (props: TLLMInputProps, clear?: () => void) => void;
    openPromptsBotCombo: boolean;
    setOpenPromptsBotCombo: (value: boolean) => void;
    contextValue: string;
    isGenerating: boolean;
    setContextValue: (value: string) => void;
    stopGeneration: () => void;
};

export type TChatProvider = {
    children: React.ReactNode;
};

export interface ModelRunParams {
    sessionId: string;
    messageId?: string;
    input: string;
    context?: string;
    image?: string;
    assistant: TAssistant;
    abortController: AbortController;
    updateCurrentMessage: (update: Partial<TChatMessage>) => void;
    setCurrentTools: React.Dispatch<React.SetStateAction<TToolResponse[]>>;
}

export interface PreparePromptParams {
    context?: string;
    image?: string;
    history: TChatMessage[];
    assistant: TAssistant;
}

export interface ModelExecutionContext {
    agentExecutor?: AgentExecutor;
    chainWithoutTools: any;
    availableTools: any[];
    abortController: AbortController;
}