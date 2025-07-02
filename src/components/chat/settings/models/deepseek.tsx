"use client";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLLMTest } from "@/hooks/chat/use-llm-test";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext } from "@/context";

export const DeepSeekSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { renderSaveApiKeyButton } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.deepseek || "");
  }, [apiKeys.deepseek]);

  return (
    <Flex direction={"col"} gap="sm">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm text-zinc-500">DeepSeek API 密钥</p>
      </div>
      <Input
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://platform.deepseek.com/api-keys", // 根据实际的 DeepSeek API 密钥页面进行调整
              "_blank"
            );
          }}
        >
          在此获取您的 API 密钥 <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.deepseek &&
          renderSaveApiKeyButton("deepseek", key, () => {
            updateApiKey("deepseek", key);
          })}
        {apiKeys?.deepseek && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("deepseek", "");
            }}
          >
            移除 API 密钥
          </Button>
        )}
      </div>

      <div className="flex flex-row items-center gap-1 py-2 text-zinc-500">
        <Info size={16} weight="bold" />
        <p className="text-xs">
          您的 API 密钥仅存储在本地浏览器中，绝不会发送到其他地方。
        </p>
      </div>
    </Flex>
  );
};
