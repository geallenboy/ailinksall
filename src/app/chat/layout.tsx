import { MainLayout } from "@/components/chat/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssistantsProvider } from "@/context/assistant";
import { ChatProvider } from "@/context/chat";
import { FiltersProvider } from "@/context/filters";
import { PreferenceProvider } from "@/context/preferences";
import { PromptsProvider } from "@/context/prompts";
import { SessionsProvider } from "@/context/sessions";

import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <PreferenceProvider>
        <SessionsProvider>
          <ChatProvider>
            <FiltersProvider>
              <AssistantsProvider>
                <PromptsProvider>
                  <MainLayout>{children}</MainLayout>
                </PromptsProvider>
              </AssistantsProvider>
            </FiltersProvider>
          </ChatProvider>
        </SessionsProvider>
      </PreferenceProvider>
    </TooltipProvider>
  );
}
