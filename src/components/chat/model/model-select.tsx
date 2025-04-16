import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModelIcon } from "./model-icon";

export type TModelSelect = {
  selectedModel: TModelKey;
  fullWidth?: boolean;
  variant?: "outline" | "ghost" | "default" | "secondary";
  setSelectedModel: (model: TModelKey) => void;
  className?: string;
};

export const ModelSelect = ({
  selectedModel,
  variant,
  fullWidth,
  setSelectedModel,
  className,
}: TModelSelect) => {
  const [isOpen, setIsOpen] = useState(false);

  const { getModelByKey, models, assistants, getAssistantByKey } =
    useModelList();

  const activeAssistant = getAssistantByKey(selectedModel);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant || "ghost"}
            className={cn("pl-1 pr-3 gap-2 text-xs md:text-sm", className)}
            size="sm"
          >
            {activeAssistant?.model?.icon("sm")}{" "}
            {activeAssistant?.assistant.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          className={cn(
            "text-xs z-[610] md:text-sm max-h-[260px] overflow-y-auto no-scrollbar",
            fullWidth ? "w-full" : "min-w-[250px]"
          )}
        >
          {assistants
            ?.filter((a) => a.type === "base")
            .map((assistant) => {
              const model = getModelByKey(assistant.baseModel);

              return (
                <DropdownMenuItem
                  className={cn(
                    "text-xs md:text-sm font-medium",
                    activeAssistant?.assistant.key === assistant.key &&
                      "dark:bg-black/30 bg-zinc-50"
                  )}
                  key={assistant.key}
                  onClick={() => {
                    setSelectedModel(assistant.key);
                    setIsOpen(false);
                  }}
                >
                  {assistant.type === "base" ? (
                    model?.icon("sm")
                  ) : (
                    <ModelIcon type="custom" size="sm" />
                  )}
                  {model?.isNew && <Badge>新</Badge>}
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
