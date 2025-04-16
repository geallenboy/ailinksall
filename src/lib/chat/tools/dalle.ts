import { DynamicStructuredTool } from "@langchain/core/tools";
import { DallEAPIWrapper } from "@langchain/openai";
import { z } from "zod";

const dalleTool = (args: any) => {
  const { apiKeys, sendToolResponse } = args;
  const imageGenerationSchema = z.object({
    imageDescription: z.string().describe("图像的描述"),
  });

  return new DynamicStructuredTool({
    name: "image_generation",
    description: "当您根据描述请求图像时非常有用。",
    schema: imageGenerationSchema,
    func: async ({ imageDescription }, runManager) => {
      try {
        const tool = new DallEAPIWrapper({
          n: 1,
          model: "dall-e-3",
          apiKey: apiKeys.openai,
        });

        const result = await tool.invoke(imageDescription);
        if (!result) {
          runManager?.handleToolError("执行 DALL·E 生成时出错");
          throw new Error("无效的响应");
        }

        sendToolResponse({
          toolName: "image_generation",
          toolArgs: {
            imageDescription,
          },
          toolRenderArgs: {
            image: result,
          },
          toolResponse: result,
        });
        const searchPrompt = "";
        return searchPrompt;
      } catch (error) {
        return "执行 DALL·E 生成时出错。";
      }
    },
  });
};

export { dalleTool };
