"use client";

import { Toaster } from "@/components/ui/toaster";
import { SettingsDialog } from "@/components/chat/settings/settings-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";

import {
  AssistantDialog,
  FilterDialog,
  PromptsDialog,
} from "@/components/chat/public";
import { SessionsProvider } from "@/provider/sessions";
import { PreferenceProvider } from "@/provider/preferences";

import { ChatProvider } from "@/provider/chat";

export type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SessionsProvider>
      <PreferenceProvider>
        <ChatProvider>
          <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row">
            {children}
            <Toaster />
            <SettingsDialog />
            <ConfirmDialog />
            <FilterDialog />
            <PromptsDialog />
            <AssistantDialog />
          </div>
        </ChatProvider>
      </PreferenceProvider>
    </SessionsProvider>
  );
};
