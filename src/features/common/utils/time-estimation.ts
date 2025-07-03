/**
 * 教程时长估算工具函数
 * 根据内容类型和长度智能计算预估学习时间
 */

// 阅读速度配置（每分钟字数）
const READING_SPEEDS = {
  chinese: 400,    // 中文每分钟400字
  english: 200,    // 英文每分钟200词
  code: 150,       // 代码每分钟150行
  json: 100        // JSON数据每分钟100行
};

// 内容类型权重配置
const CONTENT_WEIGHTS = {
  title: 0.5,           // 标题权重较低
  description: 1.0,     // 描述正常权重
  content: 1.5,         // 正文内容权重较高
  code: 2.0,            // 代码内容需要更多时间
  video: 1.0            // 视频按实际时长计算
};

// 基础时间配置（分钟）
const BASE_TIMES = {
  minimum: 3,           // 最少3分钟
  maximum: 180,         // 最多3小时
  practice: 5,          // 实践环节额外5分钟
  review: 2             // 复习环节额外2分钟
};

/**
 * 计算文本阅读时间
 */
export function calculateTextReadingTime(text: string, language: 'zh' | 'en' = 'zh'): number {
  if (!text || text.trim().length === 0) return 0;
  
  const cleanText = text.replace(/```[\s\S]*?```/g, ''); // 移除代码块
  const wordCount = language === 'zh' 
    ? cleanText.length 
    : cleanText.split(/\s+/).filter(word => word.length > 0).length;
  
  const speed = language === 'zh' ? READING_SPEEDS.chinese : READING_SPEEDS.english;
  return Math.ceil(wordCount / speed);
}

/**
 * 计算代码阅读时间
 */
export function calculateCodeReadingTime(codeText: string): number {
  if (!codeText || codeText.trim().length === 0) return 0;
  
  // 提取代码块
  const codeBlocks = codeText.match(/```[\s\S]*?```/g) || [];
  let totalLines = 0;
  
  codeBlocks.forEach(block => {
    const lines = block.split('\n').filter(line => line.trim().length > 0);
    totalLines += lines.length;
  });
  
  return Math.ceil(totalLines / READING_SPEEDS.code);
}

/**
 * 计算JSON数据理解时间
 */
export function calculateJsonReadingTime(jsonContent: any): number {
  if (!jsonContent) return 0;
  
  try {
    const jsonString = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent, null, 2);
    const lines = jsonString.split('\n').filter(line => line.trim().length > 0);
    return Math.ceil(lines.length / READING_SPEEDS.json);
  } catch (error) {
    console.error('Error parsing JSON for time estimation:', error);
    return 0;
  }
}

/**
 * 根据教程内容智能计算预估时间
 */
