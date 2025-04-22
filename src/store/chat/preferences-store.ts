import { create } from "zustand";
import { TApiKeys, TBaseModel, TPreferences } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";

/**
 * 偏好设置状态管理存储
 * 遵循单一职责原则，仅负责状态管理，不包含副作用操作
 */
interface PreferenceState {
    // 状态数据
    preferences: TPreferences;  // 用户偏好设置
    apiKeys: TApiKeys;         // API密钥集合
    isLoaded: boolean;         // 数据加载状态标记

    // 状态更新方法 - 纯函数，不包含副作用
    setPreferences: (newPreferences: Partial<TPreferences>) => void;  // 更新偏好设置
    setApiKey: (key: TBaseModel, value: string) => void;              // 更新单个API密钥
    setApiKeys: (newApiKeys: TApiKeys) => void;                       // 更新所有API密钥
    setIsLoaded: (loaded: boolean) => void;                           // 设置加载状态
}

/**
 * 创建偏好设置状态存储
 * 使用Zustand管理全局状态
 */
export const usePreferenceStore = create<PreferenceState>()((set) => ({
    // 初始状态
    preferences: defaultPreferences,  // 使用默认偏好设置初始化
    apiKeys: {},                      // API密钥初始为空对象
    isLoaded: false,                  // 初始标记为未加载

    // 更新偏好设置，合并部分更新
    setPreferences: (newPreferences) => {
        set((state) => ({
            preferences: { ...state.preferences, ...newPreferences }
        }));
    },

    // 更新单个API密钥
    setApiKey: (key, value) => {
        set((state) => ({
            apiKeys: { ...state.apiKeys, [key]: value }
        }));
    },

    // 替换所有API密钥
    setApiKeys: (newApiKeys) => {
        set({ apiKeys: newApiKeys });
    },

    // 设置加载状态
    setIsLoaded: (loaded) => {
        set({ isLoaded: loaded });
    }
}));