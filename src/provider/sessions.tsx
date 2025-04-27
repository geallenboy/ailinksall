"use client";

import { useChatSessionQuery } from "@/hooks";
import { useSessionHooks } from "@/hooks/chat";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

export type TSessionsProvider = {
  children: React.ReactNode;
};

export const SessionsProvider = ({ children }: TSessionsProvider) => {
  const { sessionId } = useParams();
  const {
    setSessions,
    setCurrentSession,
    createSession,
    setAllSessionLoading,
    setCurrentSessionLoading,
  } = useSessionHooks();
  const { sessionsQuery, getSessionByIdQuery } = useChatSessionQuery(
    sessionId?.toString()
  );
  const currentSessionQuery = getSessionByIdQuery;

  useEffect(() => {
    sessionsQuery?.data && setSessions(sessionsQuery?.data || []);
  }, [sessionsQuery?.data, setSessions]);

  useEffect(() => {
    currentSessionQuery?.data &&
      setCurrentSession(currentSessionQuery?.data || []);
  }, [currentSessionQuery?.data, setCurrentSession]);

  useEffect(() => {
    if (sessionsQuery?.isLoading !== undefined) {
      setAllSessionLoading(sessionsQuery.isLoading);
    }
  }, [sessionsQuery?.isLoading, setAllSessionLoading]);

  useEffect(() => {
    if (currentSessionQuery?.isLoading !== undefined) {
      setCurrentSessionLoading(currentSessionQuery.isLoading);
    }
  }, [currentSessionQuery?.isLoading, setCurrentSessionLoading]);

  useEffect(() => {
    if (currentSessionQuery?.error) {
      createSession({ redirect: true });
    }
  }, [currentSessionQuery?.error]);

  return <>{children}</>;
};
