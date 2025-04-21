import { TAssistant, TChatMessage } from "@/types/chat";
import { usePreferenceStore } from "@/store/chat";
import {
    BaseMessagePromptTemplateLike,
    ChatPromptTemplate,
    MessagesPlaceholder
} from "@langchain/core/prompts";

/**
 * 创建基于用户输入、上下文和历史的提示模板
 */
export function usePromptTemplate() {
    /**
     * 准备提示模板
     * @param context 上下文内容
     * @param image 图片URL
     * @param history 聊天历史
     * @param assistant 助手配置
     * @returns 格式化的提示模板
     */
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
        const { preferences } = usePreferenceStore.getState();
        const hasPreviousMessages = history?.length > 0;
        const systemPrompt = assistant.systemPrompt;

        // 创建系统提示，包含系统指令和记忆内容
        const system: BaseMessagePromptTemplateLike = [
            "system",
            `${systemPrompt}\n Things to remember: \n ${preferences.memories.join(
                "\n"
            )}\n ${hasPreviousMessages
                ? `You can also refer to these previous conversations`
                : ``
            }`,
        ];

        // 消息占位符，用于插入聊天历史
        const messageHolders = new MessagesPlaceholder("chat_history");

        // 用户内容，可能包含上下文
        const userContent = `{input}\n\n${context
            ? `Answer user's question based on the following context: """{context}"""`
            : ``
            } `;

        // 用户消息可能包含图片
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

        // 组合成最终的提示模板
        const prompt = ChatPromptTemplate.fromMessages([
            system,
            messageHolders,
            user,
            ["placeholder", "{agent_scratchpad}"],
        ]);

        return prompt;
    };

    return { preparePrompt };
}