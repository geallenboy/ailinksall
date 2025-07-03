/**
 * 调试日志工具
 * 只在开发环境显示日志，生产环境不输出
 */

const isDev = process.env.NODE_ENV === 'development';

export const debugLog = {
  /**
   * 普通日志
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * 错误日志
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },

  /**
   * 警告日志
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },

  /**
   * 信息日志
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[DEBUG INFO]', ...args);
    }
  },

  /**
   * 分组日志开始
   */
  group: (label: string) => {
    if (isDev) {
      console.group(`[DEBUG GROUP] ${label}`);
    }
  },

  /**
   * 分组日志结束
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * 表格日志
   */
  table: (data: any) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * 性能计时开始
   */
  time: (label: string) => {
    if (isDev) {
      console.time(`[DEBUG TIME] ${label}`);
    }
  },

  /**
   * 性能计时结束
   */
  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(`[DEBUG TIME] ${label}`);
    }
  }
};

/**
 * 页面调试信息显示器
 * 在页面上显示调试信息的组件
 */
export function createPageDebugger() {
  if (!isDev) {
    return {
      show: () => {},
      hide: () => {},
      log: () => {},
      clear: () => {}
    };
  }

  let debugElement: HTMLDivElement | null = null;
  let logs: string[] = [];

  const show = () => {
    if (debugElement) return;

    debugElement = document.createElement('div');
    debugElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      overflow-y: auto;
      border: 1px solid #333;
    `;
    
    debugElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>🐛 Debug Log</strong>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">✕</button>
      </div>
      <div id="debug-content" style="max-height: 300px; overflow-y: auto;"></div>
    `;

    document.body.appendChild(debugElement);
    updateContent();
  };

  const hide = () => {
    if (debugElement) {
      debugElement.remove();
      debugElement = null;
    }
  };

  const log = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '#00ff00',
      error: '#ff4444', 
      warn: '#ffaa00'
    };
    
    logs.push(`<div style="color: ${colors[type]}; margin-bottom: 5px;">
      [${timestamp}] ${message}
    </div>`);

    // 保持最多50条日志
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }

    updateContent();
  };

  const clear = () => {
    logs = [];
    updateContent();
  };

  const updateContent = () => {
    if (debugElement) {
      const content = debugElement.querySelector('#debug-content');
      if (content) {
        content.innerHTML = logs.join('');
        content.scrollTop = content.scrollHeight;
      }
    }
  };

  return { show, hide, log, clear };
} 