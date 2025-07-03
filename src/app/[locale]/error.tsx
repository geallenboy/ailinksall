'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/layout';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errorPages.error');

  useEffect(() => {
    // 记录错误到外部监控服务
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {t('title')}
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t('description')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>{t('errorMessage')}</strong>
                  {process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : t('development')
                  }
                </p>
                {process.env.NODE_ENV === 'development' && error.digest && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {t('errorId')}: {error.digest}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={reset}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('buttons.retry')}
                </Button>
                
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    {t('buttons.home')}
                  </Link>
                </Button>

               
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {t('support')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 