import { create } from "zustand";
import { TApiKeys, TBaseModel, TPreferences } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";

// 定义用于外部传入的服务类型
export interface IPreferenceService {
    getPreferences: () => Promise<TPreferences | null>;
    getApiKeys: () => Promise<TApiKeys | null>;
    setPreferences: (preferences: Partial<TPreferences>) => Promise<void>;
    setApiKey: (key: TBaseModel, value: string) => Promise<void>;
    resetToDefaults: () => Promise<void>;
}

interface PreferenceState {
    preferences: TPreferences;
    apiKeys: TApiKeys;
    isLoaded: boolean;
    setPreferences: (newPreferences: Partial<TPreferences>) => void;
    setApiKey: (key: TBaseModel, value: string) => void;
    setApiKeys: (newApiKeys: TApiKeys) => void;
    initialize: (service: IPreferenceService) => Promise<void>;
    resetToDefaults: (service: IPreferenceService) => Promise<void>;
}

export const usePreferenceStore = create<PreferenceState>()((set) => ({
    preferences: defaultPreferences,
    apiKeys: {},
    isLoaded: false,

    // 从外部服务初始化 store
    initialize: async (service: IPreferenceService) => {
        try {
            const storedPreferences = await service.getPreferences();
            const storedApiKeys = await service.getApiKeys();

            set({
                preferences: storedPreferences ? { ...defaultPreferences, ...storedPreferences } : defaultPreferences,
                apiKeys: storedApiKeys || {},
                isLoaded: true
            });
        } catch (error) {
            console.error("Failed to initialize preference store:", error);
            set({ isLoaded: true });
        }
    },

    // 仅更新本地状态（不涉及外部服务调用）
    setPreferences: (newPreferences) => {
        set((state) => ({
            preferences: { ...state.preferences, ...newPreferences }
        }));
    },

    // 仅更新本地状态
    setApiKey: (key, value) => {
        set((state) => ({
            apiKeys: { ...state.apiKeys, [key]: value }
        }));
    },

    // 仅更新本地状态
    setApiKeys: (newApiKeys) => {
        set({ apiKeys: newApiKeys });
    },

    // 重置状态（需要外部服务）
    resetToDefaults: async (service: IPreferenceService) => {
        try {
            await service.resetToDefaults();
            set({ preferences: defaultPreferences });
        } catch (error) {
            console.error("Failed to reset preferences:", error);
        }
    },
}));