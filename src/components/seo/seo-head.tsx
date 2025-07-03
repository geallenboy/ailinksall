import React from 'react';
import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  locale?: string;
  siteName?: string;
  structuredData?: any;
}

export default function SEOHead({
  title = 'AI-N8N - n8n自动化工具学习平台',
  description = 'AI-N8N是专业的n8n自动化工具学习平台，提供丰富的n8n教程、实用案例、工作流模板和技术博客。学习n8n工作流自动化，提升工作效率，从零基础到高级应用全覆盖。',
  keywords = [
    'n8n', 'n8n教程', 'n8n案例', 'n8n工作流', '自动化工具', 'workflow automation',
    'n8n中文教程', 'n8n学习', 'n8n平台', 'API自动化', '工作流设计',
    '数据集成', '自动化脚本', 'nocode', 'lowcode', 'RPA', '流程自动化'
  ],
  image = '/images/og-default.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
  locale = 'zh_CN',
  siteName = 'AI-N8N',
  structuredData
}: SEOHeadProps) {
  
  const siteUrl = 'https://aiautomatehub.org';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // 默认结构化数据
  const defaultStructuredData = {
    "@context": "https://aiautomatehub.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://github.com/ai-n8n",
      "https://twitter.com/ai_n8n"
    ]
  };

  // 组织结构化数据
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "description": "专业的n8n自动化工具学习平台",
    "foundingDate": "2024",
    "founders": [{
      "@type": "Person",
      "name": "AI-N8N Team"
    }],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+86-400-0000-000",
      "contactType": "customer service",
      "email": "hello@ai-n8n.com"
    }
  };

  // 面包屑导航数据（如果提供了URL路径）
  const breadcrumbData = url ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": url.split('/').filter(Boolean).map((segment, index, array) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": segment,
      "item": `${siteUrl}/${array.slice(0, index + 1).join('/')}`
    }))
  } : null;

  return (
    <Head>
      {/* 基础Meta标签 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'AI-N8N Team'} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Chinese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      
      {/* 视口和字符集 */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* 语言和地区 */}
      <meta httpEquiv="Content-Language" content="zh-cn" />
      <meta name="geo.region" content="CN" />
      <meta name="geo.placename" content="China" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@ai_n8n" />
      <meta name="twitter:creator" content="@ai_n8n" />
      
      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Microsoft */}
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.png" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* 网站图标 */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      
      {/* RSS订阅 */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} RSS Feed`} href="/rss.xml" />
      
      {/* DNS预解析 */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData || defaultStructuredData)
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      )}
      
      {/* 专门针对n8n相关的技术关键词 */}
      <meta name="topic" content="n8n automation, workflow automation, API integration" />
      <meta name="summary" content="学习n8n自动化工具，掌握工作流设计和API集成技术" />
      <meta name="Classification" content="Technology, Automation, Education" />
      <meta name="designer" content="AI-N8N Team" />
      <meta name="copyright" content="AI-N8N Platform" />
      <meta name="reply-to" content="hello@ai-n8n.com" />
      <meta name="owner" content="AI-N8N" />
      <meta name="url" content={fullUrl} />
      <meta name="identifier-URL" content={fullUrl} />
      <meta name="directory" content="submission" />
      <meta name="category" content="Technology Education Platform" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
      
      {/* 针对中文搜索引擎的特殊标签 */}
      <meta name="baidu-site-verification" content="" />
      <meta name="sogou_site_verification" content="" />
      <meta name="360-site-verification" content="" />
    </Head>
  );
} 