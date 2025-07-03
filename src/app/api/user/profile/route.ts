import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';


export async function GET(request: NextRequest) {
  try {
    // 从Authorization header获取token
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // 处理Bearer token
      const token = authHeader.substring(7);
      try {
        // 这里应该验证token，但为了简化，我们使用Clerk的auth()
        const { userId: clerkUserId } = await auth();
        userId = clerkUserId;
      } catch (error) {
        console.error('Bearer token验证失败:', error);
      }
    }

    // fallback到标准auth()方法
    if (!userId) {
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查询数据库中的用户信息 - 使用id字段而不是providerId
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userList[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('获取用户资料失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 