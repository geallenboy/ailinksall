"use client";

import { useChatStore } from "@/store/chat/chat-store";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";
import { useModelList } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useSessionHooks } from "./use-session-hooks";
import { useSettingsStore } from "@/store/chat";
import { removeExtraSpaces } from "@/lib/chat/helper";
import { useChatEditor } from "./chat/use-chat-editor";
import { useChatGeneration } from "./chat/use-chat-generation";
import { TLLMInputProps } from "@/types/chat";

/**
 * 聊天功能主入口Hook
 * 协调编辑器、消息处理、AI生成和其他模块之间的交互
 */
export function useChatHooks() {
  // 从各个Hook获取功能和状态
  const {
    contextValue,
    isGenerating,
    openPromptsBotCombo,
    setContextValue,
    setOpenPromptsBotCombo,
    abortController,
  } = useChatStore();

  // 获取当前会话信息
  const { currentSession, refetchSessions } = useSessionHooks();

  // 获取偏好设置和API密钥
  const { apiKeys, preferences } = usePreferenceHooks();

  // 获取模型和助手信息
  const { getAssistantByKey } = useModelList();

  // 获取设置面板控制函数
  const { open: openSettings } = useSettingsStore();

  // 获取编辑器实例和控制方法
  const { editor } = useChatEditor();

  // 获取消息处理方法
  const stopGeneration = () => {
    abortController?.abort("cancel");
  };

  // 获取消息生成方法
  const { runModel, generateTitleForSession } = useChatGeneration();

  // 使用通知组件
  const { toast } = useToast();

  /**
   * 处理模型运行
   * 验证输入、检查API密钥、准备上下文并运行模型
   */
  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    if (!props?.input) {
      return;
    }

    // 获取选中的助手信息
    const assistantProps = getAssistantByKey(props?.assistant.key);
    if (!assistantProps) {
      return;
    }

    // 检查API密钥是否存在
    const apiKey = apiKeys[assistantProps.model.baseModel];
    if (!apiKey && assistantProps.model.baseModel !== "ollama") {
      toast({
        title: "Ahh!",
        description: "API key is missing. Please check your settings.",
        variant: "destructive",
      });
      openSettings(assistantProps.model.baseModel);
      return;
    }

    // 清空上下文和输入框
    setContextValue("");
    clear?.();
    console.log("Running model with props:", {
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assistantProps.assistant,
      messageId: props?.messageId,
    });
    // 运行模型
    await runModel({
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assistantProps.assistant,
      messageId: props?.messageId,
    });

    // 刷新会话列表
    refetchSessions?.();
  };

  /**
   * 发送消息
   * 从编辑器获取用户输入并发送给AI助手
   */
  const sendMessage = async () => {
    // 验证必要条件
    if (!editor || !currentSession?.id) {
      console.warn("无法发送消息: 编辑器或会话ID不存在");
      return;
    }

    // 获取当前选中的助手
    const props = getAssistantByKey(preferences.defaultAssistant);

    if (!props) {
      console.warn("无法发送消息: 未找到助手配置");
      return;
    }

    // 调用模型处理输入
    handleRunModel(
      {
        input: editor.getText(),
        context: contextValue,
        sessionId: currentSession?.id?.toString(),
        assistant: props.assistant,
      },
      () => {
        // 成功发送后清空编辑器并聚焦
        editor.commands.clearContent();
        editor.commands.insertContent("");
        editor.commands.focus("end");
      }
    );
  };

  // 返回聊天所需的状态和方法
  return {
    editor,
    contextValue,
    isGenerating,
    openPromptsBotCombo,
    sendMessage,
    handleRunModel,
    stopGeneration,
    setContextValue,
    setOpenPromptsBotCombo,
    generateTitleForSession,
  };
}
