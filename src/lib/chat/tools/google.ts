import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const googleSearchTool = (args: any) => {
  const { preferences, sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });

  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "一个优化的搜索引擎，提供全面、准确和可信的结果。适用于需要回答有关当前事件的问题时。输入应该是搜索查询。如果已经使用此工具回答了问题，请不要再次使用。",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: input,
      };

      try {
        const response = await axios.get(url, { params });

        if (response.status !== 200) {
          runManager?.handleToolError("执行 Google 搜索时出错");
          throw new Error("无效的响应");
        }
        const googleSearchResult = response.data?.items?.map((item: any) => ({
          title: item.title,
          snippet: item.snippet,
          url: item.link,
        }));

        const searchResult = googleSearchResult
          ?.map(
            (r: any, index: number) =>
              `${index + 1}. 标题: """${r.title}""" \n URL: """${r.url
              }"""\n 摘要: """${r.snippet}"""`
          )
          ?.join("\n\n");

        const searchPrompt = `信息: \n\n ${searchResult} \n\n 基于以上内容，请回答给定的问题，并提供适当的引用。如果有 XML 标签，请移除。问题: ${input}`;

        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
          },
          toolRenderArgs: { searchResult },
          toolResponse: searchResult,
        });

        return searchPrompt;
      } catch (error) {
        return "执行 Google 搜索时出错。请让用户检查 API 密钥。";
      }
    },
  });
};

export { googleSearchTool };
