import { TPrompt } from "@/hooks/query/use-prompts-query";
import { Edit02Icon, NoteIcon } from "@hugeicons/react";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TPromptLibrary = {
  open: boolean;
  onPromptSelect: (prompt: TPrompt) => void;
  tab: "public" | "local";
  publicPrompts: TPrompt[];
  localPrompts: TPrompt[];
  onEdit: (prompt: TPrompt) => void;
  onDelete: (prompt: TPrompt) => void;
  onTabChange: (tab: "public" | "local") => void;
  onCreate: () => void;
};

export const PromptLibrary = ({
  open,
  onPromptSelect,
  tab,
  localPrompts,
  publicPrompts,
  onCreate,
  onTabChange,
  onEdit,
  onDelete,
}: TPromptLibrary) => {
  return (
    <Command>
      <div className="w-full p-1">
        <CommandInput placeholder="搜索提示词" />
      </div>

      <div className="flex flex-col w-full relative h-full">
        <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
          未找到提示词
          <Button variant="outline" size="sm" onClick={onCreate}>
            创建新提示词
          </Button>
        </CommandEmpty>

        <CommandList className="px-2 pb-2">
          <CommandItem
            value={"Create prompt"}
            className="w-full"
            onSelect={onCreate}
          >
            <Edit02Icon size={18} variant="stroke" strokeWidth="2" />
            创建提示词
          </CommandItem>
          <CommandGroup heading="提示词集合">
            {[...localPrompts, ...publicPrompts]?.map((prompt) => (
              <CommandItem
                value={prompt.name}
                key={prompt.id}
                className="w-full"
                onSelect={() => {
                  onPromptSelect(prompt);
                }}
              >
                <NoteIcon size={20} variant="stroke" strokeWidth="2" />
                {prompt.name}
                {tab === "local" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="iconSm">
                        <DotsThree size={24} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="min-w-[200px] text-sm md:text-base"
                      align="end"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          onEdit(prompt);
                          e.stopPropagation();
                        }}
                      >
                        <Pencil size={14} weight="bold" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          onDelete(prompt);
                          e.stopPropagation();
                        }}
                      >
                        <TrashSimple size={14} weight="bold" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </Command>
  );
};
