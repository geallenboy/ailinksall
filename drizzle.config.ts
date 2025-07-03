import { defineConfig } from "drizzle-kit"

// 根据环境获取不同的数据库配置
const getDbConfig = () => {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error("DATABASE_URL 环境变量必须设置")
  }

  // 检测是否为云数据库（需要 SSL）
  const isCloudDatabase = dbUrl.includes('neon.tech') || 
                         dbUrl.includes('supabase.co') ||
                         dbUrl.includes('planetscale.com') ||
                         dbUrl.includes('railway.app') ||
                         process.env.NODE_ENV === 'production';

  return {
    url: dbUrl,
    ssl: isCloudDatabase ? { rejectUnauthorized: false } : false
  }
}

export default defineConfig({
    out: "./src/drizzle/migrations",
    schema: "./src/drizzle/schemas",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: getDbConfig(),
})