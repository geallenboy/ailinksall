import { get, set } from "idb-keyval";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TApiKeys, TBaseModel, TPreferences } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";

// 将数据访问函数提取到 Hook 外部
export const getApiKeys = async (): Promise<TApiKeys> => {
  try {
    return (await get("api-keys")) || {};
  } catch (error) {
    console.error("获取 API 密钥时出错:", error);
    return {};
  }
};

export const getPreferences = async (): Promise<TPreferences> => {
  try {
    const prefs = await get("preferences");
    return prefs as TPreferences || defaultPreferences;
  } catch (error) {
    console.error("获取偏好设置时出错:", error);
    return defaultPreferences;
  }
};

export const setPreferences = async (preferences: Partial<TPreferences>): Promise<TPreferences> => {
  try {
    const currentPreferences = await getPreferences();
    const newPreferences = { ...currentPreferences, ...preferences };
    await set("preferences", newPreferences);
    return newPreferences;
  } catch (error) {
    console.error("设置偏好设置时出错:", error);
    throw error;
  }
};

export const resetToDefaults = async (): Promise<void> => {
  try {
    await set("preferences", defaultPreferences);
  } catch (error) {
    console.error("重置为默认设置时出错:", error);
    throw error;
  }
};

export const setApiKey = async (key: TBaseModel, value: string): Promise<void> => {
  try {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  } catch (error) {
    console.error(`设置 API 密钥 ${key} 时出错:`, error);
    throw error;
  }
};

export const getApiKey = async (key: TBaseModel): Promise<string | undefined> => {
  try {
    const keys = await getApiKeys();
    return keys[key];
  } catch (error) {
    console.error(`获取 API 密钥 ${key} 时出错:`, error);
    return undefined;
  }
};

// React Hook 使用外部定义的函数
export const usePreferencesQuery = () => {
  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
  });

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeys,
  });

  const setPreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<TPreferences>) =>
      await setPreferences(preferences),
    onSuccess() {
      console.log("refetching preferences");
      preferencesQuery.refetch();
    },
  });

  const setApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: { key: TBaseModel, value: string }) =>
      await setApiKey(key, value),
    onSuccess: () => {
      console.log("refetching API keys");
      apiKeysQuery.refetch();
    },
  });

  const resetToDefaultsMutation = useMutation({
    mutationFn: resetToDefaults,
    onSuccess: () => {
      preferencesQuery.refetch();
    },
  });

  return {
    // 数据访问函数
    getApiKeys,
    setApiKey,
    getApiKey,
    getPreferences,
    setPreferences,
    resetToDefaults,

    // Query 和 Mutation 对象
    preferencesQuery,
    setApiKeyMutation,
    setPreferencesMutation,
    resetToDefaultsMutation,
    apiKeysQuery,
  };
};
