import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";
import {
  CommentAdd01Icon,
  Delete01Icon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/react";
import { useFiltersStore, useSessionsStore } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { useChatSessionDB } from "../db/use-chat-session";
/**
 * 构建过滤器动作项，包括新建会话、切换主题、删除当前会话
 * 抽离为独立函数以便在不同组件中复用
 */
export const useFilterActions = () => {
  // 获取系统主题设置
  const { theme, setTheme } = useTheme();
  const { removeSessionMutation } = useChatSessionDB();
  // 获取会话相关操作
  const { createSession, currentSession } = useSessionsStore();

  // 获取提示通知功能
  const { toast, dismiss: dismissToast } = useToast();

  // 获取过滤器关闭方法
  const { dismiss } = useFiltersStore();

  // 返回动作列表
  return [
    {
      name: "New session",
      icon: CommentAdd01Icon,
      action: () => {
        createSession({
          redirect: true,
        });
        dismiss();
      },
    },
    {
      name: `切换到${theme === "light" ? "深色" : "浅色"}模式`,
      icon: theme === "light" ? Moon02Icon : Sun03Icon,
      action: () => {
        setTheme(theme === "light" ? "dark" : "light");
        dismiss();
      },
    },
    {
      name: "删除当前会话",
      icon: Delete01Icon,
      action: () => {
        dismiss();
        toast({
          title: "删除会话？",
          description: "此操作无法撤销。",
          variant: "destructive",
          action: (
            <Button
              size={"sm"}
              variant={"default"}
              onClick={() => {
                currentSession?.id &&
                  removeSessionMutation.mutate(currentSession?.id, {
                    onSuccess() {
                      createSession({
                        redirect: true,
                      });
                      dismissToast();
                    },
                  });
              }}
            >
              删除
            </Button>
          ),
        });
      },
    },
  ];
};
