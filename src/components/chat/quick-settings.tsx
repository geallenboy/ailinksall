import { defaultPreferences, TPreferences } from "@/hooks/use-preferences";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowClockwise, Info } from "@phosphor-icons/react";
import { ModelInfo } from "@/components/chat/model/model-info";
import { Tooltip } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { usePreferenceContext } from "@/context/preferences";
import { useModelList } from "@/hooks/use-model-list";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { Settings03Icon } from "@hugeicons/react";

export const QuickSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreferences } = usePreferenceContext();
  const { getModelByKey, getAssistantByKey } = useModelList();

  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="outline"
        size="iconXS"
        rounded={"lg"}
        onClick={() => {
          updatePreferences({ [key]: defaultPreferences[key] });
        }}
      >
        <ArrowClockwise size={14} weight="bold" />
      </Button>
    );
  };

  const assistant = getAssistantByKey(preferences?.defaultAssistant);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content="配置模型">
        <PopoverTrigger asChild>
          <Button variant={"ghost"} size={"iconSm"}>
            <Settings03Icon size={16} variant="stroke" strokeWidth="2" />
          </Button>
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent className="p-0 dark:bg-zinc-700 mr-8 rounded-2xl w-[300px]">
        {assistant && (
          <div className="border-b dark:border-white/10 border-black/10 p-3">
            <ModelInfo model={assistant.model} showDetails={false} />
          </div>
        )}
        <Flex direction={"col"} className="w-full px-3 py-1">
          <Flex items="center" justify={"between"} className="w-full">
            <Tooltip content="最大令牌数">
              <Type
                className="flex flex-row items-center gap-1"
                textColor={"secondary"}
              >
                最大令牌数 <Info size={14} weight="regular" />{" "}
                {preferences?.maxTokens}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(preferences?.maxTokens)]}
                step={1}
                min={0}
                max={assistant?.model?.maxOutputTokens}
                onValueChange={(value: number[]) => {
                  updatePreferences({ maxTokens: value?.[0] });
                }}
              />
              {renderResetToDefault("maxTokens")}
            </Flex>
          </Flex>
          <Flex items="center" justify={"between"} className="w-full">
            <Tooltip content="温度">
              <Type
                className="flex flex-row items-center gap-1"
                textColor={"secondary"}
              >
                温度 <Info size={14} weight="regular" />{" "}
                {preferences?.temperature}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(preferences?.temperature)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  updatePreferences({ temperature: value?.[0] });
                }}
              />
              {renderResetToDefault("temperature")}
            </Flex>
          </Flex>
          <Flex items="center" justify={"between"} className="w-full">
            <Tooltip content="TopP">
              <Type
                className="flex flex-row items-center gap-1"
                textColor={"secondary"}
              >
                TopP <Info size={14} weight="regular" /> {preferences?.topP}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(preferences?.topP)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  updatePreferences({ topP: value?.[0] });
                }}
              />
              {renderResetToDefault("topP")}
            </Flex>
          </Flex>
          <Flex items="center" justify={"between"} className="w-full">
            <Tooltip content="TopK">
              <Type
                className="flex flex-row items-center gap-1"
                textColor={"secondary"}
              >
                TopK <Info size={14} weight="regular" /> {preferences?.topK}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(preferences?.topK)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  updatePreferences({ topK: value?.[0] });
                }}
              />
              {renderResetToDefault("topK")}
            </Flex>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  );
};
