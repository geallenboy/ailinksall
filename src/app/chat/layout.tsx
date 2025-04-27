import { MainLayout } from "@/components/chat/layout/main-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <MainLayout>{children}</MainLayout>
    </TooltipProvider>
  );
}
