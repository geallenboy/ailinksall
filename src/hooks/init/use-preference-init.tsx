"use client";

import { useEffect } from "react";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";

export const PreferenceInitializer: React.FC = () => {
  const { isLoading } = usePreferenceHooks();

  // 添加isLoading作为依赖，只有当数据加载完成后才设置初始值
  useEffect(() => {
    // 只有当加载完成后才设置初始值，避免重复设置
    if (!isLoading) {
      const setInitialValues = async () => {
        try {
          // 这里可以添加任何需要在加载完成后执行的逻辑
          console.log("Preference data loaded successfully.");
        } catch (error) {
          console.error("Error setting initial values:", error);
        }
      };
      setInitialValues();
    }
  }, [isLoading]); // 添加isLoading作为依赖

  return null;
};
