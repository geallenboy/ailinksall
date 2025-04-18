import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TPrompt } from '@/hooks/db/use-prompts';

// 封装提示相关的React Query钩子
export function usePromptsQuery() {
    const queryClient = useQueryClient();

    // 获取本地提示
    const localPromptsQuery = useQuery<TPrompt[]>({
        queryKey: ["LocalPrompts"],
        // 这里应该调用您的获取本地提示的方法
        // 由于原代码使用了usePrompts hook,我们假设它从localStorage获取数据
        queryFn: async () => {
            // 这里应该是您的获取本地提示的逻辑
            const storedPrompts = localStorage.getItem("localPrompts");
            return storedPrompts ? JSON.parse(storedPrompts) : [];
        }
    });

    // 获取公共提示
    const publicPromptsQuery = useQuery<{ prompts: TPrompt[] }>({
        queryKey: ["PublicPrompts"],
        queryFn: async () => axios.get(`/api/prompts`).then((res) => res.data),
    });

    // 合并所有提示
    const allPrompts = [
        ...(localPromptsQuery.data || []),
        ...(publicPromptsQuery.data?.prompts || []),
    ];

    // 创建提示的mutation
    const createPromptMutation = useMutation({
        mutationFn: async (prompt: Omit<TPrompt, "id">) => {
            // 生成唯一ID
            const id = `local-${Date.now()}`;
            const newPrompt = { ...prompt, id };

            // 保存到localStorage
            const storedPrompts = localStorage.getItem("localPrompts");
            const prompts = storedPrompts ? JSON.parse(storedPrompts) : [];
            prompts.push(newPrompt);
            localStorage.setItem("localPrompts", JSON.stringify(prompts));

            return newPrompt;
        },
        onSuccess: () => {
            // 刷新查询
            queryClient.invalidateQueries({ queryKey: ["LocalPrompts"] });
        },
    });

    // 更新提示的mutation
    const updatePromptMutation = useMutation({
        mutationFn: async ({ id, prompt }: { id: string, prompt: Omit<TPrompt, "id"> }) => {
            // 从localStorage获取提示并更新
            const storedPrompts = localStorage.getItem("localPrompts");
            const prompts = storedPrompts ? JSON.parse(storedPrompts) : [];
            const updatedPrompts = prompts.map((p: TPrompt) =>
                p.id === id ? { ...prompt, id } : p
            );
            localStorage.setItem("localPrompts", JSON.stringify(updatedPrompts));

            return { ...prompt, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["LocalPrompts"] });
        },
    });

    // 删除提示的mutation
    const deletePromptMutation = useMutation({
        mutationFn: async (id: string) => {
            // 从localStorage删除提示
            const storedPrompts = localStorage.getItem("localPrompts");
            const prompts = storedPrompts ? JSON.parse(storedPrompts) : [];
            const filteredPrompts = prompts.filter((p: TPrompt) => p.id !== id);
            localStorage.setItem("localPrompts", JSON.stringify(filteredPrompts));

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["LocalPrompts"] });
        },
    });

    return {
        localPromptsQuery,
        publicPromptsQuery,
        allPrompts,
        createPromptMutation,
        updatePromptMutation,
        deletePromptMutation,
    };
}