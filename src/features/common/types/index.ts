
export interface PaginationInfoType {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  export interface PaginatedResponseType<T> {
    success: boolean;
    data?: T[];
    pagination?: PaginationInfoType;
    error?: string;
  }
  export interface ActionResponseType<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  } 
  
  /**
   * 所有 Server Action 的标准返回类型。
   * @template T 成功时返回的数据类型。
   */
  export interface ActionResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    error: string | null;
  }
  
  /**
   * 创建一个标准的成功响应对象。
   * @param data - Action 成功时要返回的数据。
   * @param message - （可选）成功消息。
   */
  export function createSuccessResponse<T>(
    data: T,
    message: string = '操作成功'
  ): ActionResponse<T> {
    return {
      success: true,
      data,
      message,
      error: null,
    };
  }
  
  /**
   * 创建一个标准的失败响应对象。
   * @param message - （必须）用户友好的错误消息。
   * @param errorDetails - （可选）供开发者调试的详细错误信息。
   */
  export function createErrorResponse<T = null>(
    message: string,
    errorDetails?: string
  ): ActionResponse<T> {
    // 在服务器端打印详细错误，以便调试
    if (errorDetails) {
      console.error(`Action Error: ${errorDetails}`);
    }
    return {
      success: false,
      data: null as T,
      message,
      error: errorDetails || message, // error 字段可以包含更技术性的信息
    };
  } 