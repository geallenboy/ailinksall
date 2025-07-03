'use client';

import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/nextjs';

interface UserState {
  dbUser: any;
  isLoading: boolean;
  error: string | null;
}

/**
 * 简单的用户数据获取hook
 * 只负责获取已同步的用户数据，不进行同步操作
 */
export function useUser(): UserState {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  
  const [dbUser, setDbUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn || !clerkUser) {
        setDbUser(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

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
            setDbUser(result.data);
          } else {
            setError('用户数据获取失败');
          }
        } else if (response.status === 404) {
          setError('用户未找到，请联系管理员');
        } else {
          setError('获取用户数据时出错');
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
        if (mounted) {
          setError('网络错误，请重试');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  // 重置状态当用户登出时
  useEffect(() => {
    if (!isSignedIn) {
      setDbUser(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isSignedIn]);

  return {
    dbUser,
    isLoading,
    error,
  };
} 