

// 📁 lib/chat-session.ts
import { get, set } from "idb-keyval";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { TChatMessage, TChatSession } from "@/types/chat.type";
import { sortSessions } from "@/lib/chat/helper";
import { supabase } from "@/lib/supabase";

const LOCAL_KEY = "chat-sessions";

export const getSessions = async (): Promise<TChatSession[]> => {
    return (await get(LOCAL_KEY)) || [];
};

export const saveSessions = async (sessions: TChatSession[]) => {
    await set(LOCAL_KEY, sessions);
};

export const saveSession = async (session: TChatSession) => {
    const sessions = await getSessions();
    await saveSessions([...sessions, session]);
};

export const createSession = async (): Promise<TChatSession> => {
    const sessions = await getSessions();
    const latestSession = sortSessions(sessions, "createdAt")?.[0];
    if (latestSession?.messages?.length === 0) {
        return latestSession as TChatSession;
    }


    const newSession: TChatSession = {
        id: v4(),
        messages: [],
        title: "Untitled",
        createdAt: dayjs().toISOString(),
    };
    await saveSession(newSession);
    return newSession;
};

export const getSessionById = async (id: string) => {
    const sessions = await getSessions();
    return sessions.find((s) => s.id === id);
};

export const updateSession = async (
    id: string,
    updates: Partial<Omit<TChatSession, "id">>
) => {
    const sessions = await getSessions();
    const updated = sessions.map((s) => (s.id === id ? { ...s, ...updates } : s));
    await saveSessions(updated);
};

export const addMessage = async (sessionId: string, message: TChatMessage) => {
    const sessions = await getSessions();
    const updated = sessions.map((s) => {
        if (s.id !== sessionId) return s;

        const exists = s.messages.find((m) => m.id === message.id);
        const newMessages = exists
            ? s.messages.map((m) => (m.id === message.id ? { ...m, ...message } : m))
            : [...s.messages, message];

        return {
            ...s,
            messages: newMessages,
            title: s.title || message.rawHuman,
            updatedAt: dayjs().toISOString(),
        };
    });
    await saveSessions(updated);
};

export const removeSession = async (id: string) => {
    const sessions = await getSessions();
    await saveSessions(sessions.filter((s) => s.id !== id));
};

export const removeMessage = async (sessionId: string, messageId: string) => {
    const sessions = await getSessions();
    const updated = sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const filtered = s.messages.filter((m) => m.id !== messageId);
        return { ...s, messages: filtered };
    }).filter((s) => s.messages.length);
    await saveSessions(updated);
};

export const clearAllSessions = async () => {
    await saveSessions([]);
};


export const syncToSupabase = async (userId: string) => {
    const sessions = await getSessions();

    for (const session of sessions) {
        await supabase.from("chat_sessions").upsert({
            id: session.id,
            user_id: userId,
            title: session.title,
            created_at: session.createdAt,
            updated_at: session.updatedAt,
        });

        for (const message of session.messages) {
            await supabase.from("chat_messages").upsert({
                id: message.id,
                session_id: message.sessionId,
                raw_human: message.rawHuman,
                raw_ai: message.rawAI,
                created_at: message.createdAt,
                input_props: message.inputProps || null,
                image: message.image || null,
            });
        }
    }
};
