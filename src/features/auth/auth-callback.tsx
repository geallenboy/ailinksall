'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef, useCallback } from 'react';
import { debugLog } from '@/lib/debug-logger';

/**
 * 认证回调组件
 * 只在用户登录后第一次访问时同步用户信息
 * 优化版本：减少对首页渲染的影响
 */
export function AuthCallback() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const syncedRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);
  const isProcessingRef = useRef(false);

  // 初始化同步记录 - 仅运行一次
  useEffect(() => {
    if (initRef.current) return;
    
    try {
      const syncedUsers = localStorage.getItem('auth_synced_users');
      if (syncedUsers) {
        const users = JSON.parse(syncedUsers);
        syncedRef.current = new Set(users);
        debugLog.log('已加载同步记录:', users);
      }
    } catch (error) {
      debugLog.error('加载同步记录失败:', error);
      localStorage.removeItem('auth_synced_users');
    }
    
    initRef.current = true;
  }, []);

  // 更新本地存储的同步记录
  const updateSyncRecord = useCallback(() => {
    try {
      const users = Array.from(syncedRef.current);
      localStorage.setItem('auth_synced_users', JSON.stringify(users));
      debugLog.log('更新同步记录:', users);
    } catch (error) {
      debugLog.error('保存同步记录失败:', error);
    }
  }, []);

  // 用户同步逻辑 - 使用 useCallback 优化
  const syncUserIfNeeded = useCallback(async () => {
    // 避免重复处理
    if (isProcessingRef.current) {
      debugLog.log('正在处理同步，跳过重复执行');
      return;
    }

    // 检查基本条件
    if (!isSignedIn || !userId || !user) {
      debugLog.log('用户未完全登录，跳过同步', { isSignedIn, userId, hasUser: !!user });
      return;
    }

    // 检查是否已经同步过
    if (syncedRef.current.has(userId)) {
      debugLog.log('用户已同步过，跳过同步:', userId);
      return;
    }

    // 检查会话存储，避免同一会话重复同步
    const sessionKey = `auth_sync_${userId}`;
    if (sessionStorage.getItem(sessionKey)) {
      debugLog.log('本次会话已同步，跳过同步:', userId);
      syncedRef.current.add(userId);
      updateSyncRecord();
      return;
    }

    // 开始处理
    isProcessingRef.current = true;

    try {
      debugLog.group('用户登录同步');
      debugLog.time('同步耗时');
      
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) {
        debugLog.error('用户邮箱信息不完整');
        return;
      }

      debugLog.log('开始同步用户信息:', {
        userId,
        email,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      });

      // 使用 fetch 而不是 axios，减少依赖
      const response = await fetch('/api/user/sync-on-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar: user.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`同步失败: ${response.status}`);
      }

      const result = await response.json();
      debugLog.log('同步结果:', result);

      // 记录同步成功
      syncedRef.current.add(userId);
      sessionStorage.setItem(sessionKey, 'synced');
      updateSyncRecord();

      debugLog.timeEnd('同步耗时');
      debugLog.log('用户同步完成');
      
    } catch (error) {
      debugLog.error('用户同步失败:', error);
    } finally {
      debugLog.groupEnd();
      isProcessingRef.current = false;
    }
  }, [isSignedIn, userId, user, updateSyncRecord]);

  // 延迟执行同步，避免阻塞首页渲染
  useEffect(() => {
    if (!initRef.current) return;

    // 使用 requestIdleCallback 或 setTimeout 延迟执行
    const scheduleSync = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          syncUserIfNeeded();
        }, { timeout: 5000 }); // 5秒超时
      } else {
        // fallback for Safari
        setTimeout(syncUserIfNeeded, 1000);
      }
    };

    scheduleSync();
  }, [syncUserIfNeeded]);

  // 清理过期的同步记录（可选）
  useEffect(() => {
    const cleanup = () => {
      try {
        // 清理超过7天的会话存储
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('auth_sync_')) {
            // 在实际应用中可以添加时间戳检查
            // 这里简单处理，保持当前会话的记录
          }
        });
      } catch (error) {
        debugLog.error('清理同步记录失败:', error);
      }
    };

    cleanup();
  }, []);

  return null; // 这个组件不渲染任何UI
} 