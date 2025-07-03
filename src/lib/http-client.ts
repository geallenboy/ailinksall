import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// 响应数据类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 扩展axios配置类型
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// 请求配置类型
export interface HttpClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}

// 创建axios实例
const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  client.interceptors.request.use(
    async (config: ExtendedAxiosRequestConfig) => {
      // 添加认证头 (在客户端运行时通过其他方式获取token)
      if (!config.skipAuth && typeof window !== 'undefined') {
        try {
          // 在客户端环境下，可以从localStorage或其他地方获取token
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
          if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.warn('获取认证token失败:', error)
        }
      }

      // 添加请求ID用于追踪
      config.headers = config.headers || {}
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      // 统一处理成功响应
      return response
    },
    (error: AxiosError<ApiResponse>) => {
      // 统一错误处理
      const config = error.config as ExtendedAxiosRequestConfig
      if (!config?.skipErrorHandler) {
        handleHttpError(error)
      }
      return Promise.reject(error)
    }
  )

  return client
}

// 错误处理函数
const handleHttpError = (error: AxiosError<ApiResponse>) => {
  const { response, request, message } = error

  if (response) {
    // 服务器响应了错误状态码
    const { status, data } = response
    console.error('HTTP错误:', {
      status,
      message: data?.error || data?.message || '请求失败',
      url: response.config?.url,
      requestId: response.config?.headers?.['X-Request-ID']
    })

    // 特殊状态码处理
    switch (status) {
      case 401:
        // 未授权 - 可以触发重新登录
        console.warn('用户未授权，需要重新登录')
        break
      case 403:
        // 禁止访问
        console.warn('访问被禁止')
        break
      case 404:
        // 资源未找到
        console.warn('请求的资源不存在')
        break
      case 429:
        // 请求过于频繁
        console.warn('请求过于频繁，请稍后重试')
        break
      case 500:
        // 服务器内部错误
        console.error('服务器内部错误')
        break
    }
  } else if (request) {
    // 请求已发出但没有收到响应
    console.error('网络错误:', {
      message: '请求超时或网络不可用',
      url: request.responseURL
    })
  } else {
    // 请求配置错误
    console.error('请求配置错误:', message)
  }
}

// 创建HTTP客户端实例
export const httpClient = createHttpClient()

// 便捷方法
export const http = {
  get: <T = any>(url: string, config?: HttpClientConfig) => 
    httpClient.get<ApiResponse<T>>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: HttpClientConfig) => 
    httpClient.post<ApiResponse<T>>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: HttpClientConfig) => 
    httpClient.put<ApiResponse<T>>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: HttpClientConfig) => 
    httpClient.patch<ApiResponse<T>>(url, data, config),
    
  delete: <T = any>(url: string, config?: HttpClientConfig) => 
    httpClient.delete<ApiResponse<T>>(url, config),
}

// 文件上传专用方法
export const uploadFile = async (
  url: string, 
  file: File | FormData, 
  config?: HttpClientConfig & {
    onProgress?: (progress: number) => void
  }
) => {
  const formData = file instanceof FormData ? file : new FormData()
  if (file instanceof File) {
    formData.append('file', file)
  }

  return httpClient.post<ApiResponse<any>>(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && config?.onProgress) {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        config.onProgress(progress)
      }
    },
  })
}

// 外部API请求（跳过认证和错误处理）
export const externalHttp = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    axios.get<T>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axios.post<T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axios.put<T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    axios.delete<T>(url, config),
}

// 导出类型
export type { AxiosResponse, AxiosError, AxiosRequestConfig } 