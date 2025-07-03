import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * 格式化数字的选项，基于 Intl.NumberFormatOptions
 */
interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string; // 可选的区域设置，例如 'en-US', 'zh-CN', 'de-DE'
}

/**
 * 一个强大且支持国际化的数字格式化函数
 * @param value - 需要被格式化的数字
 * @param options - 格式化选项 (基于 Intl.NumberFormatOptions)
 * @returns 格式化后的字符串
 *
 * @example
 * // 基本用法 (千位分隔符)
 * formatNumber(1234567.89); // "1,234,567.89"
 *
 * // 控制小数位数
 * formatNumber(123.456, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // "123.46"
 *
 * // 格式化为货币 (人民币)
 * formatNumber(99.9, { style: 'currency', currency: 'CNY', locale: 'zh-CN' }); // "¥99.90"
 *
 * // 格式化为货币 (美元)
 * formatNumber(99.9, { style: 'currency', currency: 'USD', locale: 'en-US' }); // "$99.90"
 *
 * // 紧凑模式 (K, M)
 * formatNumber(12345, { notation: 'compact' }); // "12K"
 * formatNumber(1234567, { notation: 'compact' }); // "1.2M"
 *
 * // 百分比
 * formatNumber(0.89, { style: 'percent' }); // "89%"
 */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { locale, ...formatOptions } = options;

  // 使用 Intl.NumberFormat 来格式化数字
  // locale 参数为 undefined 时，将使用运行环境的默认区域设置
  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    // 在出错时返回原始数字的字符串形式作为备用
    return String(value);
  }
}

/**
 * 格式化日期显示
 * @param date - 日期对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}