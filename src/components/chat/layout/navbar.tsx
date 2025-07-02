"use client";

import { memo, useCallback, useMemo } from "react";
import {
  Moon02Icon,
  MoreHorizontalIcon,
  NoteIcon,
  PlusSignIcon,
  Settings03Icon,
  Sun01Icon,
} from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { HistorySidebar } from "@/components/chat/history/history-side-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flex } from "@/components/ui/flex";
import { Tooltip } from "@/components/ui/tooltip";
import { useSettingsStore } from "@/store/chat/settings-store";
import { usePromptsStore } from "@/store/chat";
import { useSessionsContext } from "@/context";

export const Navbar = memo(() => {
  // 使用更细粒度的选择器，只订阅真正需要的状态
  const { theme, setTheme } = useTheme();
  const openSettings = useSettingsStore((state) => state.open);
  const openPrompts = usePromptsStore((state) => state.open);
  const { createSession } = useSessionsContext();
  const [isOpen, setIsOpen] = useState(false);

  // 使用 useCallback 缓存事件处理函数
  const handleCreateSession = useCallback(() => {
    createSession({
      redirect: true,
    });
  }, [createSession]);

  const handleOpenPrompts = useCallback(() => {
    openPrompts();
  }, [openPrompts]);

  const handleOpenSettings = useCallback(() => {
    openSettings();
  }, [openSettings]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const handleMenuOpenChange = useCallback((open: boolean) => {
    document.body.style.pointerEvents = "auto";
    setIsOpen(open);
  }, []);

  // 使用 useMemo 缓存计算结果
  const themeIcon = useMemo(() => {
    return theme === "light" ? (
      <Moon02Icon size={18} variant="stroke" strokeWidth="2" />
    ) : (
      <Sun01Icon size={18} variant="stroke" strokeWidth="2" />
    );
  }, [theme]);

  const renderNewSession = useCallback(() => {
    return (
      <Tooltip content="New Session" side="left" sideOffset={4}>
        <Button
          size="icon"
          variant={"ghost"}
          className="min-w-8 h-8"
          onClick={handleCreateSession}
        >
          <PlusSignIcon size={20} variant="stroke" strokeWidth="2" />{" "}
        </Button>
      </Tooltip>
    );
  }, [handleCreateSession]);

  return (
    <div className="absolute z-[50] flex flex-col justify-center items-center gap-3 pb-6 md:p-3 top-0 bottom-0 left-0 border-r border-zinc-50 dark:border-white/5">
      <div className="flex flex-row gap-2 items-center">
        {renderNewSession()}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <HistorySidebar />
      </div>
      <Tooltip content="Prompts" side="left" sideOffset={4}>
        <Button size="iconSm" variant="ghost" onClick={handleOpenPrompts}>
          <NoteIcon size={20} variant="stroke" strokeWidth="2" />
        </Button>
      </Tooltip>
      <Flex className="flex-1" />
      <Tooltip content="Preferences" side="left" sideOffset={4}>
        <Button size="iconSm" variant="ghost" onClick={handleOpenSettings}>
          <Settings03Icon size={20} variant="stroke" strokeWidth="2" />
        </Button>
      </Tooltip>
      <DropdownMenu open={isOpen} onOpenChange={handleMenuOpenChange}>
        <Tooltip content="更多" side="left" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <MoreHorizontalIcon size={20} variant="solid" />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="min-w-[250px] text-sm md:text-base mr-2"
          align="end"
          side="left"
          sideOffset={4}
        >
          <DropdownMenuItem onClick={() => {}}>关于</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>反馈</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>支持</DropdownMenuItem>
          <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10 w-full" />

          <DropdownMenuItem onClick={handleThemeToggle}>
            {themeIcon}
            切换到{theme === "light" ? "深色" : "浅色"}模式
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

Navbar.displayName = "Navbar";
