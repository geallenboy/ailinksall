import { useModelList } from "@/hooks/chat/use-model-list";
import { useState } from "react";
import { CommandItem } from "@/components/ui/command";
import { Flex } from "@/components/ui/flex";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";
import { TAssistant } from "@/types/chat";
import { usePreferencesStore } from "@/store/chat";
import { defaultPreferences } from "@/config/chat/preferences";

export type TAssistantItem = {
  assistant: TAssistant;
  onSelect: (assistant: TAssistant) => void;
  onDelete: (assistant: TAssistant) => void;
  onEdit: (assistant: TAssistant) => void;
};

export const AssistantItem = ({
  assistant,
  onSelect,
  onDelete,
  onEdit,
}: TAssistantItem) => {
  const { getAssistantByKey, getAssistantIcon } = useModelList();
  const assistantProps = getAssistantByKey(assistant.key);
  const [open, setOpen] = useState(false);
  const model = assistantProps?.model;
  const { updatePreferences } = usePreferencesStore();

  return (
    <CommandItem
      value={assistant.name}
      className="w-full"
      onSelect={() => {
        updatePreferences(
          {
            defaultAssistant: assistant.key,
            maxTokens: defaultPreferences.maxTokens,
          },
          () => {
            onSelect(assistant);
          }
        );
      }}
    >
      <Flex gap={"sm"} items={"center"} key={assistant.key} className="w-full">
        {getAssistantIcon(assistant.key)}
        {assistant.name} {model?.isNew && <Badge>新</Badge>}
        <div className="flex flex-1"></div>
        {assistant.type === "custom" && (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={(e) => {
                  setOpen(true);
                }}
              >
                <DotsThree size={20} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[200px] text-sm md:text-base z-[800]"
              align="end"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  onEdit(assistant);
                  e.stopPropagation();
                }}
              >
                <Pencil size={14} weight="bold" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  onDelete(assistant);
                  e.stopPropagation();
                }}
              >
                <TrashSimple size={14} weight="bold" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Flex>
    </CommandItem>
  );
};
