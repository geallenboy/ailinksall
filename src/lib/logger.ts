type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// 获取当前环境设置的日志级别，默认为 'info'
const getCurrentLogLevel = (): LogLevel => {
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() as LogLevel;
    return LOG_LEVELS[level] !== undefined ? level : 'info';
};

const shouldLog = (level: LogLevel): boolean => {
    const currentLevel = getCurrentLogLevel();
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

export const logger = {
    debug: (message: string, ...data: any[]) => {
        if (shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, ...data);
        }
    },

    info: (message: string, ...data: any[]) => {
        if (shouldLog('info')) {
            console.info(`[INFO] ${message}`, ...data);
        }
    },

    warn: (message: string, ...data: any[]) => {
        if (shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, ...data);
        }
    },

    error: (message: string, ...data: any[]) => {
        if (shouldLog('error')) {
            console.error(`[ERROR] ${message}`, ...data);
        }
    },

    timing: (label: string, action: () => any) => {
        if (shouldLog('debug')) {
            console.time(`[TIMING] ${label}`);
            const result = action();
            console.timeEnd(`[TIMING] ${label}`);
            return result;
        }
        return action();
    }
};