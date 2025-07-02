import { TPreferences } from "@/types/chat";

export const defaultPreferences: TPreferences = {
    defaultAssistant: "gpt-3.5-turbo",
    systemPrompt: "You're helpful assistant that can help me with my questions.",
    messageLimit: 30,
    temperature: 0.5,
    maxTokens: 1000,
    topP: 1.0,
    topK: 5,
    defaultPlugins: [],
    whisperSpeechToTextEnabled: false,
    defaultWebSearchEngine: "duckduckgo",
    ollamaBaseUrl: "http://localhost:11434",
    memories: [],
};