"use client";

import { useChatSessionQuery } from "@/hooks";
import { TChatMessage, TChatSession } from "@/types/chat";
import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

export type TSessionsContext = {
  sessions: TChatSession[];
  refetchSessions?: () => void;
  isGenerating: boolean;
  setGenerating: (value: boolean) => void;
  isAllSessionLoading: boolean;
  isCurrentSessionLoading: boolean;
  currentSession?: TChatSession;
  createSession: (props: { redirect?: boolean }) => void;
  setCurrentSession?: React.Dispatch<
    React.SetStateAction<TChatSession | undefined>
  >;
  removeMessage: (messageId: string) => void;
  refetchCurrentSession?: () => void;
  addMessageToSession: (sessionId: string, message: TChatMessage) => void;
  getSessionById: (id: string) => Promise<TChatSession | undefined>;
} & ReturnType<typeof useChatSessionQuery>;

export const SessionContext = createContext<TSessionsContext | undefined>(
  undefined
);

export const useSessionsContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSessionsContext must be used within a SessionsProvider"
    );
  }
  return context;
};

export type TSessionsProvider = {
  children: React.ReactNode;
};

export const SessionsProvider = ({ children }: TSessionsProvider) => {
  const { sessionId } = useParams();
  const [sessions, setSessions] = useState<TChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<
    TChatSession | undefined
  >();
  const [isGenerating, setIsGenerating] = useState(false);
  const props = useChatSessionQuery(sessionId?.toString());
  const {
    sessionsQuery,
    createNewSessionMutation,
    removeMessageByIdMutation,
    addMessageToSessionMutation,
    getSessionByIdMutation,
    getSessionByIdQuery,
    addSessionsMutation,
  } = props;

  const currentSessionQuery = getSessionByIdQuery;

  const { push, refresh } = useRouter();

  useEffect(() => {
    sessionsQuery?.data && setSessions(sessionsQuery?.data || []);
  }, [sessionsQuery?.data]);

  useEffect(() => {
    currentSessionQuery?.data &&
      setCurrentSession(currentSessionQuery?.data || []);
  }, [currentSessionQuery?.data]);

  useEffect(() => {
    if (currentSessionQuery?.error) {
      createSession({ redirect: true });
    }
  }, [currentSessionQuery?.error]);

  const createSession = async (props: { redirect?: boolean }) => {
    const { redirect } = props;
    await createNewSessionMutation.mutateAsync(undefined, {
      onSuccess: (data) => {
        if (redirect) {
          // push(`/chat/${data.id}`);
          // refresh();
          window.open(`/chat/${data.id}`, "_self");
        }
      },
    });
  };

  const removeMessage = (messageId: string) => {
    if (!currentSession?.id) {
      return;
    }

    removeMessageByIdMutation.mutate(
      {
        sessionId: currentSession?.id,
        messageId,
      },
      {
        onSuccess: () => {
          currentSessionQuery?.refetch();
        },
      }
    );
  };

  const addMessageToSession = async (
    sessionId: string,
    message: TChatMessage
  ) => {
    await addMessageToSessionMutation.mutateAsync({
      sessionId,
      message,
    });
  };

  const getSessionById = async (id: string) => {
    return await getSessionByIdMutation.mutateAsync(id);
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        isAllSessionLoading: sessionsQuery?.isLoading,
        isCurrentSessionLoading: currentSessionQuery.isLoading,
        createSession,
        setCurrentSession,
        currentSession,
        removeMessage,
        refetchSessions: sessionsQuery.refetch,
        refetchCurrentSession: currentSessionQuery.refetch,
        addMessageToSession,
        getSessionById,
        isGenerating,
        setGenerating: setIsGenerating,
        ...props,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
