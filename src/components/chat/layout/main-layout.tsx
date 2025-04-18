"use client";

import { Toaster } from "@/components/ui/toaster";
import { SettingsDialog } from "@/components/chat/settings/settings-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { useChatInitializer } from "@/hooks/chat/use-chat-initializer";
import { FilterDialog, PromptsDialog } from "@/components/chat/public";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  // useChatInitializer();

  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row">
      {children}
      <Toaster />
      <SettingsDialog />
      <ConfirmDialog />
      <FilterDialog />
      <PromptsDialog />
    </div>
  );
};
