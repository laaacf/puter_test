# Puter Docker 部署指南

基于修改后的 Puter 版本，支持反向代理和灵活的域名访问。

## 📋 部署准备

### 系统要求
- Debian 服务器
- Docker 和 Docker Compose 已安装
- Portainer（可选，用于图形化管理）

### 部署目录
`~/docker/puter`

## 🚀 快速部署（使用命令行）

### 1. 创建目录结构
```bash
mkdir -p ~/docker/puter/config
mkdir -p ~/docker/puter/data
```

### 2. 设置权限
```bash
sudo chown -R 1000:1000 ~/docker/puter
```

### 3. 下载配置文件

从你的仓库获取文件：
```bash
cd ~/docker/puter

# 下载 docker-compose.yml
wget https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/docker-compose.yml -O docker-compose.yml

# 下载配置文件
wget https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/config.json -O config/config.json
```

### 4. 启动服务
```bash
cd ~/docker/puter
docker compose up -d
```

### 5. 查看日志
```bash
docker compose logs -f puter
```

## 🎨 使用 Portainer 部署

### ⚠️ 重要限制

**Portainer Stack 不支持从 GitHub URL 直接构建自定义镜像！**

如果你需要反向代理和灵活域名访问功能，**请使用命令行部署**。

---

### 方案 1：命令行部署（强烈推荐）

这是**唯一支持完整功能**的方式：

```bash
# 1. 准备目录
mkdir -p ~/docker/puter/config
mkdir -p ~/docker/puter/data
sudo chown -R 1000:1000 ~/docker/puter

# 2. 下载配置文件
cd ~/docker/puter
wget https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/docker-compose.yml
wget https://raw.githubusercontent.com/laaacf/puter_test/main/deployment/config.json -O config/config.json

# 3. 启动
docker compose up -d
```

---

### 方案 2：Portainer + 官方镜像（功能受限）

如果你坚持使用 Portainer，可以：
1. 先运行命令行部署脚本准备目录
2. 然后在 Portainer 中使用下面的配置

**限制：**
- ❌ 不支持反向代理
- ❌ 不支持 IP 直接访问
- ✅ 只能通过 puter.localhost 访问

```yaml
---
version: "3.8"
services:
  puter:
    container_name: puter
    image: ghcr.io/heyputer/puter:latest
    restart: unless-stopped
    ports:
      - '4100:4100'
    environment:
      TZ: Asia/Shanghai
      PUID: 1000
      PGID: 1000
    volumes:
      - /home/你的用户名/docker/puter/config:/etc/puter
      - /home/你的用户名/docker/puter/data:/var/puter
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:4100/test || exit 1
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 30s
```

4. **部署**
   - 点击 "Deploy the stack"
   - 等待容器启动

### 方法 2：通过 Git 仓库部署

1. 在 Portainer 中添加你的 Git 仓库
2. 使用仓库中的 `deployment/docker-compose.yml` 文件

## 🔧 配置说明

### 重要配置项（config.json）

```json
{
    "allow_all_host_values": true,        // 允许任意域名访问
    "allow_nipio_domains": true,          // 允许 nip.io 域名
    "disable_ip_validate_event": true,    // 禁用 IP 验证
    "custom_domains_enabled": true,       // 允许自定义域名
    "experimental_no_subdomain": true     // API 和 GUI 使用同一域名
}
```

### ⚠️ 重要说明：镜像构建

**本版本使用自定义构建，包含反向代理支持！**

- ✅ 使用修改后的源代码构建镜像
- ✅ 支持反向代理和灵活域名访问
- ✅ 从 GitHub 仓库自动构建
- ⏱️ 首次构建需要较长时间（约 10-15 分钟）

**与官方镜像的区别：**
- 官方镜像：`ghcr.io/heyputer/puter:latest` - **不支持反向代理**
- 自定义镜像：从 `laaacf/puter_test` 构建 - **支持反向代理**

### 修改配置文件

编辑 `~/docker/puter/config/config.json`：

```bash
nano ~/docker/puter/config/config.json
```

修改后重启容器：
```bash
docker compose restart
```

## 🌐 访问方式

部署后，可以通过以下方式访问：

1. **直接访问**
   - `http://你的服务器IP:4100`
   - `http://localhost:4100`（服务器本地）

2. **反向代理访问**
   - 配置 Nginx 或其他反向代理
   - 指向 `http://localhost:4100`
   - 例如：`http://gpt.3868088.xyz`

## 🔄 常用命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f puter

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 启动服务
docker compose up -d

# 更新到最新版本
docker compose pull
docker compose up -d
```

## 🛡️ 防火墙配置

如果需要外部访问，开放端口：

```bash
# 使用 ufw
sudo ufw allow 4100/tcp

# 使用 firewalld
sudo firewall-cmd --permanent --add-port=4100/tcp
sudo firewall-cmd --reload
```

## 🐳 Docker 管理技巧

### 查看容器资源占用
```bash
docker stats puter
```

### 进入容器调试
```bash
docker exec -it puter bash
```

### 清理旧镜像
```bash
docker image prune -a
```

## 📊 数据备份

备份配置和数据：
```bash
# 创建备份目录
mkdir -p ~/docker/backup/puter

# 备份数据
tar -czf ~/docker/backup/puter/puter-$(date +%Y%m%d).tar.gz ~/docker/puter
```

恢复数据：
```bash
tar -xzf ~/docker/backup/puter/puter-20250120.tar.gz -C ~/
```

## 🆘 故障排除

### 容器无法启动
```bash
# 查看详细日志
docker compose logs puter

# 检查端口占用
sudo netstat -tulpn | grep 4100
```

### 无法访问
1. 检查防火墙设置
2. 确认容器正在运行：`docker compose ps`
3. 检查健康状态：`docker inspect puter | grep -A 10 Health`

### 配置不生效
1. 确认配置文件路径正确
2. 检查文件权限：`ls -la ~/docker/puter/config/`
3. 重启容器：`docker compose restart`

## 📝 注意事项

1. **首次启动较慢**：需要构建镜像，请耐心等待
2. **数据持久化**：数据存储在 `~/docker/puter/data` 目录
3. **配置备份**：定期备份 `config` 目录
4. **安全性**：建议使用反向代理 + HTTPS

## 🔗 相关链接

- 原项目：https://github.com/HeyPuter/puter
- 修改版本：https://github.com/laaacf/puter_test
- Portainer 文档：https://docs.portainer.io/

## ✨ 功能特性

- ✅ 支持任意域名访问
- ✅ 支持反向代理
- ✅ 支持 IP 直接访问
- ✅ API 和 GUI 使用同一域名
- ✅ 灵活的访问控制配置

## 📧 更新日志

### 2025-01-20
- 支持反向代理访问
- 修复 canonical_url 生成逻辑
- 修复 API 地址动态生成
- 添加灵活的访问控制配置
