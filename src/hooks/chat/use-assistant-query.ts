import { useModelList } from "@/hooks/chat/use-model-list";
import { useRef } from "react";
import { useAssistantStore } from "@/store/chat/assistants-store";
import { TAssistant } from "@/types/chat";

/**
 * 提供助手状态和操作的hook
 * 只提供状态和基本方法，不包含副作用
 */
export function useAssistantQuery() {
  // 从store获取状态和方法
  const {
    isAssistantOpen,
    openCreateAssistant,
    updateAssistant,
    selectedAssistantKey,
    open,
    dismiss,
    setOpenCreateAssistant,
    setUpdateAssistant,
    setSelectedAssistantKey
  } = useAssistantStore();

  // 搜索输入框引用
  const searchRef = useRef<HTMLInputElement>(null);

  // 获取助手数据和操作方法
  const {
    assistants,
    getAssistantByKey,
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
  } = useModelList();

  // 获取特定类型的助手列表
  const getAssistantsByType = (type: string) => {
    return assistants?.filter((a) => a.type === type) || [];
  };

  // 获取当前选中的助手对象
  const selectedAssistant = getAssistantByKey(selectedAssistantKey);

  return {
    // 状态
    isAssistantOpen,
    openCreateAssistant,
    updateAssistant,
    selectedAssistantKey,
    selectedAssistant,
    assistants,
    searchRef,

    // 基本操作方法
    open,
    dismiss,
    setOpenCreateAssistant,
    setUpdateAssistant,
    setSelectedAssistantKey,

    // 助手查询方法
    getAssistantsByType,
    getAssistantByKey,

    // 原始mutations
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
  };
}
