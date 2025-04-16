// lib/assistants.ts
import { get, set } from "idb-keyval";
import { v4 } from "uuid";
import { TAssistant } from "@/types/chat.type";

export const getAssistants = async (): Promise<TAssistant[]> => {
    return (await get("assistants")) || [];
};

export const createAssistant = async (assistant: Omit<TAssistant, "key">) => {
    const assistants = await getAssistants();
    const newAssistants = [...assistants, { ...assistant, key: v4() }];
    await set("assistants", newAssistants);
};

export const updateAssistant = async (
    assistantKey: string,
    newAssistant: Omit<TAssistant, "key">
) => {
    const assistants = await getAssistants();
    const newAssistants = assistants.map((assistant) => {
        if (assistant.key === assistantKey) {
            return { ...assistant, ...newAssistant };
        }
        return assistant;
    });
    await set("assistants", newAssistants);
};

export const deleteAssistant = async (key: string) => {
    const assistants = await getAssistants();
    const newAssistants =
        assistants?.filter((assistant) => assistant.key !== key) || [];
    await set("assistants", newAssistants);
};
