'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAdmin } from '@/features/auth/hooks/use-admin';
import { debugLog } from '@/lib/debug-logger';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AdminLinkProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  showStatus?: boolean; // 是否显示权限状态
  externalAdminStatus?: boolean; // 外部管理员状态（来自navigation）
}

/**
 * 智能的管理员链接组件
 * 对于已知的管理员用户，可以立即跳转到后台，无需等待验证
 */
export function AdminLink({ 
  children, 
  className, 
  href,
  onClick,
  showStatus = false,
  externalAdminStatus
}: AdminLinkProps) {
  const { isAdmin, isAuthenticated, isLoading } = useAdmin();
  const router = useRouter();
  const locale = useLocale();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 如果没有提供 href，使用当前语言构建后台链接
  const backendHref = href || `/${locale}/backend`;

  // 智能判断管理员状态：优先使用外部状态，再使用hook状态
  const effectiveAdminStatus = externalAdminStatus !== undefined ? externalAdminStatus : isAdmin;
  const shouldAllowNavigation = isAuthenticated && (effectiveAdminStatus || (isLoading && externalAdminStatus));

  const handleClick = async (e: React.MouseEvent) => {
    debugLog.log('AdminLink: 点击后台链接', {
      isAuthenticated,
      isAdmin,
      externalAdminStatus,
      effectiveAdminStatus,
      isLoading,
      shouldAllowNavigation
    });

    // 如果用户已认证且具有管理员权限（来自外部状态或内部验证）
    if (isAuthenticated && effectiveAdminStatus) {
      debugLog.log('AdminLink: 管理员用户，直接跳转');
      if (onClick) onClick();
      
      // 显示导航加载状态
      setIsNavigating(true);
      
      try {
        router.push(backendHref);
      } catch (error) {
        debugLog.error('AdminLink: 跳转失败', error);
        setIsNavigating(false);
      }
      return;
    }

    // 如果用户已认证但权限检查还在进行中，且外部状态显示为管理员
    if (isAuthenticated && isLoading && externalAdminStatus) {
      debugLog.log('AdminLink: 权限检查中但外部状态为管理员，允许跳转');
      if (onClick) onClick();
      
      setIsNavigating(true);
      
      try {
        router.push(backendHref);
      } catch (error) {
        debugLog.error('AdminLink: 跳转失败', error);
        setIsNavigating(false);
      }
      return;
    }

    // 如果用户未认证或不是管理员，阻止默认行为
    if (!isAuthenticated || (!effectiveAdminStatus && !isLoading)) {
      e.preventDefault();
      debugLog.warn('AdminLink: 用户无权限或未认证，阻止跳转');
      return;
    }

    // 其他情况（权限检查中），阻止默认行为并提示用户
    e.preventDefault();
    debugLog.log('AdminLink: 权限检查中，请稍候...');
  };

  // 判断是否显示加载状态
  const isShowingLoading = isNavigating || (isLoading && !effectiveAdminStatus);

  // 如果用户有管理员权限，渲染为可点击的链接
  if (isAuthenticated && (effectiveAdminStatus || (isLoading && externalAdminStatus))) {
    const content = showStatus ? (
      <div className="flex items-center gap-2">
        {children}
        {isShowingLoading ? (
          <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>跳转中...</span>
          </div>
        ) : (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
            快速访问
          </span>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-2">
        {children}
        {isShowingLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    );

    return (
      <div 
        onClick={handleClick}
        className={cn(
          'cursor-pointer',
          isShowingLoading && 'opacity-70 pointer-events-none',
          className
        )}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as any);
          }
        }}
      >
        {content}
      </div>
    );
  }

  // 如果用户没有权限，渲染为普通Link（会被AdminGuard拦截）
  return (
    <Link 
      href={backendHref} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export default AdminLink; 