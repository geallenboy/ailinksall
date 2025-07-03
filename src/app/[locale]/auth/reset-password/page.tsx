'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Navigation } from '@/components/layout';
import { useTranslations } from 'next-intl';
import { useSignIn } from '@clerk/nextjs';

export default function ResetPasswordPage() {
  const resetT = useTranslations('auth.resetPassword');
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [code, setCode] = useState('');

  // 从 URL 参数获取重置代码
  useEffect(() => {
    const resetCode = searchParams.get('code');
    if (resetCode) {
      setCode(resetCode);
    }
  }, [searchParams]);

  // 密码强度计算
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return '弱';
    if (passwordStrength <= 50) return '一般';
    if (passwordStrength <= 75) return '良好';
    return '强';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    setError('');

    // 验证密码
    if (password.length < 8) {
      setError(resetT('requirements.length'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (passwordStrength < 75) {
      setError('密码强度不够，请使用更复杂的密码');
      setLoading(false);
      return;
    }

    try {
      // 使用 Clerk 的 signIn 完成密码重置
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code,
        password: password,
      });

      if (result.status === 'complete') {
        setSuccess(true);
        console.log('密码重置成功');
        
        // 延迟跳转到登录页
        setTimeout(() => {
          router.push('/auth/signin?message=password-reset-success');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('密码重置错误:', error);
      
      // 处理 Clerk 错误
      if (error.errors && error.errors.length > 0) {
        const errorCode = error.errors[0].code;
        const errorMessage = error.errors[0].message;
        
        switch (errorCode) {
          case 'form_code_incorrect':
            setError(resetT('invalidLink'));
            break;
          case 'form_password_pwned':
            setError('此密码过于常见，请使用更安全的密码');
            break;
          case 'form_password_length_too_short':
            setError(resetT('requirements.length'));
            break;
          default:
            setError(errorMessage || '密码重置失败，请重试');
        }
      } else {
        setError('密码重置失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 如果没有重置代码，显示错误信息
  if (!code && isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-red-600">
                {resetT('invalidLink')}
              </CardTitle>
              
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {resetT('linkExpired')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    {resetT('requestNew')}
                  </Button>
                </Link>
                
                <Link href="/auth/signin">
                  <Button variant="ghost" className="w-full">
                    返回登录
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {success ? (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {success ? resetT('success') : resetT('title')}
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {success 
                ? resetT('successMessage')
                : resetT('subtitle')
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

            {success ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {resetT('loginWithNew')}
                  </p>
                  
                  <Link href="/auth/signin">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      {resetT('loginWithNew')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{resetT('newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入新密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{resetT('passwordStrength')}</span>
                        <span className={`font-medium ${
                          passwordStrength <= 25 ? 'text-red-500' :
                          passwordStrength <= 50 ? 'text-orange-500' :
                          passwordStrength <= 75 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{resetT('confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="确认新密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>密码要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className={password.length >= 8 ? 'text-green-600' : ''}>
                      {resetT('requirements.length')}
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                      {resetT('requirements.uppercase')}
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                      {resetT('requirements.lowercase')}
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                      {resetT('requirements.number')}
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || !password.trim() || !confirmPassword.trim() || passwordStrength < 75}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {resetT('resetting')}
                    </>
                  ) : (
                    resetT('resetButton')
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/signin" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    返回登录
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 