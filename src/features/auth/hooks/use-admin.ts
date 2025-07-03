import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';
import { debugLog } from '@/lib/debug-logger';

export interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 权限缓存
const adminCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export function useAdmin() {
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  
  // 初始化时尝试从缓存获取状态
  const getInitialState = (): AdminState => {
    if (userId) {
      const cached = adminCache.get(userId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        debugLog.log('使用缓存初始化权限状态:', cached.result);
        return {
          isAdmin: cached.result,
          isLoading: false,
          isAuthenticated: true,
        };
      }
    }
    
    return {
      isAdmin: false,
      isLoading: true,
      isAuthenticated: false,
    };
  };

  const [adminState, setAdminState] = useState<AdminState>(getInitialState);
  
  const checkInProgress = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const mountedRef = useRef(false);

  const checkAdminStatus = async () => {
    // 组件首次挂载时，立即检查缓存
    if (!mountedRef.current) {
      mountedRef.current = true;
      
      if (userId) {
        const cached = adminCache.get(userId);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          debugLog.log('组件挂载时使用缓存权限:', cached.result);
          setAdminState({
            isAdmin: cached.result,
            isLoading: false,
            isAuthenticated: true,
          });
          lastUserId.current = userId;
          return;
        }
      }
    }

    // 防止重复检查
    if (checkInProgress.current) {
      debugLog.log('权限检查进行中，跳过重复请求');
      return;
    }

    // 如果用户没有变化且不是首次加载，跳过检查
    if (lastUserId.current === userId && adminState.isLoading === false) {
      debugLog.log('用户未变化，跳过权限检查');
      return;
    }

    try {
      checkInProgress.current = true;
      debugLog.group('管理员权限检查');
      debugLog.time('权限检查耗时');
      
      setAdminState(prev => ({ ...prev, isLoading: true }));

      if (!isSignedIn || !userId) {
        debugLog.log('用户未登录');
        setAdminState({
          isAdmin: false,
          isLoading: false,
          isAuthenticated: false,
        });
        lastUserId.current = null;
        return;
      }

      lastUserId.current = userId;

      // 检查缓存
      const cached = adminCache.get(userId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        debugLog.log('使用缓存的权限结果:', cached.result);
        setAdminState({
          isAdmin: cached.result,
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }

      debugLog.log('缓存过期或不存在，发起权限检查请求');

      const token = await getToken();
      if (!token) {
        debugLog.error('无法获取认证token');
        setAdminState({
          isAdmin: false,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      const response = await fetch('/api/auth/admin-check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        debugLog.error('权限检查请求失败:', response.status, response.statusText);
        
        if (response.status === 401) {
          setAdminState({
            isAdmin: false,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }
        
        setAdminState({
          isAdmin: false,
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }
      
      const data = await response.json();
      const adminStatus = data.isAdmin;
      
      // 缓存结果
      adminCache.set(userId, {
        result: adminStatus,
        timestamp: now
      });
      
      debugLog.log('权限检查结果:', {
        userId,
        email: user?.primaryEmailAddress?.emailAddress,
        isAdmin: adminStatus
      });
      
      setAdminState({
        isAdmin: adminStatus,
        isLoading: false,
        isAuthenticated: true,
      });
      
    } catch (error) {
      debugLog.error('权限检查异常:', error);
      setAdminState({
        isAdmin: false,
        isLoading: false,
        isAuthenticated: isSignedIn || false,
      });
    } finally {
      checkInProgress.current = false;
      debugLog.timeEnd('权限检查耗时');
      debugLog.groupEnd();
    }
  };

  useEffect(() => {
    // 添加小延迟，避免过于频繁的检查
    const timer = setTimeout(checkAdminStatus, 50);
    return () => {
      clearTimeout(timer);
    };
  }, [isSignedIn, userId, getToken]);

  return {
    ...adminState,
    checkAdminStatus,
  };
}

// 清理过期缓存的工具函数
export function clearExpiredAdminCache() {
  const now = Date.now();
  for (const [userId, cache] of adminCache.entries()) {
    if (now - cache.timestamp > CACHE_DURATION) {
      adminCache.delete(userId);
      debugLog.log('清理过期权限缓存:', userId);
    }
  }
}

// 强制刷新权限缓存
export function refreshAdminCache(userId?: string) {
  if (userId) {
    adminCache.delete(userId);
    debugLog.log('清理用户权限缓存:', userId);
  } else {
    adminCache.clear();
    debugLog.log('清理所有权限缓存');
  }
} 