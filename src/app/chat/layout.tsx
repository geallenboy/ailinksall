"use client";

import { SettingsDialog } from "@/components/chat/settings/settings-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { FilterDialog, PromptsDialog } from "@/components/chat/public";
import {
  AssistantsProvider,
  ChatProvider,
  PreferenceProvider,
  SessionsProvider,
} from "@/context";
import { TooltipProvider } from "@/components/ui/tooltip";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 p-1 flex flex-row">
      <TooltipProvider>
        <PreferenceProvider>
          <SessionsProvider>
            <ChatProvider>
              <AssistantsProvider>
                {children}

                <PromptsDialog />
              </AssistantsProvider>
              <FilterDialog />
            </ChatProvider>
            <SettingsDialog />
          </SessionsProvider>
        </PreferenceProvider>
        <ConfirmDialog />
      </TooltipProvider>
    </div>
  );
};

export default ChatLayout;
