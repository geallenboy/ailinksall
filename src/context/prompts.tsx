"use client";

import { TPrompt, usePrompts } from "@/hooks/use-prompts";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { CreatePrompt } from "@/components/chat/prompts/create-prompt";
import { PromptLibrary } from "@/components/chat/prompts/prompt-library";

import { createContext, useContext } from "react";
import { useChatContext } from "./chat";

export type TPromptsContext = {
  open: (action?: "public" | "local" | "create") => void;
  dismiss: () => void;
  allPrompts: TPrompt[];
};
export const PromptsContext = createContext<undefined | TPromptsContext>(
  undefined
);

export const usePromptsContext = () => {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error("usePrompts must be used within a PromptsProvider");
  }
  return context;
};

export type TPromptsProvider = {
  children: React.ReactNode;
};

export type TPromptMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};

export const PromptsProvider = ({ children }: TPromptsProvider) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [tab, setTab] = useState<"public" | "local">("public");
  const [editablePrompt, setEditablePrompt] = useState<TPrompt | undefined>(
    undefined
  );
  const {
    getPrompts,
    promptsQuery,
    createPromptMutation,
    deletePromptMutation,
    updatePromptMutation,
  } = usePrompts();
  const { editor } = useChatContext();

  const open = (action?: "public" | "local" | "create") => {
    if (action === "create") {
      setShowCreatePrompt(true);
    } else {
      action && setTab(action);
    }
    setIsPromptOpen(true);
  };

  const localPromptsQuery = promptsQuery;

  const publicPromptsQuery = useQuery<{ prompts: TPrompt[] }>({
    queryKey: ["Prompts"],
    queryFn: async () => axios.get(`/api/prompts`).then((res) => res.data),
  });

  const allPrompts = [
    ...(localPromptsQuery.data || []),
    ...(publicPromptsQuery.data?.prompts || []),
  ];

  const dismiss = () => setIsPromptOpen(false);

  return (
    <PromptsContext.Provider value={{ open, dismiss, allPrompts }}>
      {children}

      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:w-[600px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          {showCreatePrompt ? (
            <CreatePrompt
              prompt={editablePrompt}
              open={showCreatePrompt}
              onOpenChange={(isOpen) => {
                setShowCreatePrompt(isOpen);
                if (!isOpen) {
                  setTab("local");
                }
              }}
              onCreatePrompt={(prompt) => {
                createPromptMutation.mutate(prompt);
              }}
              onUpdatePrompt={(prompt) => {
                editablePrompt?.id &&
                  updatePromptMutation.mutate({
                    id: editablePrompt?.id,
                    prompt,
                  });
              }}
            />
          ) : (
            <PromptLibrary
              open={!showCreatePrompt}
              tab={tab}
              onTabChange={setTab}
              onCreate={() => {
                setEditablePrompt(undefined);
                setShowCreatePrompt(true);
              }}
              onPromptSelect={(prompt) => {
                editor?.commands?.clearContent();
                editor?.commands?.setContent(prompt.content);
                editor?.commands?.focus("end");
                dismiss();
              }}
              localPrompts={localPromptsQuery?.data || []}
              publicPrompts={publicPromptsQuery?.data?.prompts || []}
              onEdit={(prompt) => {
                setEditablePrompt(prompt);
                setShowCreatePrompt(true);
              }}
              onDelete={(prompt) => deletePromptMutation.mutate(prompt.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PromptsContext.Provider>
  );
};
