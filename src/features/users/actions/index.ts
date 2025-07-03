/**
 * 用户模块 Server Actions
 * 处理所有与用户相关的服务端操作
 */

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schemas/users';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { 
  CreateUserSchema, 
  UpdateUserSchema,
  UpdateUserProfileSchema,
  UpdateUserAdminStatusSchema,
  UserQueryParamsSchema,
} from '@/features/users/schemas'; 

import { 
  createSuccessResponse, 
  createErrorResponse 
} from '@/features/common/types';
import { UserQueryParams } from '@/features/users/types';

// ============== 用户相关操作 ==============

/**
 * 获取用户列表
 */
export async function getUsers(params?: UserQueryParams) {
  try {
    if (!db) {
      throw new Error('数据库连接未初始化');
    }
    
    const validatedParams = UserQueryParamsSchema.parse(params || {});
    const { page, limit, search, skillLevel, isAdmin, isActive, sortBy, sortOrder } = validatedParams;
    
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    if (skillLevel) {
      whereConditions.push(eq(users.skillLevel, skillLevel));
    }
    if (typeof isAdmin === 'boolean') {
      whereConditions.push(eq(users.isAdmin, isAdmin));
    }
    if (typeof isActive === 'boolean') {
      whereConditions.push(eq(users.isActive, isActive));
    }
    
    // 构建排序
    const orderBy = sortOrder === 'asc' ? asc : desc;
    let sortColumn;
    switch (sortBy) {
      case 'fullName':
        sortColumn = users.fullName;
        break;
      case 'email':
        sortColumn = users.email;
        break;
      case 'totalLearningTime':
        sortColumn = users.totalLearningTime;
        break;
      case 'updatedAt':
        sortColumn = users.updatedAt;
        break;
      default:
        sortColumn = users.createdAt;
    }
    
    // 获取总数
    const totalQuery = db
      .select({ total: count() })
      .from(users);
    
    if (whereConditions.length > 0) {
      totalQuery.where(and(...whereConditions));
    }
    
    const [{ total }] = await totalQuery;
    
    // 获取用户列表
    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        skillLevel: users.skillLevel,
        isAdmin: users.isAdmin,
        isActive: users.isActive,
        totalLearningTime: users.totalLearningTime,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(orderBy(sortColumn))
      .limit(limit)
      .offset(offset);
    
    return {
      data: usersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw new Error('获取用户列表失败');
  }
}

/**
 * 根据ID获取用户
 */
export async function getUserById(id: string) {
  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    if (userResult.length === 0) {
      return null;
    }
    
    const user = userResult[0];
    return {
      ...user.users,
    };
  } catch (error) {
    console.error('获取用户失败:', error);
    throw new Error('获取用户失败');
  }
}

/**
 * 通过Clerk API创建用户（管理员后台使用）
 */
export async function createUser(data: unknown) {
  try {
    const validatedData = CreateUserSchema.parse(data);
    
    // 导入Clerk client
    const { clerkClient } = await import('@clerk/nextjs/server');
    const clerk = await clerkClient();
    
    // 通过Clerk API创建用户
    const clerkUser = await clerk.users.createUser({
      emailAddress: [validatedData.email],
      password: validatedData.password,
      firstName: validatedData.fullName?.split(' ')[0] || '',
      lastName: validatedData.fullName?.split(' ').slice(1).join(' ') || '',
      publicMetadata: {
        skillLevel: validatedData.skillLevel,
        isAdmin: validatedData.isAdmin,
      },
      privateMetadata: {
        createdByAdmin: true,
      },
    });

    // 同步用户信息到数据库
    const [newUser] = await db
      .insert(users)
      .values({
        id: clerkUser.id,
        email: validatedData.email,
        fullName: validatedData.fullName,
        bio: validatedData.bio || null,
        skillLevel: validatedData.skillLevel,
        isAdmin: validatedData.isAdmin || false,
        isActive: validatedData.isActive !== false,
        totalLearningTime: 0,
        preferences: {
          language: 'zh',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            comments: true,
            newTutorials: true,
          },
          learningGoals: [],
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // 重新验证相关页面缓存
    revalidatePath('/backend/users');
    
    return createSuccessResponse(newUser, '用户创建成功');
  } catch (error) {
    console.error('创建用户失败:', error);
    
    // 处理Clerk API错误
    if (error && typeof error === 'object' && 'errors' in error) {
      const clerkError = error as any;
      if (clerkError.errors && clerkError.errors.length > 0) {
        const firstError = clerkError.errors[0];
        if (firstError.code === 'form_identifier_exists') {
          return createErrorResponse('邮箱地址已存在');
        }
        return createErrorResponse(firstError.message || '创建用户失败');
      }
    }
    
    return createErrorResponse('创建用户失败：' + (error as Error).message);
  }
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: unknown) {
  try {
    const validatedData = UpdateUserSchema.parse(data);
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('更新用户失败:', error);
    return { success: false, error: '更新用户失败' };
  }
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(id: string, data: unknown) {
  try {
    const validatedData = UpdateUserProfileSchema.parse(data);
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return { success: false, error: '更新用户资料失败' };
  }
}

/**
 * 更新用户管理员状态
 */
export async function updateUserAdminStatus(id: string, data: unknown) {
  try {
    const validatedData = UpdateUserAdminStatusSchema.parse(data);
    
    const [updatedUser] = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('更新用户管理员状态失败:', error);
    return { success: false, error: '更新用户管理员状态失败' };
  }
}

/**
 * 删除用户
 */
export async function deleteUser(id: string) {
  try {
    await db
      .delete(users)
      .where(eq(users.id, id));
    
    return { success: true };
  } catch (error) {
    console.error('删除用户失败:', error);
    return { success: false, error: '删除用户失败' };
  }
}


