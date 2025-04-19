"use client";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "@/store/chat/preferences-store";
import { usePreferencesDB } from "../db";
import { defaultPreferences } from "@/config/chat/preferences";
import { set, get } from "idb-keyval";

/**
 * 偏好设置初始化组件
 * 负责在应用启动时从IndexedDB加载偏好设置
 */
export function usePreferencesInit() {
  // 初始化状态跟踪
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取基础数据操作功能
  const {
    preferencesQuery,
    apiKeysQuery,
    setPreferences: setPreferencesDB,
    setApiKeyMutation,
  } = usePreferencesDB();

  // 获取Zustand store的状态和方法
  const {
    setPreferences,
    setApiKeys,
    isPreferencesInitialized,
    isApiKeysInitialized,
    setPreferencesInitialized,
    setApiKeysInitialized,
    updatePreferences,
  } = usePreferencesStore();

  // 处理偏好设置初始化
  useEffect(() => {
    // 如果已经初始化，不再执行
    if (isInitialized) return;

    async function initPreferences() {
      try {
        console.log("开始初始化偏好设置...");

        // 直接从IndexedDB获取当前值
        const currentPrefs = await get("preferences");

        console.log("检查当前偏好设置:", currentPrefs);

        // 判断是否需要初始化默认值
        // 检查是否是空对象、null或undefined
        const needInitialize =
          !currentPrefs ||
          Object.keys(currentPrefs).length === 0 ||
          !currentPrefs.defaultAssistant;

        if (needInitialize) {
          console.log("初始化默认偏好设置...");
          // 使用mutation直接设置默认值
          await setPreferencesDB(defaultPreferences);
          // 设置到store
          setPreferences(defaultPreferences);
          setPreferencesInitialized(true);
          console.log("默认偏好设置已初始化:", defaultPreferences);
        } else {
          // 有有效数据，更新到store
          console.log("使用已存在的偏好设置:", currentPrefs);
          setPreferences(currentPrefs);
          setPreferencesInitialized(true);
          console.log("偏好设置初始化完成");
        }

        // API密钥初始化
        const currentKeys = await get("api-keys");
        console.log("检查当前API密钥:", currentKeys);

        if (!currentKeys) {
          await set("api-keys", {});
          setApiKeys({});
        } else {
          setApiKeys(currentKeys);
        }

        setApiKeysInitialized(true);

        // 标记整体初始化完成
        setIsInitialized(true);
      } catch (error) {
        console.error("偏好设置初始化失败:", error);
      }
    }

    // 执行初始化
    initPreferences();
  }, []);

  // 返回初始化状态
  return {
    isInitialized,
    preferencesInitialized: isPreferencesInitialized,
    apiKeysInitialized: isApiKeysInitialized,
  };
}
