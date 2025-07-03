import { GoogleAnalyticsComponent } from '@/components/analytics/google-analytics'
import { GoogleSearchConsole } from '@/components/seo/google-search-console'

interface GoogleToolsProps {
  gaId?: string
  siteVerification?: string
  enableAnalytics?: boolean
  enableSearchConsole?: boolean
}
// 谷歌工具组件
export function GoogleTools({
  gaId,
  siteVerification,
  enableAnalytics = true,
  enableSearchConsole = true,
}: GoogleToolsProps) {
  return (
    <>
      {/* Google Analytics */}
      {enableAnalytics && gaId && (
        <GoogleAnalyticsComponent gaId={gaId} />
      )}
      
      {/* Google Search Console */}
      {enableSearchConsole && siteVerification && (
        <GoogleSearchConsole siteVerification={siteVerification} />
      )}
    </>
  )
}

// 配置对象类型
export interface GoogleToolsConfig {
  analytics: {
    enabled: boolean
    measurementId: string
  }
  searchConsole: {
    enabled: boolean
    siteVerification: string
  }
}

// 从环境变量加载配置的Hook
export function useGoogleToolsConfig(): GoogleToolsConfig {
  return {
    analytics: {
      enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
    searchConsole: {
      enabled: !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
  }
} 