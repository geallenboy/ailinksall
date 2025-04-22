import { useRef, useEffect, useCallback } from "react";
import { useModelList } from "@/hooks/chat/use-model-list";
import { useAssistantStore } from "@/store/chat/assistants-store";
import { useAssistantsQuery } from "@/hooks/query/use-assistants-query";
import { defaultPreferences } from "@/config/chat/preferences";
import { TAssistant } from "@/types/chat";
import { usePreferenceHooks } from "@/hooks/chat";
import { usePreferenceStore } from "@/store/chat";

/**
 * 提供助手状态和操作的hook
 * 集中所有与助手相关的逻辑，负责处理副作用和业务逻辑
 */
export function useAssistantHooks() {
  // 从store获取状态和基础方法
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
  const {
    preferences, // 当前偏好设置
  } = usePreferenceStore();
  // 搜索输入框引用
  const searchRef = useRef<HTMLInputElement>(null);

  // 获取助手数据和操作方法
  const { assistants, getAssistantByKey } = useModelList();

  // 获取API操作方法
  const {
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
  } = useAssistantsQuery();

  // 获取偏好设置更新方法
  const { updatePreferences } = usePreferenceHooks();
  // 初始化：确保状态与持久化存储同步
  useEffect(() => {
    // 确保 selectedAssistantKey 与偏好设置中的 defaultAssistant 保持同步
    if (preferences.defaultAssistant && preferences.defaultAssistant !== selectedAssistantKey) {
      // 检查该助手是否存在
      const assistantExists = getAssistantByKey(preferences.defaultAssistant);
      if (assistantExists) {
        // 如果存在，则更新选中的助手
        setSelectedAssistantKey(preferences.defaultAssistant);
      } else {
        // 如果助手不存在，则将偏好设置也更新为默认值
        updatePreferences({
          defaultAssistant: defaultPreferences.defaultAssistant
        });
      }
    }
  }, [preferences.defaultAssistant, selectedAssistantKey, setSelectedAssistantKey, getAssistantByKey, updatePreferences]);
  // 当助手对话框打开时，聚焦搜索框
  useEffect(() => {
    if (isAssistantOpen && searchRef?.current) {
      searchRef?.current?.focus();
    }
  }, [isAssistantOpen]);

  // 获取特定类型的助手列表
  const getAssistantsByType = useCallback((type: string) => {
    return assistants?.filter((a: { type: string; }) => a.type === type) || [];
  }, [assistants]);

  // 获取当前选中的助手对象
  const selectedAssistant = getAssistantByKey(selectedAssistantKey);

  /**
   * 处理选择助手
   */
  const handleSelectAssistant = useCallback(async (assistant: TAssistant) => {
    // 同时更新偏好设置中的默认助手 
    await updatePreferences({ defaultAssistant: assistant.key });
    setSelectedAssistantKey(assistant.key);

    dismiss(); // 关闭助手对话框
  }, [setSelectedAssistantKey, updatePreferences, dismiss]);

  /**
   * 处理删除助手
   */
  const handleDeleteAssistant = useCallback((assistant: TAssistant) => {
    deleteAssistantMutation?.mutate(assistant.key, {
      onSuccess: () => {
        // 如果删除的是当前选中的助手，重置为默认助手
        if (assistant.key === selectedAssistantKey) {
          updatePreferences({
            defaultAssistant: defaultPreferences.defaultAssistant,
          });
        }
      },
    });
  }, [deleteAssistantMutation, selectedAssistantKey, updatePreferences]);

  /**
   * 处理编辑助手
   */
  const handleEditAssistant = useCallback((assistant: TAssistant) => {
    setOpenCreateAssistant(true);
    setUpdateAssistant(assistant);
  }, [setOpenCreateAssistant, setUpdateAssistant]);

  /**
   * 处理创建新助手
   */
  const handleCreateAssistant = useCallback((assistant: Omit<TAssistant, "key">) => {
    createAssistantMutation.mutate(assistant as any, {
      onSettled: () => {
        setOpenCreateAssistant(false);
      },
    });
  }, [createAssistantMutation, setOpenCreateAssistant]);

  /**
   * 处理更新助手
   */
  const handleUpdateAssistant = useCallback((assistant: TAssistant) => {
    updateAssistantMutation.mutate(
      {
        assistantKey: assistant.key,
        newAssistant: assistant,
      },
      {
        onSettled: () => {
          setOpenCreateAssistant(false);
          setUpdateAssistant(undefined);
        },
      }
    );
  }, [updateAssistantMutation, setOpenCreateAssistant, setUpdateAssistant]);

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

    // 业务操作方法
    handleSelectAssistant,
    handleDeleteAssistant,
    handleEditAssistant,
    handleCreateAssistant,
    handleUpdateAssistant
  };
}