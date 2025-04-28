"use client";

import { v4 } from "uuid";
import dayjs from "dayjs";
import { useChatStore } from "@/store/chat/chat-store";
import { usePreferenceContext, useSessionsContext } from "@/context";
import { useModelList, useTools, useChatSessionQuery } from "@/hooks";

import { sortMessages } from "@/lib/chat/helper";
import { TChatSession, TLLMInputProps, TToolResponse } from "@/types/chat";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { defaultPreferences } from "@/config/chat/preferences";
import { useChatPrompt } from "./use-chat-prompt";
import { useToast } from "@/components/ui/use-toast";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Serialized } from "@langchain/core/load/serializable";
import { LLMResult } from "@langchain/core/outputs";
import { useEffect } from "react";
import { useSessionStore } from "@/store/chat";

/**
 * AI消息生成Hook
 * 负责与AI模型的交互、消息流处理和工具调用
 */
export function useChatGeneration() {
  // 获取状态和更新方法
  const {
    currentTools,
    currentMessage,
    setIsGenerating,
    setCurrentMessage,
    setCurrentTools,
    setAbortController,
    updateCurrentMessage,
  } = useChatStore();

  // 获取会话相关功能
  const { getSessionById } = useSessionsContext();
  const { updateSessionMutation: updateSessionMutationApi } =
    useChatSessionQuery();

  // 获取偏好设置和工具
  const { apiKeys, preferences, updatePreferences } = usePreferenceContext();
  const { getAssistantByKey, createInstance, getModelByKey } = useModelList();
  const { getToolByKey } = useTools();

  // 获取提示词构建方法
  const { preparePrompt } = useChatPrompt();

  // 通知组件
  const { toast } = useToast();

  // 获取会话操作方法
  const { addMessageToSession, setCurrentSession } = useSessionsContext();

  // 监听当前消息变化，同步更新会话状态
  useEffect(() => {
    const props = currentMessage;

    if (props) {
      // 获取当前会话
      const session = useSessionStore.getState().currentSession;

      if (session) {
        const existingMessage = session.messages.find(
          (message) => message.id === props.id
        );

        let updatedSession;

        if (existingMessage) {
          updatedSession = {
            ...session,
            messages: session.messages.map((message) => {
              if (message.id === props.id) {
                return {
                  ...message,
                  ...props,
                  tools: currentTools,
                };
              }
              return message;
            }),
          };
        } else {
          updatedSession = {
            ...session,
            messages: [...session.messages, { ...props, tools: currentTools }],
          };
        }

        // setCurrentSession(updatedSession);
      }
    }
    if (currentMessage?.stop) {
      currentMessage?.sessionId &&
        addMessageToSession(currentMessage?.sessionId, {
          ...currentMessage,
          isLoading: false,
          tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
        });
      setIsGenerating(false);
    }
  }, [currentMessage, currentTools]);

  /*
   * 运行AI模型生成回复
   */
  const runModel = async (props: TLLMInputProps) => {
    // 初始化状态
    setIsGenerating(true);
    setCurrentMessage(undefined);
    setCurrentTools([]);

    // 解构参数
    const { sessionId, messageId, input, context, image, assistant } = props;
    console.log(props, "runModel props");
    // 创建中止控制器
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);

    // 获取当前会话
    const selectedSession = await getSessionById(sessionId);
    console.log(selectedSession, "selectedSession==>");
    // 输入验证
    if (!input) {
      return;
    }

    // 创建消息ID
    const newMessageId = messageId || v4();
    const modelKey = assistant.baseModel;

    // 准备历史消息
    const allPreviousMessages =
      selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    console.log(chatHistory, "chatHistory==>");
    // 获取插件配置和消息限制
    const plugins = preferences.defaultPlugins || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;
    console.log(
      {
        inputProps: props,
        id: newMessageId,
        sessionId,
        rawHuman: input,
        createdAt: dayjs().toISOString(),
        isLoading: true,
      },
      "初始化消息状态"
    );
    // 初始化消息状态
    setCurrentMessage({
      inputProps: props,
      id: newMessageId,
      sessionId,
      rawHuman: input,
      createdAt: dayjs().toISOString(),
      isLoading: true,
    });

    // 获取模型配置
    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    // 检查API密钥
    const apiKey = apiKeys[selectedModelKey?.baseModel];
    if (!apiKey) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "apikey",
      });
      return;
    }

    // 准备提示模板
    const prompt = await preparePrompt({
      context: context,
      image,
      history:
        selectedSession?.messages?.filter((m) => m.id !== messageId) || [],
      assistant,
    });

    // 准备可用工具
    const availableTools =
      selectedModelKey?.plugins
        ?.filter((p) => {
          return plugins.includes(p);
        })
        ?.map((p) =>
          getToolByKey(p)?.tool({
            updatePreferences,
            preferences,
            apiKeys,
            sendToolResponse: (arg: TToolResponse) => {
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
            },
          })
        )
        ?.filter((t): t is any => !!t) || [];

    console.log("Available tools", availableTools);

    // 创建模型实例
    const selectedModel = await createInstance(selectedModelKey, apiKey);

    // 准备历史消息
    const previousAllowedChatHistory = chatHistory
      .slice(0, messageLimit)
      .reduce(
        (acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman, image }) => {
          if (rawAI && rawHuman) {
            return [...acc, new HumanMessage(rawHuman), new AIMessage(rawAI)];
          } else {
            return [...acc];
          }
        },
        []
      );
    console.log(
      previousAllowedChatHistory,
      "previousAllowedChatHistory==>",
      messageLimit
    );
    // 准备Agent执行器
    let agentExecutor: AgentExecutor | undefined;

    // 创建模型副本并添加中止信号
    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));
    Object.assign(modifiedModel, selectedModel);
    modifiedModel.bindTools = (tools: any[], options: any) => {
      return selectedModel.bindTools?.(tools, {
        ...options,
        signal: currentAbortController?.signal,
      });
    };

    // 如果有可用工具，创建工具调用代理
    if (availableTools?.length) {
      const agentWithTool = await createToolCallingAgent({
        llm: modifiedModel as any,
        tools: availableTools,
        prompt: prompt as any,
        streamRunnable: true,
      });

      agentExecutor = new AgentExecutor({
        agent: agentWithTool as any,
        tools: availableTools,
      });
    }

    // 创建不带工具的链
    const chainWithoutTools = prompt.pipe(
      selectedModel.bind({
        signal: currentAbortController?.signal,
      }) as any
    );

    // 跟踪流式生成的消息
    let streamedMessage = "";

    // 选择执行器
    const executor =
      !!availableTools?.length && agentExecutor
        ? agentExecutor
        : chainWithoutTools;

    try {
      // 调用模型/代理生成回复
      const stream: any = await executor.invoke(
        {
          chat_history: previousAllowedChatHistory || [],
          context,
          input,
        },
        {
          callbacks: [
            {
              // 模型开始生成
              handleLLMStart: async (llm: Serialized, prompts: string[]) => {},

              // 工具启动处理
              handleToolStart(
                tool,
                input,
                runId,
                parentRunId,
                tags,
                metadata,
                name
              ) {
                console.log("handleToolStart", name);
                name &&
                  setCurrentTools((tools) => [
                    ...tools,
                    { toolName: name, toolLoading: true },
                  ]);
              },

              // 工具错误处理
              handleToolError(err, runId, parentRunId, tags) {},

              // 工具完成处理
              handleToolEnd(output, runId, parentRunId, tags) {},

              // 模型生成结束
              handleLLMEnd: async (output: LLMResult) => {
                console.log("handleLLMEnd", output);
              },

              // 处理流式返回的新token
              handleLLMNewToken: async (token: string) => {
                streamedMessage += token;
                updateCurrentMessage({
                  isLoading: true,
                  rawAI: streamedMessage,
                  stop: false,
                  stopReason: undefined,
                });
              },

              // 处理链条结束
              handleChainEnd: async (output: any) => {},

              // 处理模型错误
              handleLLMError: async (err: Error) => {
                console.error("handleLLMError", err);
                if (!currentAbortController?.signal.aborted) {
                  toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                  });
                }

                updateCurrentMessage({
                  isLoading: false,
                  rawHuman: input,
                  rawAI: streamedMessage,
                  stop: true,
                  stopReason: currentAbortController?.signal.aborted
                    ? "cancel"
                    : "error",
                });
              },
            },
          ],
        }
      );
      console.log("stream", stream);
      console.log(
        {
          rawHuman: input,
          rawAI: stream?.content || stream?.output,
          isLoading: false,
          stop: true,
          stopReason: "finish",
        },
        "更新消息状态"
      );
      // 更新最终消息状态
      updateCurrentMessage({
        rawHuman: input,
        rawAI: stream?.content || stream?.output,
        isLoading: false,
        stop: true,
        stopReason: "finish",
      });
    } catch (err) {
      // 处理错误
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "error",
      });
      console.error(err);
    }
  };

  /**
   * 为会话生成标题
   * 使用AI根据首条消息生成描述性标题
   */
  const generateTitleForSession = async (sessionId: string) => {
    // 获取会话数据
    const session = await getSessionById(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    // 获取API密钥和模型
    const apiKey = apiKeys[assistant.model.baseModel];
    const selectedModel = await createInstance(assistant.model, apiKey!);
    const firstMessage = session?.messages?.[0];

    // 检查是否符合生成标题的条件
    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      session?.messages?.length > 2
    ) {
      return;
    }

    // 创建生成标题的提示模板
    const template = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("message"),
      [
        "user",
        "Make this prompt clear and consise? You must strictly answer with only the title, no other text is allowed.\n\nAnswer in English.",
      ],
    ]);

    try {
      // 准备提示并生成标题
      const prompt = await template.formatMessages({
        message: [new HumanMessage(firstMessage.rawHuman)],
      });

      const generation = await selectedModel.invoke(prompt);
      const newTitle = generation?.content?.toString() || session.title;

      // 更新会话标题
      await updateSessionMutationApi.mutate({
        sessionId,
        session: newTitle
          ? { title: newTitle, updatedAt: dayjs().toISOString() }
          : {},
      });
    } catch (e) {
      console.error(e);
      return;
    }
  };

  return {
    runModel,
    generateTitleForSession,
  };
}
