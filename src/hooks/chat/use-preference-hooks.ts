import { useEffect, useCallback } from "react";
import { usePreferencesQuery } from "@/hooks/query/use-preferences-query";
import { TPreferences, TBaseModel, TApiKeys } from "@/types/chat";
import { usePreferenceStore, IPreferenceService } from "@/store/chat";

export function usePreferenceHooks() {
  const {
    preferences, apiKeys, isLoaded,
    setPreferences, setApiKey, setApiKeys,
    initialize, resetToDefaults
  } = usePreferenceStore();

  const preferenceService = usePreferencesQuery();
  const {
    preferencesQuery,
    apiKeysQuery,
    setPreferencesMutation,
    setApiKeyMutation
  } = preferenceService;

  // 创建服务适配器
  const service: IPreferenceService = {
    getPreferences: preferenceService.getPreferences,
    getApiKeys: preferenceService.getApiKeys,
    setPreferences: async (preferences: Partial<TPreferences>) => {
      await preferenceService.setPreferences(preferences);
      return;
    },
    setApiKey: preferenceService.setApiKey,
    resetToDefaults: preferenceService.resetToDefaults
  };

  // 从服务器初始化 store（如果尚未加载）
  useEffect(() => {
    if (!isLoaded) {
      initialize(service);
    }
  }, [isLoaded, initialize]);

  // 当服务端数据变化且有值时才更新 store，避免不必要的更新
  useEffect(() => {
    if (preferencesQuery.data && preferencesQuery.isSuccess) {
      setPreferences(preferencesQuery.data);
    }
  }, [preferencesQuery.data, preferencesQuery.isSuccess, setPreferences]);

  useEffect(() => {
    if (apiKeysQuery.data && apiKeysQuery.isSuccess) {
      setApiKeys(apiKeysQuery.data);
    }
  }, [apiKeysQuery.data, apiKeysQuery.isSuccess, setApiKeys]);

  // 使用 useCallback 包装方法，避免不必要的重新创建函数
  const updatePreferences = useCallback(async (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => {
    // 先更新本地状态
    setPreferences(newPreferences);
    // 再提交到服务器
    setPreferencesMutation.mutate(newPreferences, {
      onSuccess: () => {
        onSuccess && onSuccess(preferences);
      },
    });
  }, [setPreferences, setPreferencesMutation, preferences]);

  const updateApiKey = useCallback(async (key: TBaseModel, value: string) => {
    // 先更新本地状态
    setApiKey(key, value);
    // 再提交到服务器
    setApiKeyMutation.mutate({ key, value });
  }, [setApiKey, setApiKeyMutation]);

  const updateApiKeys = useCallback(async (newKeys: TApiKeys) => {
    // 先更新本地状态
    setApiKeys(newKeys);
    // 再逐个提交到服务器
    for (const [key, value] of Object.entries(newKeys)) {
      await service.setApiKey(key as TBaseModel, value);
    }
  }, [setApiKeys, service]);

  const handleResetToDefaults = useCallback(async () => {
    await resetToDefaults(service);
  }, [resetToDefaults, service]);

  return {
    preferences,
    apiKeys,
    isLoading: preferencesQuery.isLoading || !isLoaded,
    updatePreferences,
    updateApiKey,
    updateApiKeys,
    resetToDefaults: handleResetToDefaults,
  };
}