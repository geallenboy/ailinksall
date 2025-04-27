"use client";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLLMTest } from "@/hooks/chat/use-llm-test";
import { Flex } from "@/components/ui/flex";
import { usePreferenceHooks } from "@/hooks/chat";

export const GeminiSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceHooks();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    setKey(apiKeys.gemini || "");
  }, [apiKeys.gemini]);
  return (
    <Flex direction={"col"} gap={"sm"}>
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">
          Google Gemini API 密钥
        </p>
      </div>
      <Input
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
        type="password"
        autoComplete="off"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />

      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open("https://aistudio.google.com/app/apikey", "_blank");
          }}
        >
          在此获取您的 API 密钥 <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.gemini &&
          renderSaveApiKeyButton("gemini", key, () => {
            updateApiKey("gemini", key);
          })}
        {apiKeys?.gemini && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("gemini", "");
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
