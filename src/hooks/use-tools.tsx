import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { FC, ReactNode, RefAttributes } from "react";
import { TApiKeys, TPreferences } from "./use-preferences";
import { usePreferenceContext } from "@/context/preferences";
import { googleSearchTool } from "@/lib/chat/tools/google";
import { duckduckGoTool } from "@/lib/chat/tools/duckduckgo";
import { dalleTool } from "@/lib/chat/tools/dalle";
import { useSettingsContext } from "@/context";
import {
  GlobalSearchIcon,
  HugeiconsProps,
  Image01Icon,
  BrainIcon,
} from "@hugeicons/react";
import { TToolResponse } from "@/types/chat.type";
import { memoryTool } from "@/lib/chat/tools/memory";

export const toolKeys = ["calculator", "web_search"];
export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";

export type TToolArg = {
  updatePreferences: ReturnType<
    typeof usePreferenceContext
  >["updatePreferences"];
  preferences: TPreferences;
  apiKeys: TApiKeys;
  sendToolResponse: (response: TToolResponse) => void;
};

export type TTool = {
  key: TToolKey;
  description: string;
  renderUI?: (args: any) => ReactNode;
  name: string;
  loadingMessage?: string;
  resultMessage?: string;
  tool: (args: TToolArg) => any;
  icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  smallIcon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
  validate?: () => Promise<boolean>;
  validationFailedAction?: () => void;
  showInMenu?: boolean;
};

export const useTools = () => {
  const { preferences, updatePreferences, apiKeys } = usePreferenceContext();
  const { open } = useSettingsContext();
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

  const searchTool = new TavilySearchResults({
    maxResults: 5,
    apiKey: "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",
  });

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
