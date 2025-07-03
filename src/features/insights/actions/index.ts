'use server';

import { db } from '@/drizzle';
import { articles, userProfiles } from '@/drizzle/schemas';
import { eq, desc, and, sql, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { Article } from '@/drizzle/schemas';
import type { InsightArticle, ImpactAnalysis, TrendInsight } from '../types';

// 获取所有带洞察的文章
export async function getInsightArticles(limit = 20): Promise<InsightArticle[]> {
  try {
    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.isProcessed, true))
      .orderBy(desc(articles.aiScore), desc(articles.createdAt))
      .limit(limit);

    return result.map((article: Article) => ({
      ...article,
      publishedAt: article.publishedAt || undefined,
      impactAnalysis: article.impactAnalysis as ImpactAnalysis | undefined,
      tags: (article.tags as string[]) || [],
    }));
  } catch (error) {
    console.error('Error fetching insight articles:', error);
    return [];
  }
}

// 获取趋势洞察
export async function getTrendInsights(): Promise<TrendInsight[]> {
  try {
    const result = await db
      .select({
        trendTag: articles.trendTag,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .where(and(
        isNotNull(articles.trendTag),
        eq(articles.isProcessed, true)
      ))
      .groupBy(articles.trendTag)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // 为每个趋势获取最新文章
    const trends: TrendInsight[] = [];
    for (const trend of result) {
      if (trend.trendTag) {
        const recentArticles = await db
          .select()
          .from(articles)
          .where(and(
            eq(articles.trendTag, trend.trendTag),
            eq(articles.isProcessed, true)
          ))
          .orderBy(desc(articles.createdAt))
          .limit(3);

        trends.push({
          tag: trend.trendTag,
          count: trend.count,
          recentArticles: recentArticles.map((article: Article) => ({
            ...article,
            publishedAt: article.publishedAt || undefined,
            impactAnalysis: article.impactAnalysis as ImpactAnalysis | undefined,
            tags: (article.tags as string[]) || [],
          })),
          momentum: trend.count > 5 ? 'rising' : 'stable', // 简单的动量计算
        });
      }
    }

    return trends;
  } catch (error) {
    console.error('Error fetching trend insights:', error);
    return [];
  }
}

// 创建新文章（模拟AI处理）
export async function createArticleWithInsight(data: {
  title: string;
  content: string;
  sourceUrl?: string;
  author?: string;
}) {
  try {
    // 模拟AI洞察生成（在真实环境中，这里会调用AI API）
    const mockInsights = generateMockInsights(data.title, data.content);

    const result = await db.insert(articles).values({
      ...data,
      ...mockInsights,
      isProcessed: true,
      publishedAt: new Date(),
    }).returning();

    revalidatePath('/insights');
    return result[0];
  } catch (error) {
    console.error('Error creating article with insight:', error);
    throw new Error('Failed to create article');
  }
}

// 模拟AI洞察生成函数（MVP阶段使用）
function generateMockInsights(title: string, content: string) {
  const keywords = title.toLowerCase();
  
  let coreInsight = "";
  let trendTag = "";
  let impactAnalysis: ImpactAnalysis = {};
  let aiScore = Math.floor(Math.random() * 40) + 60; // 60-100分
  
  if (keywords.includes('ai') || keywords.includes('artificial intelligence')) {
    coreInsight = "AI技术的发展正在重新定义人机交互的边界，这将深刻影响未来工作方式。";
    trendTag = "AI革命";
    impactAnalysis = {
      developers: "需要学习AI集成技术，掌握提示工程和AI模型微调。",
      business: "应考虑AI自动化如何优化业务流程，提高效率。",
      users: "将体验到更智能的产品界面和个性化服务。"
    };
  } else if (keywords.includes('automation') || keywords.includes('n8n')) {
    coreInsight = "自动化工具的普及正在降低技术门槛，让更多人能够构建复杂的工作流程。";
    trendTag = "低代码自动化";
    impactAnalysis = {
      developers: "自动化技能将成为核心竞争力，需要掌握低代码/无代码平台。",
      business: "可以通过自动化显著减少重复性工作，提升团队效率。",
      users: "工作流程将变得更加顺畅，减少手动操作。"
    };
  } else if (keywords.includes('startup') || keywords.includes('funding')) {
    coreInsight = "创业生态的变化反映了市场对新技术的接受度和投资热点的转移。";
    trendTag = "创业趋势";
    impactAnalysis = {
      developers: "关注被投资项目的技术栈，这些往往代表未来的技术方向。",
      business: "了解投资动向有助于识别新的商业机会和竞争态势。",
      users: "新获得资金的产品可能提供更好的用户体验和创新功能。"
    };
  } else {
    coreInsight = "技术发展的背后往往蕴含着社会和商业模式的深层变革。";
    trendTag = "技术趋势";
    impactAnalysis = {
      developers: "保持对新技术的敏感度，持续学习和适应变化。",
      business: "评估新技术对现有业务模式的潜在影响。",
      users: "新技术将带来更好的产品体验和服务质量。"
    };
  }

  return {
    coreInsight,
    trendTag,
    impactAnalysis,
    aiScore,
    category: determineCategory(keywords),
    tags: extractTags(title, content),
  };
}

function determineCategory(keywords: string): string {
  if (keywords.includes('ai') || keywords.includes('machine learning')) return 'AI/ML';
  if (keywords.includes('automation') || keywords.includes('workflow')) return '自动化';
  if (keywords.includes('startup') || keywords.includes('funding')) return '创业投资';
  if (keywords.includes('web3') || keywords.includes('blockchain')) return 'Web3';
  return '科技资讯';
}

function extractTags(title: string, content: string): string[] {
  const text = (title + ' ' + content).toLowerCase();
  const tagMap: Record<string, string> = {
    'ai': 'AI',
    'artificial intelligence': 'AI',
    'machine learning': '机器学习',
    'automation': '自动化',
    'workflow': '工作流',
    'n8n': 'n8n',
    'startup': '创业',
    'funding': '融资',
    'web3': 'Web3',
    'blockchain': '区块链',
    'productivity': '生产力',
  };
  
  const tags: string[] = [];
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (text.includes(keyword)) {
      tags.push(tag);
    }
  }
  
  return [...new Set(tags)]; // 去重
} 