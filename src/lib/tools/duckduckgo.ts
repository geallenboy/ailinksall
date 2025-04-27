import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
const duckduckGoTool = (args: any) => {
  const { sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });
  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "一个优化的搜索引擎，提供全面、准确和可信的结果。适用于需要回答有关当前事件的问题时。输入应该是搜索查询。如果已经使用此工具回答了问题，请不要再次使用。",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      try {
        const response = await axios.post("/api/search", { query: input });
        const result = response.data?.results;
        if (!result) {
          runManager?.handleToolError("执行 DuckDuckGo 搜索时出错");
          throw new Error("无效的响应");
        }
        const searchPrompt = `信息: \n\n ${result} \n\n 基于以上内容，请回答给定的问题，并提供适当的引用，不要再次使用 duckduckgo_search 函数。如果有 XML 标签，请移除。问题: ${input}`;
        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolRenderArgs: {
            searchResult: result,
          },
          toolResponse: result,
        });
        return searchPrompt;
      } catch (error) {
        return "执行搜索时出错。现在不要使用 duckduckgo_search 工具。请让用户检查 API 密钥。";
      }
    },
  });
};
export { duckduckGoTool };
