#!/bin/bash

# 生产环境部署前检查脚本
echo "🚀 开始生产环境部署前检查..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ 环境变量 $1 未设置${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 环境变量 $1 已设置${NC}"
        return 0
    fi
}

# 检查必需的环境变量
echo -e "\n${YELLOW}检查环境变量...${NC}"
ENV_ERRORS=0

# Clerk 认证
check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" || ENV_ERRORS=$((ENV_ERRORS + 1))
check_env_var "CLERK_SECRET_KEY" || ENV_ERRORS=$((ENV_ERRORS + 1))

# 数据库
check_env_var "DATABASE_URL" || ENV_ERRORS=$((ENV_ERRORS + 1))

# 应用配置
check_env_var "NEXT_PUBLIC_APP_URL" || ENV_ERRORS=$((ENV_ERRORS + 1))

# 检查是否是生产密钥
echo -e "\n${YELLOW}检查生产环境密钥...${NC}"
if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == pk_live_* ]]; then
    echo -e "${GREEN}✅ 使用 Clerk 生产环境密钥${NC}"
else
    echo -e "${YELLOW}⚠️  警告: 使用的是 Clerk 测试环境密钥${NC}"
fi

# 检查依赖安装
echo -e "\n${YELLOW}检查依赖...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✅ 找到 pnpm-lock.yaml${NC}"
else
    echo -e "${RED}❌ 未找到 pnpm-lock.yaml，请运行 pnpm install${NC}"
    ENV_ERRORS=$((ENV_ERRORS + 1))
fi

# 运行类型检查
echo -e "\n${YELLOW}运行类型检查...${NC}"
if pnpm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 类型检查通过${NC}"
else
    echo -e "${RED}❌ 类型检查失败，请修复后再部署${NC}"
    ENV_ERRORS=$((ENV_ERRORS + 1))
fi

# 运行构建测试
echo -e "\n${YELLOW}测试构建...${NC}"
if NODE_ENV=production pnpm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 构建成功${NC}"
else
    echo -e "${RED}❌ 构建失败，请检查代码${NC}"
    ENV_ERRORS=$((ENV_ERRORS + 1))
fi

# 检查数据库连接
echo -e "\n${YELLOW}检查数据库连接...${NC}"
if curl -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库连接正常${NC}"
else
    echo -e "${YELLOW}⚠️  无法连接到健康检查端点，请确保应用正在运行${NC}"
fi

# 最终结果
echo -e "\n${YELLOW}=================================${NC}"
if [ $ENV_ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！应用已准备好部署到生产环境${NC}"
    exit 0
else
    echo -e "${RED}❌ 发现 $ENV_ERRORS 个问题，请修复后再部署${NC}"
    exit 1
fi 