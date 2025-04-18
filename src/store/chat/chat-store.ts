/**
 * 聊天功能状态管理
 * 基于 Zustand 实现的状态管理，负责聊天输入、消息发送和模型调用
 */
"use client";
import { create } from 'zustand';
import { useToast } from "@/components/ui/use-toast";
import { defaultPreferences, useChatSession, useTools } from "@/hooks";
import {
    TAssistant,
    TChatMessage,
    TLLMInputProps,
    TToolResponse,
} from "@/types/chat.type";
import { useModelList } from "@/hooks/use-model-list";
import { removeExtraSpaces, sortMessages } from "@/lib/chat/helper";
import { useEditor } from "@tiptap/react";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { LLMResult } from "@langchain/core/outputs";
import {
    BaseMessagePromptTemplateLike,
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { useSessionsStore } from '@/store/chat/sessions-store';
import { usePreferenceContext } from "@/context";
import { useSettingsStore } from "@/store/chat";
import type { Serialized } from "@langchain/core/load/serializable";


// 编辑器扩展在单独文件中引入
import { getChatEditorExtensions } from "@/config/chat/chat";

/**
 * 聊天状态接口定义
 */
interface ChatState {
    // 编辑器状态
    editor: ReturnType<typeof useEditor> | null;

    // UI状态
    openPromptsBotCombo: boolean;
    contextValue: string;
    isGenerating: boolean;
    currentMessage?: TChatMessage;
    currentTools: TToolResponse[];
    abortController?: AbortController;

    // 方法
    setOpenPromptsBotCombo: (value: boolean) => void;
    setContextValue: (value: string) => void;
    setIsGenerating: (value: boolean) => void;
    updateCurrentMessage: (update: Partial<TChatMessage>) => void;
    setCurrentTools: (tools: TToolResponse[]) => void;
    setAbortController: (controller?: AbortController) => void;

    // 业务功能
    initEditor: () => void;
    sendMessage: () => void;
    handleRunModel: (props: TLLMInputProps, clear?: () => void) => void;
    runModel: (props: TLLMInputProps) => Promise<void>;
    stopGeneration: () => void;
    generateTitleForSession: (sessionId: string) => Promise<void>;
    preparePrompt: (props: {
        context?: string;
        image?: string;
        history: TChatMessage[];
        assistant: TAssistant;
    }) => Promise<ChatPromptTemplate>;
}

/**
 * 创建聊天状态管理 store
 */
export const useChatStore = create<ChatState>((set, get) => ({
    // 初始状态
    editor: null,
    openPromptsBotCombo: false,
    contextValue: "",
    isGenerating: false,
    currentMessage: undefined,
    currentTools: [],
    abortController: undefined,

    // 设置方法
    setOpenPromptsBotCombo: (value: boolean) => set({ openPromptsBotCombo: value }),
    setContextValue: (value: string) => set({ contextValue: value }),
    setIsGenerating: (value: boolean) => set({ isGenerating: value }),
    updateCurrentMessage: (update: Partial<TChatMessage>) => set((state) => {
        if (state.currentMessage) {
            return {
                currentMessage: {
                    ...state.currentMessage,
                    ...update
                }
            };
        }
        return {};
    }),
    setCurrentTools: (tools: TToolResponse[]) => set({ currentTools: tools }),

    setAbortController: (controller?: AbortController) => set({ abortController: controller }),

    /**
     * 初始化编辑器
     * 设置编辑器配置和内容处理
     */
    initEditor: () => {
        const editor = useEditor({
            extensions: getChatEditorExtensions(),
            content: ``,
            autofocus: true,
            onTransaction(props) {
                const { editor } = props;
                const text = editor.getText();
                const html = editor.getHTML();

                // 处理提示符触发
                const { setOpenPromptsBotCombo } = useChatStore.getState();
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

        set({ editor });
    },

    /**
     * 停止生成
     * 中断当前的AI生成过程
     */
    stopGeneration: () => {
        const { abortController } = get();
        abortController?.abort("cancel");
    },

    /**
     * 准备提示模板
     * 构建包含系统提示、历史消息和用户输入的提示模板
     */
    preparePrompt: async ({ context, image, history, assistant }) => {
        const { preferences } = usePreferenceContext();
        const hasPreviousMessages = history?.length > 0;
        const systemPrompt = assistant.systemPrompt;

        // 构建系统提示
        const system: BaseMessagePromptTemplateLike = [
            "system",
            `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
                "\n"
            )}\n ${hasPreviousMessages
                ? `You can also refer to these previous conversations`
                : ``
            }`,
        ];

        // 历史消息占位符
        const messageHolders = new MessagesPlaceholder("chat_history");

        // 用户输入提示，包括可选的上下文和图像
        const userContent = `{input}\n\n${context
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

        // 创建完整提示模板
        const prompt = ChatPromptTemplate.fromMessages([
            system,
            messageHolders,
            user,
            ["placeholder", "{agent_scratchpad}"],
        ]);

        return prompt;
    },

    /**
     * 运行AI模型
     * 处理输入、调用模型API并处理流式响应
     */
    runModel: async (props: TLLMInputProps) => {
        const { setIsGenerating, updateCurrentMessage, setCurrentTools, setAbortController } = get();
        const { toast } = useToast();
        const { getToolByKey } = useTools();
        const { getModelByKey, createInstance, getAssistantByKey } = useModelList();
        const { getSessionById } = useSessionsStore();
        const { preferences, updatePreferences, apiKeys } = usePreferenceContext();

        // 启动生成流程
        setIsGenerating(true);
        set({ currentMessage: undefined });
        setCurrentTools([]);

        // 提取输入参数
        const { sessionId, messageId, input, context, image, assistant } = props;
        const currentAbortController = new AbortController();
        setAbortController(currentAbortController);

        // 获取当前会话
        const selectedSession = await getSessionById(sessionId);

        if (!input) {
            return;
        }

        // 创建新消息
        const newMessageId = messageId || v4();
        const modelKey = assistant.baseModel;

        const allPreviousMessages =
            selectedSession?.messages?.filter((m) => m.id !== messageId) || [];
        const chatHistory = sortMessages(allPreviousMessages, "createdAt");
        const plugins = preferences.defaultPlugins || [];
        const messageLimit =
            preferences.messageLimit || defaultPreferences.messageLimit;

        // 设置当前消息状态为加载中
        set({
            currentMessage: {
                inputProps: props,
                id: newMessageId,
                sessionId,
                rawHuman: input,
                createdAt: dayjs().toISOString(),
                isLoading: true,
            }
        });

        // 获取选中的模型配置
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
        const prompt = await get().preparePrompt({
            context: context,
            image,
            history:
                selectedSession?.messages?.filter((m) => m.id !== messageId) || [],
            assistant,
        });

        // 获取可用工具
        const availableTools =
            selectedModelKey?.plugins
                ?.filter((p) => plugins.includes(p))
                ?.map((p) =>
                    getToolByKey(p)?.tool({
                        updatePreferences,
                        preferences,
                        apiKeys,
                        sendToolResponse: (arg: TToolResponse) => {
                            const currentTools = get().currentTools || [];
                            const newTools = currentTools.map((t) => {
                                if (t.toolName === arg.toolName) {
                                    return {
                                        ...arg,
                                        toolLoading: false,
                                    };
                                }
                                return t;
                            });
                            get().setCurrentTools(newTools);
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

        let agentExecutor: AgentExecutor | undefined;

        // 创建模型副本并绑定中断信号
        const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));
        Object.assign(modifiedModel, selectedModel);
        modifiedModel.bindTools = (tools: any[], options: any) => {
            return selectedModel.bindTools?.(tools, {
                ...options,
                signal: currentAbortController?.signal,
            });
        };

        // 如果有工具，创建工具调用代理
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

        // 创建没有工具的链
        const chainWithoutTools = prompt.pipe(
            selectedModel.bind({
                signal: currentAbortController?.signal,
            }) as any
        );

        // 存储生成的消息
        let streamedMessage = "";

        // 选择执行器
        const executor =
            !!availableTools?.length && agentExecutor
                ? agentExecutor
                : chainWithoutTools;

        try {
            // 调用模型并处理结果
            const stream: any = await executor.invoke(
                {
                    chat_history: previousAllowedChatHistory || [],
                    context,
                    input,
                },
                {
                    callbacks: [
                        {
                            // LLM 启动回调
                            handleLLMStart: async (llm: Serialized, prompts: string[]) => { },

                            // 工具启动回调
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

                                name && (() => {
                                    const currentTools = get().currentTools || [];
                                    get().setCurrentTools([
                                        ...currentTools,
                                        { toolName: name, toolLoading: true },
                                    ]);
                                })();
                            },

                            // 工具错误和结束回调
                            handleToolError(err, runId, parentRunId, tags) { },
                            handleToolEnd(output, runId, parentRunId, tags) { },

                            // LLM 结束回调
                            handleLLMEnd: async (output: LLMResult) => {
                                console.log("handleLLMEnd", output);
                            },

                            // 处理流式生成的新token
                            handleLLMNewToken: async (token: string) => {
                                streamedMessage += token;
                                updateCurrentMessage({
                                    isLoading: true,
                                    rawAI: streamedMessage,
                                    stop: false,
                                    stopReason: undefined,
                                });
                            },

                            // 链结束和错误处理
                            handleChainEnd: async (output: any) => { },
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

            // 更新最终结果
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
    },

    /**
     * 处理模型运行
     * 进行输入验证、清理和调用模型运行
     */
    handleRunModel: async (props: TLLMInputProps, clear?: () => void) => {
        const { toast } = useToast();
        const { open: openSettings } = useSettingsStore();
        const { getAssistantByKey } = useModelList();
        const { apiKeys } = usePreferenceContext();
        const { refetchSessions } = useSessionsStore();
        const { setContextValue, runModel } = get();

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
    },

    /**
     * 发送消息
     * 从编辑器获取内容并调用模型处理
     */
    sendMessage: async () => {
        const { editor, handleRunModel, contextValue } = get();
        const { currentSession } = useSessionsStore();
        const { preferences } = usePreferenceContext();
        const { getAssistantByKey } = useModelList();

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
    },

    /**
     * 为会话生成标题
     * 使用AI生成一个基于第一条消息的会话标题
     */
    generateTitleForSession: async (sessionId: string) => {
        const { getSessionById } = useSessionsStore();
        const { getAssistantByKey } = useModelList();
        const { preferences, apiKeys } = usePreferenceContext();
        const { createInstance } = useModelList();

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
            const { updateSessionMutation } = useChatSession();
            const prompt = await template.formatMessages({
                message: [new HumanMessage(firstMessage.rawHuman)],
            });

            const generation = await selectedModel.invoke(prompt as any, {});

            const newTitle = generation?.content?.toString() || session.title;
            await updateSessionMutation.mutate({
                sessionId,
                session: newTitle
                    ? { title: newTitle, updatedAt: dayjs().toISOString() }
                    : {},
            });
        } catch (e) {
            console.error(e);
            // return firstMessage.rawHuman;
        }
    },
}));
