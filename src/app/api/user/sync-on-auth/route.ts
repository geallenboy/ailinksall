import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';

// 强制使用 Node.js 运行时，因为我们需要访问数据库
export const runtime = 'nodejs';

/**
 * 登录时的用户同步API
 * 只在用户登录/注册时调用一次，检查是否需要创建用户记录
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 登录同步: 开始处理用户同步请求...');
    
    // 验证用户身份
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      console.log('❌ 登录同步: 用户未授权');
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, fullName, avatar } = body;

    console.log('🔄 登录同步: 接收到的用户数据:', {
      userId,
      email,
      fullName,
      hasAvatar: !!avatar,
    });

    // 验证必要字段
    if (!email) {
      console.log('❌ 登录同步: 邮箱地址为空');
      return NextResponse.json(
        { success: false, error: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 验证数据库连接
    if (!db) {
      console.error('❌ 登录同步: 数据库连接不可用');
      return NextResponse.json(
        { success: false, error: '数据库连接不可用' },
        { status: 500 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length > 0) {
      // 用户已存在，直接返回
      console.log('✅ 登录同步: 用户已存在，跳过创建:', existingUser[0].id);
      return NextResponse.json({
        success: true,
        data: existingUser[0],
        action: 'exists',
        message: '用户已存在',
      });
    }

    // 创建新用户
    console.log('🆕 登录同步: 创建新用户');
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

    console.log('✅ 登录同步: 新用户创建成功:', newUser.id);

    return NextResponse.json({
      success: true,
      data: newUser,
      action: 'created',
      message: '用户创建成功',
    });

  } catch (error) {
    console.error('❌ 登录同步: 用户同步失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '内部服务器错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 