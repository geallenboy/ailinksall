import { useEffect, useRef } from "react";
import { usePreferencesQuery } from "@/hooks/query/use-preferences-query";
import { TPreferences, TBaseModel, TApiKeys } from "@/types/chat";
import { usePreferenceStore } from "@/store/chat";
import { defaultPreferences } from "@/config/chat/preferences";
import { createLogger } from "@/utils/logger";

// 创建偏好设置管理的日志记录器
const logger = createLogger("usePreferenceHooks");

/**
 * 自定义Hook，用于管理和同步用户的聊天偏好设置
 * 遵循关注点分离原则，将状态管理与副作用分开处理
 * @returns 偏好设置相关的状态和操作方法
 */
export function usePreferenceHooks() {
  logger.info("🚀 初始化 usePreferenceHooks");

  // 使用 useRef 避免重复初始化和追踪渲染次数
  const initialized = useRef(false);
  const renderCount = useRef(0);
  renderCount.current += 1;

  logger.debug(`第 ${renderCount.current} 次渲染`);

  // 使用细粒度选择器从store获取状态和方法
  logger.debug("获取 store 状态");
  const preferences = usePreferenceStore(state => state.preferences);
  const apiKeys = usePreferenceStore(state => state.apiKeys);
  const setPreferences = usePreferenceStore(state => state.setPreferences);
  const setApiKeys = usePreferenceStore(state => state.setApiKeys);

  logger.debug("当前偏好设置状态", {
    hasPreferences: !!preferences,
    defaultAssistant: preferences?.defaultAssistant,
    hasApiKeys: !!Object.keys(apiKeys || {}).length
  });

  // 获取查询和变异方法
  logger.debug("初始化查询");
  const {
    preferencesQuery,
    apiKeysQuery,
    setPreferencesMutation,
    setApiKeyMutation,
  } = usePreferencesQuery();

  logger.debug("查询状态", {
    preferencesLoading: preferencesQuery.isLoading,
    preferencesError: !!preferencesQuery.error,
    apiKeysLoading: apiKeysQuery.isLoading,
    apiKeysError: !!apiKeysQuery.error
  });

  // 监听偏好设置数据变化
  useEffect(() => {
    logger.debug("偏好设置数据变化", {
      hasData: !!preferencesQuery.data
    });

    if (preferencesQuery.data) {
      logger.info("更新偏好设置", {
        defaultAssistant: preferencesQuery.data?.defaultAssistant
      });

      // 合并默认偏好设置和查询结果
      const mergedPreferences = { ...defaultPreferences, ...preferencesQuery.data };
      setPreferences(mergedPreferences);

      logger.debug("偏好设置已更新", {
        defaultModel: mergedPreferences.defaultPlugins,
        messageLimit: mergedPreferences.messageLimit
      });
    }
  }, [preferencesQuery.data, setPreferences]);

  // 监听API密钥数据变化
  useEffect(() => {
    logger.debug("API密钥数据变化", {
      hasData: !!apiKeysQuery.data,
      keyCount: Object.keys(apiKeysQuery.data || {}).length
    });

    if (apiKeysQuery.data) {
      logger.info("更新API密钥", {
        keyCount: Object.keys(apiKeysQuery.data).length,
        models: Object.keys(apiKeysQuery.data)
      });

      setApiKeys(apiKeysQuery.data);

      logger.debug("API密钥已更新");
    }
  }, [apiKeysQuery.data, setApiKeys]);

  /**
   * 更新偏好设置
   * @param newPreferences 部分偏好设置
   * @param onSuccess 成功回调
   */
  const updatePreferences = async (
    newPreferences: Partial<TPreferences>,
    onSuccess?: (preference: TPreferences) => void
  ) => {
    logger.info("更新偏好设置", {
      keys: Object.keys(newPreferences)
    });

    try {
      // 先在本地更新状态
      const updatedPreferences = { ...preferences, ...newPreferences };
      logger.debug("本地状态更新", {
        defaultAssistant: updatedPreferences.defaultAssistant
      });

      setPreferences(updatedPreferences);

      // 然后持久化到存储
      logger.debug("提交偏好设置变更到服务器");
      setPreferencesMutation.mutate(newPreferences, {
        onSuccess: () => {
          logger.info("偏好设置更新成功");
          preferencesQuery.refetch();

          if (onSuccess) {
            logger.debug("调用成功回调");
            onSuccess(updatedPreferences);
          }
        },
        onError: (error) => {
          logger.error("偏好设置更新失败", { error });
        }
      });
    } catch (error) {
      logger.error("偏好设置更新过程出错", { error });
    }
  };

  /**
   * 更新单个API密钥
   * @param key 模型类型
   * @param value API密钥值
   */
  const updateApiKey = async (key: TBaseModel, value: string) => {
    logger.info("更新API密钥", { model: key, hasValue: !!value });

    try {
      // 先在本地更新状态
      const updatedApiKeys = { ...apiKeys, [key]: value };
      logger.debug("本地API密钥更新");
      setApiKeys(updatedApiKeys);

      // 然后持久化到存储
      logger.debug("提交API密钥变更到服务器");
      setApiKeyMutation.mutate(
        { key, value },
        {
          onSuccess: () => {
            logger.info("API密钥更新成功", { model: key });
          },
          onError: (error) => {
            logger.error("API密钥更新失败", { model: key, error });
          }
        }
      );
    } catch (error) {
      logger.error("API密钥更新过程出错", { model: key, error });
    }
  };

  /**
   * 批量更新API密钥
   * @param newApiKeys 新的API密钥对象
   */
  const updateApiKeys = (newApiKeys: TApiKeys) => {
    logger.info("批量更新API密钥", {
      modelCount: Object.keys(newApiKeys).length,
      models: Object.keys(newApiKeys)
    });

    try {
      setApiKeys(newApiKeys);
      logger.debug("API密钥批量更新完成");

      // 可以考虑添加批量更新API的持久化逻辑
    } catch (error) {
      logger.error("API密钥批量更新出错", { error });
    }
  };

  // 记录完成初始化
  if (!initialized.current) {
    logger.info("✅ usePreferenceHooks 初始化完成");
    initialized.current = true;
  }

  return {
    preferences,
    apiKeys,
    updatePreferences,
    updateApiKey,
    updateApiKeys,
  };
}