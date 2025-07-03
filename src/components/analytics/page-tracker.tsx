'use client'

import { usePageTracking } from '@/hooks/use-analytics'

/**
 * 页面跟踪组件
 * 在每个页面中包含此组件以自动跟踪页面视图
 */
export function PageTracker() {
  usePageTracking()
  return null
}

/**
 * 内容视图跟踪组件
 * 用于跟踪特定内容的查看
 */
interface ContentTrackerProps {
  contentType: 'blog' | 'use-case' | 'tutorial' | 'tutorial-step'
  contentId: string
  title?: string
}

export function ContentTracker({ contentType, contentId, title }: ContentTrackerProps) {
  // 这里可以添加内容视图的跟踪逻辑
  // 例如当组件挂载时自动跟踪内容视图
  
  return null
} 