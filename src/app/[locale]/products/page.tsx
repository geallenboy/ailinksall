import React from 'react';
import { Eye, TrendingUp, Target, Brain, Lightbulb, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 产品数据
const products = [
  {
    id: 1,
    name: "洞察引擎",
    icon: Eye,
    subtitle: "The \"So What?\" Engine",
    description: "将海量信息转化为有价值的洞察，为不同角色提供个性化的影响分析。",
    features: [
      "智能内容解析",
      "多角色影响分析", 
      "趋势模式识别",
      "核心洞察提炼"
    ],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    demo: "分析一篇关于AI发展的文章，自动提取对开发者、产品经理、投资人的不同影响"
  },
  {
    id: 2,
    name: "预见引擎",
    icon: TrendingUp,
    subtitle: "The \"What If?\" Engine",
    description: "基于洞察分析生成多种未来场景，帮助用户提前规划和应对变化。",
    features: [
      "多场景预测",
      "概率评估模型",
      "时间线规划",
      "风险机会分析"
    ],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    demo: "根据技术趋势，生成2030年三种不同发展路径的详细预测"
  },
  {
    id: 3,
    name: "行动引擎",
    icon: Target,
    subtitle: "The \"Now What?\" Engine",
    description: "将洞察和预见转化为具体可执行的行动计划，帮助用户立即开始实施。",
    features: [
      "个性化建议",
      "步骤化计划",
      "优先级排序",
      "执行时间规划"
    ],
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    demo: "为营销人员生成基于AI趋势的5步行动计划，本周即可开始"
  }
];

const valueChain = [
  {
    level: "信息",
    description: "发生了什么？",
    value: "商品化，价值最低",
    color: "bg-gray-200 dark:bg-gray-700"
  },
  {
    level: "洞察", 
    description: "这为什么重要？",
    value: "连接信息点，揭示模式",
    color: "bg-blue-200 dark:bg-blue-800"
  },
  {
    level: "预见",
    description: "接下来会发生什么？", 
    value: "基于洞察推演预测",
    color: "bg-green-200 dark:bg-green-800"
  },
  {
    level: "智慧/行动",
    description: "我应该怎么做？",
    value: "个性化可执行建议", 
    color: "bg-purple-200 dark:bg-purple-800"
  }
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Brain className="w-12 h-12" />
              <Lightbulb className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI洞察引擎产品体系
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              三大智能引擎，将信息转化为洞察，洞察转化为预见，预见转化为行动
            </p>
            <div className="flex items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>认知增强</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>智能决策</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>即时行动</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 价值链展示 */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            内容价值四层次演进
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            在信息极度丰富却有效信息稀缺的时代，我们重新定义内容的价值层次
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {valueChain.map((item, index) => (
            <div key={index} className="relative">
              <div className={`${item.color} rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.level}
                  </div>
                  <div className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                    {item.description}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {item.value}
                  </div>
                </div>
                {index < valueChain.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden md:block">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 三大引擎产品展示 */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            三大AI引擎
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            每个引擎解决一个核心问题，共同构建完整的认知增强体系
          </p>
        </div>

        <div className="space-y-20">
          {products.map((product, index) => {
            const IconComponent = product.icon;
            const isReversed = index % 2 === 1;
            
            return (
              <div key={product.id} className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                {/* 产品信息 */}
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex items-center gap-3 ${product.bgColor} px-6 py-3 rounded-full`}>
                    <IconComponent className={`w-6 h-6 ${product.textColor}`} />
                    <span className={`font-semibold ${product.textColor}`}>
                      {product.subtitle}
                    </span>
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${product.textColor}`} />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`${product.bgColor} rounded-xl p-6`}>
                    <h4 className={`font-semibold ${product.textColor} mb-2`}>示例场景：</h4>
                    <p className="text-gray-700 dark:text-gray-300">{product.demo}</p>
                  </div>
                </div>

                {/* 产品可视化 */}
                <div className="flex-1">
                  <div className="relative">
                    <div className={`w-80 h-80 mx-auto rounded-3xl bg-gradient-to-br ${product.color} p-8 shadow-2xl relative overflow-hidden group`}>
                      {/* 背景装饰 */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-white/10"></div>
                        <div className="absolute top-1/2 left-4 w-12 h-12 rounded-full bg-white/15"></div>
                      </div>
                      
                      {/* 主图标 */}
                      <div className="relative z-10 flex items-center justify-center h-full">
                        <IconComponent className="w-32 h-32 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      
                      {/* 发光效果 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-60"></div>
                    </div>
                    
                    {/* 浮动元素 */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 特性对比 */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              为什么选择AI洞察引擎？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              不只是信息聚合，而是认知增强
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "传统资讯平台",
                subtitle: "信息提供者",
                features: ["推送海量信息", "简单分类整理", "被动接收内容", "信息过载问题"],
                color: "border-gray-300 dark:border-gray-600",
                icon: "📰"
              },
              {
                title: "AI洞察引擎",
                subtitle: "认知增强伙伴",
                features: ["智能洞察提炼", "个性化影响分析", "未来场景预测", "可执行行动计划"],
                color: "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20",
                icon: "🧠",
                highlight: true
              },
              {
                title: "传统咨询服务",
                subtitle: "专家意见",
                features: ["高成本咨询", "周期较长", "通用性建议", "人力资源限制"],
                color: "border-gray-300 dark:border-gray-600",
                icon: "💼"
              }
            ].map((item, index) => (
              <div key={index} className={`rounded-2xl border-2 ${item.color} p-8 ${item.highlight ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900'} relative`}>
                {item.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      推荐选择
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.subtitle}
                  </p>
                </div>
                <ul className="space-y-3">
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.highlight ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-16 text-white relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-8 right-16 w-32 h-32 rounded-full bg-white/10"></div>
              <div className="absolute bottom-12 left-12 w-24 h-24 rounded-full bg-white/10"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                准备好体验认知增强了吗？
              </h3>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                让AI成为您的外脑，从信息洪流中提炼真正的价值和洞察
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/insights">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                    立即体验三大引擎
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/front/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                    了解更多详情
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}