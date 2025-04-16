import { MainLayout } from "@/components/chat/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssistantsProvider } from "@/context/assistant";
import { ChatProvider } from "@/context/chat";
import { ConfirmProvider } from "@/context/confirm";
import { FiltersProvider } from "@/context/filters";
import { PreferenceProvider } from "@/context/preferences";
import { PromptsProvider } from "@/context/prompts";
import { SessionsProvider } from "@/context/sessions";
import { SettingsProvider } from "@/context/settings";
import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <ConfirmProvider>
        <PreferenceProvider>
          <SessionsProvider>
            <SettingsProvider>
              <ChatProvider>
                <FiltersProvider>
                  <AssistantsProvider>
                    <PromptsProvider>
                      <MainLayout>{children}</MainLayout>
                    </PromptsProvider>
                  </AssistantsProvider>
                </FiltersProvider>
              </ChatProvider>
            </SettingsProvider>
          </SessionsProvider>
        </PreferenceProvider>
      </ConfirmProvider>
    </TooltipProvider>
  );
}
