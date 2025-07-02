import { TModelKey } from "@/types/chat";

export type TAssistantType = "base" | "custom";

export type TAssistant = {
    name: string;
    systemPrompt: string;
    baseModel: TModelKey;
    key: TModelKey | string;
    type: TAssistantType;
};