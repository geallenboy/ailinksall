import { logger } from "@/lib/logger";
import { TChatMessage, TToolResponse } from "@/types/chat";
import { LLMResult } from "@langchain/core/outputs";
import { Serialized } from "@langchain/core/load/serializable";

export const createModelCallbacks = (
    updateCurrentMessage: (update: Partial<TChatMessage>) => void,
    setCurrentTools: React.Dispatch<React.SetStateAction<TToolResponse[]>>,
    abortController: AbortController,
    toast: any
) => {
    let streamedMessage = "";

    return {
        handleLLMStart: async (llm: Serialized, prompts: string[]) => {
            logger.info("LLM started", { llm: llm.id });
        },

        handleToolStart: (
            tool: any,
            input: any,
            runId: string,
            parentRunId?: string,
            tags?: string[],
            metadata?: Record<string, any>,
            name?: string
        ) => {
            logger.info("Tool started", {
                tool,
                input,
                runId,
                parentRunId,
                tags,
                name
            });

            name &&
                setCurrentTools((tools) => [
                    ...tools,
                    { toolName: name, toolLoading: true },
                ]);
        },

        handleToolError: (
            err: Error,
            runId: string,
            parentRunId?: string,
            tags?: string[]
        ) => {
            logger.error("Tool error", { error: err.message, runId, parentRunId, tags });
        },

        handleToolEnd: (
            output: any,
            runId: string,
            parentRunId?: string,
            tags?: string[]
        ) => {
            logger.info("Tool ended", { output, runId, parentRunId, tags });
        },

        handleLLMEnd: async (output: LLMResult) => {
            logger.info("LLM ended", { output });
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

        handleChainEnd: async (output: any) => {
            logger.info("Chain ended", { output });
        },

        handleLLMError: async (err: Error) => {
            logger.error("LLM error", { error: err.message });

            if (!abortController.signal.aborted) {
                toast({
                    title: "错误",
                    description: "发生了一些问题",
                    variant: "destructive",
                });
            }

            updateCurrentMessage({
                isLoading: false,
                rawAI: streamedMessage,
                stop: true,
                stopReason: abortController.signal.aborted ? "cancel" : "error",
            });
        },

        getStreamedContent: () => streamedMessage
    };
};