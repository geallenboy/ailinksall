import { logger } from "@/lib/logger";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ModelRunParams, ModelExecutionContext } from "./types";
import { createModelCallbacks } from "./callbacks";
import { preparePrompt } from "./model-utils";

export const setupModelExecution = async ({
    sessionId,
    messageId,
    input,
    context,
    image,
    assistant,
    abortController,
    updateCurrentMessage,
    setCurrentTools
}: ModelRunParams,
    dependencies: {
        getSessionById: (id: string) => Promise<any>;
        getToolByKey: (key: string) => any;
        createInstance: (model: any, apiKey: string) => Promise<any>;
        getModelByKey: (key: string) => any;
        apiKeys: Record<string, string>;
        preferences: any;
        updatePreferences: (prefs: any) => void;
        toast: any;
    }): Promise<ModelExecutionContext> => {
    logger.info("Setting up model execution", { sessionId, messageId, assistant });

    const {
        getSessionById, getToolByKey, createInstance,
        getModelByKey, apiKeys, preferences,
        updatePreferences, toast
    } = dependencies;

    const selectedSession = await getSessionById(sessionId);
    if (!selectedSession) {
        logger.error("Session not found", { sessionId });
        throw new Error("Session not found");
    }

    const allPreviousMessages = selectedSession?.messages?.filter((m: any) => m.id !== messageId) || [];
    const chatHistory = allPreviousMessages; // 排序逻辑移到外部
    const plugins = preferences.defaultPlugins || [];
    const messageLimit = preferences.messageLimit || 100; // 默认消息限制

    const selectedModelKey = getModelByKey(assistant.baseModel);
    if (!selectedModelKey) {
        logger.error("Model not found", { baseModel: assistant.baseModel });
        throw new Error("Model not found");
    }

    const apiKey = apiKeys[selectedModelKey?.baseModel];
    if (!apiKey) {
        logger.error("API key not found", { baseModel: selectedModelKey?.baseModel });
        throw new Error("API key not found");
    }

    const prompt = await preparePrompt({
        context: context,
        image,
        history: allPreviousMessages,
        assistant,
    });

    // 获取可用工具
    const availableTools = selectedModelKey?.plugins
        ?.filter((p: string) => plugins.includes(p))
        ?.map((p: string) =>
            getToolByKey(p)?.tool({
                updatePreferences,
                preferences,
                apiKeys,
                sendToolResponse: (arg: any) => {
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
        ?.filter((t: any): t is any => !!t) || [];

    logger.info("Available tools", { toolsCount: availableTools.length });

    const selectedModel = await createInstance(selectedModelKey, apiKey);

    // 处理聊天历史
    const previousAllowedChatHistory = chatHistory
        .slice(0, messageLimit)
        .reduce(
            (acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman, image }: any) => {
                if (rawAI && rawHuman) {
                    return [...acc, new HumanMessage(rawHuman), new AIMessage(rawAI)];
                } else {
                    return [...acc];
                }
            },
            []
        );

    // 创建一个修改过的模型，绑定中断控制器信号
    const modifiedModel = Object.create(Object.getPrototypeOf(selectedModel));
    Object.assign(modifiedModel, selectedModel);

    modifiedModel.bindTools = (tools: any[], options: any) => {
        return selectedModel.bindTools?.(tools, {
            ...options,
            signal: abortController?.signal,
        });
    };

    let agentExecutor;
    if (availableTools?.length) {
        const agentWithTool = await createToolCallingAgent({
            llm: modifiedModel as any,
            tools: availableTools,
            prompt: prompt as any,
            streamRunnable: true,
        });

        logger.info("Agent with tools created");

        agentExecutor = new AgentExecutor({
            agent: agentWithTool as any,
            tools: availableTools,
        });
    }

    const chainWithoutTools = prompt.pipe(
        modifiedModel.bind({
            signal: abortController?.signal,
        }) as any
    );

    return {
        agentExecutor,
        chainWithoutTools,
        availableTools,
        abortController
    };
};

export const runModel = async (
    context: ModelExecutionContext,
    input: string,
    context_text: string | undefined,
    previousAllowedChatHistory: any[],
    updateCurrentMessage: (update: Partial<any>) => void,
    toast: any,
    callbacks: any
) => {
    const { agentExecutor, chainWithoutTools, availableTools, abortController } = context;
    logger.info("Running model", {
        hasAgentExecutor: !!agentExecutor,
        inputLength: input.length,
        hasContext: !!context_text
    });

    const executor = !!availableTools?.length && agentExecutor ? agentExecutor : chainWithoutTools;

    try {
        const stream: any = await executor.invoke(
            {
                chat_history: previousAllowedChatHistory || [],
                context: context_text,
                input,
            },
            { callbacks: [callbacks] }
        );

        logger.info("Model execution completed successfully");

        updateCurrentMessage({
            rawHuman: input,
            rawAI: stream?.content || stream?.output,
            isLoading: false,
            stop: true,
            stopReason: "finish",
        });

        return stream;
    } catch (err: any) {
        logger.error("Model execution failed", { error: err.message });

        updateCurrentMessage({
            isLoading: false,
            stop: true,
            stopReason: "error",
        });

        if (!abortController.signal.aborted) {
            toast({
                title: "错误",
                description: err.message || "模型执行失败",
                variant: "destructive",
            });
        }

        throw err;
    }
};