export function calculateTutorialEstimatedTime(tutorialData: {
  title?: string;
  titleZh?: string;
  description?: string;
  descriptionZh?: string;
  content?: string;
  contentZh?: string;
  videoUrl?: string;
  workflowJson?: any;
  hasExercises?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}): number {
  let totalTime = 0;
  
  // 1. 标题阅读时间
  if (tutorialData.titleZh) {
    totalTime += calculateTextReadingTime(tutorialData.titleZh) * CONTENT_WEIGHTS.title;
  } else if (tutorialData.title) {
    totalTime += calculateTextReadingTime(tutorialData.title, 'en') * CONTENT_WEIGHTS.title;
  }
  
  // 2. 描述阅读时间
  if (tutorialData.descriptionZh) {
    totalTime += calculateTextReadingTime(tutorialData.descriptionZh) * CONTENT_WEIGHTS.description;
  } else if (tutorialData.description) {
    totalTime += calculateTextReadingTime(tutorialData.description, 'en') * CONTENT_WEIGHTS.description;
  }
  
  // 3. 正文内容阅读时间
  if (tutorialData.contentZh) {
    totalTime += calculateTextReadingTime(tutorialData.contentZh) * CONTENT_WEIGHTS.content;
    totalTime += calculateCodeReadingTime(tutorialData.contentZh) * CONTENT_WEIGHTS.code;
  } else if (tutorialData.content) {
    totalTime += calculateTextReadingTime(tutorialData.content, 'en') * CONTENT_WEIGHTS.content;
    totalTime += calculateCodeReadingTime(tutorialData.content) * CONTENT_WEIGHTS.code;
  }
  
  // 4. 工作流JSON分析时间
  if (tutorialData.workflowJson) {
    totalTime += calculateJsonReadingTime(tutorialData.workflowJson) * CONTENT_WEIGHTS.code;
  }
  
  // 5. 视频观看时间（如果有视频URL，假设是标准教学视频）
  if (tutorialData.videoUrl) {
    // 如果有视频，估算为15-30分钟的教学视频
    totalTime += 20; // 假设平均20分钟视频时长
  }
  
  // 6. 根据难度调整时间
  if (tutorialData.difficulty) {
    const difficultyMultiplier = {
      beginner: 1.0,      // 初学者正常时间
      intermediate: 1.3,  // 中级增加30%
      advanced: 1.6       // 高级增加60%
    };
    totalTime *= difficultyMultiplier[tutorialData.difficulty];
  }
  
  // 7. 如果有练习环节，增加实践时间
  if (tutorialData.hasExercises) {
    totalTime += BASE_TIMES.practice;
  }
  
  // 8. 添加复习时间
  totalTime += BASE_TIMES.review;
  
  // 9. 确保在合理范围内
  const finalTime = Math.max(BASE_TIMES.minimum, Math.min(BASE_TIMES.maximum, Math.ceil(totalTime)));
  
  return finalTime;
}

/**
 * 根据博客内容计算预估阅读时间
 */
export function calculateBlogEstimatedTime(blogData: {
  title?: string;
  titleZh?: string;
  excerpt?: string;
  excerptZh?: string;
  content?: string;
  contentZh?: string;
  readme?: string;
  readmeZh?: string;
}): number {
  let totalTime = 0;
  
  // 标题时间
  if (blogData.titleZh) {
    totalTime += calculateTextReadingTime(blogData.titleZh) * 0.3;
  } else if (blogData.title) {
    totalTime += calculateTextReadingTime(blogData.title, 'en') * 0.3;
  }
  
  // 摘要时间
  if (blogData.excerptZh) {
    totalTime += calculateTextReadingTime(blogData.excerptZh) * 0.8;
  } else if (blogData.excerpt) {
    totalTime += calculateTextReadingTime(blogData.excerpt, 'en') * 0.8;
  }
  
  // 正文时间
  const mainContent = blogData.readmeZh || blogData.readme || blogData.contentZh || blogData.content || '';
  if (mainContent) {
    totalTime += calculateTextReadingTime(mainContent) * 1.2;
    totalTime += calculateCodeReadingTime(mainContent) * 1.5;
  }
  
  // 确保最少2分钟，最多60分钟
  return Math.max(2, Math.min(60, Math.ceil(totalTime)));
}

/**
 * 格式化时间显示
 */
export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} 小时`;
    } else {
      return `${hours} 小时 ${remainingMinutes} 分钟`;
    }
  }
}

/**
 * 批量计算教程模块的总时间
 */
export function calculateTotalModulesTime(modules: Array<{
  estimatedTimeMinutes?: number;
  title?: string;
  titleZh?: string;
  content?: string;
  contentZh?: string;
  videoUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}>): number {
  return modules.reduce((total, module) => {
    // 如果已经有预估时间，使用它；否则自动计算
    if (module.estimatedTimeMinutes && module.estimatedTimeMinutes > 0) {
      return total + module.estimatedTimeMinutes;
    } else {
      return total + calculateTutorialEstimatedTime({
        title: module.title,
        titleZh: module.titleZh,
        content: module.content,
        contentZh: module.contentZh,
        videoUrl: module.videoUrl,
        difficulty: module.difficulty
      });
    }
  }, 0);
} 