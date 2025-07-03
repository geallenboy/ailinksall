/**
 * 用户模块的 SWR Hooks
 * 基于 SWR 的数据获取、缓存和状态管理
 */

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { USER_KEYS } from '@/features/users/constants';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserProfile,
  updateUserAdminStatus,
  deleteUser,
} from '@/features/users/actions';
import {
  type UserQueryParams,
} from '@/features/users/types';


// ============== 用户相关 Hooks ==============

/**
 * 获取用户列表
 */
export function useUsers(params?: UserQueryParams) {
  const key = params ? [USER_KEYS.list(params)] : USER_KEYS.all;
  
  const { data, error, isLoading, mutate: mutateFn } = useSWR(
    key,
    () => getUsers(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30秒内去重
    }
  );

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate: mutateFn
  };
}

/**
 * 获取单个用户详情
 */
export function useUser(id: string | null) {
  const { data, error, isLoading, mutate: mutateFn } = useSWR(
    id ? [USER_KEYS.detail(id)] : null,
    () => id ? getUserById(id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30秒内去重
    }
  );

  return {
    user: data,
    isLoading,
    error,
    mutate: mutateFn
  };
}

/**
 * 创建用户
 */
export function useCreateUser() {
  return useSWRMutation(
    'users',
    async (_, { arg }: { arg: any }) => {
      const result = await createUser(arg);
      if (!result.success) {
        throw new Error(result.error ?? '创建用户失败');
      }
      return result.data;
    }
  );
}

/**
 * 更新用户
 */
export function useUpdateUser() {
  return useSWRMutation(
    'users',
    async (_, { arg }: { arg: { id: string; data: any } }) => {
      const { id, data } = arg;
      const result = await updateUser(id, data);
      if (!result.success) {
        throw new Error(result.error ?? '更新用户失败');
      }
      return result.data;
    }
  );
}

/**
 * 更新用户资料
 */
export function useUpdateUserProfile() {
  return useSWRMutation(
    'users',
    async (_, { arg }: { arg: { id: string; data: any } }) => {
      const { id, data } = arg;
      const result = await updateUserProfile(id, data);
      if (!result.success) {
        throw new Error(result.error ?? '更新用户资料失败');
      }
      return result.data;
    }
  );
}

/**
 * 更新用户管理员状态
 */
export function useUpdateUserAdminStatus() {
  return useSWRMutation(
    'users',
    async (_, { arg }: { arg: { id: string; data: any } }) => {
      const { id, data } = arg;
      const result = await updateUserAdminStatus(id, data);
      if (!result.success) {
        throw new Error(result.error ?? '更新用户权限失败');
      }
      return result.data;
    }
  );
}

/**
 * 删除用户
 */
export function useDeleteUser() {
  return useSWRMutation(
    'users',
    async (_, { arg }: { arg: string }) => {
      const result = await deleteUser(arg);
      if (!result.success) {
        throw new Error(result.error ?? '删除用户失败');
      }
      return result;
    }
  );
}
