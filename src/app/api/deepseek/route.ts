// 文件路径: /src/app/api/deepseek/route.ts
import { NextRequest, NextResponse } from "next/server";

// 获取 DeepSeek API 密钥
const getDeepSeekApiKey = () => {
    return process.env.DEEPSEEK_API_KEY || "";
};

// 代理到 DeepSeek API
export async function POST(request: NextRequest) {
    try {
        const apiKey = getDeepSeekApiKey();
        if (!apiKey) {
            return NextResponse.json({ error: "DeepSeek API key not found" }, { status: 401 });
        }

        // 获取请求体
        const body = await request.json();

        // 转发到 DeepSeek API
        const deepseekEndpoint = "https://api.deepseek.com/v1/chat/completions";  // 请确认实际的 API 地址
        const response = await fetch(deepseekEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        // 获取返回数据
        const data = await response.json();

        // 返回给客户端
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("DeepSeek API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}