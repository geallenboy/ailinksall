"use client";

import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { usePreferenceContext } from "@/context";
import { TChatMessage } from "@/types/chat";

/**
 * 提示词准备Hook
 * 负责构建AI模型所需的提示模板
 */
export function useChatPrompt() {
  const { preferences } = usePreferenceContext();

  /**
   * 准备AI提示模板
   * 基于系统提示词、上下文和用户输入构建提示模板
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
    assistant: any;
  }) => {
    // 检查是否有历史消息
    const hasPreviousMessages = history?.length > 0;
    const systemPrompt = assistant.systemPrompt;

    // 构建系统提示部分
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

    // 历史消息占位符
    const messageHolders = new MessagesPlaceholder("chat_history");

    // 构建用户内容，包含可能的上下文引用
    const userContent = `{input}\n\n${
      context
        ? `Answer user's question based on the following context: """{context}"""`
        : ``
    } `;

    // 处理多模态输入（文本+图像）
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

    // 组合模板各部分
    const prompt = ChatPromptTemplate.fromMessages([
      system,
      messageHolders,
      user,
      ["placeholder", "{agent_scratchpad}"], // 为Agent提供的思考空间
    ]);

    return prompt;
  };

  return { preparePrompt };
}
