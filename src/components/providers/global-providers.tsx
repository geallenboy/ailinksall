'use client'

import { ReactNode, Suspense } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { SWRProvider } from './swr-provider'
import { Toaster } from 'sonner'
import { AuthCallback } from '@/features/auth/auth-callback'
import { ErrorBoundary } from 'react-error-boundary'

interface GlobalProvidersProps {
  children: ReactNode
  fallbackData?: Record<string, any>
}

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">出现了一些问题</h2>
        <p className="text-sm text-red-500 mb-4">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重试
        </button>
      </div>
    </div>
  )
}

// 加载回退组件
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

export function GlobalProviders({ children, fallbackData }: GlobalProvidersProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: '#2563eb',
          },
        }}
        // 配置CAPTCHA相关选项以避免错误
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SWRProvider fallback={fallbackData}>
            <Suspense fallback={<LoadingFallback />}>
              <AuthCallback />
              {children}
            </Suspense>
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </SWRProvider>
        </ThemeProvider>
      </ClerkProvider>
    </ErrorBoundary>
  )
} 