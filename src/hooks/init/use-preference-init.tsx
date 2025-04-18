"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/store/chat/preferences-store";
import { usePreferencesDB } from "../db";

/**
 * 偏好设置初始化组件
 * 负责在应用启动时从IndexedDB加载偏好设置
 */
export function usePreferencesInit() {
  // 使用useState来跟踪初始化状态
  const [initialized, setInitialized] = useState(false);

  // 获取基础数据操作功能
  const { preferencesQuery, apiKeysQuery } = usePreferencesDB();

  // 获取Zustand store的状态和方法
  const {
    setPreferences,
    setApiKeys,
    preferences,
    setPreferencesInitialized,
    setApiKeysInitialized,
  } = usePreferencesStore();

  useEffect(() => {
    // 如果已经初始化过，不再执行
    if (initialized) return;

    // 检查是否两个查询都已完成
    if (preferencesQuery.isSuccess && apiKeysQuery.isSuccess) {
      console.log("偏好设置初始化完成");

      // 更新Zustand store
      if (preferencesQuery.data) {
        setPreferences(preferencesQuery.data);
        setPreferencesInitialized(true);
      }

      if (apiKeysQuery.data) {
        setApiKeys(apiKeysQuery.data);
        setApiKeysInitialized(true);
      }

      // 设置特定项到localStorage (这些可能被其他非zustand组件直接访问)
      if (preferences.ollamaBaseUrl) {
        localStorage.setItem("ollamaBaseUrl", preferences.ollamaBaseUrl);
      }

      if (preferences.whisperSpeechToTextEnabled !== undefined) {
        localStorage.setItem(
          "whisperSpeechToTextEnabled",
          preferences.whisperSpeechToTextEnabled.toString()
        );
      }

      if (preferences.defaultWebSearchEngine) {
        localStorage.setItem(
          "defaultWebSearchEngine",
          preferences.defaultWebSearchEngine
        );
      }

      // 标记初始化完成
      setInitialized(true);
    }
  }, [
    initialized,
    preferencesQuery.isSuccess,
    apiKeysQuery.isSuccess,
    preferencesQuery.data,
    apiKeysQuery.data,
    preferences,
  ]);

  return { initialized };
}
