'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { debugLog } from '@/lib/debug-logger';
interface UserSyncState {
  dbUser: any;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  isSynced: boolean;
  isSyncing: boolean;
  hasAttemptedSync: boolean;
  syncUserToDatabase: () => Promise<any>;
}

export function useUserSync(): UserSyncState {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  
  const [dbUser, setDbUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [userExistsInDb, setUserExistsInDb] = useState<boolean | null>(null);

  const syncUserToDatabase = useCallback(async () => {
    if (!clerkUser || !isSignedIn || !isLoaded) {
      console.log('同步用户失败: 用户未登录或用户信息不完整', {
        hasClerkUser: !!clerkUser,
        isSignedIn,
        isLoaded
      });
      return null;
    }

    // 如果已经在同步中，避免重复请求
    if (syncStatus === 'syncing') {
      console.log('用户同步已在进行中，跳过重复请求');
      return null;
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);
      setHasAttemptedSync(true);

      console.log('开始同步用户信息到数据库:', {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
      });

      // 等待一下确保Clerk session完全加载
      await new Promise(resolve => setTimeout(resolve, 100));

      // 🔑 关键修复：获取Clerk的认证token
      const token = await getToken();
      
      if (!token) {
        throw new Error('无法获取认证token，请重新登录');
      }

      console.log('已获取认证token，开始API调用...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 添加认证token
        },
        body: JSON.stringify({
          email: clerkUser.primaryEmailAddress?.emailAddress,
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0],
          avatar: clerkUser.imageUrl,
          provider: 'clerk',
          providerId: clerkUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`同步失败: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 用户信息同步成功:', result.action, result.data);
        setDbUser(result.data);
        setSyncStatus('success');
        setUserExistsInDb(true);
        setRetryCount(0);
        return result;
      } else {
        throw new Error(result.error || '用户同步失败');
      }
    } catch (error) {
      console.error('❌ 用户同步失败:', error);
      setSyncStatus('error');
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setSyncError(errorMessage);
      
      // 针对401错误和token问题的特殊处理
      const is401Error = errorMessage.includes('401') || errorMessage.includes('未授权') || errorMessage.includes('认证token');
      
      // 自动重试机制（最多3次）
      if (retryCount < 3) {
        const retryDelay = is401Error 
          ? 3000 * (retryCount + 1) // 401错误使用更长的延迟
          : 2000 * (retryCount + 1); // 其他错误正常延迟
          
        console.log(`⚠️ 用户同步失败，准备第${retryCount + 1}次重试... (延迟${retryDelay}ms)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          syncUserToDatabase();
        }, retryDelay);
      } else {
        console.error('❌ 用户同步失败，已达到最大重试次数');
      }
      
      return null;
    }
  }, [clerkUser, isSignedIn, isLoaded, getToken, retryCount, syncStatus]);

  // 重置状态当用户登出时
  useEffect(() => {
    if (!isSignedIn) {
      setDbUser(null);
      setSyncStatus('idle');
      setSyncError(null);
      setHasAttemptedSync(false);
      setRetryCount(0);
      setUserExistsInDb(null);
    }
  }, [isSignedIn]);

  // 仅在首次登录时检查用户是否存在，避免不必要的重复请求
  useEffect(() => {
    let mounted = true;

    const checkExistingUser = async () => {
      // 只在用户首次加载且从未尝试过同步时检查
      if (!isLoaded || !isSignedIn || !clerkUser || hasAttemptedSync || syncStatus !== 'idle' || userExistsInDb !== null) {
        return;
      }

      try {
        const token = await getToken();
        if (!token || !mounted) return;

       
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok && mounted) {
          const result = await response.json();
          if (result.success && result.data) {
            debugLog.info('✅ 发现已存在的用户数据，无需同步:', result.data);
        
            setDbUser(result.data);
            setSyncStatus('success');
            setHasAttemptedSync(true);
            setUserExistsInDb(true);
          } else {
            console.error('[useUserSync] 用户不存在于数据库中，需要同步');
            setUserExistsInDb(false);
            await syncUserToDatabase();
          }
        } else if (response.status === 404) {
          console.error('[useUserSync] 用户不存在于数据库中，需要同步');
          setUserExistsInDb(false);
          await syncUserToDatabase();
        }
      } catch (error) {
        console.error('[useUserSync] 检查已存在用户数据失败，标记为需要同步');
        setUserExistsInDb(false);
      }
    };

    checkExistingUser();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, clerkUser, hasAttemptedSync, syncStatus, getToken, userExistsInDb]);

  return {
    dbUser,
    syncStatus,
    syncError,
    isSynced: syncStatus === 'success' && dbUser !== null,
    isSyncing: syncStatus === 'syncing',
    hasAttemptedSync,
    syncUserToDatabase,
  };
} 