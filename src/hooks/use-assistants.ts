// hooks/use-assistants.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
} from "@/lib/chat/assistants";
import { TAssistant } from "@/types/chat.type";

export const useAssistants = () => {
    const assistantsQuery = useQuery({
        queryKey: ["assistants"],
        queryFn: getAssistants,
    });

    const createAssistantMutation = useMutation({
        mutationFn: createAssistant,
        onSuccess: () => assistantsQuery.refetch(),
    });

    const deleteAssistantMutation = useMutation({
        mutationFn: deleteAssistant,
        onSuccess: () => assistantsQuery.refetch(),
    });

    const updateAssistantMutation = useMutation({
        mutationFn: ({
            assistantKey,
            newAssistant,
        }: {
            assistantKey: string;
            newAssistant: Omit<TAssistant, "key">;
        }) => updateAssistant(assistantKey, newAssistant),
        onSuccess: () => assistantsQuery.refetch(),
    });

    return {
        getAssistants,
        createAssistant,
        updateAssistant,
        assistantsQuery,
        createAssistantMutation,
        updateAssistantMutation,
        deleteAssistantMutation,
    };
};
