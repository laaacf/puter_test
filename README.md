# Puter - 支持反向代理的个人云系统

> 🔒 隐私优先的个人云系统，支持反向代理和灵活的域名访问

## ⚡ 快速开始

### 系统要求

- **Node.js** >= 24.0.0
- **npm** >= 10.0.0
- **操作系统**：Linux / macOS / Windows

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/laaacf/puter-unlocked.git
cd puter-unlocked

# 安装依赖
npm install

# 启动服务
npm start

# 访问：http://localhost:4100
```

---

## 🚀 服务器部署（推荐方式）

### 前提准备

```bash
# 1. 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -S bash -
sudo apt install nodejs -y

# 2. 验证版本
node --version  # 应该显示 v24.x.x
npm --version
```

### 部署步骤

```bash
# 1. 克隆仓库到服务器
git clone https://github.com/laaacf/puter-unlocked.git ~/docker/puter-unlocked
cd ~/docker/puter-unlocked

# 2. 创建配置目录
mkdir -p volatile/config

# 3. 创建配置文件
cat > volatile/config/config.json << 'EOF'
{
    "config_name": "Puter Universal Config",
    "env": "dev",
    "nginx_mode": true,
    "http_port": "auto",
    "domain": "puter.localhost",
    "protocol": "http",
    "contact_email": "your-email@example.com",
    "allow_all_host_values": true,
    "allow_nipio_domains": true,
    "disable_ip_validate_event": true,
    "custom_domains_enabled": true,
    "experimental_no_subdomain": true,
    "services": {
        "database": {
            "engine": "sqlite",
            "path": "puter-database.sqlite"
        },
        "dynamo": {
            "path": "./puter-ddb",
            "autostart": false
        }
    },
    "cookie_name": "8fbcc83b-6a51-48f6-9a77-82145c76c651",
    "jwt_secret": "5b35719d-f834-49ad-8532-985c787e02b1",
    "url_signature_secret": "b30bb5cd-0474-403a-a5ae-18fb680969cf",
    "private_uid_secret": "23e9077a30286dbaf2ae74f7dad656179080972eeafa2498",
    "private_uid_namespace": "d30e3844-ebcf-4abc-8d67-d97db8ed5cc6"
}
EOF

# 4. 安装依赖
npm install

# 5. 后台启动服务
nohup npm start > /tmp/puter.log 2>&1 &

# 6. 查看日志和管理员密码
tail -f /tmp/puter.log
# 找到类似这样的输出：
# * Username: admin
# * Password: xxxxxxxx
```

### 访问方式

- **IP 访问**：`http://服务器IP:4100/`
- **本地访问**：`http://localhost:4100/`

---

## 🌐 配置反向代理（可选，推荐）

使用 Nginx 配置 HTTPS 反向代理：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

配置后访问：`https://your-domain.com`

---

## 🛠️ 管理命令

```bash
# 查看进程状态
ps aux | grep 'node.*run-selfhosted'

# 查看实时日志
tail -f /tmp/puter.log

# 停止服务
pkill -f 'node ./tools/run-selfhosted.js'

# 重启服务
cd ~/docker/puter-unlocked
pkill -f 'node ./tools/run-selfhosted.js'
nohup npm start > /tmp/puter.log 2>&1 &

# 查看服务是否在运行
curl http://localhost:4100/
```

---

## ✨ 主要特性

- ✅ **反向代理支持** - 完美支持 Nginx 等 HTTPS 反向代理
- ✅ **灵活的域名访问** - 支持任意域名、IP 地址访问
- ✅ **简单部署** - 无需 Docker，直接 npm install && npm start
- ✅ **完全开源** - 基于官方 Puter 项目修改

---

## 🔧 技术修改

本项目基于 [HeyPuter/puter](https://github.com/HeyPuter/puter) 修改，主要修改：

### 1. 支持反向代理的协议识别
- 检查 `X-Forwarded-Proto` 头识别真实协议（HTTP/HTTPS）
- 检查 `X-Forwarded-Host` 头识别真实主机名
- 修复反向代理时协议不匹配问题

### 2. 简化认证流程
- 移除注册的 bot 检测
- 移除登录的 captcha 验证
- 允许从任意来源访问

### 3. 灵活的访问控制
- 支持任意域名访问（`allow_all_host_values`）
- 支持 IP 直接访问（`disable_ip_validate_event`）
- API 和 GUI 使用同一域名（`experimental_no_subdomain`）

---

## 📖 详细文档

- [版本差异说明](VERSION_DIFFERENCE.md) - 与原项目的差异对比
- [快速开始指南](QUICKSTART.md) - 简化的安装说明

---

## 🔒 配置说明

### 关键配置项

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `allow_all_host_values` | `true` | 允许任意域名访问 |
| `allow_nipio_domains` | `true` | 允许 nip.io 域名 |
| `disable_ip_validate_event` | `true` | 允许 IP 直接访问 |
| `custom_domains_enabled` | `true` | 允许自定义域名 |
| `experimental_no_subdomain` | `true` | API 使用同一域名 |

### 默认登录凭据

首次启动时会自动创建管理员账户：
- **用户名**：`admin`
- **密码**：查看启动日志中的提示

**重要**：首次登录后请立即修改密码！

---

## 🔍 故障排除

### 问题 1：Node.js 版本过低

```bash
# 升级到 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -S bash -
sudo apt install nodejs -y
```

### 问题 2：端口被占用

```bash
# 查找占用 4100 端口的进程
sudo lsof -i :4100

# 停止该进程
sudo kill -9 <PID>
```

### 问题 3：无法访问

```bash
# 检查服务是否运行
ps aux | grep 'node.*run-selfhosted'

# 检查日志
tail -50 /tmp/puter.log

# 测试本地访问
curl http://localhost:4100/
```

### 问题 4：反向代理显示空白页面

**原因**：协议不匹配（HTTP vs HTTPS）

**解决**：
1. 确认 Nginx 配置包含 `X-Forwarded-Proto` 头
2. 检查前端配置中的 `api_origin` 是否使用正确的协议

---

## 📚 相关链接

- **原项目**：https://github.com/HeyPuter/puter
- **修改版本**：https://github.com/laaacf/puter-unlocked
- **官方网站**：https://puter.com

---

## 📄 许可证

本项目遵循原项目的 [AGPL-3.0](https://github.com/HeyPuter/puter/blob/master/LICENSE.txt) 许可证。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## ⭐ 更新记录

### v1.0 (2025-01-20)

- ✅ 支持反向代理和灵活域名访问
- ✅ 修复反向代理时协议不匹配问题
- ✅ 简化认证流程（移除 captcha 和 bot 检测）
- ✅ 优化部署方式（npm start 直接运行）
- ✅ 添加完整的服务器部署文档

---

**享受你的私人云系统！** 🎉
