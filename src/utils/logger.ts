/**
 * 全局日志工具，方便调试跟踪代码执行流程
 * 可根据环境变量或配置开关日志输出
 */

// 日志级别定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志级别权重配置
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// 全局日志级别设置 - 可根据环境变更
const GLOBAL_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';

// 组件日志级别覆盖 - 可针对特定组件设置不同级别
const COMPONENT_LOG_LEVEL: Record<string, LogLevel> = {
    // 生产环境下默认关闭调试日志
    'ChatInput': 'error',
    'useSessionHooks': 'error',
    'usePreferenceContext': 'error',
    'useChatContext': 'error',
    // 开发环境下可单独开启某些组件的调试
    ...(process.env.NODE_ENV !== 'production' ? {
        'useSessionHooks': 'info',
        'usePreferenceContext': 'info',
        'useChatContext': 'info'
    } : {})
};

/**
 * 创建日志记录器
 * @param component 组件名称
 * @returns 包含不同级别日志方法的记录器对象
 */
export function createLogger(component: string) {
    // 获取组件特定日志级别或使用全局级别
    const componentLevel = COMPONENT_LOG_LEVEL[component] || GLOBAL_LOG_LEVEL;

    // 检查是否应该记录某个级别的日志
    const shouldLog = (level: LogLevel): boolean => {
        return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[componentLevel];
    };

    // 创建格式化的日志前缀
    const getPrefix = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `[${hours}:${minutes}:${seconds}]`;
    };

    return {
        debug: (message: string, data?: any) => {
            if (shouldLog('debug') && process.env.NODE_ENV !== 'production') {
                console.debug(`${getPrefix()}[DEBUG][${component}]`, message, data !== undefined ? data : '');
            }
        },

        info: (message: string, data?: any) => {
            if (shouldLog('info') && process.env.NODE_ENV !== 'production') {
                console.info(`${getPrefix()}[INFO][${component}]`, message, data !== undefined ? data : '');
            }
        },

        warn: (message: string, data?: any) => {
            if (shouldLog('warn')) {
                console.warn(`${getPrefix()}[WARN][${component}]`, message, data !== undefined ? data : '');
            }
        },

        error: (message: string, data?: any) => {
            if (shouldLog('error')) {
                console.error(`${getPrefix()}[ERROR][${component}]`, message, data !== undefined ? data : '');
            }
        }
    };
}
