import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn'; // 导入中文语言包

// 设置 dayjs 使用中文
dayjs.locale('zh-cn');

const duckduckGoTool = (args: any) => {
  const { sendToolResponse } = args;
  const webSearchSchema = z.object({
    input: z.string(),
  });

  return new DynamicStructuredTool({
    name: "web_search",
    description:
      "一个搜索引擎，提供全面的结果。适用于需要回答有关当前事件的问题时。输入应该是搜索查询。必须注意搜索结果的日期，确保回答使用最近的信息。如果已经使用此工具回答了问题，请不要再次使用。",
    schema: webSearchSchema,
    func: async ({ input }, runManager) => {
      try {
        // 添加日志记录
        console.log(`执行网络搜索: "${input}"`);

        // 获取当前年份用于时效性标记
        const currentYear = dayjs().year();

        // 构建更加时效性的查询
        const enhancedQuery = `${input} ${currentYear} 最新`;
        console.log(`增强后的查询: "${enhancedQuery}"`);

        // 发送搜索请求，使用增强查询
        const response = await axios.post("/api/search", {
          query: enhancedQuery,
          // 添加时间相关参数
          currentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currentYear: currentYear
        });

        const result = response.data?.results;
        if (!result) {
          runManager?.handleToolError("执行搜索时出错");
          throw new Error("无效的响应");
        }

        // 处理结果中的时间信息
        const processedResult = processTimeInformation(result);

        // 构建更好的提示，包含当前时间信息和时效性警告
        const currentTimeInfo = `当前日期: ${dayjs().format('YYYY年MM月DD日 HH:mm:ss')}`;
        const currentYearStr = currentYear.toString();

        const searchPrompt = `信息: \n\n ${processedResult} \n\n ${currentTimeInfo} \n\n
重要提示:
1. 当前是${currentYearStr}年，请确保回答基于最新的信息
2. 如果搜索结果包含过时信息，请明确指出并说明这可能不是最新信息
3. 如果搜索结果时间早于${currentYearStr}年，请明确告知用户这可能是过时信息
4. 对于提到具体时间的事件，明确告知用户信息来源的时间
5. 对于未来事件，请基于当前是${currentYearStr}年来评估信息的准确性

基于以上内容，请回答用户的问题: "${input}"。提供适当的引用，不要再次使用搜索工具。`;

        sendToolResponse({
          toolName: "web_search",
          toolArgs: {
            input,
            requestTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          },
          toolRenderArgs: {
            searchResult: processedResult,
            searchTime: dayjs().format('YYYY年MM月DD日 HH:mm:ss'),
            currentYear: currentYearStr
          },
          toolResponse: processedResult,
        });

        return searchPrompt;
      } catch (error) {
        console.error("搜索执行失败:", error);
        return "执行搜索时出错。现在不要使用搜索工具。请让用户尝试更具体的查询或检查API设置。";
      }
    },
  });
};

/**
 * 处理搜索结果中的时间信息
 * @param result 搜索结果
 * @returns 处理后的结果
 */
function processTimeInformation(result: string): string {
  // 保留原始结果用于调试
  console.log("原始搜索结果:", result.substring(0, 200) + "...");

  // 添加时效性标记
  const currentYear = dayjs().year();
  const lastYear = currentYear - 1;

  // 先尝试提取结果中的年份
  const yearPattern = /\b(19|20)\d{2}\b/g;
  const yearsFound = [...result.matchAll(yearPattern)].map(match => match[0]);

  // 如果找到年份，检查是否为当前年份或去年
  if (yearsFound.length > 0) {
    const hasCurrentYear = yearsFound.some(y => y === currentYear.toString());
    const hasRecentInfo = yearsFound.some(y =>
      Number(y) === currentYear || Number(y) === lastYear);

    if (!hasRecentInfo) {
      // 添加时效性警告
      result = `[警告: 这些搜索结果可能不是最新的，未发现${currentYear}年或${lastYear}年的信息] \n\n` + result;
    } else if (hasCurrentYear) {
      // 标记包含当前年份的结果
      result = `[包含${currentYear}年的最新信息] \n\n` + result;
    }
  }

  // 替换相对时间表达为绝对时间
  const relativeTimePatterns = [
    // 中文时间表达
    { pattern: /(\d+)\s*小时前/g, replace: (match: any, hours: any) => `${match}(${dayjs().subtract(Number(hours), 'hour').format('YYYY年MM月DD日 HH:mm')})` },
    { pattern: /(\d+)\s*分钟前/g, replace: (match: any, minutes: any) => `${match}(${dayjs().subtract(Number(minutes), 'minute').format('YYYY年MM月DD日 HH:mm')})` },
    { pattern: /(\d+)\s*天前/g, replace: (match: any, days: any) => `${match}(${dayjs().subtract(Number(days), 'day').format('YYYY年MM月DD日')})` },
    { pattern: /昨天/g, replace: () => `昨天(${dayjs().subtract(1, 'day').format('YYYY年MM月DD日')})` },
    { pattern: /上周/g, replace: () => `上周(${dayjs().subtract(1, 'week').format('YYYY年MM月DD日')})` },
    { pattern: /上个月/g, replace: () => `上个月(${dayjs().subtract(1, 'month').format('YYYY年MM月')})` },

    // 英文时间表达
    { pattern: /(\d+)\s*hours?\s*ago/gi, replace: (match: any, hours: any) => `${match}(${dayjs().subtract(Number(hours), 'hour').format('YYYY年MM月DD日 HH:mm')})` },
    { pattern: /(\d+)\s*minutes?\s*ago/gi, replace: (match: any, minutes: any) => `${match}(${dayjs().subtract(Number(minutes), 'minute').format('YYYY年MM月DD日 HH:mm')})` },
    { pattern: /(\d+)\s*days?\s*ago/gi, replace: (match: any, days: any) => `${match}(${dayjs().subtract(Number(days), 'day').format('YYYY年MM月DD日')})` },
    { pattern: /yesterday/gi, replace: (match: any) => `${match}(${dayjs().subtract(1, 'day').format('YYYY年MM月DD日')})` }
  ];

  let processedResult = result;
  relativeTimePatterns.forEach(({ pattern, replace }) => {
    processedResult = processedResult.replace(pattern, replace);
  });

  return processedResult;
}

export { duckduckGoTool };
