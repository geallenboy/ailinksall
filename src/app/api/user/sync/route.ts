import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';

// 强制使用 Node.js 运行时，因为我们需要访问数据库
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    
    // 验证用户身份 - 支持多种认证方式
    let userId: string | null = null;
    
    // 方式1: 尝试从Clerk的标准认证中获取
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log('API: 从标准auth()获取用户ID:', userId);
    } catch (authError) {
      console.log('API: 标准auth()失败:', authError);
    }
    
    // 方式2: 如果标准方式失败，尝试从Authorization header获取token
    // if (!userId) {
    //   const authHeader = request.headers.get('authorization');
    //   if (authHeader && authHeader.startsWith('Bearer ')) {
    //     console.log('API: 尝试从Authorization header验证token...');
    //     // 这里我们暂时相信客户端传来的token是有效的
    //     // 在生产环境中应该验证token的有效性
    //     const token = authHeader.substring(7);
    //     if (token) {
    //       // 再次尝试获取auth信息
    //       try {
    //         const retryAuth = await auth();
    //         userId = retryAuth.userId;
    //         console.log('API: 重试auth()成功，用户ID:', userId);
    //       } catch (retryError) {
    //         console.log('API: 重试auth()仍然失败:', retryError);
    //       }
    //     }
    //   }
    // }
    
    if (!userId) {
      console.log('API: 用户未授权 - 无法获取有效的用户ID');
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, fullName, avatar, provider, providerId } = body;

    console.log('API: 接收到的用户数据:', {
      userId,
      email,
      fullName,
      hasAvatar: !!avatar,
      provider,
      providerId
    });

    // 验证必要字段
    if (!email) {
      console.log('API: 邮箱地址为空');
      return NextResponse.json(
        { success: false, error: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 验证数据库连接
    if (!db) {
      console.error('API: 数据库连接不可用');
      return NextResponse.json(
        { success: false, error: '数据库连接不可用' },
        { status: 500 }
      );
    }

    // 检查用户是否已存在（按ID和邮箱都检查）
    const existingUserById = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;
    let action: 'created' | 'updated';

    // 如果按ID找到用户，更新它
    if (existingUserById.length > 0) {
      console.log('API: 按ID找到现有用户，更新用户信息');
      const [updatedUser] = await db
        .update(users)
        .set({
          email,
          fullName: fullName || existingUserById[0].fullName,
          avatarUrl: avatar || existingUserById[0].avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      user = updatedUser;
      action = 'updated';
    } 
    // 如果按邮箱找到用户但ID不同，说明这是一个已存在的邮箱
    else if (existingUserByEmail.length > 0 && existingUserByEmail[0].id !== userId) {
      console.log('API: 邮箱已存在但ID不同，更新现有记录的ID');
      // 更新现有记录的ID为当前Clerk用户ID
      const [updatedUser] = await db
        .update(users)
        .set({
          id: userId,
          fullName: fullName || existingUserByEmail[0].fullName,
          avatarUrl: avatar || existingUserByEmail[0].avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .returning();

      user = updatedUser;
      action = 'updated';
    }
    // 如果按邮箱找到用户且ID相同，更新信息
    else if (existingUserByEmail.length > 0 && existingUserByEmail[0].id === userId) {
      console.log('API: 按邮箱找到现有用户，更新用户信息');
      const [updatedUser] = await db
        .update(users)
        .set({
          fullName: fullName || existingUserByEmail[0].fullName,
          avatarUrl: avatar || existingUserByEmail[0].avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email))
        .returning();

      user = updatedUser;
      action = 'updated';
    }
    // 创建新用户
    else {
      console.log('API: 创建新用户');
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          email,
          fullName: fullName || email.split('@')[0],
          avatarUrl: avatar,
          bio: null,
          skillLevel: 'beginner',
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
          isActive: true,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      user = newUser;
      action = 'created';
    }

    console.log(`API: 用户${action}成功:`, {
      userId: user.id,
      email: user.email,
      action
    });

    return NextResponse.json({
      success: true,
      data: user,
      action,
      message: action === 'created' ? '用户创建成功' : '用户信息更新成功',
    });

  } catch (error) {
    console.error('API: 用户同步失败:', error);
    
    // 更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorDetails = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };
    
    return NextResponse.json(
      {
        success: false,
        error: '用户同步失败',
        details: errorMessage,
        debugInfo: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
} 