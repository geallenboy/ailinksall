import { usePreferencesStore } from "@/store/chat";
import { useEffect } from "react";
import { usePreferencesDB } from "@/hooks/db/use-preferences";
import { defaultPreferences } from "@/config/chat/preferences";
import { TBaseModel, TPreferences } from "@/types/chat";

// 创建一个hook来结合zustand和react-query
export const usePreferencesQuery = () => {
  // 获取store中的状态和方法
  const {
    preferences,
    setPreferences,
    setApiKeys,
    updatePreferences: storeUpdatePreferences,
    updateApiKey: storeUpdateApiKey,
    isPreferencesInitialized,
    isApiKeysInitialized,
    setPreferencesInitialized,
    setApiKeysInitialized,
  } = usePreferencesStore();

  // 获取react-query相关的查询和mutation
  const {
    preferencesQuery,
    setPreferencesMutation,
    apiKeysQuery,
    setApiKeyMutation,
  } = usePreferencesDB();

  // 当查询数据变化时初始化store
  useEffect(() => {
    if (preferencesQuery.data && !isPreferencesInitialized) {
      setPreferences({ ...defaultPreferences, ...preferencesQuery.data });
      setPreferencesInitialized(true);
    }
  }, [preferencesQuery.data, isPreferencesInitialized]);

  useEffect(() => {
    if (apiKeysQuery.data && !isApiKeysInitialized) {
      setApiKeys(apiKeysQuery.data);
      setApiKeysInitialized(true);
    }
  }, [apiKeysQuery.data, isApiKeysInitialized]);

  // 更新偏好设置(包含服务端mutation)
  const updatePreferences = async (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => {
    // 先在本地状态中更新
    storeUpdatePreferences(newPreferences);

    // 然后执行服务器更新
    setPreferencesMutation.mutate(newPreferences, {
      onSuccess: () => {
        preferencesQuery.refetch();
        onSuccess && onSuccess(preferences);
      },
    });
  };

  // 更新API key(包含服务端mutation)
  const updateApiKey = async (key: TBaseModel, value: string) => {
    // 先在本地状态中更新
    storeUpdateApiKey(key, value);

    // 然后执行服务器更新
    setApiKeyMutation.mutate(
      { key, value },
      {
        onSuccess: () => {
          apiKeysQuery.refetch();
        },
      }
    );
  };

  return {
    updatePreferences,
    updateApiKey,
    updateApiKeys: storeUpdateApiKey,
    isLoading: preferencesQuery.isLoading || apiKeysQuery.isLoading,
  };
};
