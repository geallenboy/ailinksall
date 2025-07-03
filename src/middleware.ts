import createIntlMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { locales, defaultLocale } from '@/translate/i18n/config';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  // 将需要登录才能访问的路由放在这里
  '/:locale/dashboard(.*)',
  '/:locale/settings(.*)',
]);

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default clerkMiddleware(async (auth, req:any) => {
  // 检查是否是 API 路由，如果是则跳过多语言处理
  if (req.nextUrl.pathname.startsWith('/api/') || req.nextUrl.pathname.startsWith('/trpc/')) {
    // 对于 API 路由，只进行认证检查（如果需要）
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // 用户未登录，将他们重定向到登录页面。
      // 我们在这里构建 URL，以包含区域设置和重定向 URL。
      const locale = req.nextUrl.pathname.split('/')[1] || defaultLocale;
      const signInUrl = new URL(`/${locale}/sign-in`, req.nextUrl.origin);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 对于页面路由，都通过 next-intl 中间件处理
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // 跳过 Next.js 的内部路径和静态文件
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 始终对 API 路由运行中间件
    '/(api|trpc)(.*)',
  ],
};