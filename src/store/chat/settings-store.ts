/**
 * 设置模块的状态管理
 * 基于 Zustand 实现的状态管理,支持持久化存储
 */
import { create } from 'zustand';  // 导入 Zustand 的创建函数
import { persist } from 'zustand/middleware';  // 导入持久化中间件
import React from 'react';  // 导入 React 类型
import { createSettingMenu } from '@/config/chat/settings';  // 导入设置菜单配置

/**
 * 设置菜单项的类型定义
 */
export type TSettingMenuItem = {
    name: string;         // 菜单项显示名称
    key: string;          // 唯一标识符
    icon: () => React.ReactNode;  // 图标组件
    component: React.ReactNode;   // 对应的内容组件
};

/**
 * 设置状态的接口定义
 */
interface SettingsState {
    isSettingOpen: boolean;              // 设置面板是否打开
    selectedMenu: string;                // 当前选中的菜单项 key
    settingMenu: TSettingMenuItem[];     // 设置菜单配置项列表

    // 操作方法
    open: (menu?: string) => void;       // 打开设置面板,可选择指定菜单
    dismiss: () => void;                 // 关闭设置面板
    setSelectedMenu: (key: string) => void;  // 设置当前选中的菜单
    getSelectedMenuItem: () => TSettingMenuItem | undefined;  // 获取当前选中的菜单项
}

/**
 * 创建 Zustand store，使用 persist 中间件实现持久化
 */
export const useSettingsStore = create<SettingsState>()(
    persist(
        // 状态定义和操作方法
        (set, get) => ({
            // 初始状态
            isSettingOpen: false,           // 初始关闭设置面板
            selectedMenu: "common",         // 默认选中"通用"设置
            settingMenu: createSettingMenu(),  // 从配置文件加载菜单项

            // 打开设置面板，可以指定打开某个具体菜单
            open: (menu) => set({
                isSettingOpen: true,
                selectedMenu: menu || get().selectedMenu  // 如果没指定菜单,则保持当前选择
            }),

            // 关闭设置面板
            dismiss: () => set({ isSettingOpen: false }),

            // 切换选中的菜单项
            setSelectedMenu: (key) => set({ selectedMenu: key }),

            // 根据当前选中的 key 获取对应的菜单项对象
            getSelectedMenuItem: () => {
                const { settingMenu, selectedMenu } = get();
                return settingMenu.find(menu => menu.key === selectedMenu);
            }
        }),
        {
            // 持久化配置
            name: 'settings-storage',  // 存储在 localStorage 中的键名
            partialize: (state) => ({ selectedMenu: state.selectedMenu }),  // 只持久化 selectedMenu 属性
        }
    )
);

/**
 * 封装常用功能的自定义 Hook
 * 提供简化的 API，隐藏实现细节
 * 
 * @returns {Object} 返回常用的设置操作方法
 */
export const useSettings = () => {
    // 从 store 中提取需要的方法
    const { open, dismiss, setSelectedMenu, getSelectedMenuItem, isSettingOpen } = useSettingsStore();

    // 返回封装后的 API
    return { open, dismiss, setSelectedMenu, getSelectedMenuItem, isSettingOpen };
};