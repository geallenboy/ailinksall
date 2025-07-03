/**
 * Users 模块常量定义
 * SWR Keys 和其他常量
 */

import {
  type UserQueryParams,
} from './types';

// ============== SWR Keys ==============

/**
 * 用户相关的 SWR Key 工厂函数
 */
export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (params: UserQueryParams) => [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
  stats: () => [...USER_KEYS.all, 'stats'] as const,
};

/**
 * 作者相关的 SWR Key 工厂函数
 */
export const AUTHOR_KEYS = {
  all: ['authors'] as const,
  lists: () => [...AUTHOR_KEYS.all, 'list'] as const,
  details: () => [...AUTHOR_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AUTHOR_KEYS.details(), id] as const,
  stats: () => [...AUTHOR_KEYS.all, 'stats'] as const,
};

/**
 * 标签相关的 SWR Key 工厂函数
 */
export const TAG_KEYS = {
  all: ['tags'] as const,
  lists: () => [...TAG_KEYS.all, 'list'] as const,
  details: () => [...TAG_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TAG_KEYS.details(), id] as const,
};


/**
 * 分页默认设置
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  userLimit: 20,
  authorLimit: 20,
  tagLimit: 50,
} as const;
