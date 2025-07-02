import { NextRequest, NextResponse } from "next/server";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import dayjs from "dayjs";

export async function POST(req: NextRequest, resp: NextResponse) {
  try {
    const { query, currentYear } = await req.json();
    console.log("搜索查询:", query);
    console.log("当前年份:", currentYear);

    if (!query) {
      return Response.json({ error: "未提供搜索查询" }, { status: 401 });
    }

    // 创建两个不同时效性的搜索实例
    const recentSearchTool = new DuckDuckGoSearch({
      maxResults: 3,

    });

    const generalSearchTool = new DuckDuckGoSearch({
      maxResults: 5
    });

    // 执行两次搜索
    const [recentResults, generalResults] = await Promise.all([
      recentSearchTool.invoke(query).catch(() => ""),
      generalSearchTool.invoke(query)
    ]);

    // 合并结果，优先使用最近的结果
    let combinedResults = "";

    if (recentResults && recentResults.trim().length > 100) {
      combinedResults = `[最近24小时内的结果]\n${recentResults}\n\n[更多搜索结果]\n${generalResults}`;
    } else {
      combinedResults = generalResults;
    }

    // 在结果中明确添加时间信息
    const searchTimeInfo = `\n\n搜索执行时间: ${dayjs().format('YYYY年MM月DD日 HH:mm:ss')} 当前年份: ${currentYear || dayjs().year()}`;
    const resultsWithTimeInfo = combinedResults + searchTimeInfo;

    return NextResponse.json({
      results: resultsWithTimeInfo,
      searchTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      currentYear: currentYear || dayjs().year()
    });
  } catch (error) {
    console.error("搜索API错误:", error);
    return Response.json({ error: "搜索执行失败" }, { status: 500 });
  }
}
