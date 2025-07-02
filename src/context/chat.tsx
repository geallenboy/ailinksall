"use client";

import { useToast } from "@/components/ui/use-toast";
import { sortMessages } from "@/lib/chat/helper";
import { v4 } from "uuid";
import dayjs from "dayjs";
import { createContext, useContext, useEffect, useState } from "react";
import { usePreferenceContext, useSessionsContext } from "@/context";
import { TChatMessage, TLLMInputProps, TToolResponse } from "@/types/chat";
import { useModelList, useTools } from "@/hooks";
import { useSettingsStore } from "@/store/chat";
import { logger } from "@/lib/logger";
import { TChatContext, TChatProvider } from "./chat/types";
import { createChatEditor, clearEditorContent } from "./chat/editor-utils";
import { setupModelExecution, runModel } from "./chat/model-runner";
import { createModelCallbacks } from "./chat/callbacks";
import { formatModelRunParams } from "./chat/model-utils";

export const ChatContext = createContext<undefined | TChatContext>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const {
    setCurrentSession,
    refetchSessions,
    currentSession,
    addMessageToSession,
    getSessionById,
  } = useSessionsContext();

  const { getAssistantByKey, createInstance, getModelByKey } = useModelList();
  const [openPromptsBotCombo, setOpenPromptsBotCombo] = useState(false);
  const [contextValue, setContextValue] = useState("");
  const { open: openSettings } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<TChatMessage>();
  const [currentTools, setCurrentTools] = useState<TToolResponse[]>([]);
  const { apiKeys, preferences, updatePreferences } = usePreferenceContext();
  const { getToolByKey } = useTools();
  const { toast } = useToast();
  const [abortController, setAbortController] = useState<AbortController>();

  // 创建编辑器
  const editor = createChatEditor(setOpenPromptsBotCombo);

  // 更新当前消息
  const updateCurrentMessage = (update: Partial<TChatMessage>) => {
    logger.debug("正在更新当前消息", update);

    setCurrentMessage((prev) => {
      if (!!prev) {
        return {
          ...prev,
          ...update,
        };
      }
      return prev;
    });
  };

  // 当消息状态改变时更新会话
  useEffect(() => {
    const props = currentMessage;

    if (props) {
      logger.debug("消息状态发生变化", {
        id: props.id,
        isLoading: props.isLoading,
        stop: props.stop,
      });

      setCurrentSession?.((session) => {
        if (!session) return undefined;
        const exisingMessage = session.messages.find(
          (message) => message.id === props.id
        );
        if (exisingMessage) {
          return {
            ...session,
            messages: session.messages.map((message) => {
              if (message.id === props.id) {
                return { ...message, ...props, tools: currentTools };
              }
              return message;
            }),
          };
        }

        return {
          ...session,
          messages: [...session.messages, { ...props, tools: currentTools }],
        };
      });

      if (props.stop) {
        props.sessionId &&
          addMessageToSession(props.sessionId, {
            ...props,
            isLoading: false,
            tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
          });
        setIsGenerating(false);
      }
    }
  }, [currentMessage, currentTools]);

  // 停止生成
  const stopGeneration = () => {
    logger.info("正在停止生成");
    abortController?.abort("cancel");
  };

  // 运行模型
  const runModelWrapper = async (props: TLLMInputProps) => {
    setIsGenerating(true);
    setCurrentMessage(undefined);
    setCurrentTools([]);

    const { sessionId, messageId, input, context, image, assistant } = props;
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    if (!input) {
      logger.warn("未提供输入内容");
      return;
    }

    const newMessageId = messageId || v4();

    // 设置初始消息状态
    setCurrentMessage({
      inputProps: props,
      id: newMessageId,
      sessionId,
      rawHuman: input,
      createdAt: dayjs().toISOString(),
      isLoading: true,
    });

    try {
      // 创建回调
      const callbacks = createModelCallbacks(
        updateCurrentMessage,
        setCurrentTools,
        newAbortController,
        toast
      );

      // 设置模型执行环境
      const executionContext = await setupModelExecution(
        {
          sessionId,
          messageId,
          input,
          context,
          image,
          assistant,
          abortController: newAbortController,
          updateCurrentMessage,
          setCurrentTools,
        },
        {
          getSessionById,
          getToolByKey,
          createInstance,
          getModelByKey,
          apiKeys,
          preferences,
          updatePreferences,
          toast,
        }
      );

      // 获取会话数据
      const selectedSession = await getSessionById(sessionId);
      const allPreviousMessages =
        selectedSession?.messages?.filter((m: any) => m.id !== messageId) || [];
      const chatHistory = sortMessages(allPreviousMessages, "createdAt");
      const messageLimit = preferences.messageLimit || 100;

      // 处理聊天历史
      const previousAllowedChatHistory = chatHistory
        .slice(0, messageLimit)
        .reduce((acc: any[], { rawAI, rawHuman, image }: any) => {
          if (rawAI && rawHuman) {
            // 需要引入 HumanMessage 和 AIMessage
            return [
              ...acc,
              { content: rawHuman, type: "human" },
              { content: rawAI, type: "ai" },
            ];
          } else {
            return [...acc];
          }
        }, []);

      // 运行模型
      await runModel(
        executionContext,
        input,
        context,
        previousAllowedChatHistory,
        updateCurrentMessage,
        toast,
        callbacks
      );
    } catch (error) {
      logger.error("模型运行失败", { error });
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "error",
      });
    }
  };

  // 处理模型运行
  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    logger.info("处理模型运行请求", {
      sessionId: props?.sessionId,
      hasInput: !!props?.input,
      assistantKey: props?.assistant?.key,
    });

    if (!props?.input) {
      return;
    }

    const assistantProps = getAssistantByKey(props?.assistant.key);
    if (!assistantProps) {
      logger.warn("未找到助手", { key: props?.assistant.key });
      return;
    }

    const apiKey = apiKeys[assistantProps.model.baseModel];
    if (!apiKey && assistantProps.model.baseModel !== "ollama") {
      logger.warn("缺少API密钥", { model: assistantProps.model.baseModel });
      toast({
        title: "啊哦！",
        description: "缺少API密钥。请检查您的设置。",
        variant: "destructive",
      });
      openSettings(assistantProps.model.baseModel);
      return;
    }

    setContextValue("");
    clear?.();

    const formattedParams = formatModelRunParams(
      props,
      assistantProps.assistant
    );

    await runModelWrapper({
      sessionId: props?.sessionId?.toString(),
      input: formattedParams.input,
      context: formattedParams.context,
      image: formattedParams.image,
      assistant: assistantProps.assistant,
      messageId: props?.messageId,
    });

    refetchSessions?.();
  };

  // 发送消息
  const sendMessage = async () => {
    logger.info("正在发送消息");

    if (!editor || !currentSession?.id) {
      logger.warn("无法发送消息 - 编辑器或会话不可用");
      return;
    }

    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props) {
      logger.warn("未找到默认助手");
      return;
    }

    handleRunModel(
      {
        input: editor.getText(),
        context: contextValue,
        sessionId: currentSession?.id?.toString(),
        assistant: props.assistant,
      },
      () => clearEditorContent(editor)
    );
  };

  return (
    <ChatContext.Provider
      value={{
        editor,
        sendMessage,
        handleRunModel,
        openPromptsBotCombo,
        setOpenPromptsBotCombo,
        contextValue,
        isGenerating,
        setContextValue,
        stopGeneration,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
