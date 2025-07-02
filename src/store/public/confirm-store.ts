/**
 * 确认对话框状态管理
 * 基于 Zustand 实现的状态管理
 */
import { create } from 'zustand';  // 导入 Zustand 的创建函数

/**
 * 确认对话框参数类型定义
 */
export type TConfirmArgs = {
    message: string;        // 对话框消息内容
    onConfirm: () => void;  // 确认按钮回调
    title: string;          // 对话框标题
    onCancel?: () => void;  // 取消按钮回调（可选）
    cancelTitle?: string;   // 取消按钮文本（可选）
    actionTitle?: string;   // 确认按钮文本（可选）
};

/**
 * 确认对话框状态接口定义
 */
interface ConfirmState {
    isOpen: boolean;              // 对话框是否打开
    args: TConfirmArgs | null;    // 对话框参数

    // 操作方法
    open: (args: TConfirmArgs) => void;  // 打开确认对话框
    dismiss: () => void;                 // 关闭确认对话框
}

/**
 * 创建 Zustand store 用于管理确认对话框状态
 */
export const useConfirmStore = create<ConfirmState>((set, get) => ({
    // 初始状态
    isOpen: false,
    args: null,

    // 打开确认对话框
    open: (args: TConfirmArgs) => set({
        isOpen: true,
        args: args
    }),

    // 关闭确认对话框
    dismiss: () => {
        const { args } = get();
        // 如果有取消回调函数，则执行
        args?.onCancel?.();
        // 重置状态
        set({
            isOpen: false,
            args: null
        });
    }
}));

/**
 * 封装常用功能的自定义 Hook
 * 提供简化的 API，与原 Context API 保持兼容
 * 
 * @returns {Object} 返回确认对话框操作方法
 */
export const useConfirm = () => {
    const { open, dismiss } = useConfirmStore();
    return { open, dismiss };
};