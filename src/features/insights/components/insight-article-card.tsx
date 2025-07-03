'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Brain, Target, Calendar, ExternalLink } from 'lucide-react';
import type { InsightArticle, UserRole } from '../types';

interface InsightArticleCardProps {
  article: InsightArticle;
  userRole?: UserRole;
}

export function InsightArticleCard({ article, userRole }: InsightArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getImpactForRole = (role?: UserRole) => {
    if (!article.impactAnalysis || !role) return null;
    
    const impactMap: Record<UserRole, keyof typeof article.impactAnalysis> = {
      developer: 'developers',
      business: 'business',
      marketer: 'business',
      student: 'developers',
      investor: 'business',
      researcher: 'developers',
    };
    
    const key = impactMap[role];
    return article.impactAnalysis[key];
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const userImpact = getImpactForRole(userRole);

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {article.aiScore && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Brain className="w-3 h-3 mr-1" />
                {article.aiScore}
              </Badge>
            )}
            {article.category && (
              <Badge variant="outline">{article.category}</Badge>
            )}
          </div>
        </div>

        {/* 核心洞察 */}
        {article.coreInsight && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 text-sm mb-1">核心洞察</p>
                <p className="text-blue-800 text-sm leading-relaxed">{article.coreInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* 个性化影响分析 */}
        {userImpact && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900 text-sm mb-1">对您的影响</p>
                <p className="text-green-800 text-sm leading-relaxed">{userImpact}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 文章摘要 */}
        {article.summary && (
          <p className="text-gray-600 text-sm leading-relaxed">{article.summary}</p>
        )}

        {/* 标签和趋势 */}
        <div className="flex flex-wrap gap-2">
          {article.trendTag && (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              🔥 {article.trendTag}
            </Badge>
          )}
          {article.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 展开/收起按钮 */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              {isExpanded ? (
                <>
                  收起详情 <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  查看详情 <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* 全部影响分析 */}
            {article.impactAnalysis && (
              <div className="grid gap-3">
                <h4 className="font-medium text-sm text-gray-900">影响分析</h4>
                {article.impactAnalysis.developers && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-xs text-gray-700 mb-1">📱 对开发者</p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {article.impactAnalysis.developers}
                    </p>
                  </div>
                )}
                {article.impactAnalysis.business && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-xs text-gray-700 mb-1">💼 对企业</p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {article.impactAnalysis.business}
                    </p>
                  </div>
                )}
                {article.impactAnalysis.users && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-xs text-gray-700 mb-1">👥 对用户</p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {article.impactAnalysis.users}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 文章元信息 */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
              <div className="flex items-center gap-4">
                {article.author && (
                  <span>作者: {article.author}</span>
                )}
                {article.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </div>
                )}
              </div>
              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  查看原文 <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
} 