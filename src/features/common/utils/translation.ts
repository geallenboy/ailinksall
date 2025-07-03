/**
 * 前端翻译工具函数
 * 通过API调用翻译服务，避免在客户端直接使用环境变量
 */

import { toast } from 'sonner';

/**
 * 单个文本翻译
 */
export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text, 
        targetLanguage: 'en' 
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.translatedText;
    } else {
      console.error('Translation API error:', result.error);
      return text; // 返回原文
    }
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // 返回原文
  }
};

/**
 * 批量字段翻译
 */
export const translateFieldsToEnglish = async (fields: Record<string, string>): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (value && value.trim()) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: value, 
            targetLanguage: 'en' 
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          results[key] = result.translatedText;
        } else {
          console.error('Translation API error:', result.error);
          results[key] = value; // 返回原文
        }
      } catch (error) {
        console.error(`Translation failed for field ${key}:`, error);
        results[key] = value; // 返回原文
      }
    } else {
      results[key] = value;
    }
  }
  
  return results;
};

/**
 * 带UI反馈的翻译处理
 */
export const handleTranslationWithFeedback = async (
  fields: Record<string, string>
): Promise<Record<string, string>> => {
  try {
    const translatedFields = await translateFieldsToEnglish(fields);
    toast.success('内容已自动翻译为英文');
    return translatedFields;
  } catch (error) {
    console.error('Translation failed:', error);
    toast.warning('自动翻译失败，将使用中文内容');
    return fields; // 翻译失败时使用原始内容
  }
};

/**
 * 翻译表单数据的通用处理逻辑
 */
export const processFormDataWithTranslation = async <T extends Record<string, any>>(
  formData: T,
  fieldMapping: Record<string, string> // 中文字段到英文字段的映射
): Promise<T> => {
  const fieldsToTranslate: Record<string, string> = {};
  
  // 构建需要翻译的字段
  Object.entries(fieldMapping).forEach(([zhField, enField]) => {
    if (formData[zhField] && typeof formData[zhField] === 'string' && formData[zhField].trim()) {
      fieldsToTranslate[enField] = formData[zhField];
    }
  });

  // 如果有需要翻译的字段，进行翻译
  let translatedFields: Record<string, string> = {};
  if (Object.keys(fieldsToTranslate).length > 0) {
    try {
      translatedFields = await handleTranslationWithFeedback(fieldsToTranslate);
    } catch (error) {
      console.error('Translation processing failed:', error);
      translatedFields = fieldsToTranslate;
    }
  }

  // 合并翻译后的数据
  return {
    ...formData,
    ...translatedFields
  };
}; 