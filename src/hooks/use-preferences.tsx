import { get, set } from "idb-keyval";
import { TBaseModel, TModelKey } from "./use-model-list";
import { TToolKey } from "./use-tools";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TAssistant } from "@/types/chat.type";

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

export const usePreferences = () => {
  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => getPreferences(),
  });

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => getApiKeys(),
  });

  const setPreferencesMutation = useMutation({
    mutationFn: async (prefernces: Partial<TPreferences>) =>
      await setPreferences(prefernces),
    onSuccess() {
      console.log("refetching");
      preferencesQuery.refetch();
    },
  });

  const setApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: any) => setApiKey(key, value),
    onSuccess: () => {
      apiKeysQuery.refetch();
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: () => resetToDefaults(),
    onSuccess: () => {
      preferencesQuery.refetch();
    },
  });

  const getApiKeys = async (): Promise<TApiKeys> => {
    return (await get("api-keys")) || {};
  };

  const getPreferences = async (): Promise<TPreferences> => {
    return (await get("preferences")) as TPreferences;
  };

  const setPreferences = async (preferences: Partial<TPreferences>) => {
    const currentPreferences = await getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
    return newPreferences;
  };

  const resetToDefaults = async () => {
    await set("preferences", defaultPreferences);
  };

  const setApiKey = async (key: TBaseModel, value: string) => {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  };

  const getApiKey = async (key: TBaseModel) => {
    const keys = await getApiKeys();
    return keys[key];
  };

  return {
    getApiKeys,
    setApiKey,
    getApiKey,
    getPreferences,
    setPreferences,
    resetToDefaults,
    preferencesQuery,
    setApiKeyMutation,
    setPreferencesMutation,
    resetToDefaultsMutation,
    apiKeysQuery,
  };
};
