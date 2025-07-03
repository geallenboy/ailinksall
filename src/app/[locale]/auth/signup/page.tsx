'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignUp, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth as useCustomAuth } from '@/features/auth/use-auth';
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const { syncUserToDatabase } = useCustomAuth();
  const t = useTranslations('auth.signUp');
  const formT = useTranslations('login.signUpForm');
  const verifyT = useTranslations('auth.verifyEmail');
  const errorT = useTranslations('auth.errors');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    if (!isLoaded || !signUp) {
      setLoading(false);
      return;
    }

    // 验证密码强度
    if (formData.password.length < 8) {
      setError(formT('passwordMin'));
      setLoading(false);
      return;
    }

    try {
      // 只使用邮箱和密码进行注册，避免参数错误
      const signUpParams = {
        emailAddress: formData.email.trim(),
        password: formData.password,
      };

      console.log('注册参数:', signUpParams);

      // 使用 Clerk 进行注册
      const result = await signUp.create(signUpParams);

      if (result.status === 'missing_requirements') {
        // 需要邮箱验证
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setVerificationStep(true);
        setSuccess(verifyT('checkEmail'));
      } else if (result.status === 'complete') {
        // 注册完成，直接登录
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
      }
    } catch (err: any) {
      console.error('注册错误:', err);
      
      // 处理常见的错误情况
      if (err.errors && err.errors.length > 0) {
        const errorCode = err.errors[0].code;
        const errorMessage = err.errors[0].message || errorT('signupFailed');
        
        // 只在开发环境打印详细错误信息
        if (process.env.NODE_ENV === 'development') {
          console.error('错误详情:', {
            code: errorCode,
            message: errorMessage,
            meta: err.errors[0].meta || 'No meta data',
            fullError: err
          });
        }
        
        switch (errorCode) {
          case 'form_identifier_exists':
            setError(errorT('emailExists'));
            break;
          case 'form_password_pwned':
            setError(errorT('passwordTooWeak'));
            break;
          case 'form_password_length_too_short':
            setError(formT('passwordMin'));
            break;
          case 'form_param_unknown':
          case 'form_param_format_invalid':
            setError(errorT('invalidParams'));
            break;
          default:
            setError(errorMessage);
        }
      } else {
        console.error('网络或未知错误:', err);
        setError(errorT('networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // 验证成功后同步用户信息到数据库
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
        
        setSuccess(verifyT('success') + ' ' + '正在跳转...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      console.error('验证错误:', err);
      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message || errorT('verificationFailed');
        
        // 只在开发环境打印详细错误信息
        if (process.env.NODE_ENV === 'development') {
          console.error('验证错误详情:', {
            code: err.errors[0].code,
            message: errorMessage,
            fullError: err
          });
        }
        
        setError(errorMessage);
      } else {
        setError(errorT('verificationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    
    setOauthLoading(provider);
    setError('');

    try {
      await signUp.authenticateWithRedirect({
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
     
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {verificationStep ? verifyT('title') : t('title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {verificationStep ? verifyT('enterCode') : t('subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {verificationStep ? (
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">{verifyT('verificationCode')}</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder={verifyT('enterCode')}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="h-11"
                    maxLength={6}
                  />
                </div>

                {/* Clerk CAPTCHA 容器 */}
                <div id="clerk-captcha"></div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={loading || !isLoaded}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {verifyT('verifying')}
                    </>
                  ) : (
                    verifyT('verifyButton')
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Button 
                    variant="ghost" 
                    onClick={() => setVerificationStep(false)}
                    type="button"
                  >
                    {verifyT('backToSignup')}
                  </Button>
                </div>
              </form>
            ) : (
              <>
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
                        placeholder={formT('passwordInfo')}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{formT('confirmPassword')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder={formT('confirmPasswordEnter')}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                      {formT('btn3')} <Link href="/terms" className="text-primary hover:underline">{formT('btn4')}</Link> {formT('btn5')} 
                      {/* <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link> */}
                    </Label>
                  </div>

                  {/* Clerk CAPTCHA 容器 */}
                  <div id="clerk-captcha"></div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={loading || !isLoaded || !formData.agreeToTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {formT('signupInfo1')}
                      </>
                    ) : (
                      formT('signupBtn1')
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
                    onClick={() => handleOAuthSignUp('oauth_google')}
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
                    onClick={() => handleOAuthSignUp('oauth_github')}
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
                    href="/auth/signin" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {formT('signupBtn2')}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 