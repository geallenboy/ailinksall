"use client";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chat/chat-store";
import { usePreferenceHooks } from "@/hooks/chat/use-preference-hooks";
import { useChatSessionQuery, useModelList, useTools } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Highlight } from "@tiptap/extension-highlight";
import { HardBreak } from "@tiptap/extension-hard-break";
import { useEditor } from "@tiptap/react";
import { TLLMInputProps, TChatMessage, TToolResponse } from "@/types/chat";
import { v4 } from "uuid";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { defaultPreferences } from "@/config/chat/preferences";
import { useSessionHooks } from "./use-session-hooks";
import { useSettingsStore } from "@/store/chat";
import { removeExtraSpaces, sortMessages } from "@/lib/chat/helper";
import dayjs from "dayjs";
import {
  DisableEnter,
  ShiftEnterToLineBreak,
} from "@/lib/chat/tiptap-extension";
import { Serialized } from "@langchain/core/load/serializable";
import { LLMResult } from "@langchain/core/outputs";

export function useChatHooks() {
  const {
    contextValue,
    isGenerating,
    openPromptsBotCombo,
    currentMessage,
    currentTools,
    abortController,
    setContextValue,
    setIsGenerating,
    setOpenPromptsBotCombo,
    setCurrentMessage,
    updateCurrentMessage,
    setCurrentTools,
    setAbortController,
  } = useChatStore();

  const {
    currentSession,
    setCurrentSession,
    addMessageToSession,
    getSessionById,
    refetchSessions,
  } = useSessionHooks();
  const { updateSessionMutation } = useChatSessionQuery();

  const { apiKeys, preferences, updatePreferences } = usePreferenceHooks();
  const { getAssistantByKey, createInstance, getModelByKey } = useModelList();
  const { getToolByKey } = useTools();
  const { toast } = useToast();
  const { open: openSettings } = useSettingsStore();

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type / or Ask anything...",
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
  useEffect(() => {
    if (!currentMessage) return;

    setCurrentSession?.((session: any) => {
      if (!session) return undefined;

      const existingMessage = session.messages.find(
        (message: { id: string }) => message.id === currentMessage.id
      );
      // 确保messages数组存在
      const currentMessages = session.messages || [];
      if (existingMessage) {
        return {
          ...session,
          messages: currentMessages.map((message: { id: string }) => {
            if (message.id === currentMessage.id) {
              return { ...message, ...currentMessage, tools: currentTools };
            }
            return message;
          }),
        };
      }

      return {
        ...session,
        messages: [
          ...session.messages,
          { ...currentMessage, tools: currentTools },
        ],
      };
    });

    if (currentMessage?.stop) {
      currentMessage?.sessionId &&
        addMessageToSession(currentMessage.sessionId, {
          ...currentMessage,
          isLoading: false,
          tools: currentTools?.map((t) => ({ ...t, toolLoading: false })),
        });
      setIsGenerating(false);
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
    assistant: any;
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
            updatePreferences: updatePreferences as any,
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
  const generateTitleForSession = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    const apiKey = apiKeys[assistant.model.baseModel];
    const selectedModel = await createInstance(assistant.model, apiKey!);
    const firstMessage = session?.messages?.[0];

    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      session?.messages?.length > 2
    ) {
      return;
    }

    const template = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("message"),
      [
        "user",
        "Make this prompt clear and consise? You must strictly answer with only the title, no other text is allowed.\n\nAnswer in English.",
      ],
    ]);

    try {
      const prompt = await template.formatMessages({
        message: [new HumanMessage(firstMessage.rawHuman)],
      });

      const generation = await selectedModel.invoke(prompt);
      const newTitle = generation?.content?.toString() || session.title;

      await updateSessionMutation.mutate({
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

  const handleRunModel = async (props: TLLMInputProps, clear?: () => void) => {
    console.log("props-input:", props.input);
    if (!props?.input) {
      return;
    }

    const assistantProps = getAssistantByKey(props?.assistant.key);
    if (!assistantProps) {
      return;
    }

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

    setContextValue("");
    clear?.();
    await runModel({
      sessionId: props?.sessionId?.toString(),
      input: removeExtraSpaces(props?.input),
      context: removeExtraSpaces(props?.context),
      image: props?.image,
      assistant: assistantProps.assistant,
      messageId: props?.messageId,
    });
    refetchSessions?.();
  };

  const sendMessage = async () => {
    console.log("editor:", editor);
    console.log("currentSession:", currentSession);
    if (!editor || !currentSession?.id) {
      console.warn("无法发送消息: 编辑器或会话ID不存在");
      return;
    }
    const props = getAssistantByKey(preferences.defaultAssistant);
    console.log("props", props);
    if (!props) {
      console.warn("无法发送消息: 未找到助手配置");
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
