"use client";

import Spinner from "@/components/ui/loading-spinner";
import { useSessionHooks } from "@/hooks/chat/use-session-hooks";
import { useEffect } from "react";

export default function Home() {
  const { createSession } = useSessionHooks();
  useEffect(() => {
    createSession({ redirect: true });
  }, []);
  return (
    <main className="flex flex-col gap-2 h-[100dvh] w-screen items-center justify-center">
      <Spinner />
    </main>
  );
}
