"use client";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLLMTest } from "@/hooks/chat/use-llm-test";
import { Flex } from "@/components/ui/flex";
import { usePreferencesStore } from "@/store/chat";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferencesStore();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    setKey(apiKeys.openai || "");
  }, [apiKeys.openai]);
  return (
    <Flex direction={"col"} gap="sm">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">OpenAI API 密钥</p>
      </div>
      <Input
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
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
              "https://platform.openai.com/account/api-keys",
              "_blank"
            );
          }}
        >
          在此获取您的 API 密钥 <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.openai &&
          renderSaveApiKeyButton("openai", key, () => {
            updateApiKey("openai", key);
          })}
        {apiKeys?.openai && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("openai", "");
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
