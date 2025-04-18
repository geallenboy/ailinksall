import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import {
  DisableEnter,
  ShiftEnterToLineBreak,
} from "@/lib/chat/tiptap-extension";
import { useTools } from "@/hooks";
import { useChatStore } from "@/store/chat";
import { TToolResponse } from "@/types/chat.type";

/**
 * 获取聊天编辑器的扩展配置
 * 包含文档、段落、文本、占位符、高亮和自定义行为扩展
 */
export const getChatEditorExtensions = () => [
  Document,
  Paragraph,
  Text,
  Placeholder.configure({
    placeholder: "输入 / 或询问任何问题...",
  }),
  ShiftEnterToLineBreak,
  Highlight.configure({
    HTMLAttributes: {
      class: "prompt-highlight",
    },
  }),
  HardBreak,
  DisableEnter,
];

/**
 * 获取模型可用的工具列表
 * 基于当前模型支持的插件和用户偏好设置过滤并配置工具
 */
const getAvailableTools = (
  selectedModelKey: any,
  plugins: string[],
  toolConfig: {
    updatePreferences: any;
    preferences: any;
    apiKeys: any;
  }
): any[] => {
  // 如果模型没有插件支持，返回空数组
  if (!selectedModelKey?.plugins || selectedModelKey.plugins.length === 0) {
    return [];
  }

  const { updatePreferences, preferences, apiKeys } = toolConfig;
  const { getToolByKey } = useTools();
  const { setCurrentTools } = useChatStore.getState();

  // 1. 过滤出用户启用的插件
  const enabledPlugins = selectedModelKey.plugins.filter((pluginKey: string) =>
    plugins.includes(pluginKey)
  );

  // 2. 将插件键转换为工具实例
  const toolInstances = enabledPlugins
    .map((pluginKey: string) => {
      const toolDefinition = getToolByKey(pluginKey);
      if (!toolDefinition) return null;

      // 创建工具实例并提供必要的配置
      return toolDefinition.tool({
        updatePreferences,
        preferences,
        apiKeys,
        // 工具响应回调 - 更新工具状态
        sendToolResponse: (response: TToolResponse) => {
          const { currentTools } = useChatStore.getState();
          const newTools = currentTools.map((tool) => {
            // 只更新匹配的工具条目
            if (tool.toolName === response.toolName) {
              return {
                ...response,
                toolLoading: false,
              };
            }
            return tool;
          });
          setCurrentTools(newTools);
        },
      });
    })
    // 3. 过滤掉无效工具（null 或 undefined）
    .filter(Boolean);

  return toolInstances;
};
