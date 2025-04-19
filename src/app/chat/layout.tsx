import { MainLayout } from "@/components/chat/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/context/chat";
import { SessionsProvider } from "@/context/sessions";
import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SessionsProvider>
        <ChatProvider>
          <MainLayout>{children}</MainLayout>
        </ChatProvider>
      </SessionsProvider>
    </TooltipProvider>
  );
}
