"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useModelList } from "@/hooks/chat/use-model-list";
import { cn } from "@/lib/utils";
import { useFiltersStore } from "@/store/chat";

import { sortSessions } from "@/lib/chat/helper";
import { useFilterActions } from "@/hooks/chat/use-filter-actions";
import { useFilterKeyboardShortcut } from "@/hooks/chat/use-filter-keyboard-shortcut";
import { useSessionHooks } from "@/hooks/chat";

/**
 * 过滤器对话框组件
 * 显示命令面板、会话列表和快捷操作
 */
export const FilterDialog = () => {
  // 从 store 获取状态
  const { isFilterOpen, open: setIsFilterOpen, dismiss } = useFiltersStore();

  // 获取会话数据
  const { sessions, currentSession } = useSessionHooks();

  // 获取模型和助手数据
  const { getModelByKey, getAssistantByKey } = useModelList();

  // 获取操作项
  const actions = useFilterActions();

  // 设置路由
  const router = useRouter();
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const {
          isFilterOpen,
          open: setIsFilterOpen,
          dismiss,
        } = useFiltersStore();
        isFilterOpen ? dismiss() : setIsFilterOpen();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  // 注册键盘快捷键
  useFilterKeyboardShortcut();

  return (
    <CommandDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <CommandInput placeholder="搜索..." />
      <CommandList>
        <CommandEmpty>未找到结果</CommandEmpty>
        <CommandGroup>
          {actions.map((action) => (
            <CommandItem
              key={action.name}
              className="gap-2"
              value={action.name}
              onSelect={action.action}
            >
              <action.icon
                size={18}
                strokeWidth={"2"}
                className="flex-shrink-0"
              />
              {action.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="会话">
          {sortSessions(sessions, "updatedAt")?.map((session) => {
            const assistantProps = getAssistantByKey(
              session.messages?.[0]?.inputProps?.assistant?.key!
            );
            return (
              <CommandItem
                key={session.id}
                value={`${session.id}/${session.title}`}
                className={cn(
                  "gap-2 w-full",
                  currentSession?.id === session.id
                    ? "bg-black/10 dark:bg-black/10"
                    : ""
                )}
                onSelect={() => {
                  router.push(`/chat/${session.id}`);
                  dismiss();
                }}
              >
                {assistantProps?.model.icon("sm")}
                <span className="w-full truncate">{session.title}</span>
                <span className="pl-4 text-xs md:text-xs text-zinc-400 dark:text-zinc-700 flex-shrink-0">
                  {dayjs(session.createdAt).fromNow(true)}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
