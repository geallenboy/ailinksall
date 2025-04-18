import { MainLayout } from "@/components/chat/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssistantsProvider } from "@/context/assistant";
import { ChatProvider } from "@/context/chat";
import { PreferenceProvider } from "@/context/preferences";
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
            <AssistantsProvider>
              <MainLayout>{children}</MainLayout>
            </AssistantsProvider>
          </ChatProvider>
        </SessionsProvider>
      </PreferenceProvider>
    </TooltipProvider>
  );
}
