import { useFiltersStore } from "@/store/chat";
import { useEffect } from "react";

/**
 * 注册键盘快捷键 (Cmd/Ctrl+K) 用于快速打开过滤面板
 * 此 hook 需要在组件中调用以设置事件监听
 */
export const useFilterKeyboardShortcut = () => {
  const { toggleFilter } = useFiltersStore();

  useEffect(() => {
    // 监听键盘事件
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFilter();
      }
    };

    // 添加事件监听
    document.addEventListener("keydown", down);

    // 清理事件监听
    return () => document.removeEventListener("keydown", down);
  }, [toggleFilter]);
};