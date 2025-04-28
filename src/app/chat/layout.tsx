"use client";

import { Toaster } from "@/components/ui/toaster";
import { SettingsDialog } from "@/components/chat/settings/settings-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import {
  AssistantDialog,
  FilterDialog,
  PromptsDialog,
} from "@/components/chat/public";
import { ChatProvider, PreferenceProvider, SessionsProvider } from "@/context";

export const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row">
      <PreferenceProvider>
        <SessionsProvider>
          <ChatProvider>
            {children}
            <Toaster />
            <SettingsDialog />
            <ConfirmDialog />
            <FilterDialog />
            <PromptsDialog />
            <AssistantDialog />
          </ChatProvider>
        </SessionsProvider>
      </PreferenceProvider>
    </div>
  );
};
