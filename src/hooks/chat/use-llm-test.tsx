"use client";
import { useState } from "react";
import { useModelList } from "./use-model-list";
import { useToast } from "@/components/ui/use-toast";
import { usePreferencesQuery } from "../query/use-preferences-query";
import { Button } from "@/components/ui/button";
import { TBaseModel } from "@/types/chat";

export const useLLMTest = () => {
  const { getModelByKey, createInstance, getTestModelKey } = useModelList();

  const [isTestRunning, setIsTestRunning] = useState(false);

  const { toast } = useToast();

  const { getApiKey } = usePreferencesQuery();

  const testLLM = async (model: TBaseModel, apiKey?: string) => {
    try {
      const modelKey = getTestModelKey(model);

      if (!apiKey) {
        return false;
      }

      const selectedModelKey = getModelByKey(modelKey);

      if (!selectedModelKey) {
        return false;
      }

      const selectedModel = await createInstance(selectedModelKey, apiKey);

      const data = await selectedModel
        .withListeners({
          onError: (error: any) => {
            console.error("error", error);
          },
        })
        .withConfig({
          recursionLimit: 2,
        })
        .invoke("This is a test message", {
          callbacks: [
            {
              handleLLMError: (error: any) => {
                console.error("lll", error);
                throw new Error(error);
              },
            },
          ],
        });

      if (data) {
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const renderSaveApiKeyButton = (
    model: TBaseModel,
    key: string,
    onValidated: () => void
  ) => {
    return (
      <Button
        size={"sm"}
        onClick={async () => {
          setIsTestRunning(true);
          const isWorking = await testLLM(model, key);
          if (isWorking) {
            onValidated();
            toast({
              title: "API 密钥保存成功",
              description: "模型运行正常",
              variant: "default",
            });
          } else {
            toast({
              title: "API 密钥无效",
              description: "请检查您的 API 密钥并重试。",
              variant: "destructive",
            });
          }
          setIsTestRunning(false);
        }}
      >
        {isTestRunning ? "验证中 ..." : "保存 API 密钥"}
      </Button>
    );
  };

  return { testLLM, renderSaveApiKeyButton };
};
