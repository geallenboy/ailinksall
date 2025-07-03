#!/bin/bash

# 数据库环境管理脚本
# 使用方法: ./scripts/db-env.sh [环境名] [操作]
# 示例: ./scripts/db-env.sh dev migrate
#       ./scripts/db-env.sh prod migrate

set -e

ENV=${1:-dev}
OPERATION=${2:-help}

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 环境配置
case $ENV in
    "dev")
        ENV_FILE=".env.local"
        ENV_NAME="开发环境"
        ;;
    "staging")
        ENV_FILE=".env.staging"
        ENV_NAME="测试环境"
        ;;
    "prod")
        ENV_FILE=".env.production"
        ENV_NAME="生产环境"
        ;;
    *)
        echo -e "${RED}❌ 不支持的环境: $ENV${NC}"
        echo "支持的环境: dev, staging, prod"
        exit 1
        ;;
esac

# 检查环境文件是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 环境文件 $ENV_FILE 不存在${NC}"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' $ENV_FILE | xargs)

echo -e "${YELLOW}🚀 执行数据库操作 - $ENV_NAME${NC}"
echo -e "${YELLOW}📁 环境文件: $ENV_FILE${NC}"

case $OPERATION in
    "generate")
        echo -e "${GREEN}📝 生成迁移文件...${NC}"
        NODE_ENV=$ENV pnpm drizzle-kit generate
        ;;
    "migrate")
        echo -e "${GREEN}🔄 执行数据库迁移...${NC}"
        NODE_ENV=$ENV pnpm drizzle-kit migrate
        ;;
    "push")
        if [ "$ENV" = "prod" ]; then
            echo -e "${RED}❌ 生产环境不允许使用 push 命令，请使用 migrate${NC}"
            exit 1
        fi
        echo -e "${GREEN}⬆️ 推送 schema 到数据库...${NC}"
        NODE_ENV=$ENV pnpm drizzle-kit push
        ;;
    "studio")
        echo -e "${GREEN}🎨 启动 Drizzle Studio...${NC}"
        if [ "$ENV" = "prod" ]; then
            NODE_TLS_REJECT_UNAUTHORIZED=0 NODE_ENV=$ENV pnpm drizzle-kit studio
        else
            NODE_ENV=$ENV pnpm drizzle-kit studio
        fi
        ;;
    "status")
        echo -e "${GREEN}📊 检查迁移状态...${NC}"
        NODE_ENV=$ENV pnpm drizzle-kit check
        ;;
    "help")
        echo -e "${GREEN}📖 使用帮助:${NC}"
        echo "  generate - 生成迁移文件"
        echo "  migrate  - 执行数据库迁移"
        echo "  push     - 推送 schema (仅限开发环境)"
        echo "  studio   - 启动 Drizzle Studio"
        echo "  status   - 检查迁移状态"
        echo ""
        echo -e "${GREEN}📖 使用示例:${NC}"
        echo "  ./scripts/db-env.sh dev generate"
        echo "  ./scripts/db-env.sh dev migrate"
        echo "  ./scripts/db-env.sh prod migrate"
        echo "  ./scripts/db-env.sh dev studio"
        ;;
    *)
        echo -e "${RED}❌ 不支持的操作: $OPERATION${NC}"
        echo "运行 './scripts/db-env.sh help' 查看帮助"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ 操作完成${NC}" 