'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 记录全局错误
    console.error('Global Error:', error);
  }, [error]);

  // 由于这是全局错误页面，不能依赖next-intl，需要提供双语言支持
  const isZh = typeof window !== 'undefined' && (
    window.navigator.language.includes('zh') ||
    localStorage.getItem('NEXT_LOCALE') === 'zh' ||
    document.cookie.includes('NEXT_LOCALE=zh')
  );

  const text = {
    title: isZh ? '系统错误' : 'System Error',
    description: isZh ? '应用程序遇到了一个严重错误' : 'The application encountered a critical error',
    errorMessage: isZh ? '错误信息：' : 'Error Message:',
    development: isZh ? '系统遇到了一个意外错误，请稍后重试。' : 'The system encountered an unexpected error, please try again later.',
    retry: isZh ? '重试' : 'Retry',
    home: isZh ? '返回首页' : 'Back to Home',
    support: isZh ? '如果问题持续存在，请联系技术支持' : 'If the problem persists, please contact technical support'
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl border-0 p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <svg 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {text.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300">
                {text.description}
              </p>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>{text.errorMessage}</strong>
                  {process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : text.development
                  }
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={reset}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-medium transition-colors"
                >
                  {text.retry}
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {text.home}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {text.support}
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 