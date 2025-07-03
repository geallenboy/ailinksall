'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2 } from 'lucide-react';

import { useAuth as useCustomAuth } from '@/features/auth/use-auth';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const { syncUserToDatabase } = useCustomAuth();
  const t = useTranslations('auth.signIn');
  const formT = useTranslations('login.signUpForm');
  const resetT = useTranslations('login.resetPassword');
  const errorT = useTranslations('auth.errors');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      // 使用 Clerk 进行登录
      const result = await signIn.create({
        identifier: formData.email.trim(),
        password: formData.password,
      });

      if (result.status === 'complete') {
        // 登录成功，设置活动会话
        await setActive({ session: result.createdSessionId });
        
        // 登录成功后同步用户信息到数据库
        try {
          const syncResult = await syncUserToDatabase();
          if (syncResult.success) {
            console.log('用户信息同步成功:', syncResult.action);
          } else {
            console.warn('用户信息同步失败:', syncResult.error);
          }
        } catch (syncError) {
          console.error('用户信息同步异常:', syncError);
          // 不影响登录流程，继续跳转
        }
        
        router.push('/');
      } else {
        // 可能需要额外的验证步骤
        console.log('需要额外验证:', result);
        setError(errorT('needVerification'));
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      
      // 处理常见的错误情况
      if (err.errors && err.errors.length > 0) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_identifier_not_found':
            setError(errorT('emailNotFound'));
            break;
          case 'form_password_incorrect':
            setError(errorT('incorrectPassword'));
            break;
          case 'too_many_requests':
            setError(errorT('tooManyAttempts'));
            break;
          default:
            setError(err.errors[0].message || errorT('loginFailed'));
        }
      } else {
        setError(errorT('networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    
    setOauthLoading(provider);
    setError('');

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error(`${provider} OAuth 错误:`, err);
      setError(`${provider === 'oauth_google' ? 'Google' : 'GitHub'} ${errorT('oauthError')}`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">


      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{formT('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{formT('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={formT('passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    href="/auth/forgot-password" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {resetT('name')}？
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {formT('info1')}
                  </>
                ) : (
                  formT('btn1')
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {formT('or')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('oauth_google')}
                disabled={!!oauthLoading || !isLoaded}
                className="h-11"
              >
                {oauthLoading === 'oauth_google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('oauth_github')}
                disabled={!!oauthLoading || !isLoaded}
                className="h-11"
              >
                {oauthLoading === 'oauth_github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{formT('info3')} </span>
              <Link 
                href="/auth/signup" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {formT('btn2')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 