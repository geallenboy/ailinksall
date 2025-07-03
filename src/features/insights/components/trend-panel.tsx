'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles } from 'lucide-react';
import type { TrendInsight } from '../types';

interface TrendPanelProps {
  trends: TrendInsight[];
  onTrendClick?: (trendTag: string) => void;
}

export function TrendPanel({ trends, onTrendClick }: TrendPanelProps) {
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'rising':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declining':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateFutureScenarios = (trendTag: string) => {
    // 模拟未来场景生成（在真实环境中，这里会调用AI API）
    const scenarios = [
      {
        type: 'optimistic',
        title: '乐观场景：技术普及加速创新',
        description: `${trendTag}将彻底改变我们的工作方式，带来前所未有的效率提升。到2030年，这项技术将成为日常生活的一部分，创造出全新的职业机会和商业模式。`,
        icon: '🚀',
        probability: '30%'
      },
      {
        type: 'likely',
        title: '最可能场景：渐进式采用',
        description: `${trendTag}将在未来3-5年内逐步被主流市场接受。虽然不会立即颠覆现有模式，但会持续影响行业发展方向，智能化程度不断提升。`,
        icon: '📈',
        probability: '50%'
      },
      {
        type: 'cautious',
        title: '谨慎场景：挑战与机遇并存',
        description: `${trendTag}的发展可能面临技术壁垒、法规限制或用户接受度挑战。需要关注潜在风险，如隐私保护、就业影响等社会问题。`,
        icon: '⚠️',
        probability: '20%'
      }
    ];
    
    return scenarios;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            预见引擎：趋势分析
          </CardTitle>
          <p className="text-sm text-gray-600">
            点击任意趋势，AI将为您生成未来场景预测
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {trends.map((trend) => (
              <div
                key={trend.tag}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTrend === trend.tag 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedTrend(selectedTrend === trend.tag ? null : trend.tag);
                  onTrendClick?.(trend.tag);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getMomentumIcon(trend.momentum)}
                      <h3 className="font-medium text-gray-900">{trend.tag}</h3>
                    </div>
                    <Badge className={`text-xs ${getMomentumColor(trend.momentum)}`}>
                      {trend.count} 篇文章
                    </Badge>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedTrend === trend.tag ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
                
                {/* 趋势下的最新文章 */}
                {trend.recentArticles.length > 0 && (
                  <div className="mt-3 text-xs text-gray-600">
                    最新: {trend.recentArticles[0].title.slice(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 未来场景预测 */}
      {selectedTrend && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-purple-900">
              "{selectedTrend}" 的未来场景预测
            </CardTitle>
            <p className="text-sm text-purple-700">
              基于当前趋势，AI为您生成三种可能的未来发展路径
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generateFutureScenarios(selectedTrend).map((scenario, index) => (
                <div 
                  key={index}
                  className="bg-white p-4 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{scenario.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          概率 {scenario.probability}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-800">
                💡 <strong>提示：</strong> 这些场景基于当前数据趋势生成，仅供参考。真实的未来发展可能受到多种因素影响。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 