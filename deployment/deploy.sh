#!/bin/bash
# Puter 快速部署脚本
# 在 Debian 服务器上运行此脚本

set -e  # 遇到错误立即退出

echo "======================================"
echo "  Puter Docker 部署脚本"
echo "======================================"
echo ""

# 1. 创建目录
echo "📁 创建目录结构..."
mkdir -p ~/docker/puter/config
mkdir -p ~/docker/puter/data

# 2. 设置权限
echo "🔐 设置目录权限..."
sudo chown -R 1000:1000 ~/docker/puter

# 3. 下载配置文件
echo "⬇️  下载配置文件..."
cd ~/docker/puter

# 下载 docker-compose.yml
if [ ! -f docker-compose.yml ]; then
    wget -q https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/docker-compose.yml -O docker-compose.yml
    echo "  ✓ docker-compose.yml 下载完成"
else
    echo "  ⚠ docker-compose.yml 已存在，跳过下载"
fi

# 下载 config.json
if [ ! -f config/config.json ]; then
    wget -q https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/config.json -O config/config.json
    echo "  ✓ config.json 下载完成"
else
    echo "  ⚠ config.json 已存在，跳过下载"
fi

# 4. 显示配置
echo ""
echo "======================================"
echo "  部署准备完成！"
echo "======================================"
echo ""
echo "目录位置："
echo "  - 配置：~/docker/puter/config"
echo "  - 数据：~/docker/puter/data"
echo ""
echo "下一步操作："
echo ""
echo "方式 1 - 命令行部署："
echo "  cd ~/docker/puter"
echo "  docker compose up -d"
echo ""
echo "方式 2 - Portainer Stack 部署："
echo "  1. 打开 Portainer"
echo "  2. Stacks → Add stack"
echo "  3. 复制以下内容："
echo ""
cat portainer-stack.yml 2>/dev/null || echo "  （需要手动从 GitHub 获取 portainer-stack.yml）"
echo ""
echo "======================================"
