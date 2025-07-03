/**
 * 用户模块的类型定义
 * 基于 src/drizzle/schemas/users.ts 的数据库表结构
 * 用户页面、组件中使用到的类型
 */

import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { users } from '@/drizzle/schemas/users';

// ============== 用户表 (Users) ==============

/**
 * 用户查询类型 - 用于读取操作
 */
export type User = InferSelectModel<typeof users>;

/**
 * 用户插入类型 - 用于创建操作
 */
export type UserInsert = InferInsertModel<typeof users>;

/**
 * 用户更新类型 - 用于更新操作（所有字段可选）
 */
export type UserUpdate = Partial<Omit<UserInsert, 'id' | 'createdAt'>>;


// ============== 扩展类型 (Extended Types) ==============

/**
 * 用户列表项类型 - 用于用户列表显示
 */
export interface UserListItem {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
  isAdmin: boolean;
  isActive: boolean;
  totalLearningTime?: number | null;
  createdAt: Date;
  updatedAt: Date;
}


/**
 * 用户查询参数类型
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  isAdmin?: boolean;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | 'totalLearningTime';
  sortOrder?: 'asc' | 'desc';
}
