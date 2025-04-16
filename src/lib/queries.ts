// 📁 src/lib/queries.ts（或与你数据库逻辑统一的文件中）
import { db } from '@/drizzle/db'
import { AIUserTable } from '@/drizzle/schema'
import { eq } from "drizzle-orm";
/**
 * 确保用户记录存在于业务数据库中（如 Supabase Auth 登录成功后）
 * 如果用户首次登录，则插入一条默认数据
 */
export const ensureUserExists = async (user: { id: string; email: string }) => {
    const existing = await db
        .select()
        .from(AIUserTable)
        .where(eq(AIUserTable.id, user.id))

    if (existing.length === 0) {
        await db.insert(AIUserTable).values({
            id: user.id,
            email: user.email,
            credits: 100, // 默认积分
            isPro: false,
        })
    }
}
