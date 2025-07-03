import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { User } from '@/types/user';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';
import { debugLog } from '@/lib/debug-logger';

// 同步Clerk用户到数据库
export async function syncClerkUserToDatabase(clerkUser: any): Promise<any | null> {
  if (!db || !clerkUser) {
    return null;
  }

  try {
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    
    // 构建fullName：优先使用firstName + lastName，如果没有则使用邮箱前缀
    let fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    if (!fullName && email) {
      // 从邮箱中提取用户名（@之前的部分）作为默认姓名
      const emailPrefix = email.split('@')[0];
      // 将数字、下划线、点替换为空格，并进行首字母大写处理
      fullName = emailPrefix
        .replace(/[0-9_.-]/g, ' ')
        .split(' ')
        .filter((word: string) => word.length > 0)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || emailPrefix;
    }
    const finalFullName = fullName || null;
    
    const avatar = clerkUser.imageUrl;

    if (!email) {
      debugLog.warn('Clerk用户没有邮箱地址');
      return null;
    }

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, clerkUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      // 更新现有用户
      const updatedUser = await db
        .update(users)
        .set({
          email,
          fullName: finalFullName,
          avatar,
          updatedAt: new Date(),
        })
        .where(eq(users.id, clerkUser.id))
        .returning();

      debugLog.log('用户信息已更新:', updatedUser[0]?.id);
      return updatedUser[0];
    } else {
      // 创建新用户
      const newUser = await db
        .insert(users)
        .values({
          email,
          fullName: finalFullName,
          avatar,
          id: clerkUser.id,
          skillLevel: 'beginner',
          isActive: true,
          isAdmin: false,
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
          totalLearningTime: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      debugLog.log('新用户已创建:', newUser[0]?.id);
      return newUser[0];
    }
  } catch (error) {
    debugLog.error('同步用户到数据库失败:', error);
    return null;
  }
}

// 从数据库获取用户信息
export async function getDbUserByClerkId(clerkId: string): Promise<any | null> {
  if (!db || !clerkId) {
    return null;
  }

  try {
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.id, clerkId))
      .limit(1);

    return dbUser.length > 0 ? dbUser[0] : null;
  } catch (error) {
    debugLog.error('从数据库获取用户失败:', error);
    return null;
  }
}

// 从Clerk获取当前用户（服务器端）
export async function getCurrentUser(_request?: NextRequest): Promise<User | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // 获取Clerk的完整用户信息
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // 尝试同步用户到数据库（如果数据库可用）
    if (db) {
      try {
        await syncClerkUserToDatabase(clerkUser);
      } catch (syncError) {
        debugLog.warn('用户同步失败，但不影响认证:', syncError);
      }
    }

    // 返回标准化的用户对象
    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    
    // 构建fullName：优先使用firstName + lastName，如果没有则使用邮箱前缀
    let fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    if (!fullName && email) {
      // 从邮箱中提取用户名（@之前的部分）作为默认姓名
      const emailPrefix = email.split('@')[0];
      // 将数字、下划线、点替换为空格，并进行首字母大写处理
      fullName = emailPrefix
        .replace(/[0-9_.-]/g, ' ')
        .split(' ')
        .filter((word: string) => word.length > 0)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || emailPrefix;
    }
    
    return {
      id: clerkUser.id,
      email,
      fullName: fullName || null,
      avatar: clerkUser.imageUrl || null,
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
    };
  } catch (error) {
    debugLog.error('获取当前用户失败:', error);
    return null;
  }
}

// 获取完整的用户信息（包含数据库信息）
export async function getCurrentUserWithDbInfo(_request?: NextRequest): Promise<{
  clerkUser: User | null;
  dbUser: any | null;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { clerkUser: null, dbUser: null };
    }

    // 获取Clerk用户信息
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return { clerkUser: null, dbUser: null };
    }

    // 获取数据库用户信息
    let dbUser = null;
    if (db) {
      dbUser = await getDbUserByClerkId(clerkUser.id);
      
      // 如果数据库中没有用户，尝试同步
      if (!dbUser) {
        dbUser = await syncClerkUserToDatabase(clerkUser);
      }
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    
    // 构建fullName：优先使用firstName + lastName，如果没有则使用邮箱前缀
    let fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    if (!fullName && email) {
      // 从邮箱中提取用户名（@之前的部分）作为默认姓名
      const emailPrefix = email.split('@')[0];
      // 将数字、下划线、点替换为空格，并进行首字母大写处理
      fullName = emailPrefix
        .replace(/[0-9_.-]/g, ' ')
        .split(' ')
        .filter((word: string) => word.length > 0)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || emailPrefix;
    }

    const standardizedClerkUser: User = {
      id: clerkUser.id,
      email,
      fullName: fullName || null,
      avatar: clerkUser.imageUrl || null,
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
    };

    return {
      clerkUser: standardizedClerkUser,
      dbUser,
    };
  } catch (error) {
    debugLog.error('获取用户信息失败:', error);
    return { clerkUser: null, dbUser: null };
  }
}

// 检查用户是否是管理员
export async function isAdmin(userOrId?: User | string | null): Promise<boolean> {
  try {
    let dbUser = null;

    if (typeof userOrId === 'string') {
      // 如果传入的是Clerk ID
      dbUser = await getDbUserByClerkId(userOrId);
    } else if (userOrId?.id) {
      // 如果传入的是User对象
      dbUser = await getDbUserByClerkId(userOrId.id);
    } else {
      // 获取当前用户
      const { userId } = await auth();
      if (userId) {
        dbUser = await getDbUserByClerkId(userId);
      }
    }

    return dbUser?.isAdmin === true;
  } catch (error) {
    debugLog.error('检查管理员权限失败:', error);
    return false;
  }
}

// 检查用户是否有效（激活状态）
export async function isActiveUser(userOrId?: User | string | null): Promise<boolean> {
  try {
    let dbUser = null;

    if (typeof userOrId === 'string') {
      dbUser = await getDbUserByClerkId(userOrId);
    } else if (userOrId?.id) {
      dbUser = await getDbUserByClerkId(userOrId.id);
    } else {
      const { userId } = await auth();
      if (userId) {
        dbUser = await getDbUserByClerkId(userId);
      }
    }

    return dbUser?.isActive === true;
  } catch (error) {
    debugLog.error('检查用户状态失败:', error);
    return true; // 默认返回true，不影响正常使用
  }
} 