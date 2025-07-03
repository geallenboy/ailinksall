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
  const t = useTranslations();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI洞察引擎
        </h1>
        <p className="text-lg text-gray-600">
          从信息到智慧：让AI为您提炼价值，预见未来，指导行动
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
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTrend ? `"${selectedTrend}" 相关洞察` : '最新洞察'}
            </h2>
            {selectedTrend && (
              <button
                onClick={() => setSelectedTrend(null)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                查看全部
              </button>
            )}
          </div>

          {articlesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                暂时无法加载文章，请稍后再试。
              </p>
            </div>
          )}

          {articlesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {selectedTrend ? '该趋势下暂无相关文章' : '暂无文章'}
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-medium text-yellow-800 mb-2">
                🚀 体验AI洞察引擎
              </h3>
              <p className="text-yellow-700 text-sm mb-4">
                当前为演示版本，暂无实际数据。在真实环境中，这里会显示AI分析的最新科技资讯。
              </p>
              <div className="flex gap-2">
                <div className="bg-yellow-100 px-3 py-1 rounded text-xs text-yellow-800">
                  AI洞察分析
                </div>
                <div className="bg-yellow-100 px-3 py-1 rounded text-xs text-yellow-800">
                  个性化推荐
                </div>
                <div className="bg-yellow-100 px-3 py-1 rounded text-xs text-yellow-800">
                  趋势预测
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：趋势分析面板 */}
        <div className="space-y-6">
          {trendsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                暂时无法加载趋势数据。
              </p>
            </div>
          )}

          {trendsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 rounded-lg h-96"></div>
            </div>
          ) : trends && trends.length > 0 ? (
            <TrendPanel 
              trends={trends}
              onTrendClick={setSelectedTrend}
            />
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-medium text-purple-800 mb-2">
                🔮 预见引擎
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                当有足够数据时，AI会在这里为您分析技术趋势，并生成未来场景预测。
              </p>
              <div className="space-y-2">
                <div className="bg-purple-100 px-3 py-2 rounded text-xs text-purple-800">
                  📈 趋势识别与分析
                </div>
                <div className="bg-purple-100 px-3 py-2 rounded text-xs text-purple-800">
                  🚀 未来场景生成
                </div>
                <div className="bg-purple-100 px-3 py-2 rounded text-xs text-purple-800">
                  ⚡ 影响力评估
                </div>
              </div>
            </div>
          )}

          {/* 行动引擎提示 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-medium text-green-800 mb-2">
              🎯 行动引擎
            </h3>
            <p className="text-green-700 text-sm mb-4">
              {selectedRole 
                ? `作为${selectedRole}，每篇文章都会为您生成个性化的行动建议。`
                : '选择身份后，AI会为您生成个性化的行动计划。'
              }
            </p>
            <div className="space-y-2">
              <div className="bg-green-100 px-3 py-2 rounded text-xs text-green-800">
                📋 个性化行动清单
              </div>
              <div className="bg-green-100 px-3 py-2 rounded text-xs text-green-800">
                ⏰ 时间规划建议
              </div>
              <div className="bg-green-100 px-3 py-2 rounded text-xs text-green-800">
                🎯 优先级排序
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 