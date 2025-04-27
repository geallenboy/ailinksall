"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useConfirmStore } from "@/store/public";

/**
 * 确认对话框组件
 * 使用 Zustand 管理状态，完全分离 UI 和状态管理
 */
export const ConfirmDialog = () => {
  // 从 store 获取状态和方法
  const { isOpen, args, dismiss } = useConfirmStore();

  // 处理对话框状态变化
  const handleOpenChange = (open: boolean) => {
    if (!open) dismiss();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{args?.title}</AlertDialogTitle>
          {args?.message && (
            <AlertDialogDescription>{args?.message}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={dismiss}>
            {args?.cancelTitle || "取消"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              args?.onConfirm();
              dismiss();
            }}
          >
            {args?.actionTitle || "继续"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
