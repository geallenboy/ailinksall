import { useEffect, useCallback } from "react";
import { usePreferencesQuery } from "@/hooks/query/use-preferences-query";
import { TPreferences, TBaseModel, TApiKeys } from "@/types/chat";
import { usePreferenceStore } from "@/store/chat";

/**
 * 自定义Hook，用于管理和同步用户的聊天偏好设置
 * 遵循关注点分离原则，将状态管理与副作用分开处理
 * @returns 偏好设置相关的状态和操作方法
 */
export function usePreferenceHooks() {
  // 从Zustand store获取本地状态和纯状态操作方法
  const {
    preferences, // 当前偏好设置
    apiKeys, // API密钥集合
    isLoaded, // 是否已加载标志
    setPreferences, // 更新本地偏好设置的方法
    setApiKey, // 更新单个API密钥的方法
    setApiKeys, // 批量更新API密钥的方法
    setIsLoaded, // 设置加载状态的方法
  } = usePreferenceStore();

  // 获取查询和变异方法
  const {
    preferencesQuery, // 查询偏好设置
    apiKeysQuery, // 查询API密钥
    setPreferencesMutation, // 更新偏好设置
    setApiKeyMutation, // 更新API密钥
    resetToDefaults: resetApiToDefaults, // 重置为默认设置的API方法
    getPreferences, // 获取偏好设置的API方法
    getApiKeys, // 获取API密钥的API方法
  } = usePreferencesQuery();


  // 从服务器初始化数据（如果尚未加载）
  useEffect(() => {
    console.log("usePreferenceHooks: Initializing preference data...");
    // 仅在未加载状态时从服务器获取数据
    if (!isLoaded) {
      const initializeData = async () => {
        try {
          // 并行获取偏好设置和API密钥
          const [storedPreferences, storedApiKeys] = await Promise.all([
            getPreferences(),
            getApiKeys()
          ]);

          // 更新本地状态
          if (storedPreferences) {
            setPreferences(storedPreferences);
          }

          if (storedApiKeys) {
            setApiKeys(storedApiKeys);
          }

          // 标记为已加载
          setIsLoaded(true);
        } catch (error) {
          console.error("Failed to initialize preference data:", error);
          setIsLoaded(true); // 即使失败也标记为已加载，避免无限重试
        }
      };

      initializeData();
    }
  }, [isLoaded, setPreferences, setApiKeys, setIsLoaded]);

  // 当服务端偏好设置数据变化时更新本地状态
  useEffect(() => {
    if (preferencesQuery.data && preferencesQuery.isSuccess && isLoaded) {
      setPreferences(preferencesQuery.data);
    }
  }, [preferencesQuery.data, preferencesQuery.isSuccess, setPreferences, isLoaded]);

  // 当服务端API密钥数据变化时更新本地状态
  useEffect(() => {
    if (apiKeysQuery.data && apiKeysQuery.isSuccess && isLoaded) {
      setApiKeys(apiKeysQuery.data);
    }
  }, [apiKeysQuery.data, apiKeysQuery.isSuccess, setApiKeys, isLoaded]);

  /**
   * 更新偏好设置
   * 采用乐观更新策略：先更新本地，再提交服务器
   * @param newPreferences 要更新的偏好设置（部分更新）
   * @param onSuccess 更新成功后的回调
   */
  const updatePreferences = useCallback(async (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => {
    // 先更新本地状态，提供即时反馈
    setPreferences(newPreferences);

    // 再提交到服务器
    setPreferencesMutation.mutate(newPreferences, {
      onSuccess: () => {
        // 更新成功后执行回调
        if (onSuccess) {
          // 使用当前最新状态调用回调
          const updatedPreferences = usePreferenceStore.getState().preferences;
          onSuccess(updatedPreferences);
        }
      },
      onError: (error) => {
        console.error("Failed to update preferences:", error);
        // 可以在这里添加错误提示或回滚操作
      }
    });
  }, [setPreferences, setPreferencesMutation]);

  /**
   * 更新单个API密钥
   * @param key 模型标识符
   * @param value API密钥值
   */
  const updateApiKey = useCallback(async (key: TBaseModel, value: string) => {
    // 先更新本地状态
    setApiKey(key, value);

    // 再提交到服务器
    setApiKeyMutation.mutate({ key, value }, {
      onError: (error) => {
        console.error(`Failed to update API key for ${key}:`, error);
        // 可以在这里添加错误提示或回滚操作
      }
    });
  }, [setApiKey, setApiKeyMutation]);

  /**
   * 批量更新API密钥
   * @param newKeys 新的API密钥集合
   */
  const updateApiKeys = useCallback(async (newKeys: TApiKeys) => {
    // 先更新本地状态
    setApiKeys(newKeys);

    // 再逐个提交到服务器
    const updatePromises = Object.entries(newKeys).map(([key, value]) =>
      setApiKey(key as TBaseModel, value)
    );

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update API keys:", error);
      // 可以在这里添加错误提示或回滚操作
    }
  }, [setApiKeys]);

  /**
   * 重置所有设置为默认值
   */
  const handleResetToDefaults = useCallback(async () => {
    try {
      // 调用API重置服务器数据
      await resetApiToDefaults();

      // 获取默认偏好设置
      const { defaultPreferences } = await import("@/config/chat/preferences");

      // 重置本地状态
      setPreferences(defaultPreferences);
      setApiKeys({});

      // 可选：重新获取服务器数据以确保同步
      preferencesQuery.refetch();
      apiKeysQuery.refetch();
    } catch (error) {
      console.error("Failed to reset preferences to defaults:", error);
    }
  }, [resetApiToDefaults, setPreferences, setApiKeys, preferencesQuery, apiKeysQuery]);

  return {
    preferences, // 当前偏好设置
    apiKeys, // 当前API密钥
    isLoading: preferencesQuery.isLoading || !isLoaded, // 加载状态
    updatePreferences, // 更新偏好设置方法
    updateApiKey, // 更新单个API密钥方法
    updateApiKeys, // 批量更新API密钥方法
    resetToDefaults: handleResetToDefaults, // 重置为默认设置方法
  };
}