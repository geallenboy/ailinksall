'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, ExternalLink, Heart, Brain, Eye, Lightbulb, Target, TrendingUp, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="relative bg-gradient-to-br from-white via-gray-50/90 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-700 dark:text-white overflow-hidden">
      
      
      <div className="relative z-10 mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 品牌介绍 - 3D玻璃态卡片 */}
          <div className="lg:col-span-2 relative group">
            <div className="relative bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/20 p-8 shadow-[0_0_30px_rgba(59,130,246,0.1)] dark:shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_70px_rgba(59,130,246,0.25)] transition-all duration-500 transform hover:scale-[1.02]">
              {/* 发光边框 - 主题适配 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              {/* 装饰性粒子 - 主题适配 */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shadow-[0_0_8px_#3b82f6] dark:shadow-[0_0_10px_#60a5fa] opacity-40 dark:opacity-60 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-500 dark:bg-purple-400 rounded-full shadow-[0_0_6px_#a855f7] dark:shadow-[0_0_8px_#c084fc] opacity-50 dark:opacity-70"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">AI洞察引擎</span>
                    <Lightbulb className="absolute -top-1 -right-6 h-5 w-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
                  您在AI时代的认知增强伙伴。我们将信息转化为洞察，洞察转化为预见，预见转化为行动。让AI为您思考，成为您的外脑。
                </p>
                
                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">洞察引擎</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">预见引擎</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">行动引擎</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">个性化服务</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">邮箱联系</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 核心功能 - 3D玻璃态卡片 */}
          <div className="relative group">
            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 p-6 shadow-[0_0_20px_rgba(59,130,246,0.08)] dark:shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] transition-all duration-500 transform hover:scale-[1.02]">
              {/* 发光边框 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">核心功能</h4>
                <ul className="space-y-4">
                  <li>
                    <Link 
                      href="/insights" 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors group flex items-center"
                    >
                      <Eye className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                      AI洞察引擎
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/news"
                      className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-white transition-colors group flex items-center"
                    >
                      <BookOpen className="mr-2 h-4 w-4 text-green-500 dark:text-green-400" />
                      新闻资讯
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/products" 
                      className="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-white transition-colors group flex items-center"
                    >
                      <Target className="mr-2 h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                      产品展示
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/auth/signin" 
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white transition-colors group flex items-center"
                    >
                      <Users className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                      用户中心
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 价值体系 - 3D玻璃态卡片 */}
          <div className="relative group">
            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 p-6 shadow-[0_0_20px_rgba(59,130,246,0.08)] dark:shadow-[0_0_30px_rgba(59,130,246,0.12)] hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] transition-all duration-500 transform hover:scale-[1.02]">
              {/* 发光边框 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">价值层次</h4>
                <ul className="space-y-4">
                  <li className="text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
                    信息 → 洞察
                  </li>
                  <li className="text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-2"></div>
                    洞察 → 预见
                  </li>
                  <li className="text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-2"></div>
                    预见 → 行动
                  </li>
                  <li className="text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full mr-2"></div>
                    认知增强
                  </li>
                  <li>
                    <Link 
                      href="/contact" 
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors group flex items-center"
                    >
                      联系我们
                      <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* 分割线 - 玻璃态效果 */}
        <div className="relative mt-16">
          <div className="relative bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 p-6 shadow-[0_0_20px_rgba(59,130,246,0.08)] dark:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <span>© {currentYear} AI洞察引擎. 保留所有权利.</span>
                <span className="mx-2">•</span>
                <Link href="/contact" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                  联系我们
                </Link>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                <span>用</span>
                <Heart className="h-4 w-4 text-red-500 mx-1" />
                <span>打造的认知增强伙伴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 