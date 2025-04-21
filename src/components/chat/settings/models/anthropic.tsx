"use client";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLLMTest } from "@/hooks/chat/use-llm-test";
import { SettingsContainer } from "@/components/chat/settings/settings-container";
import { usePreferenceHooks } from "@/hooks/chat";

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceHooks();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    setKey(apiKeys.anthropic || "");
  }, [apiKeys.anthropic]);
  return (
    <SettingsContainer title="Anthropic 设置">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">Anthropic API 密钥</p>
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
              "https://console.anthropic.com/settings/keys",
              "_blank"
            );
          }}
        >
          在此获取您的 API 密钥 <ArrowRight size={16} weight="bold" />
        </Button>
        {key &&
          key !== apiKeys?.anthropic &&
          renderSaveApiKeyButton("anthropic", key, () => {
            updateApiKey("anthropic", key);
          })}
        {apiKeys?.anthropic && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setKey("");
              updateApiKey("anthropic", "");
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
    </SettingsContainer>
  );
};
