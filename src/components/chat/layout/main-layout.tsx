"use client";

import { Toaster } from "@/components/ui/toaster";
import { SettingsDialog } from "@/components/chat/settings/settings-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";

import {
  AssistantDialog,
  FilterDialog,
  PromptsDialog,
} from "@/components/chat/public";
import {
  ChatInitializer,
  PreferenceInitializer,
  SessionInitializer,
} from "@/hooks/init";

export type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row">
      {children}
      <Toaster />
      <SettingsDialog />
      <ConfirmDialog />
      <FilterDialog />
      <PromptsDialog />
      <AssistantDialog />
      <ChatInitializer />
      <PreferenceInitializer />
      <SessionInitializer />
    </div>
  );
};
