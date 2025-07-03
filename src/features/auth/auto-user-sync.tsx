'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useUserSync } from './use-user-sync';

/**
 * 全局自动用户同步组件
 * 只在用户首次注册或登录且数据库中不存在用户记录时自动同步
 */
export function AutoUserSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { isSynced, syncUserToDatabase, hasAttemptedSync, syncStatus, dbUser } = useUserSync();
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    // 更严格的条件检查：只有当用户已登录、已加载、未同步且数据库中没有用户记录时才同步
    const shouldSync = 
      isLoaded && 
      isSignedIn && 
      clerkUser && 
      !isSynced && 
      !hasAttemptedSync && 
      syncStatus !== 'syncing' &&
      !syncInProgressRef.current &&
      !dbUser; // 重要：只有当数据库中没有用户记录时才同步

    if (shouldSync) {
      console.log('🔄 AutoUserSync: 检测到新用户或未同步用户，开始自动同步...', {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        reason: '用户不存在于数据库中'
      });
      
      syncInProgressRef.current = true;
      
      // 延迟一下，确保Clerk状态完全稳定
      const syncTimeout = setTimeout(async () => {
        try {
          await syncUserToDatabase();
        } catch (error) {
          console.error('🚨 AutoUserSync: 自动同步失败:', error);
        } finally {
          syncInProgressRef.current = false;
        }
      }, 500); // 减少延迟时间

      return () => {
        clearTimeout(syncTimeout);
        syncInProgressRef.current = false;
      };
    }
    
    // 如果用户已经同步或数据库中已存在用户，不进行任何操作
    if (isSynced || dbUser) {
      if (syncInProgressRef.current) {
        console.log('✅ AutoUserSync: 用户已存在或同步完成，停止同步流程');
        syncInProgressRef.current = false;
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, isSynced, hasAttemptedSync, syncStatus, dbUser, syncUserToDatabase]);

  // 当用户登出时重置状态
  useEffect(() => {
    if (!isSignedIn) {
      syncInProgressRef.current = false;
    }
  }, [isSignedIn]);

  // 此组件不渲染任何UI
  return null;
} 