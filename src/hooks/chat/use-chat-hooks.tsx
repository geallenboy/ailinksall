"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useChatStore } from "@/store/chat/chat-store";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";
import { useModelList, useTools } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useSessionHooks } from "./use-session-hooks";
import {
  usePreferenceStore,
  useSessionStore,
  useSettingsStore,
} from "@/store/chat";
import { removeExtraSpaces, sortMessages } from "@/lib/chat/helper";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { useEditor } from "@tiptap/react";
import {
  DisableEnter,
  ShiftEnterToLineBreak,
} from "@/lib/chat/tiptap-extension";
import {
  TAssistant,
  TChatMessage,
  TLLMInputProps,
  TToolResponse,
} from "@/types/chat";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { v4 } from "uuid";
import { defaultPreferences } from "@/config/chat/preferences";
import dayjs from "dayjs";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { Serialized } from "@langchain/core/load/serializable";
import { LLMResult } from "@langchain/core/outputs";

/**
 * 聊天功能主入口Hook
 * 协调编辑器、消息处理、AI生成和其他模块之间的交互
 */
export function useChatHooks() {
  // 从各个Hook获取功能和状态
  const setOpenPromptsBotCombo = useChatStore(
    (state) => state.setOpenPromptsBotCombo
  );
  const currentMessage = useChatStore.getState().currentMessage;
  const setCurrentMessage = useChatStore((state) => state.setCurrentMessage);
  const contextValue = useChatStore((state) => state.contextValue);
  const isGenerating = useChatStore((state) => state.isGenerating);
  const openPromptsBotCombo = useChatStore(
    (state) => state.openPromptsBotCombo
  );
  const setAbortController = useChatStore((state) => state.setAbortController);
  const currentTools = useChatStore((state) => state.currentTools);
  const setCurrentTools = useChatStore((state) => state.setCurrentTools);
  const setContextValue = useChatStore((state) => state.setContextValue);
  const abortController = useChatStore((state) => state.abortController);
  const setIsGenerating = useChatStore((state) => state.setIsGenerating);
  const currentSession = useSessionStore.getState().currentSession;

  const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
  const { addMessageToSession, getSessionById, refetchSessions } =
    useSessionHooks();
  const { createInstance, getModelByKey, getAssistantByKey } = useModelList();
  const preferences = usePreferenceStore((state) => state.preferences);
  const apiKeys = usePreferenceStore((state) => state.apiKeys);
  const { updatePreferences } = usePreferenceHooks();
  const openSettings = useSettingsStore((state) => state.open);

  const { toast } = useToast();
  const { getToolByKey } = useTools();

  const updateCurrentMessage = (update: Partial<TChatMessage>) => {
    if (currentMessage) {
      setCurrentMessage({
        ...currentMessage,
        ...update,
      });
    }
  };

  useEffect(() => {
    console.log("currentMessage", currentMessage);
    const props = currentMessage;

    if (props) {
      if (currentSession) {
        const exisingMessage = currentSession.messages.find(
          (message) => message.id === props.id
        );

        let updatedSession;
        if (exisingMessage) {
          updatedSession = {
            ...currentSession,
            messages: currentSession.messages.map((message) => {
              if (message.id === props.id) {
                return { message, ...{ ...props, tools: currentTools } };
              }
              return message;
            }),
          };
        } else {
          updatedSession = {
            ...currentSession,
            messages: [
              ...currentSession.messages,
              { ...props, tools: currentTools },
            ],
          };
        }

        // 更新会话
        setCurrentSession(updatedSession);
      }
    }
  }, [currentMessage, currentTools]);

  const stopGeneration = () => {
    abortController?.abort("cancel");
  };

  const preparePrompt = async ({
    context,
    image,
    history,
    assistant,
  }: {
    context?: string;
    image?: string;
    history: TChatMessage[];
    assistant: TAssistant;
  }) => {
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt = assistant.systemPrompt;

    const system: BaseMessagePromptTemplateLike = [
      "system",
      `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
        "\n"
      )}\n ${
        hasPreviousMessages
          ? `You can also refer to these previous conversations`
          : ``
      }`,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

    const userContent = `{input}\n\n${
      context
        ? `Answer user's question based on the following context: """{context}"""`
        : ``
    } `;

    const user: BaseMessagePromptTemplateLike = [
      "user",
      image
        ? [
            {
              type: "text",
              content: userContent,
            },
            {
              type: "image_url",
              image_url: image,
            },
          ]
        : userContent,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      system,
      messageHolders,
      user,
      ["placeholder", "{agent_scratchpad}"],
    ]);

    return prompt;
  };

  const runModel = async (props: TLLMInputProps) => {
    setIsGenerating(true);
    setCurrentMessage(undefined);
    setCurrentTools([]);

    const { sessionId, messageId, input, context, image, assistant } = props;
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);
    const selectedSession = await getSessionById(sessionId);

    if (!input) {
      return;
    }

    const newMessageId = messageId || v4();
    const modelKey = assistant.baseModel;

    const allPreviousMessages =
      selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
    const chatHistory = sortMessages(allPreviousMessages, "createdAt");
    const plugins = preferences.defaultPlugins || [];
    const messageLimit =
      preferences.messageLimit || defaultPreferences.messageLimit;

    setCurrentMessage({
      inputProps: props,
      id: newMessageId,
      sessionId,
      rawHuman: input,
      createdAt: dayjs().toISOString(),
      isLoading: true,
    });

    const selectedModelKey = getModelByKey(modelKey);
    if (!selectedModelKey) {
      throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];

    if (!apiKey) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "apikey",
      });

      return;
    }

    const prompt = await preparePrompt({
      context: context,
      image,
      history:
        selectedSession?.messages?.filter((m) => m.id !== messageId) || [],
      assistant,
    });

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

    const selectedModel = await createInstance(selectedModelKey, apiKey);

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

    let agentExecutor: AgentExecutor | undefined;

    // Creating a copy of the model
    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));

    Object.assign(modifiedModel, selectedModel);

    modifiedModel.bindTools = (tools: any[], options: any) => {
      return selectedModel.bindTools?.(tools, {
        ...options,
        signal: currentAbortController?.signal,
      });
    };

    if (availableTools?.length) {
      const agentWithTool = await createToolCallingAgent({
        llm: modifiedModel as any,
        tools: availableTools,
        prompt: prompt as any,
        streamRunnable: true,
      });

      console.log("aGENT WITH TOOL", agentWithTool);

      agentExecutor = new AgentExecutor({
        agent: agentWithTool as any,
        tools: availableTools,
      });
    }
    const chainWithoutTools = prompt.pipe(
      selectedModel.bind({
        signal: currentAbortController?.signal,
      }) as any
    );

    let streamedMessage = "";

    const executor =
      !!availableTools?.length && agentExecutor
        ? agentExecutor
        : chainWithoutTools;

    try {
      const stream: any = await executor.invoke(
        {
          chat_history: previousAllowedChatHistory || [],
          context,
          input,
        },
        {
          callbacks: [
            {
              handleLLMStart: async (llm: Serialized, prompts: string[]) => {},
              handleToolStart(
                tool,
                input,
                runId,
                parentRunId,
                tags,
                metadata,
                name
              ) {
                console.log(
                  "handleToolStart",
                  tool,
                  input,
                  runId,
                  parentRunId,
                  tags,
                  metadata,
                  name
                );

                name &&
                  setCurrentTools((tools) => [
                    ...tools,
                    { toolName: name, toolLoading: true },
                  ]);
              },
              handleToolError(err, runId, parentRunId, tags) {},
              handleToolEnd(output, runId, parentRunId, tags) {},

              handleLLMEnd: async (output: LLMResult) => {
                console.log("handleLLMEnd", output);
              },
              handleLLMNewToken: async (token: string) => {
                streamedMessage += token;
                updateCurrentMessage({
                  isLoading: true,
                  rawAI: streamedMessage,
                  stop: false,
                  stopReason: undefined,
                });
              },
              handleChainEnd: async (output: any) => {},
              handleLLMError: async (err: Error) => {
                console.error("handleLLMError", err);
                if (!currentAbortController?.signal.aborted) {
                  toast({
                    title: "错误",
                    description: "发生了一些问题",
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

      updateCurrentMessage({
        rawHuman: input,
        rawAI: stream?.content || stream?.output,
        isLoading: false,
        stop: true,
        stopReason: "finish",
      });
    } catch (err) {
      updateCurrentMessage({
        isLoading: false,
        stop: true,
        stopReason: "error",
      });
      console.error(err);
    }
  };

  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    if (!props?.input) {
      return;
    }

    const assitantprops = getAssistantByKey(props?.assistant.key);

    if (!assitantprops) {
      return;
    }

    const apiKey = apiKeys[assitantprops.model.baseModel];

    if (!apiKey && assitantprops.model.baseModel !== "ollama") {
      toast({
        title: "Ahh!",
        description: "API key is missing. Please check your settings.",
        variant: "destructive",
      });
      openSettings(assitantprops.model.baseModel);
      return;
    }

    setContextValue("");
    clear?.();
    await runModel({
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assitantprops.assistant,
      messageId: props?.messageId,
    });
    refetchSessions?.();
  };

  const editor = useEditor({
    extensions: [
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
    ],
    content: ``,
    autofocus: true,
    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();
      if (text === "/") {
        setOpenPromptsBotCombo(true);
      } else {
        const newHTML = html.replace(
          /{{{{(.*?)}}}}/g,
          ` <mark class="prompt-highlight">$1</mark> `
        );

        if (newHTML !== html) {
          editor.commands.setContent(newHTML, true, {
            preserveWhitespace: true,
          });
        }
        setOpenPromptsBotCombo(false);
      }
    },

    parseOptions: {
      preserveWhitespace: "full",
    },
  });

  const sendMessage = async () => {
    if (!editor || !currentSession?.id) {
      return;
    }
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props) {
      return;
    }
    handleRunModel(
      {
        input: editor.getText(),
        context: contextValue,
        sessionId: currentSession?.id?.toString(),
        assistant: props.assistant,
      },
      () => {
        editor.commands.clearContent();
        editor.commands.insertContent("");
        editor.commands.focus("end");
      }
    );
  };

  return {
    editor,
    sendMessage,
    handleRunModel,
    openPromptsBotCombo,
    setOpenPromptsBotCombo,
    contextValue,
    isGenerating,
    setContextValue,
    stopGeneration,
  };
}
