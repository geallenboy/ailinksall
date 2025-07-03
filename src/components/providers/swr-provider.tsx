'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
  fallback?: Record<string, any>
}

export function SWRProvider({ children, fallback = {} }: SWRProviderProps) {
  return (
    <SWRConfig 
      value={{
        ...swrConfig,
        fallback: {
          ...fallback,
          // 可以在这里添加其他全局 fallback 数据
        }
      }}
    >
      {children}
    </SWRConfig>
  )
} 