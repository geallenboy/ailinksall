'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/use-auth';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SSOCallbackPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, syncUserToDatabase, syncStatus, syncError } = useAuth();
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const t = useTranslations('auth.ssoCallback');
  const tErrors = useTranslations('auth.errors');

  // 监听登录状态变化，在OAuth登录成功后同步用户信息
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const handleOAuthSync = async () => {
        try {
          console.log('SSO回调: 开始同步用户信息...');
          const syncResult = await syncUserToDatabase();
          if (syncResult && syncResult.success) {
            console.log('OAuth用户信息同步成功:', syncResult.action);
            
            // 同步成功后延迟跳转
            const timer = setTimeout(() => {
              router.push('/');
            }, 2000);
            
            setRedirectTimer(timer);
          } else {
            console.error('OAuth用户信息同步失败:', syncResult);
            // 即使同步失败也跳转到首页
            const timer = setTimeout(() => {
              router.push('/');
            }, 2000);
            setRedirectTimer(timer);
          }
        } catch (syncError) {
          console.error('OAuth用户信息同步异常:', syncError);
          // 即使同步异常也跳转到首页
          const timer = setTimeout(() => {
            router.push('/');
          }, 2000);
          setRedirectTimer(timer);
        }
      };

      // 延迟一下确保Clerk完全处理完成
      setTimeout(handleOAuthSync, 1000);
    }
  }, [isLoaded, isSignedIn, syncUserToDatabase, router]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // 获取当前状态的显示内容
  const getStatusContent = () => {
    if (!isLoaded || !isSignedIn) {
      return {
        icon: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
        title: t('title'),
        description: t('description'),
        className: 'text-blue-600'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
          title: t('syncingUser'),
          description: t('description'),
          className: 'text-blue-600'
        };
      
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: t('syncSuccess'),
          description: t('redirecting'),
          className: 'text-green-600'
        };
      
      case 'error':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-600" />,
          title: tErrors('syncFailed'),
          description: syncError || tErrors('unknownError'),
          className: 'text-red-600'
        };
      
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
          title: t('title'),
          description: t('description'),
          className: 'text-blue-600'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="flex justify-center">
            {statusContent.icon}
          </div>
          
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
              {statusContent.title}
            </h2>
            <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
              {statusContent.description}
            </p>
          </div>

          {/* 同步状态指示器 */}
          {syncStatus === 'syncing' && (
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
          )}

          {/* 错误状态下的重试按钮 */}
          {syncStatus === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {t('syncError')}
            </button>
          )}
        </div>
      </div>
      
      {/* 添加 CAPTCHA 容器元素以避免错误 */}
      <div id="clerk-captcha" style={{ display: 'none' }}></div>
      
      <AuthenticateWithRedirectCallback 
        continueSignUpUrl="/auth/signup"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
} 