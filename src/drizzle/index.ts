import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schemas';

// 数据库连接字符串
const DATABASE_URL = process.env.DATABASE_URL;

let db: any;

// 安全的数据库初始化
try {
  // 确保 DATABASE_URL 存在，并且只在服务器端初始化数据库连接
  if (typeof window === 'undefined') {
    if (!DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL 环境变量未设置');
      console.warn('请创建 .env.local 文件并设置 DATABASE_URL');
      console.warn('示例: DATABASE_URL="postgresql://username:password@localhost:5432/database_name"');
      db = null;
    } else {
      // 动态导入 'postgres' 库，确保它只在服务器端被加载
      const postgres = require('postgres');
      
      // 检测是否为 Neon 数据库或其他云数据库
      const isCloudDatabase = DATABASE_URL.includes('neon.tech') || 
                             DATABASE_URL.includes('supabase.co') ||
                             DATABASE_URL.includes('planetscale.com') ||
                             DATABASE_URL.includes('railway.app') ||
                             process.env.NODE_ENV === 'production';
      
      // 创建 postgres 客户端实例，配置 SSL
      const client = postgres(DATABASE_URL, {
        ssl: isCloudDatabase 
          ? { rejectUnauthorized: false }
          : false,
        max: 10, // 连接池大小
        idle_timeout: 20, // 空闲超时
        connect_timeout: 10 // 连接超时
      });

      // 使用 drizzle 适配器将 postgres 客户端与 Drizzle ORM 绑定
      db = drizzle(client, { schema });
      console.log('✅ 数据库连接已初始化');
    }
  } else {
    // 客户端环境
    db = null;
  }
} catch (error) {
  console.error('❌ 数据库初始化失败:', error);
  db = null;
}

// 导出数据库实例和模式
export { db };
export * from './schemas';