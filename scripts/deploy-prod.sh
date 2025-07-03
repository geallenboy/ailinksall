#!/bin/bash

# 生产环境部署脚本
# 包含数据库迁移和应用部署

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始生产环境部署...${NC}"

# 1. 检查必要的环境变量
echo -e "${YELLOW}📋 检查环境变量...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL 环境变量未设置${NC}"
    exit 1
fi

# 2. 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
pnpm install --frozen-lockfile

# 3. 代码检查
echo -e "${YELLOW}🔍 执行代码检查...${NC}"
pnpm run lint

# 4. 生成数据库迁移文件（如果有更改）
echo -e "${YELLOW}📝 生成数据库迁移文件...${NC}"
NODE_ENV=production pnpm drizzle-kit generate

# 5. 执行数据库迁移
echo -e "${YELLOW}🔄 执行数据库迁移...${NC}"
NODE_ENV=production pnpm drizzle-kit migrate

# 6. 构建应用
echo -e "${YELLOW}🏗️ 构建应用...${NC}"
pnpm run build

# 7. 健康检查（可选，如果应用已经在运行）
echo -e "${YELLOW}🏥 执行健康检查...${NC}"
if command -v curl &> /dev/null; then
    # 等待应用启动
    sleep 5
    if curl -f http://localhost:3000/api/health; then
        echo -e "${GREEN}✅ 应用健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️ 健康检查失败，可能应用尚未启动${NC}"
    fi
fi

echo -e "${GREEN}🎉 生产环境部署完成！${NC}" 