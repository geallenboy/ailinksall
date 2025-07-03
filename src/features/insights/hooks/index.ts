import useSWR from 'swr';
import { getInsightArticles, getTrendInsights } from '../actions';
import type { InsightArticle, TrendInsight } from '../types';

// SWR keys
export const INSIGHTS_KEYS = {
  articles: 'insights:articles',
  trends: 'insights:trends',
} as const;

// 获取洞察文章
export function useInsightArticles() {
  return useSWR<InsightArticle[]>(
    INSIGHTS_KEYS.articles,
    () => getInsightArticles(20),
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // 5分钟刷新一次
    }
  );
}

// 获取趋势洞察
export function useTrendInsights() {
  return useSWR<TrendInsight[]>(
    INSIGHTS_KEYS.trends,
    () => getTrendInsights(),
    {
      revalidateOnFocus: false,
      refreshInterval: 10 * 60 * 1000, // 10分钟刷新一次
    }
  );
}

// 获取特定趋势的文章
export function useArticlesByTrend(trendTag: string | null) {
  return useSWR<InsightArticle[]>(
    trendTag ? `insights:trend:${trendTag}` : null,
    async () => {
      if (!trendTag) return [];
      const allArticles = await getInsightArticles(100);
      return allArticles.filter(article => article.trendTag === trendTag);
    },
    {
      revalidateOnFocus: false,
    }
  );
} 