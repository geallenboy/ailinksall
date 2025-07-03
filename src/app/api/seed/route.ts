import { NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { articles } from '@/drizzle/schemas';

const sampleArticles = [
  {
    title: "OpenAI发布GPT-5：多模态AI能力革命性突破",
    content: `OpenAI今日正式发布了GPT-5模型，相比GPT-4在多模态理解、推理能力和代码生成方面取得显著突破。新模型能够同时处理文本、图像、音频和视频，并在复杂推理任务中表现出接近人类专家的水平。

    主要改进包括：
    1. 多模态理解能力提升300%
    2. 代码生成准确率达到95%
    3. 支持实时视频分析
    4. 推理链长度增加到10万tokens

    业界专家认为，这标志着AI技术进入新的发展阶段，将深刻影响软件开发、内容创作和教育等多个领域。`,
    sourceUrl: "https://openai.com/gpt-5",
    author: "OpenAI团队",
    publishedAt: new Date(),
    coreInsight: "GPT-5的发布标志着AI从单模态向全模态智能的关键转变，这将重新定义人机交互的边界。",
    impactAnalysis: {
      developers: "需要重新评估现有技术栈，学习多模态AI集成技术，掌握新的API和开发范式。",
      business: "可以考虑AI驱动的产品升级，特别是在客户服务、内容生成和数据分析方面。",
      users: "将体验到更智能、更自然的AI助手，能够理解和处理各种形式的内容。"
    },
    trendTag: "多模态AI",
    isProcessed: true,
    aiScore: 95,
    category: "AI/ML",
    tags: ["AI", "GPT-5", "多模态", "机器学习"],
  },
  {
    title: "n8n发布云原生自动化平台，降低企业数字化门槛",
    content: `自动化平台n8n今日宣布推出全新的云原生版本，集成了AI工作流生成、可视化调试和企业级安全功能。新平台允许非技术用户通过简单的拖拽操作构建复杂的业务流程自动化。

    新功能亮点：
    - AI辅助工作流设计
    - 800+预构建集成
    - 实时协作编辑
    - 企业级权限管理
    - 99.9%可用性保证

    据统计，使用新平台的企业平均可减少70%的重复性工作，提升团队效率3倍。`,
    sourceUrl: "https://n8n.io/cloud-native",
    author: "n8n团队",
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    coreInsight: "低代码自动化平台的成熟正在打破技术与业务之间的壁垒，让每个人都能成为'开发者'。",
    impactAnalysis: {
      developers: "自动化技能将成为必备技能，需要学习API集成和工作流设计思维。",
      business: "可以通过自动化大幅减少运营成本，重新设计业务流程以提高效率。",
      users: "工作流程将变得更加顺畅，减少手动操作，专注于创造性工作。"
    },
    trendTag: "低代码自动化",
    isProcessed: true,
    aiScore: 88,
    category: "自动化",
    tags: ["n8n", "自动化", "低代码", "工作流"],
  },
  {
    title: "Anthropic获得40亿美元融资，专注AI安全研究",
    content: `AI安全公司Anthropic宣布完成40亿美元C轮融资，由Google和亚马逊领投。本轮融资将主要用于AI安全研究、模型训练基础设施建设和人才招聘。

    Anthropic专注于构建"有用、无害、诚实"的AI系统，其Claude模型在安全性测试中表现优异。公司计划在未来两年内将团队规模扩大至2000人，重点投入AI对齐、可解释性和安全性研究。

    此次融资也反映了投资界对AI安全领域的高度关注，随着AI技术快速发展，确保AI系统的安全性和可控性变得越来越重要。`,
    sourceUrl: "https://anthropic.com/funding",
    author: "科技媒体",
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    coreInsight: "大额投资AI安全反映了行业对AI风险的清醒认识，安全将成为AI发展的核心约束条件。",
    impactAnalysis: {
      developers: "AI安全将成为新的技术领域，需要学习相关的评估和防护技术。",
      business: "在AI应用中必须考虑安全性和合规性，这可能成为竞争优势。",
      users: "将使用到更安全、更可靠的AI产品，减少AI误用的风险。"
    },
    trendTag: "AI安全",
    isProcessed: true,
    aiScore: 82,
    category: "创业投资",
    tags: ["Anthropic", "融资", "AI安全", "投资"],
  },
  {
    title: "Meta推出Code Llama：专为编程优化的大语言模型",
    content: `Meta AI发布了Code Llama，一个专门为代码生成和理解任务优化的大语言模型。该模型基于Llama 2架构，在代码相关任务上的表现显著超越通用模型。

    Code Llama特点：
    - 支持多种编程语言
    - 代码补全准确率达90%+
    - 支持长达100K tokens的上下文
    - 可进行代码解释和调试
    - 开源免费使用

    开发者社区反响热烈，已有多个IDE插件和开发工具集成了Code Llama。`,
    sourceUrl: "https://ai.meta.com/code-llama",
    author: "Meta AI",
    publishedAt: new Date(Date.now() - 259200000), // 3 days ago
    coreInsight: "专用AI模型的出现表明AI正在从通用智能向领域专家发展，垂直化将是AI应用的重要趋势。",
    impactAnalysis: {
      developers: "AI辅助编程将成为标配，需要学习如何与AI协作提高开发效率。",
      business: "可以显著提升软件开发效率，缩短产品上市时间。",
      users: "将享受到更快速开发、更高质量的软件产品。"
    },
    trendTag: "AI编程助手",
    isProcessed: true,
    aiScore: 91,
    category: "AI/ML",
    tags: ["Meta", "Code Llama", "编程", "开源"],
  },
  {
    title: "苹果发布Vision Pro开发者工具包，空间计算生态启动",
    content: `苹果公司发布了Vision Pro开发者工具包，包括完整的SDK、设计指南和示例应用。开发者现在可以开始为这款混合现实头显创建沉浸式应用。

    工具包包含：
    - RealityKit 4.0框架
    - 手势和眼动追踪API
    - 空间音频工具
    - 3D用户界面组件
    - 性能优化工具

    业界预测，Vision Pro可能会开启空间计算的新时代，就像iPhone开启了移动互联网时代一样。`,
    sourceUrl: "https://developer.apple.com/visionos",
    author: "Apple开发者",
    publishedAt: new Date(Date.now() - 345600000), // 4 days ago
    coreInsight: "空间计算代表着下一代人机交互范式，将物理世界与数字世界无缝融合。",
    impactAnalysis: {
      developers: "需要学习空间计算开发技能，掌握3D交互和沉浸式体验设计。",
      business: "早期进入空间计算生态可能获得先发优势，特别是在教育、培训和协作领域。",
      users: "将体验到全新的计算界面，工作和娱乐方式可能发生根本性改变。"
    },
    trendTag: "空间计算",
    isProcessed: true,
    aiScore: 87,
    category: "硬件/XR",
    tags: ["Apple", "Vision Pro", "空间计算", "开发工具"],
  }
];

export async function POST() {
  try {
    // 清空现有数据
    await db.delete(articles);
    
    // 插入示例数据
    await db.insert(articles).values(sampleArticles);
    
    return NextResponse.json({ 
      success: true, 
      message: `已成功插入 ${sampleArticles.length} 篇示例文章` 
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
} 