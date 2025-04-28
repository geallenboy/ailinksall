import { logger } from "@/lib/logger";
import { removeExtraSpaces } from "@/lib/chat/helper";
import { TAssistant, TChatMessage, TLLMInputProps } from "@/types/chat";
import {
    BaseMessagePromptTemplateLike,
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { PreparePromptParams } from "./types";

export const preparePrompt = async ({
    context,
    image,
    history,
    assistant,
}: PreparePromptParams) => {
    logger.debug("Preparing prompt", { context, image, historyLength: history?.length, assistant });

    const hasPreviousMessages = history?.length > 0;
    const systemPrompt = assistant.systemPrompt;
    const preferences = { memories: [] }; // 这里需要从外部传入，暂时使用空数组

    const system: BaseMessagePromptTemplateLike = [
        "system",
        `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
            "\n"
        )}\n ${hasPreviousMessages
            ? `You can also refer to these previous conversations`
            : ``
        }`,
    ];

    const messageHolders = new MessagesPlaceholder("chat_history");

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

    const prompt = ChatPromptTemplate.fromMessages([
        system,
        messageHolders,
        user,
        ["placeholder", "{agent_scratchpad}"],
    ]);

    logger.info("Prompt prepared successfully");
    return prompt;
};

export const formatModelRunParams = (
    props: TLLMInputProps,
    assistant: TAssistant
): { input: string; context?: string; image?: string } => {
    logger.debug("Formatting model run parameters", props);

    return {
        input: removeExtraSpaces(props?.input) || '',
        context: removeExtraSpaces(props?.context) || '',
        image: props?.image,
    };
};