"use client";

import { useEffect } from "react";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";

export const PreferenceInitializer: React.FC = () => {
  const { updateApiKey, isLoading } = usePreferenceHooks();

  // 添加isLoading作为依赖，只有当数据加载完成后才设置初始值
  useEffect(() => {
    // 只有当加载完成后才设置初始值，避免重复设置
    if (!isLoading) {
      const setInitialValues = async () => {
        // await updateApiKey("ollama", "dsdsdsdsds");
      };

      setInitialValues();
    }
  }, [isLoading, updateApiKey]); // 添加isLoading作为依赖

  return null;
};
