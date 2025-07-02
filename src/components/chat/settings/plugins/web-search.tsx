import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { ArrowRight, CaretDown, Info } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingCard } from "@/components/chat/settings/setting-card";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { usePreferenceContext } from "@/context";

export const WebSearchPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();

  const handleRunTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: "最新新闻",
      };

      const response = await axios.get(url, { params });

      if (response.status === 200) {
        toast({
          title: "测试成功",
          description: "Google 搜索插件正常工作",
          variant: "default",
        });
      } else {
        throw new Error("无效的响应");
      }
    } catch (error) {
      toast({
        title: "测试失败",
        description: "Google 搜索插件无法正常工作",
        variant: "destructive",
      });
    }
  };

  return (
    <Flex
      direction={"col"}
      gap={"sm"}
      className="border-t pt-2 border-white/10"
    >
      <Flex className="w-full" justify={"between"} items="center">
        <Type size={"sm"} textColor={"secondary"}>
          默认搜索引擎
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"secondary"}>
              {preferences.defaultWebSearchEngine}{" "}
              <CaretDown size={12} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "google",
                });
              }}
            >
              Google
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({
                  defaultWebSearchEngine: "duckduckgo",
                });
              }}
            >
              DuckDuckGo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      {preferences.defaultWebSearchEngine === "google" && (
        <SettingCard className="flex flex-col w-full items-start gap-2 py-3">
          <Flex direction={"col"} gap="sm" className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google 搜索引擎 ID <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchEngineId"
              type="text"
              value={preferences.googleSearchEngineId}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchEngineId: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex direction={"col"} gap={"sm"} className="w-full">
            <Type
              size={"xs"}
              className="flex flex-row gap-2 items-center"
              textColor={"secondary"}
            >
              Google 搜索 API 密钥 <Info weight="regular" size={14} />
            </Type>
            <Input
              name="googleSearchApiKey"
              type="text"
              value={preferences.googleSearchApiKey}
              autoCapitalize="off"
              onChange={(e) => {
                updatePreferences({
                  googleSearchApiKey: e.target.value,
                });
              }}
            />
          </Flex>
          <Flex gap="sm">
            <Button onClick={handleRunTest} size={"sm"}>
              运行检查
            </Button>
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                window.open(
                  "https://programmablesearchengine.google.com/controlpanel/create",
                  "_blank"
                );
              }}
            >
              在此获取您的 API 密钥 <ArrowRight size={16} weight="bold" />
            </Button>
          </Flex>
        </SettingCard>
      )}
    </Flex>
  );
};
