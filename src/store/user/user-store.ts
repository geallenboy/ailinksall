import { create } from 'zustand';

// Define user types
interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isLoggedIn: boolean;
}

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;

    // Actions
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: false,
    error: null,

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            // Replace with actual API call
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const userData = await response.json();
            set({ user: { ...userData, isLoggedIn: true }, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Login failed', loading: false });
        }
    },

    logout: () => {
        // Could add API call to logout here if needed
        set({ user: null, error: null });
    },

    updateUser: (userData) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
        }));
    },

    fetchUser: async () => {
        set({ loading: true, error: null });
        try {
            // Replace with actual API call
            const response = await fetch('/api/user');

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            set({ user: { ...userData, isLoggedIn: true }, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch user', loading: false });
        }
    },
}));