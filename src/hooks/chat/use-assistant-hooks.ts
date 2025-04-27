import { useRef, useEffect, useCallback, useMemo } from "react";
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
  // 使用细粒度选择器从store获取状态和基础方法
  const isAssistantOpen = useAssistantStore(state => state.isAssistantOpen);
  const openCreateAssistant = useAssistantStore(state => state.openCreateAssistant);
  const updateAssistant = useAssistantStore(state => state.updateAssistant);
  const selectedAssistantKey = useAssistantStore(state => state.selectedAssistantKey);

  // 获取方法引用，避免依赖项变化
  const open = useAssistantStore(state => state.open);
  const dismiss = useAssistantStore(state => state.dismiss);
  const setOpenCreateAssistant = useAssistantStore(state => state.setOpenCreateAssistant);
  const setUpdateAssistant = useAssistantStore(state => state.setUpdateAssistant);
  const setSelectedAssistantKey = useAssistantStore(state => state.setSelectedAssistantKey);

  // 只获取需要的偏好设置属性
  const defaultAssistant = usePreferenceStore(state => state.preferences.defaultAssistant);

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

  // 缓存当前选中的助手对象
  const selectedAssistant = useMemo(() =>
    getAssistantByKey(selectedAssistantKey),
    [getAssistantByKey, selectedAssistantKey]
  );

  // 初始化：确保状态与持久化存储同步
  useEffect(() => {
    // 只在需要同步时执行
    if (!defaultAssistant || defaultAssistant === selectedAssistantKey) return;

    // 检查该助手是否存在
    const assistantExists = getAssistantByKey(defaultAssistant);
    if (assistantExists) {
      // 如果存在，则更新选中的助手
      setSelectedAssistantKey(defaultAssistant);
    } else {
      // 如果助手不存在，则将偏好设置也更新为默认值
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant
      });
    }
  }, [defaultAssistant, selectedAssistantKey, setSelectedAssistantKey, getAssistantByKey, updatePreferences]);

  // 当助手对话框打开时，聚焦搜索框 - 使用 requestAnimationFrame 优化
  useEffect(() => {
    if (isAssistantOpen && searchRef?.current) {
      // 使用 requestAnimationFrame 确保DOM已更新
      const focusTimer = requestAnimationFrame(() => {
        searchRef?.current?.focus();
      });

      return () => cancelAnimationFrame(focusTimer);
    }
  }, [isAssistantOpen]);

  // 缓存助手类型列表
  const assistantsByType = useMemo(() => {
    const typeMap = new Map<string, TAssistant[]>();

    assistants?.forEach((assistant: TAssistant) => {
      if (!typeMap.has(assistant.type)) {
        typeMap.set(assistant.type, []);
      }
      typeMap.get(assistant.type)!.push(assistant);
    });

    return typeMap;
  }, [assistants]);

  // 获取特定类型的助手列表
  const getAssistantsByType = useCallback((type: string) => {
    return assistantsByType.get(type) || [];
  }, [assistantsByType]);

  /**
   * 处理选择助手
   */
  const handleSelectAssistant = useCallback((assistant: TAssistant) => {
    // 同时更新偏好设置中的默认助手 
    updatePreferences({ defaultAssistant: assistant.key });
    setSelectedAssistantKey(assistant.key);

    dismiss(); // 关闭助手对话框
  }, [setSelectedAssistantKey, updatePreferences, dismiss]);

  /**
   * 处理删除助手
   */
  const handleDeleteAssistant = useCallback((assistant: TAssistant) => {
    if (!deleteAssistantMutation) return;

    deleteAssistantMutation.mutate(assistant.key, {
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

  // 使用 useMemo 缓存返回值，避免每次渲染都创建新对象
  return useMemo(() => ({
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
  }), [
    isAssistantOpen,
    openCreateAssistant,
    updateAssistant,
    selectedAssistantKey,
    selectedAssistant,
    assistants,
    open,
    dismiss,
    setOpenCreateAssistant,
    setUpdateAssistant,
    setSelectedAssistantKey,
    getAssistantsByType,
    getAssistantByKey,
    handleSelectAssistant,
    handleDeleteAssistant,
    handleEditAssistant,
    handleCreateAssistant,
    handleUpdateAssistant
  ]);
}