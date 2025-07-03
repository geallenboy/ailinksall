import { SWRConfiguration } from 'swr'
import { http, type ApiResponse } from './http-client'
import { AxiosError } from 'axios'

// 全局 fetcher 函数 - 使用 axios
export const fetcher = async (url: string) => {
  try {
    const response = await http.get<any>(url)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>
    
    // 重新抛出具有更好错误信息的错误
    const enhancedError = new Error(
      axiosError.response?.data?.error || 
      axiosError.response?.data?.message || 
      axiosError.message ||
      'An error occurred while fetching the data.'
    )
    
    // 保留HTTP状态码信息
    if (axiosError.response?.status) {
      ;(enhancedError as any).status = axiosError.response.status
    }
    
    throw enhancedError
  }
}

// 专用于Server Actions的fetcher（不经过HTTP）
export const actionFetcher = async (action: () => Promise<ApiResponse<any>>) => {
  const result = await action()
  if (!result.success) {
    const error = new Error(result.error || result.message || '操作失败')
    throw error
  }
  return result
}

// SWR 全局配置
export const swrConfig: SWRConfiguration = {
  fetcher,
  // 缓存配置
  revalidateOnFocus: true, // 窗口聚焦时重新验证
  revalidateOnReconnect: true, // 网络重连时重新验证
  refreshInterval: 0, // 默认不轮询，按需设置
  
  // 错误重试配置
  errorRetryCount: 3, // 最多重试3次
  errorRetryInterval: 5000, // 重试间隔5秒
  
  // 缓存时间配置（毫秒）
  dedupingInterval: 2000, // 请求去重间隔2秒
  
  // 全局错误处理
  onError: (error, key) => {
    if (error.status !== 403 && error.status !== 404) {
      // 排除权限和404错误，其他错误可以发送到监控系统
      console.error('SWR Error:', { error, key })
    }
  },
  
  // 全局成功回调
  onSuccess: (data, key, config) => {
    // 可以在这里添加成功后的统一处理
  },
  
  // 加载状态回调
  onLoadingSlow: (key, config) => {
    // 加载缓慢时的回调，可以显示加载提示
    console.warn('Loading slow:', key)
  }
}

// 专用于突变操作的配置
export const mutationConfig = {
  // 乐观更新的全局配置
  populateCache: true,
  revalidate: false, // 突变后不立即重新验证，等待 Server Action 触发
  
  // 突变错误处理
  onError: (error: any, key: string) => {
    console.error('Mutation Error:', { error, key })
    // 可以在这里添加全局错误提示
  }
}

// API 路径常量
export const API_ENDPOINTS = {
  // 工作流相关
  WORKFLOWS: '/api/workflows',
  WORKFLOW_DETAIL: (id: string) => `/api/workflows/${id}`,
  WORKFLOW_COMMENTS: (id: string) => `/api/workflows/${id}/comments`,
  WORKFLOW_INTERACTIONS: (id: string) => `/api/workflows/${id}/interactions`,
  
  // 用户相关
  USER_PROFILE: '/api/user/profile',
  USER_FAVORITES: '/api/user/favorites',
  USER_WORKFLOWS: '/api/user/workflows',
  
  // 类别和标签
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  
  // 统计和分析
  ANALYTICS: '/api/analytics',
  DASHBOARD_STATS: '/api/dashboard/stats'
} as const

// 缓存键生成器
export const generateCacheKey = {
  workflows: (params?: { 
    category?: string, 
    difficulty?: string, 
    status?: string,
    page?: number,
    limit?: number 
  }) => {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.difficulty) query.set('difficulty', params.difficulty)
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    return `${API_ENDPOINTS.WORKFLOWS}?${query.toString()}`
  },
  
  workflowDetail: (id: string) => API_ENDPOINTS.WORKFLOW_DETAIL(id),
  workflowComments: (id: string) => API_ENDPOINTS.WORKFLOW_COMMENTS(id),
  workflowInteractions: (id: string) => API_ENDPOINTS.WORKFLOW_INTERACTIONS(id),
  
  userProfile: () => API_ENDPOINTS.USER_PROFILE,
  userFavorites: () => API_ENDPOINTS.USER_FAVORITES,
  userWorkflows: (userId?: string) => userId 
    ? `${API_ENDPOINTS.USER_WORKFLOWS}?userId=${userId}`
    : API_ENDPOINTS.USER_WORKFLOWS
}

// 预设的 SWR 配置选项
export const swrPresets = {
  // 实时数据（频繁更新）
  realtime: {
    refreshInterval: 5000, // 5秒刷新
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  },
  
  // 静态数据（不常变化）
  static: {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000 // 1分钟内请求去重
  },
  
  // 用户交互数据（中等频率更新）
  interactive: {
    refreshInterval: 30000, // 30秒刷新
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  }
} 