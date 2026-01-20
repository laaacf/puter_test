#!/bin/bash
# Puter 完整部署脚本
# 在服务器上运行此脚本进行完整部署

set -e

echo "========================================"
echo "  Puter Docker 完整部署"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查 Docker 是否安装
echo -e "${YELLOW}1. 检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 已安装"
echo ""

# 2. 检查 Docker Compose
echo -e "${YELLOW}2. 检查 Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装"
    exit 1
fi
echo "✅ Docker Compose 已安装"
echo ""

# 3. 检查是否在项目目录
echo -e "${YELLOW}3. 检查项目目录...${NC}"
if [ ! -f "Dockerfile" ]; then
    echo "❌ 未找到 Dockerfile，请确保在 Puter 项目根目录"
    exit 1
fi
echo "✅ 当前目录正确"
echo ""

# 4. 创建必要的目录
echo -e "${YELLOW}4. 创建目录结构...${NC}"
mkdir -p config data
echo "✅ 目录创建完成"
echo ""

# 5. 设置权限
echo -e "${YELLOW}5. 设置目录权限...${NC}"
sudo chown -R 1000:1000 config data
echo "✅ 权限设置完成"
echo ""

# 6. 创建配置文件
echo -e "${YELLOW}6. 创建配置文件...${NC}"
if [ ! -f "config/config.json" ]; then
    if [ -f "config.prod.json" ]; then
        cp config.prod.json config/config.json
        echo "✅ 配置文件创建完成（从 config.prod.json 复制）"
    else
        cat > config/config.json << 'EOF'
{
    "env": "production",
    "http_port": 4100,
    "allow_all_host_values": true,
    "experimental_no_subdomain": true,
    "disable_ip_validate_event": true,
    "services": {
        "database": {
            "engine": "sqlite",
            "path": "/var/puter/puter-database.sqlite"
        }
    }
}
EOF
        echo "✅ 配置文件创建完成（最小配置）"
    fi
else
    echo "⚠️  配置文件已存在，跳过创建"
fi
echo ""

# 7. 检查是否有旧的容器
echo -e "${YELLOW}7. 检查旧容器...${NC}"
if sudo docker ps -a | grep -q puter; then
    echo "⚠️  发现旧容器，是否删除？(y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        sudo docker compose down 2>/dev/null || sudo docker rm -f puter
        echo "✅ 旧容器已删除"
    else
        echo "❌ 取消部署"
        exit 1
    fi
else
    echo "✅ 没有旧容器"
fi
echo ""

# 8. 构建 Docker 镜像
echo -e "${YELLOW}8. 构建 Docker 镜像...${NC}"
echo "⏳ 这可能需要 10-15 分钟，请耐心等待..."
sudo docker compose build
echo "✅ 镜像构建完成"
echo ""

# 9. 启动容器
echo -e "${YELLOW}9. 启动容器...${NC}"
sudo docker compose up -d
echo "✅ 容器已启动"
echo ""

# 10. 等待服务就绪
echo -e "${YELLOW}10. 等待服务就绪...${NC}"
echo "⏳ 等待 30 秒..."
sleep 30

# 11. 检查容器状态
echo -e "${YELLOW}11. 检查容器状态...${NC}"
sudo docker compose ps
echo ""

# 12. 显示访问信息
echo -e "${GREEN}========================================"
echo "  🎉 部署完成！"
echo "========================================${NC}"
echo ""
echo "访问地址："
echo "  - 本地: http://localhost:4100"
echo "  - 局域网: http://$(hostname -I | awk '{print $1}'):4100"
echo ""
echo "查看日志："
echo "  sudo docker compose logs -f puter"
echo ""
echo "管理容器："
echo "  停止: sudo docker compose stop"
echo "  启动: sudo docker compose start"
echo "  重启: sudo docker compose restart"
echo "  删除: sudo docker compose down"
echo ""
echo -e "${GREEN}========================================${NC}"
