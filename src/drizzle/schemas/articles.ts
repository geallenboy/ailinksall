import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  sourceUrl: varchar('source_url', { length: 1000 }),
  author: varchar('author', { length: 200 }),
  publishedAt: timestamp('published_at'),
  
  // AI洞察相关字段
  coreInsight: text('core_insight'), // 核心洞察（一句话总结）
  impactAnalysis: jsonb('impact_analysis'), // 对不同角色的影响分析
  trendTag: varchar('trend_tag', { length: 200 }), // 识别出的趋势标签
  
  // 元数据
  isProcessed: boolean('is_processed').default(false), // 是否已被AI处理
  aiScore: integer('ai_score'), // AI评估的重要性分数 (1-100)
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags'), // 标签数组
  
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

// 用户画像表
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 200 }).notNull().unique(), // Clerk用户ID
  role: varchar('role', { length: 100 }).notNull(), // 用户身份：developer, marketer, student, etc.
  interests: jsonb('interests'), // 兴趣标签数组
  preferences: jsonb('preferences'), // 用户偏好设置
  
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
});

// 未来场景表
export const futureScenarios = pgTable('future_scenarios', {
  id: serial('id').primaryKey(),
  trendTag: varchar('trend_tag', { length: 200 }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  scenario: text('scenario').notNull(), // 场景描述
  type: varchar('type', { length: 50 }).notNull(), // optimistic, cautious, likely
  impactLevel: integer('impact_level'), // 影响程度 1-10
  timeframe: varchar('timeframe', { length: 100 }), // 时间框架：2025, 2030等
  
  createdAt: timestamp('created_at').default(sql`now()`),
});

// 行动建议表
export const actionPlans = pgTable('action_plans', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id),
  userRole: varchar('user_role', { length: 100 }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  steps: jsonb('steps').notNull(), // 行动步骤数组
  difficulty: varchar('difficulty', { length: 50 }), // easy, medium, hard
  timeCommitment: varchar('time_commitment', { length: 100 }), // "1 week", "1 month"等
  
  createdAt: timestamp('created_at').default(sql`now()`),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type FutureScenario = typeof futureScenarios.$inferSelect;
export type ActionPlan = typeof actionPlans.$inferSelect; 