import React from 'react';
import { BookOpen, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 模拟新闻数据
const newsData = [
  {
    id: 1,
    title: "AI技术在商业决策中的应用趋势",
    summary: "最新研究显示，85%的企业计划在未来两年内增加AI投资，主要用于提升决策效率和预测准确性。",
    category: "技术趋势",
    date: "2024-01-15",
    readTime: "5分钟",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    trending: true
  },
  {
    id: 2,
    title: "大数据分析助力企业洞察市场机会",
    summary: "通过AI驱动的数据分析，企业能够更准确地识别潜在市场机会，提前布局未来商业模式。",
    category: "商业洞察",
    date: "2024-01-12",
    readTime: "8分钟",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    trending: false
  },
  {
    id: 3,
    title: "认知增强技术：重新定义人机协作",
    summary: "新一代认知增强技术正在改变传统工作模式，让AI成为人类思维的延伸和补充。",
    category: "未来工作",
    date: "2024-01-10",
    readTime: "6分钟",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop",
    trending: true
  },
  {
    id: 4,
    title: "智能预测系统在金融行业的突破",
    summary: "基于深度学习的预测模型在风险管理和投资决策方面取得重大进展，准确率提升40%。",
    category: "金融科技",
    date: "2024-01-08",
    readTime: "7分钟",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=200&fit=crop",
    trending: false
  }
];

const categories = ["全部", "技术趋势", "商业洞察", "未来工作", "金融科技"];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              新闻资讯
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              探索AI时代的最新趋势，获取有价值的行业洞察
            </p>
            <div className="flex items-center justify-center gap-4">
              <BookOpen className="w-6 h-6" />
              <span className="text-lg">持续更新 • 深度分析 • 前沿视角</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "全部" ? "default" : "outline"}
              className={category === "全部" ? 
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : 
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 热门文章 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            热门资讯
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData.filter(news => news.trending).map((news) => (
              <div key={news.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      热门
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {news.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {news.date}
                    </div>
                    <span>{news.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {news.summary}
                  </p>
                  <Button variant="ghost" className="group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 p-0">
                    阅读更多
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 所有文章 */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            最新资讯
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {newsData.map((news) => (
              <div key={news.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-32 h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {news.category}
                      </span>
                      <span>{news.date}</span>
                      <span>{news.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                      {news.summary}
                    </p>
                    <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0">
                      了解详情
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              想了解更多AI洞察？
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              体验我们的AI洞察引擎，获取个性化的趋势分析和行动建议
            </p>
            <Link href="/insights">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                立即体验 AI洞察引擎
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 