'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/use-auth';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Shield, LogOut, Menu, X, Sun, Moon, Laptop, Globe, Languages, Crown, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import Logo from '@/features/common/components/logo';

export default function Navigation() {
  const { user, loading, signOut, isLoaded, isSignedIn, dbUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('navigation');
  const localeT = useTranslations('locale');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件在客户端挂载后才显示用户相关内容
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      // 延迟设置初始化状态，确保Clerk完全加载
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 检查用户是否是管理员
  const isUserAdmin = dbUser?.isAdmin === true;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('退出失败:', error);
    }
  };

  // 更新语言切换逻辑，使用路由跳转
  const handleLanguageChange = (newLocale: 'zh' | 'en') => {
    const currentPath = pathname;
    // 移除当前语言前缀
    const pathWithoutLocale = currentPath.replace(`/${locale}`, '') || '/';
    // 跳转到新语言的路径
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  // 构建带语言前缀的路径
  const localePath = (path: string) => `/${locale}${path}`;

  const getUserInitials = (user: any) => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.fullName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user: any) => {
    return user?.fullName || user?.email || 'User';
  };

  // 更新导航项使用语言路由
  const navItems = [
    { href: localePath('/'), label: t('home'), active: pathname === localePath('/') || pathname === `/${locale}` },
    { href: localePath('/insights'), label: 'AI洞察引擎', active: pathname.startsWith(localePath('/insights')) },
    { href: localePath('/news'), label: '新闻资讯', active: pathname.startsWith(localePath('/news')) },
    { href: localePath('/products'), label: '产品展示', active: pathname.startsWith(localePath('/products')) },
    // { href: localePath('/contact'), label: t('contact'), active: pathname.startsWith(localePath('/contact')) },
  ];

  
  const ThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{localeT('switchTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>{localeT('light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>{localeT('dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>{localeT('system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LanguageToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{localeT('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('zh')}
          className={locale === 'zh' ? 'bg-primary/10' : ''}
        >
          <Globe className="mr-2 h-4 w-4" />
          <span>{localeT('zh')}</span>
          {locale === 'zh' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={locale === 'en' ? 'bg-primary/10' : ''}
        >
          <Globe className="mr-2 h-4 w-4" />
          <span>{localeT('en')}</span>
          {locale === 'en' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-colors duration-300">
     
      
      <div className="relative z-10 max-w-none mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <Link href={localePath('/')}>
                <Logo withLink={false} />
              </Link>
            </div>
          </div>

          {/* 桌面端导航菜单 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group transform hover:scale-105",
                  item.active 
                    ? "text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-blue-400/50 dark:border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                )}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                <span className="relative z-10">{item.label}</span>
                {item.active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                )}
                {/* 3D悬浮效果背景 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            ))}
          </div>

          {/* 右侧操作区域 */}
          <div className="flex items-center space-x-2">
            {/* 桌面端语言切换器 */}
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
            
            {/* 桌面端主题切换器 */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* 用户菜单区域 - 优化渲染 */}
            {!isMounted ? (
              // 服务器端和初始客户端渲染显示简单的占位符
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/30 rounded-full"></div>
              </div>
            ) : loading ? (
              // 加载中状态
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
              </div>
            ) : user ? (
              // 已登录用户菜单
              <div className="flex items-center space-x-2">
               
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                      <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <AvatarImage src={user.avatar || ''} alt={getUserDisplayName(user)} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        {/* 发光环效果 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm animate-pulse"></div>
                      </div>
                     
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">
                            {getUserDisplayName(user)}
                          </p>
                          
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href={localePath('/dashboard')} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href={localePath('/settings')} className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('settings')}</span>
                      </Link>
                    </DropdownMenuItem>


                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // 未登录状态
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={localePath('/auth/signin')}>{t('signIn')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={localePath('/auth/signup')}>{t('signUp')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端菜单 - 3D科技风格 */}
      {isMenuOpen && (
        <div className="md:hidden relative">
        
          <div className="relative z-10 px-4 py-6 space-y-4">
            {/* 导航链接 */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:translate-x-2",
                    item.active 
                      ? "text-blue-600 dark:text-white bg-gradient-to-r from-blue-500/40 to-purple-500/40 dark:from-blue-500/30 dark:to-purple-500/30 backdrop-blur-sm border border-blue-400/60 dark:border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.5)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-gray-300/50 dark:hover:border-white/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  )}
                  {/* 3D悬浮背景 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-all duration-300 -z-10 transform hover:scale-105"></div>
                </Link>
              ))}
            </div>
            
            {/* 移动端工具 */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{localeT('label')}</span>
                <div className="flex space-x-2">
                  <Button
                    variant={locale === 'zh' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleLanguageChange('zh');
                      setIsMenuOpen(false);
                    }}
                  >
                    中文
                  </Button>
                  <Button
                    variant={locale === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleLanguageChange('en');
                      setIsMenuOpen(false);
                    }}
                  >
                    EN
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-muted-foreground">主题</span>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                  >
                    <Laptop className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 