
import { TAssistant, TBaseModel, TToolKey } from "@/types/chat";

export type TApiKeys = Partial<Record<TBaseModel, string>>;


export type TPreferences = {
    defaultAssistant: TAssistant["key"];
    systemPrompt: string;
    messageLimit: number;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    googleSearchEngineId?: string;
    googleSearchApiKey?: string;
    defaultPlugins: TToolKey[];
    whisperSpeechToTextEnabled: boolean;
    defaultWebSearchEngine: "google" | "duckduckgo";
    ollamaBaseUrl: string;
    memories: string[];
};


