import { TAssistant } from "@/types/chat";

export type TLLMInputProps = {
    context?: string;
    input?: string;
    image?: string;
    sessionId: string;
    messageId?: string;
    assistant: TAssistant;
};

export type TToolResponse = {
    toolName: string;
    toolLoading?: boolean;
    toolArgs?: any;
    toolResponse?: any;
    toolRenderArgs?: any;
};

export type TChatMessage = {
    id: string;
    rawHuman?: string;
    rawAI?: string;
    sessionId: string;
    isLoading?: boolean;
    stop?: boolean;
    stopReason?: "error" | "cancel" | "apikey" | "recursion" | "finish";
    image?: string;
    inputProps?: TLLMInputProps;
    tools?: TToolResponse[];
    createdAt: string;
};

export type TChatSession = {
    messages: TChatMessage[];
    title?: string;
    id: string;
    createdAt: string;
    updatedAt?: string;
};

export type TAttachment = {
    file?: File;
    base64?: string;
};