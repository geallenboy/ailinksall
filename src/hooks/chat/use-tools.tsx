import { googleSearchTool } from "@/lib/tools/google";
import { duckduckGoTool } from "@/lib/tools/duckduckgo";
import { dalleTool } from "@/lib/tools/dalle";
import { GlobalSearchIcon, Image01Icon, BrainIcon } from "@hugeicons/react";
import { memoryTool } from "@/lib/tools/memory";
import { useSettingsStore } from "@/store/chat/settings-store";
import { usePreferenceStore } from "@/store/chat";
import { TTool, TToolKey } from "@/types/chat";

export const useTools = () => {
  const { preferences } = usePreferenceStore();
  const { open } = useSettingsStore();
  const tools: TTool[] = [
    {
      key: "web_search",
      description: "在网络上搜索",
      tool:
        preferences?.defaultWebSearchEngine === "google"
          ? googleSearchTool
          : duckduckGoTool,
      name: "网络搜索",
      showInMenu: true,
      loadingMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "正在使用 Google 搜索..."
          : "正在使用 DuckDuckGo 搜索...",
      resultMessage:
        preferences?.defaultWebSearchEngine === "google"
          ? "来自 Google 搜索的结果"
          : "来自 DuckDuckGo 搜索的结果",
      icon: GlobalSearchIcon,
      smallIcon: GlobalSearchIcon,
      validate: async () => {
        if (
          preferences?.defaultWebSearchEngine === "google" &&
          (!preferences?.googleSearchApiKey ||
            !preferences?.googleSearchEngineId)
        ) {
          return false;
        }
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
    },
    {
      key: "image_generation",
      description: "生成图像",
      tool: dalleTool,
      showInMenu: true,
      name: "图像生成",
      loadingMessage: "正在生成图像",
      resultMessage: "生成的图像",
      icon: Image01Icon,
      smallIcon: Image01Icon,
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt="生成的图像"
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      validate: async () => {
        return true;
      },
    },
    {
      key: "memory",
      description: "AI 将记住关于您的信息",
      tool: memoryTool,
      name: "记忆",
      showInMenu: true,
      validate: async () => {
        return true;
      },
      validationFailedAction: () => {
        open("web-search");
      },
      renderUI: ({ image }) => {
        return (
          <img
            src={image}
            alt="记忆图像"
            className="w-[400px] h-[400px] rounded-2xl border"
          />
        );
      },
      loadingMessage: "正在保存到记忆...",
      resultMessage: "记忆已更新",
      icon: BrainIcon,
      smallIcon: BrainIcon,
    },
  ];

  const getToolByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  const getToolInfoByKey = (key: TToolKey) => {
    return tools.find((tool) => tool.key.includes(key));
  };

  return {
    tools,
    getToolByKey,
    getToolInfoByKey,
  };
};
