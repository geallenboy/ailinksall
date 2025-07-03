export interface InsightArticle {
  id: number;
  title: string;
  content: string;
  summary?: string;
  sourceUrl?: string;
  author?: string;
  publishedAt?: Date;
  
  // AI洞察
  coreInsight?: string;
  impactAnalysis?: {
    developers?: string;
    business?: string;
    users?: string;
  };
  trendTag?: string;
  
  // 元数据
  isProcessed: boolean;
  aiScore?: number;
  category?: string;
  tags?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ImpactAnalysis {
  developers?: string;
  business?: string;
  users?: string;
}

export interface TrendInsight {
  tag: string;
  count: number;
  recentArticles: InsightArticle[];
  momentum: 'rising' | 'stable' | 'declining';
}

export type UserRole = 'developer' | 'marketer' | 'student' | 'business' | 'investor' | 'researcher'; 