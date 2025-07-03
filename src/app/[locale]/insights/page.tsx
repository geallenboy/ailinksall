'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  InsightArticleCard, 
  TrendPanel, 
  UserRoleSelector,
  useInsightArticles,
  useTrendInsights,
  type UserRole 
} from '@/features/insights';

export default function InsightsPage() {
  const t = useTranslations('insights');
  const [selectedRole, setSelectedRole] = useState<UserRole>();
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);

  const { data: articles, isLoading: articlesLoading, error: articlesError } = useInsightArticles();
  const { data: trends, isLoading: trendsLoading, error: trendsError } = useTrendInsights();

  // 过滤文章（如果选择了特定趋势）
  const filteredArticles = selectedTrend 
    ? articles?.filter(article => article.trendTag === selectedTrend)
    : articles;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('subtitle')}
        </p>
      </div>

      {/* 用户角色选择器 */}
      <UserRoleSelector 
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：洞察文章列表 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {selectedTrend ? t('relatedInsightsTitle', { trend: selectedTrend }) : t('latestInsightsTitle')}
            </h2>
            {selectedTrend && (
              <button
                onClick={() => setSelectedTrend(null)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('viewAll')}
              </button>
            )}
          </div>

          {articlesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">
                {t('errors.articles')}
              </p>
            </div>
          )}

          {articlesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedTrend ? t('noArticlesForTrend') : t('noArticles')}
                  </p>
                </div>
              ) : (
                filteredArticles?.map((article) => (
                  <InsightArticleCard
                    key={article.id}
                    article={article}
                    userRole={selectedRole}
                  />
                ))
              )}
            </div>
          )}

          {/* 示例数据提示 */}
          {!articlesLoading && !articlesError && (!articles || articles.length === 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                🚀 {t('demo.insights.title')}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-4">
                {t('demo.insights.description')}
              </p>
              <div className="flex gap-2">
                <div className="bg-yellow-100 dark:bg-yellow-800/50 px-3 py-1 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  {t('demo.insights.tags.analysis')}
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-800/50 px-3 py-1 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  {t('demo.insights.tags.recommendation')}
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-800/50 px-3 py-1 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  {t('demo.insights.tags.prediction')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：趋势分析面板 */}
        <div className="space-y-6">
          {trendsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 text-sm">
                {t('errors.trends')}
              </p>
            </div>
          )}

          {trendsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
            </div>
          ) : trends && trends.length > 0 ? (
            <TrendPanel 
              trends={trends}
              onTrendClick={setSelectedTrend}
            />
          ) : (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                🔮 {t('demo.foresight.title')}
              </h3>
              <p className="text-purple-700 dark:text-purple-400 text-sm mb-4">
                {t('demo.foresight.description')}
              </p>
              <div className="space-y-2">
                <div className="bg-purple-100 dark:bg-purple-800/50 px-3 py-2 rounded text-xs text-purple-800 dark:text-purple-200">
                  📈 {t('demo.foresight.tags.analysis')}
                </div>
                <div className="bg-purple-100 dark:bg-purple-800/50 px-3 py-2 rounded text-xs text-purple-800 dark:text-purple-200">
                  🚀 {t('demo.foresight.tags.scenario')}
                </div>
                <div className="bg-purple-100 dark:bg-purple-800/50 px-3 py-2 rounded text-xs text-purple-800 dark:text-purple-200">
                  ⚡ {t('demo.foresight.tags.impact')}
                </div>
              </div>
            </div>
          )}

          {/* 行动引擎提示 */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
              🎯 {t('demo.action.title')}
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm mb-4">
              {selectedRole 
                ? t('demo.action.descriptionWithRole', { role: selectedRole })
                : t('demo.action.descriptionWithoutRole')
              }
            </p>
            <div className="space-y-2">
              <div className="bg-green-100 dark:bg-green-800/50 px-3 py-2 rounded text-xs text-green-800 dark:text-green-200">
                📋 {t('demo.action.tags.checklist')}
              </div>
              <div className="bg-green-100 dark:bg-green-800/50 px-3 py-2 rounded text-xs text-green-800 dark:text-green-200">
                ⏰ {t('demo.action.tags.planning')}
              </div>
              <div className="bg-green-100 dark:bg-green-800/50 px-3 py-2 rounded text-xs text-green-800 dark:text-green-200">
                🎯 {t('demo.action.tags.priority')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 