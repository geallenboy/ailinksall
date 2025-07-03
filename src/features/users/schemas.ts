/**
 * 用户模块的 Schema
 * 使用 drizzle-zod 从 Drizzle Schema 生成 Zod Schema
 * 用于表单校验和 Server Actions 的输入验证
 */

import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '@/drizzle/schemas/users';

// ============== 用户表 Schema ==============

/**
 * 用户查询 Schema
 */
export const UserSelectSchema = createSelectSchema(users);

/**
 * 用户插入 Schema
 */
export const UserInsertSchema = createInsertSchema(users);

/**
 * 用户创建表单 Schema (管理员后台创建用户)
 */
export const CreateUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要8个字符'),
  fullName: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符'),
  bio: z.string().max(500, '简介不能超过500个字符').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  isActive: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
});

/**
 * 数据库用户插入 Schema (用于内部同步)
 */
export const DatabaseUserInsertSchema = z.object({
  id: z.string().min(1, '用户ID不能为空'),
  email: z.string().email('邮箱格式不正确'),
  fullName: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符').optional(),
  avatarUrl: z.string().url('头像URL格式不正确').optional(),
  bio: z.string().max(500, '简介不能超过500个字符').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  preferences: z.any().optional(),
  totalLearningTime: z.number().int().min(0, '学习时间不能为负数').default(0),
  isActive: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
});

/**
 * 用户更新表单 Schema
 */
export const UpdateUserSchema = z.object({
  email: z.string().email('邮箱格式不正确').optional(),
  fullName: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符').optional(),
  avatarUrl: z.string().url('头像URL格式不正确').optional(),
  bio: z.string().max(500, '简介不能超过500个字符').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferences: z.any().optional(),
  totalLearningTime: z.number().int().min(0, '学习时间不能为负数').optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  updatedAt: z.date().optional(),
}).partial();

/**
 * 用户资料更新 Schema
 */
export const UpdateUserProfileSchema = z.object({
  fullName: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过100个字符').optional(),
  bio: z.string().max(500, '简介不能超过500个字符').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferences: z.any().optional(),
});

/**
 * 用户管理权限更新 Schema
 */
export const UpdateUserAdminStatusSchema = z.object({
  isAdmin: z.boolean(),
});


// ============== 查询参数 Schema ==============

/**
 * 用户列表查询参数 Schema
 */
export const UserQueryParamsSchema = z.object({
  page: z.number().int().min(1, '页码必须大于0').default(1),
  limit: z.number().int().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(20),
  search: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isAdmin: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'email', 'totalLearningTime']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});



// ============== 导出类型 ==============

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserAdminStatusInput = z.infer<typeof UpdateUserAdminStatusSchema>;
