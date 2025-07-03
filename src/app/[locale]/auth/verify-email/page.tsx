'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Navigation } from '@/components/layout';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const t = useTranslations('auth.verifyEmail');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setLoading(false);
      setError(t('invalidToken'));
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 3000);
      } else {
        setError(result.message || t('failed'));
      }
    } catch (error) {
      console.error('验证邮箱错误:', error);
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError(t('emailMissing'));
      return;
    }

    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setResendSuccess(true);
      } else {
        setError(result.message || t('resendFailed'));
      }
    } catch (error) {
      console.error('重新发送验证邮件错误:', error);
      setError(t('networkError'));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {loading ? (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : success ? (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {loading ? t('verifying') : success ? t('success') : t('title')}
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {loading 
                ? t('verifyingSubtitle')
                : success 
                ? t('successSubtitle')
                : token 
                ? t('failed')
                : t('subtitle')
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{t('resendSuccess')}</AlertDescription>
              </Alert>
            )}

            {success ? (
                              <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('congratulations')}
                    </p>
                    <Link href="/auth/signin?verified=true">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                        {t('loginNow')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
            ) : loading ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('verifyingSubtitle')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {!token && (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('checkEmail')}
                    </p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>{t('tip').split('：')[0]}：</strong>{t('tip').split('：')[1]}
                      </p>
                    </div>
                  </div>
                )}

                {email && (
                  <Button 
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('resending')}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('resendEmail')}
                      </>
                    )}
                  </Button>
                )}

                <div className="text-center">
                  <Link 
                    href="/auth/signin" 
                    className="text-sm text-primary hover:underline"
                  >
                    返回登录页面
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 