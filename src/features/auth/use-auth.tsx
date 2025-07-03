'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useUserSync } from './use-user-sync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Clerk 状态
  isLoaded: boolean;
  isSignedIn: boolean;
  
  // 数据库用户信息
  dbUser: any;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  isSynced: boolean;
  isSyncing: boolean;
  syncUserToDatabase: () => Promise<any>;
}

// 将Clerk用户数据转换为我们的User类型
function transformClerkUser(clerkUser: any): User | null {
  if (!clerkUser) return null;
  
  const email = clerkUser.primaryEmailAddress?.emailAddress || '';
  
  // 构建fullName：优先使用firstName + lastName，如果没有则使用邮箱前缀
  let fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
  if (!fullName && email) {
    // 从邮箱中提取用户名（@之前的部分）作为默认姓名
    const emailPrefix = email.split('@')[0];
    // 将数字、下划线、点替换为空格，并进行首字母大写处理
    fullName = emailPrefix
      .replace(/[0-9_.-]/g, ' ')
      .split(' ')
      .filter((word: string) => word.length > 0)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || emailPrefix;
  }
  
  return {
    id: clerkUser.id,
    email,
    fullName: fullName || null,
    avatar: clerkUser.imageUrl || null,
    createdAt: new Date(clerkUser.createdAt),
    updatedAt: new Date(clerkUser.updatedAt),
  };
}

export function useAuth(): AuthContextType {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  
  // 集成用户同步功能
  const {
    dbUser,
    syncStatus,
    syncError,
    isSynced,
    isSyncing,
    syncUserToDatabase,
    hasAttemptedSync,
  } = useUserSync();

  const user = transformClerkUser(clerkUser);
  const loading = !isLoaded;

  const signOut = useCallback(async () => {
    try {
      // 防止重复调用
      if (!isSignedIn) {
        router.push('/auth/signin');
        return;
      }
      
      await clerkSignOut();
      // 给Clerk时间处理登出状态
      setTimeout(() => {
        router.push('/auth/signin');
      }, 100);
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出失败，也跳转到登录页
      router.push('/auth/signin');
    }
  }, [isSignedIn, clerkSignOut, router]);

  const refreshUser = useCallback(async () => {
    // Clerk自动管理用户状态，这里不需要手动刷新
    // 如果需要强制刷新，可以调用 window.location.reload()
    // 同时触发用户信息同步
    if (isSignedIn) {
      await syncUserToDatabase();
    }
  }, [isSignedIn, syncUserToDatabase]);

  return {
    user: isSignedIn ? user : null,
    loading,
    signOut,
    refreshUser,
    
    // Clerk 状态
    isLoaded: isLoaded || false,
    isSignedIn: isSignedIn || false,
    
    // 数据库用户信息
    dbUser,
    syncStatus,
    syncError,
    isSynced,
    isSyncing,
    syncUserToDatabase,
  };
}

// 兼容性：保持旧的API
export function useAuthState() {
  return useAuth();
}

// 这个Provider现在不需要了，因为Clerk在layout.tsx中已经提供了
// 但为了兼容性，我们保留一个空的实现
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}