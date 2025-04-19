"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { CreateAssistant } from "@/components/chat/assistants/create-assistant";
import { AssistantItem } from "@/components/chat/assistants/assistant-item";
import { useAssistantQuery } from "@/hooks/chat/use-assistant-query";
import { usePreferencesStore } from "@/store/chat";
import { defaultPreferences } from "@/config/chat/preferences";
import { useEffect } from "react";
import { TAssistant } from "@/types/chat";

/**
 * 助手选择对话框组件
 */
export function AssistantDialog() {
  // 使用助手hook获取所需状态和方法
  const {
    isAssistantOpen,
    openCreateAssistant,
    updateAssistant,
    selectedAssistantKey,
    assistants,
    searchRef,
    dismiss,
    setOpenCreateAssistant,
    setUpdateAssistant,
    setSelectedAssistantKey,
    getAssistantsByType,
    getAssistantByKey,
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
  } = useAssistantQuery();

  // 获取偏好设置
  const { updatePreferences } = usePreferencesStore();

  // 当助手对话框打开时，聚焦搜索框
  useEffect(() => {
    if (isAssistantOpen && searchRef?.current) {
      searchRef?.current?.focus();
    }
  }, [isAssistantOpen, searchRef]);

  // 处理选择助手的操作
  const handleSelectAssistant = (assistant: TAssistant) => {
    setSelectedAssistantKey(assistant.key);
    // 同时更新偏好设置中的默认助手
    updatePreferences({ defaultAssistant: assistant.key });
    dismiss(); // 关闭助手对话框
  };

  // 处理删除助手的操作
  const handleDeleteAssistant = (assistant: TAssistant) => {
    deleteAssistantMutation?.mutate(assistant.key, {
      onSuccess: () => {
        // 如果删除的是当前选中的助手，重置为默认助手
        if (assistant.key === selectedAssistantKey) {
          updatePreferences({
            defaultAssistant: defaultPreferences.defaultAssistant,
          });
        }
      },
    });
  };

  // 处理编辑助手的操作
  const handleEditAssistant = (assistant: TAssistant) => {
    setOpenCreateAssistant(true);
    setUpdateAssistant(assistant);
  };

  // 处理创建新助手的操作
  const handleCreateAssistant = (assistant: Omit<TAssistant, "key">) => {
    createAssistantMutation.mutate(assistant as any, {
      onSettled: () => {
        setOpenCreateAssistant(false);
      },
    });
  };

  // 处理更新助手的操作
  const handleUpdateAssistant = (assistant: TAssistant) => {
    updateAssistantMutation.mutate(
      {
        assistantKey: assistant.key,
        newAssistant: assistant,
      },
      {
        onSettled: () => {
          setOpenCreateAssistant(false);
          setUpdateAssistant(undefined);
        },
      }
    );
  };

  /**
   * 渲染特定类型的助手列表
   * @param type 助手类型，如'custom'或'base'
   */
  const renderAssistants = (type: string) => {
    return getAssistantsByType(type).map((assistant) => {
      return (
        <AssistantItem
          key={assistant.key}
          onDelete={() => handleDeleteAssistant(assistant)}
          onEdit={() => handleEditAssistant(assistant)}
          assistant={assistant}
          onSelect={() => handleSelectAssistant(assistant)}
        />
      );
    });
  };

  return (
    <Drawer.Root
      direction="bottom"
      shouldScaleBackground
      open={isAssistantOpen}
      onOpenChange={(open) => !open && dismiss()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col items-center outline-none max-h-[430px] mt-24 fixed z-[500] md:bottom-4 mx-auto md:left-[50%] left-0 bottom-0 right-0",
            `md:ml-[-200px] md:w-[400px] w-full`
          )}
        >
          <Command className="rounded-2xl relative dark:border-white/10 dark:border">
            <CommandInput
              placeholder="搜索..."
              className="h-12"
              ref={searchRef}
            />

            <CommandList className="border-t border-zinc-500/20">
              <CommandEmpty>未找到结果。</CommandEmpty>
              <CommandGroup>
                <Flex direction={"col"} className="p-2 w-full">
                  <Flex
                    items={"start"}
                    justify={"between"}
                    gap={"lg"}
                    className="w-full px-3 py-2"
                  >
                    <Flex direction={"col"}>
                      <Type weight={"medium"} size={"base"}>
                        助手
                      </Type>
                      <Type size={"xs"} textColor={"tertiary"}>
                        体验 AI 的高级功能，使用自定义助手
                      </Type>
                    </Flex>
                    <Drawer.NestedRoot
                      open={openCreateAssistant}
                      onOpenChange={setOpenCreateAssistant}
                    >
                      <Drawer.Trigger asChild>
                        <Button
                          size={"sm"}
                          onClick={() => {
                            setOpenCreateAssistant(true);
                          }}
                        >
                          添加新助手
                        </Button>
                      </Drawer.Trigger>
                      <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 z-[600] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
                        <Drawer.Content
                          className={cn(
                            "flex flex-col items-center outline-none max-h-[450px] mt-24 fixed z-[605] md:bottom-6 mx-auto md:left-[50%] left-0 bottom-0 right-0",
                            `md:ml-[-220px] md:w-[440px] w-full`
                          )}
                        >
                          <CreateAssistant
                            assistant={updateAssistant}
                            onUpdateAssistant={handleUpdateAssistant}
                            onCreateAssistant={handleCreateAssistant}
                            onCancel={() => {
                              setOpenCreateAssistant(false);
                              // 重置更新助手状态
                              if (updateAssistant) {
                                setUpdateAssistant(undefined);
                              }
                            }}
                          />
                        </Drawer.Content>
                      </Drawer.Portal>
                    </Drawer.NestedRoot>
                  </Flex>
                  {renderAssistants("custom")}
                </Flex>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Flex direction={"col"} className="p-2 w-full">
                  <Type weight={"medium"} size={"base"} className="px-3 py-2">
                    模型
                  </Type>
                  {renderAssistants("base")}
                </Flex>
              </CommandGroup>
            </CommandList>
          </Command>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
