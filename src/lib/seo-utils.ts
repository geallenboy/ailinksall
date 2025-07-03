import { Metadata } from 'next'

// SEO配置常量
export const SEO_CONFIG = {
  siteName: 'AI n8n Platform',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatehub.org',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@ain8n',
  zh: {
    defaultTitle: 'AI n8n Platform - 专业的n8n自动化工具学习平台',
    defaultDescription: 'AI n8n Platform是专业的n8n自动化工具学习平台，提供丰富的n8n教程、实用案例、工作流模板和技术博客。学习n8n工作流自动化，提升工作效率，从零基础到高级应用全覆盖。',
    keywords: [
      'n8n', 'n8n教程', 'n8n案例', 'n8n工作流', '自动化工具', 'workflow automation',
      'n8n中文教程', 'n8n学习', 'n8n平台', 'API自动化', '工作流设计',
      '数据集成', '自动化脚本', 'nocode', 'lowcode', 'RPA', '流程自动化'
    ],
    orgDescription: '专业的n8n自动化工具学习平台',
    blog: {
      title: 'n8n博客 - 最新资讯与技术文章',
      description: '探索AI n8n平台的最新博客文章，了解n8n自动化工具的最佳实践、技术教程、案例分析和行业资讯。学习如何使用n8n提升工作效率。',
    },
  },
  en: {
    defaultTitle: 'AI n8n Platform - Professional Learning Platform for n8n Automation Tools',
    defaultDescription: 'AI n8n Platform is a professional learning platform for n8n automation tools, providing rich n8n tutorials, practical cases, workflow templates, and technical blogs. Learn n8n workflow automation to improve work efficiency, covering everything from basics to advanced applications.',
    keywords: [
      'n8n', 'n8n tutorial', 'n8n use case', 'n8n workflow', 'automation tool', 'workflow automation',
      'n8n english tutorial', 'learn n8n', 'n8n platform', 'API automation', 'workflow design',
      'data integration', 'automation script', 'nocode', 'lowcode', 'RPA', 'process automation'
    ],
    orgDescription: 'A professional learning platform for n8n automation tools.',
    blog: {
      title: 'n8n Blog - Latest News and Technical Articles',
      description: 'Explore the latest blog posts from the AI n8n Platform to learn best practices, technical tutorials, case studies, and industry news about n8n automation tools.',
    },
  }
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  locale?: 'zh' | 'en';
  noindex?: boolean;
  canonical?: string;
}

// 生成页面metadata
export function generatePageMetadata({
  title,
  description,
  keywords,
  image = SEO_CONFIG.defaultImage,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  locale = 'zh',
  noindex = false,
  canonical
}: SEOProps = {}): Metadata {
  
  const langConfig = SEO_CONFIG[locale] || SEO_CONFIG.zh;

  const pageTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : langConfig.defaultTitle;
  
  const pageDescription = description || langConfig.defaultDescription;
  const pageKeywords = keywords || langConfig.keywords;

  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${SEO_CONFIG.siteUrl}${image}`;

  const fullUrl = url 
    ? `${SEO_CONFIG.siteUrl}${url}`
    : SEO_CONFIG.siteUrl;

  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US';

  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'AI n8n Team' }],
    creator: 'AI n8n Platform',
    publisher: 'AI n8n Platform',
    
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    
    robots: {
      index: !noindex,
      follow: !noindex,
    },

    openGraph: {
      type: type as any,
      locale: ogLocale,
      url: fullUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || langConfig.defaultTitle,
        },
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        ...(modifiedTime && { modifiedTime }),
        ...(author && { authors: [author] }),
        ...(tags && { tags }),
      }),
    },

    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [fullImageUrl],
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
    },

    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },

    alternates: {
      canonical: canonical || fullUrl,
      languages: {
        'zh-CN': url ? `${SEO_CONFIG.siteUrl}/zh${url}` : `${SEO_CONFIG.siteUrl}/zh`,
        'en-US': url ? `${SEO_CONFIG.siteUrl}/en${url}` : `${SEO_CONFIG.siteUrl}/en`,
      },
    },
  }

  return metadata
}

// 生成结构化数据
export function generateStructuredData(type: string, data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }

  return baseData
}

// 网站结构化数据
export function generateWebsiteStructuredData({
  siteName,
  siteUrl,
  description
}: {
  siteName: string;
  siteUrl: string;
  description: string;
}) {
  return generateStructuredData('WebSite', {
    name: siteName,
    url: siteUrl,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`
    }
  })
}

// 组织结构化数据
export function generateOrganizationStructuredData({
  siteName,
  siteUrl,
  description
}: {
  siteName: string;
  siteUrl: string;
  description: string;
}) {
  return generateStructuredData('Organization', {
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: description,
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@aiautomatehub.org'
    },
    sameAs: [
      'https://github.com/geallenboy',
      'https://twitter.com/gejialun88',
      'https://discord.gg/FbnKf8v3'
    ]
  })
}

// 文章结构化数据
export function generateArticleStructuredData({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  url,
  tags = []
}: {
  title: string
  description: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  image?: string
  url: string
  tags?: string[]
}) {
  return generateStructuredData('Article', {
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author || 'AI n8n Team'
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      logo: `${SEO_CONFIG.siteUrl}/logo.png`
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    image: image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
    url: `${SEO_CONFIG.siteUrl}${url}`,
    mainEntityOfPage: `${SEO_CONFIG.siteUrl}${url}`,
    keywords: tags.join(', ')
  })
}

// 面包屑结构化数据
export function generateBreadcrumbStructuredData(paths: Array<{ name: string; url: string }>) {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: paths.map((path, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: path.name,
      item: `${SEO_CONFIG.siteUrl}${path.url}`
    }))
  })
}

// FAQ结构化数据
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return generateStructuredData('FAQPage', {
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  })
}

// 生成多语言hreflang标签
export function generateHreflangUrls(currentPath: string) {
  return {
    'zh-CN': `${SEO_CONFIG.siteUrl}${currentPath}`,
    'en-US': `${SEO_CONFIG.siteUrl}/en${currentPath}`,
    'x-default': `${SEO_CONFIG.siteUrl}${currentPath}`
  }
} 