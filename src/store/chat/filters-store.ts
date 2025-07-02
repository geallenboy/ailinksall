
import { useSessionsContext } from '@/context';
import { create } from 'zustand';



/**
 * 过滤器的状态接口定义
 */
interface FiltersState {
    isFilterOpen: boolean;              // 过滤面板是否打开
    // 操作方法
    open: () => void;                   // 打开过滤面板
    dismiss: () => void;                // 关闭过滤面板
    toggleFilter: () => void;           // 切换过滤面板显示状态
}

/**
 * 创建过滤器状态管理 store
 */
export const useFiltersStore = create<FiltersState>((set, get) => ({
    // 初始状态
    isFilterOpen: false,

    // 打开过滤面板并刷新会话列表
    open: () => {
        // 如果需要刷新会话列表，可以在这里调用 sessions store 的方法
        const { refetchSessions } = useSessionsContext();
        refetchSessions?.();
        set({ isFilterOpen: true });
    },

    // 关闭过滤面板
    dismiss: () => set({ isFilterOpen: false }),

    // 切换过滤面板显示状态
    toggleFilter: () => set(state => ({ isFilterOpen: !state.isFilterOpen })),
}));
