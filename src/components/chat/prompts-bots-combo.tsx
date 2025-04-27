import { TPrompt } from "@/hooks/query/use-prompts-query";
import React, { useState } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command as CMDKCommand,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus } from "@phosphor-icons/react";
import { usePromptsStore } from "@/store/chat";
import { usePrompts } from "@/hooks/chat";

export type TPromptsBotsCombo = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptSelect: (prompt: TPrompt) => void;
  onBack: () => void;
};

export const PromptsBotsCombo = ({
  open,
  children,
  onBack,
  onOpenChange,
  onPromptSelect,
}: TPromptsBotsCombo) => {
  const [commandInput, setCommandInput] = useState("");
  const { open: openPrompts } = usePromptsStore();
  const { allPrompts } = usePrompts();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor className="w-full">{children}</PopoverAnchor>
      <PopoverContent
        side="top"
        sideOffset={4}
        className="min-w-[96vw] md:min-w-[700px] lg:min-w-[720px] p-0 rounded-2xl overflow-hidden"
      >
        <CMDKCommand>
          <CommandInput
            placeholder="Search..."
            className="h-10"
            value={commandInput}
            onValueChange={setCommandInput}
            onKeyDown={(e) => {
              if (
                (e.key === "Delete" || e.key === "Backspace") &&
                !commandInput
              ) {
                onOpenChange(false);
                onBack();
              }
            }}
          />
          <CommandEmpty>未找到提示词。</CommandEmpty>
          <CommandList className="p-2 max-h-[160px]">
            <CommandItem
              onSelect={() => {
                openPrompts("create");
              }}
            >
              <Plus size={14} weight="bold" className="flex-shrink-0" />{" "}
              创建新提示词
            </CommandItem>

            {!!allPrompts?.length && (
              <CommandGroup heading="提示词">
                {allPrompts?.map((prompt, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      onPromptSelect(prompt);
                    }}
                  >
                    {prompt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CMDKCommand>
      </PopoverContent>
    </Popover>
  );
};
