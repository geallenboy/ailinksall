// 📁 src/app/actions/user-actions.ts
"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { AIUserTable } from "@/drizzle/schema";

interface UserPayload {
    id: string;
    email: string;
    displayName?: string;
}

export const ensureUserExists = async (user: UserPayload) => {
    const existing = await db
        .select()
        .from(AIUserTable)
        .where(eq(AIUserTable.id, user.id));

    if (existing.length === 0) {
        await db.insert(AIUserTable).values({
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? null,
            credits: 100,
            isPro: false,
        });
    }
};

export const getUserById = async (userId: string) => {
    const [user] = await db
        .select()
        .from(AIUserTable)
        .where(eq(AIUserTable.id, userId));

    return user ?? null;
};

export const updateUserDisplayName = async (userId: string, displayName: string) => {
    await db
        .update(AIUserTable)
        .set({ displayName })
        .where(eq(AIUserTable.id, userId));
};

export const getUserCredits = async (userId: string) => {
    const [user] = await db
        .select({ credits: AIUserTable.credits })
        .from(AIUserTable)
        .where(eq(AIUserTable.id, userId));

    return user?.credits ?? 0;
};

export const updateUserCredits = async (userId: string, delta: number) => {
    await await db
        .update(AIUserTable)
        .set({
            credits: sql`${AIUserTable.credits} + ${delta}`,
        })
        .where(eq(AIUserTable.id, userId));
};

export const setUserProStatus = async (userId: string, isPro: boolean) => {
    await db
        .update(AIUserTable)
        .set({ isPro })
        .where(eq(AIUserTable.id, userId));
};
