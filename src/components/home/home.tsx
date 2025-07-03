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
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-6">
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2 dark:bg-purple-900/20 dark:text-purple-300">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('hero.badge')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {t('hero.title.line1')}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('hero.title.line2')}
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t.rich('hero.description', {
              br: () => <br />,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/insights">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                {t('hero.cta.primary')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
              {t('hero.cta.secondary')}
            </Button>
          </div>
        </div>
      </section>

      {/* 价值层次展示 */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('valueLevels.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('valueLevels.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-200 hover:border-gray-300 transition-colors bg-white dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{t('valueLevels.levels.information.title')}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('valueLevels.levels.information.question')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {t('valueLevels.levels.information.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:border-blue-300 transition-colors bg-white dark:bg-gray-800/50 dark:border-blue-900/50 dark:hover:border-blue-800">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg text-blue-700 dark:text-blue-400">{t('valueLevels.levels.insight.title')}</CardTitle>
              <p className="text-sm text-blue-500 dark:text-blue-400/80">{t('valueLevels.levels.insight.question')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {t('valueLevels.levels.insight.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:border-purple-300 transition-colors bg-white dark:bg-gray-800/50 dark:border-purple-900/50 dark:hover:border-purple-800">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg text-purple-700 dark:text-purple-400">{t('valueLevels.levels.foresight.title')}</CardTitle>
              <p className="text-sm text-purple-500 dark:text-purple-400/80">{t('valueLevels.levels.foresight.question')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {t('valueLevels.levels.foresight.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:border-green-300 transition-colors bg-white dark:bg-gray-800/50 dark:border-green-900/50 dark:hover:border-green-800">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg text-green-700 dark:text-green-400">{t('valueLevels.levels.action.title')}</CardTitle>
              <p className="text-sm text-green-500 dark:text-green-400/80">{t('valueLevels.levels.action.question')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {t('valueLevels.levels.action.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 三大引擎介绍 */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('engines.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('engines.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 洞察引擎 */}
            <Card className="border-blue-200 bg-white dark:bg-gray-800/50 dark:border-blue-900/60">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-blue-700 dark:text-blue-400">
                  {t('engines.insight.title')}
                </CardTitle>
                <p className="text-blue-600 dark:text-blue-400/80 font-medium">{t('engines.insight.tagline')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('engines.insight.description')}
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    🎯 <strong>{t('engines.insight.features.core.title')}:</strong> {t('engines.insight.features.core.description')}
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    👥 <strong>{t('engines.insight.features.impact.title')}:</strong> {t('engines.insight.features.impact.description')}
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    📊 <strong>{t('engines.insight.features.trend.title')}:</strong> {t('engines.insight.features.trend.description')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 预见引擎 */}
            <Card className="border-purple-200 bg-white dark:bg-gray-800/50 dark:border-purple-900/60">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl text-purple-700 dark:text-purple-400">
                  {t('engines.foresight.title')}
                </CardTitle>
                <p className="text-purple-600 dark:text-purple-400/80 font-medium">{t('engines.foresight.tagline')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('engines.foresight.description')}
                </p>
                <div className="space-y-2">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    🚀 <strong>{t('engines.foresight.features.optimistic.title')}:</strong> {t('engines.foresight.features.optimistic.description')}
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    📈 <strong>{t('engines.foresight.features.probable.title')}:</strong> {t('engines.foresight.features.probable.description')}
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    ⚠️ <strong>{t('engines.foresight.features.cautious.title')}:</strong> {t('engines.foresight.features.cautious.description')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 行动引擎 */}
            <Card className="border-green-200 bg-white dark:bg-gray-800/50 dark:border-green-900/60">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-green-700 dark:text-green-400">
                  {t('engines.action.title')}
                </CardTitle>
                <p className="text-green-600 dark:text-green-400/80 font-medium">{t('engines.action.tagline')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('engines.action.description')}
                </p>
                <div className="space-y-2">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    💡 <strong>{t('engines.action.features.personalized.title')}:</strong> {t('engines.action.features.personalized.description')}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    🗺️ <strong>{t('engines.action.features.roadmap.title')}:</strong> {t('engines.action.features.roadmap.description')}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                    ✅ <strong>{t('engines.action.features.trackable.title')}:</strong> {t('engines.action.features.trackable.description')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12">
          <h2 className="text-3xl font-bold text-white">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            {t('finalCta.subtitle')}
          </p>
          <Link href="/insights">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              {t('finalCta.button')}
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}