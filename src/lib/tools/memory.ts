import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const memoryParser = StructuredOutputParser.fromZodSchema(
  z.object({
    memories: z
      .array(z.string().describe("关键信息点"))
      .describe("关键信息的列表"),
  })
);

const memoryTool = (args: any) => {
  const { apiKeys, sendToolResponse, preferences, updatePreferences } = args;
  const memorySchema = z.object({
    memory: z
      .string()
      .describe(
        "关于用户的关键信息，任何用户偏好，用于个性化未来的交互。必须简短且清晰。"
      ),
    question: z.string().describe("用户提出的问题"),
  });

  return new DynamicStructuredTool({
    name: "memory",
    description:
      "当用户提供关键信息或偏好以个性化未来交互时非常有用。用户可能会明确要求记住某些内容。",
    schema: memorySchema,
    func: async ({ memory, question }, runManager) => {
      try {
        const existingMemories = preferences?.memories;


        const chain = RunnableSequence.from([
          PromptTemplate.fromTemplate(
            `以下是新的信息: {new_memory} \n 如果需要，请更新以下信息，否则添加新信息: """{existing_memory}""" \n{format_instructions} `
          ),
          new ChatOpenAI({
            model: "gpt-3.5-turbo",
            apiKey: apiKeys.openai,
          }),
          memoryParser as any,
        ]);
        console.log("chain", chain);

        const response = await chain.invoke({
          new_memory: memory,
          existing_memory: existingMemories?.join("\n"),
          format_instructions: memoryParser.getFormatInstructions(),
        });
        console.log(`response`, response);
        if (!response) {
          runManager?.handleToolError("执行记忆更新时出错");
          return question;
        }

        updatePreferences({
          memories: response.memories,
        });

        console.log("工具已更新", response);
        sendToolResponse({
          toolName: "memory",
          toolArgs: {
            memory,
          },
          toolResponse: response,
        });
        return question;
      } catch (error) {
        return "执行记忆更新时出错。";
      }
    },
  });
};

export { memoryTool };
