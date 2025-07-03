'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Lightbulb,
  Zap 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-6">
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI时代的认知增强伙伴
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            从信息到智慧
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              让AI为您思考
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            在AI时代，我们面临信息极度丰富却有效信息极度稀缺的悖论。
            <br />
            <strong>AI导航总站</strong>不再是内容提供者，而是您的<strong>认知减负者</strong>和<strong>价值提炼者</strong>。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/zh/insights">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                体验AI洞察引擎
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* 价值层次展示 */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            四个层次的价值提升
          </h2>
          <p className="text-gray-600">
            我们用AI将您从底层信息不断向上提升到智慧行动
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <CardTitle className="text-lg">信息 Information</CardTitle>
              <p className="text-sm text-gray-500">"发生了什么？"</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                原始资讯内容，价值最低，无处不在
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg text-blue-700">洞察 Insight</CardTitle>
              <p className="text-sm text-blue-500">"这为什么重要？"</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                连接信息点，揭示背后的模式和含义
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg text-purple-700">预见 Foresight</CardTitle>
              <p className="text-sm text-purple-500">"接下来会发生什么？"</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                基于洞察推演预测，提供决策的"未来地图"
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-green-700">行动 Action</CardTitle>
              <p className="text-sm text-green-500">"我应该怎么做？"</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                个性化可执行建议，最稀缺最有价值
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 三大引擎介绍 */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              三大AI引擎
            </h2>
            <p className="text-gray-600">
              不再是"模块"，我们称之为"引擎"，为您的认知提供动力
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 洞察引擎 */}
            <Card className="border-blue-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">
                  洞察引擎
                </CardTitle>
                <p className="text-blue-600 font-medium">The "So What?" Engine</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  每条资讯都有AI生成的"核心洞察"标签，一句话告诉您"这件事为什么重要"。
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    🎯 <strong>核心洞察：</strong>一句话提炼关键价值
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    👥 <strong>影响分析：</strong>对不同角色的具体影响
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    📊 <strong>趋势识别：</strong>自动发现潜在模式
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 预见引擎 */}
            <Card className="border-purple-200">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-700">
                  预见引擎
                </CardTitle>
                <p className="text-purple-600 font-medium">The "What If?" Engine</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  点击任意趋势，AI动态生成多种"未来剧本"，为您提供远见。
                </p>
                <div className="space-y-2">
                  <div className="bg-purple-50 p-3 rounded-lg text-sm">
                    🚀 <strong>乐观场景：</strong>技术普及的最佳可能
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-sm">
                    📈 <strong>最可能场景：</strong>渐进式发展路径
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-sm">
                    ⚠️ <strong>审慎场景：</strong>挑战与风险预警
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 行动引擎 */}
            <Card className="border-green-200">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">
                  行动引擎
                </CardTitle>
                <p className="text-green-600 font-medium">The "Now What?" Engine</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  基于您的身份角色，为每个洞察生成个性化的行动计划。
                </p>
                <div className="space-y-2">
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    📋 <strong>行动清单：</strong>3-5步骤可执行计划
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    ⏰ <strong>时间规划：</strong>本周内可开始执行
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    🎯 <strong>个性化：</strong>基于您的身份定制
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            开始您的认知增强之旅
          </h2>
          <p className="text-xl opacity-90 mb-8">
            让AI成为您的"外脑"，7×24小时不知疲倦地为您服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/zh/insights">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                <Zap className="w-5 h-5 mr-2" />
                立即体验
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
              了解技术实现
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}