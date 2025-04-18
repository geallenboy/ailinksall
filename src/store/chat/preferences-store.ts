import { create } from 'zustand';

import { TApiKeys, TPreferences, TBaseModel } from '@/types/chat';
import { defaultPreferences } from '@/config/chat/preferences';


// 定义Zustand store的状态类型
interface PreferencesState {
    // 状态
    preferences: TPreferences;
    apiKeys: TApiKeys;

    // 操作方法
    setPreferences: (preferences: TPreferences) => void;
    setApiKeys: (apiKeys: TApiKeys) => void;
    updatePreferences: (
        newPreferences: Partial<TPreferences>,
        onSuccess?: (preference: TPreferences) => void
    ) => void;
    updateApiKey: (key: TBaseModel, value: string) => void;
    updateApiKeys: (newApiKeys: TApiKeys) => void;

    // 初始化标志
    isPreferencesInitialized: boolean;
    isApiKeysInitialized: boolean;
    setPreferencesInitialized: (initialized: boolean) => void;
    setApiKeysInitialized: (initialized: boolean) => void;
}

// 创建Zustand store
export const usePreferencesStore = create<PreferencesState>((set, get) => ({
    // 初始状态
    preferences: defaultPreferences,
    apiKeys: {},
    isPreferencesInitialized: false,
    isApiKeysInitialized: false,

    // 设置方法
    setPreferences: (preferences) => set({ preferences }),
    setApiKeys: (apiKeys) => set({ apiKeys }),
    setPreferencesInitialized: (initialized) => set({ isPreferencesInitialized: initialized }),
    setApiKeysInitialized: (initialized) => set({ isApiKeysInitialized: initialized }),

    // 更新偏好设置
    updatePreferences: (newPreferences, onSuccess) => {
        const currentState = get();
        // 先更新本地状态
        const updatedPreferences = { ...currentState.preferences, ...newPreferences };
        set({ preferences: updatedPreferences });

        // 使用react-query中的mutation更新服务器数据
        // 注意: 这里我们需要在组件中处理实际的mutation调用
        // 因为Zustand store是存储状态的地方，而不是执行异步操作的地方

        // 成功回调会在usePreferencesHook中处理
        if (onSuccess) {
            onSuccess(updatedPreferences);
        }
    },

    // 更新单个API key
    updateApiKey: (key, value) => {
        const currentState = get();
        set({ apiKeys: { ...currentState.apiKeys, [key]: value } });
        // 实际的mutation调用将在hook中处理
    },

    // 批量更新API keys
    updateApiKeys: (newApiKeys) => {
        set({ apiKeys: newApiKeys });
    },
}));
