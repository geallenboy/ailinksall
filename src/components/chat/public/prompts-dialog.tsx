"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreatePrompt } from "@/components/chat/prompts/create-prompt";
import { PromptLibrary } from "@/components/chat/prompts/prompt-library";
import { usePromptsStore } from "@/store/chat";
import { usePrompts } from "@/hooks/chat";
import { useChatHooks } from "@/hooks/chat/use-chat-hooks";

export const PromptsDialog = () => {
  const {
    isPromptOpen,
    showCreatePrompt,
    tab,
    editablePrompt,
    dismiss,
    setTab,
    setShowCreatePrompt,
    setEditablePrompt,
  } = usePromptsStore();

  const {
    localPromptsQuery,
    publicPromptsQuery,
    createPromptMutation,
    updatePromptMutation,
    deletePromptMutation,
  } = usePrompts();

  const { editor } = useChatHooks();

  return (
    <Dialog
      open={isPromptOpen}
      onOpenChange={(open) => {
        if (!open) dismiss();
      }}
    >
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
              // 使用选定的提示内容更新编辑器
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
  );
};
