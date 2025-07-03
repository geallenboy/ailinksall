'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Navigation } from '@/components/layout';
import { useTranslations } from 'next-intl';
import { useSignIn, useAuth } from '@clerk/nextjs';

export default function ForgotPasswordPage() {
  
  const t = useTranslations('login.resetPassword');
  const forgotT = useTranslations('auth.forgotPassword');
  const resetT = useTranslations('auth.resetPassword');
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  // 流程步骤：1-输入邮箱，2-输入验证码和新密码，3-完成
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  // 密码强度计算
  useEffect(() => {
    if (step === 2 && newPassword) {
      let strength = 0;
      if (newPassword.length >= 8) strength += 25;
      if (/[A-Z]/.test(newPassword)) strength += 25;
      if (/[a-z]/.test(newPassword)) strength += 25;
      if (/[0-9]/.test(newPassword)) strength += 25;
      setPasswordStrength(strength);
    }
  }, [newPassword, step]);

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return '弱';
    if (passwordStrength <= 50) return '一般';
    if (passwordStrength <= 75) return '良好';
    return '强';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'text-red-500';
    if (passwordStrength <= 50) return 'text-orange-500';
    if (passwordStrength <= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  // 第一步：发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    setError('');

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('emailMessage'));
      setLoading(false);
      return;
    }

    try {
      // 使用 Clerk 的 signIn 创建密码重置
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });

      setStep(2); // 进入第二步
      console.log('密码重置邮件发送成功:', email.trim());
      
    } catch (error: any) {
      console.error('发送重置邮件错误:', error);
      
      // 处理 Clerk 错误
      if (error.errors && error.errors.length > 0) {
        const errorCode = error.errors[0].code;
        const errorMessage = error.errors[0].message;
        
        switch (errorCode) {
          case 'form_identifier_not_found':
            setError(forgotT('emailNotFound'));
            break;
          case 'too_many_requests':
            setError(forgotT('tooManyRequests'));
            break;
          default:
            setError(errorMessage || forgotT('sendError'));
        }
      } else {
        setError(forgotT('sendError'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 第二步：验证码和密码重置
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    setError('');

    // 验证输入
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(resetT('requirements.length'));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
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
        code: verificationCode,
        password: newPassword,
      });

      if (result.status === 'complete') {
        console.log('密码重置成功');
        
        // 设置活跃会话 - 用户已经通过密码重置自动登录
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        
        setStep(3); // 进入完成步骤
        
        // 延迟跳转到首页（用户已登录）
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('密码重置错误:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      
      // 处理 Clerk 错误
      if (error.errors && error.errors.length > 0) {
        const errorCode = error.errors[0].code;
        const errorMessage = error.errors[0].message;
        console.log('Clerk 错误代码:', errorCode);
        console.log('Clerk 错误消息:', errorMessage);
        
        switch (errorCode) {
          case 'form_code_incorrect':
            setError('验证码错误，请重新输入');
            break;
          case 'form_password_pwned':
            setError('此密码过于常见，请使用更安全的密码');
            break;
          case 'form_password_length_too_short':
            setError(resetT('requirements.length'));
            break;
          case 'session_exists':
            // 会话已存在，用户可能已经登录
            console.log('用户已登录，直接跳转');
            router.push('/');
            return;
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

  // 重新发送验证码
  const handleResendCode = async () => {
    setStep(1);
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {step === 3 ? (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              ) : step === 2 ? (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {step === 3 ? resetT('success') : 
               step === 2 ? '输入验证码和新密码' : 
               forgotT('title')}
            </CardTitle>
            
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {step === 3 ? resetT('successMessage') :
               step === 2 ? `我们已向 ${email} 发送了验证码` :
               forgotT('subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 步骤 3: 完成 */}
            {step === 3 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    密码重置成功！
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    您已自动登录，即将跳转到首页...
                  </p>
                  
                  <Button 
                    onClick={() => router.push('/')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    进入首页
                  </Button>
                </div>
              </div>
            
            /* 步骤 2: 输入验证码和新密码 */
            ) : step === 2 ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="输入6位验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    className="h-11 text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    请查看邮箱 {email} 中的验证码
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{resetT('newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入新密码"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{resetT('passwordStrength')}</span>
                        <span className={`font-medium ${getPasswordStrengthColor()}`}>
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
                    <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                      {resetT('requirements.length')}
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                      {resetT('requirements.uppercase')}
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                      {resetT('requirements.lowercase')}
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                      {resetT('requirements.number')}
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={loading || !verificationCode || !newPassword || !confirmPassword || passwordStrength < 75}
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

                <div className="text-center space-y-2">
                  <Button
                    variant="ghost"
                    onClick={handleResendCode}
                    className="text-sm"
                    type="button"
                  >
                    重新发送验证码
                  </Button>
                  
                  <div>
                    <Link 
                      href="/auth/signin" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      {forgotT('backToLogin')}
                    </Link>
                  </div>
                </div>
              </form>
            
            /* 步骤 1: 输入邮箱 */
            ) : (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{forgotT('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {forgotT('sending')}
                    </>
                  ) : (
                    forgotT('sendResetLink')
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/signin" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    {forgotT('backToLogin')}
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