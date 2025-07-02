import { create } from "zustand";
import { TChatMessage, TChatSession } from "@/types/chat";

interface SessionState {
    sessions: TChatSession[];
    currentSession?: TChatSession;
    isGenerating: boolean;
    isAllSessionLoading: boolean;
    isCurrentSessionLoading: boolean;

    // Actions
    setSessions: (sessions: TChatSession[]) => void;
    setCurrentSession: (session?: any) => void;
    setGenerating: (isGenerating: boolean) => void;
    setAllSessionLoading: (isLoading: boolean) => void;
    setCurrentSessionLoading: (isLoading: boolean) => void;


}

export const useSessionStore = create<SessionState>((set) => ({
    sessions: [],
    currentSession: undefined,
    isGenerating: false,
    isAllSessionLoading: true,
    isCurrentSessionLoading: true,

    // Basic state setters
    setSessions: (sessions) => set({ sessions }),
    setCurrentSession: (session) => set({ currentSession: session }),
    setGenerating: (isGenerating) => set({ isGenerating }),
    setAllSessionLoading: (isLoading) => set({ isAllSessionLoading: isLoading }),
    setCurrentSessionLoading: (isLoading) => set({ isCurrentSessionLoading: isLoading }),

}));