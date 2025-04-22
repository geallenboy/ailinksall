"use client";

import { useChatStore } from "@/store/chat/chat-store";
import { useTools } from "@/hooks";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";
import { TToolResponse } from "@/types/chat";

/**
 * 聊天工具Hook
 * 处理工具调用、响应和状态更新
 */
export function useChatTools() {
  const { currentTools, setCurrentTools } = useChatStore();
  const { getToolByKey } = useTools();
  const { preferences, apiKeys } = usePreferenceHooks();

  /**
   * 准备可用工具列表
   * 根据模型支持和用户设置过滤工具
   */
  const prepareAvailableTools = (
    modelPlugins: string[] | undefined,
    enabledPlugins: string[]
  ) => {
    return (
      modelPlugins
        ?.filter((p) => enabledPlugins.includes(p))
        ?.map((p) =>
          getToolByKey(p)?.tool({
            updatePreferences: preferences,
            preferences,
            apiKeys,
            sendToolResponse: handleToolResponse,
          })
        )
        ?.filter((t): t is any => !!t) || []
    );
  };

  /**
   * 处理工具响应
   * 更新工具状态和结果
   */
  const handleToolResponse = (arg: TToolResponse) => {
    setCurrentTools((tools) =>
      tools.map((t) => {
        if (t.toolName === arg.toolName) {
          return {
            ...arg,
            toolLoading: false,
          };
        }
        return t;
      })
    );
  };

  /**
   * 添加工具到当前工具列表
   * 用于追踪工具调用状态
   */
  const addTool = (toolName: string, loading = true) => {
    setCurrentTools((tools) => [...tools, { toolName, toolLoading: loading }]);
  };

  return {
    currentTools,
    prepareAvailableTools,
    handleToolResponse,
    addTool,
  };
}
