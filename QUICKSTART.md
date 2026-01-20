# 🚀 Puter 快速部署指南

## ⚡ 超级简单（3 步完成）

### 在你的服务器上运行：

```bash
# 1️⃣ 克隆仓库
git clone https://github.com/laaacf/puter-unlocked.git ~/docker/puter-unlocked
cd ~/docker/puter-unlocked

# 2️⃣ 创建配置文件
mkdir -p volatile/config
cat > volatile/config/config.json << 'EOF'
{
    "config_name": "Puter Universal Config",
    "env": "dev",
    "http_port": "auto",
    "allow_all_host_values": true,
    "allow_nipio_domains": true,
    "disable_ip_validate_event": true,
    "custom_domains_enabled": true,
    "experimental_no_subdomain": true
}
EOF

# 3️⃣ 安装并启动
npm install
nohup npm start > /tmp/puter.log 2>&1 &

# 查看管理员密码
grep "Password:" /tmp/puter.log
```

**就这么简单！** 🎉

---

## 📦 系统要求

- **Node.js** >= 24.0.0
- **npm** >= 10.0.0
- **操作系统**：Linux（推荐 Debian/Ubuntu）

检查 Node.js 版本：
```bash
node --version
npm --version
```

如果版本过低，请升级：
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -S bash -
sudo apt install nodejs -y
```

---

## 🎯 适用场景

✅ **个人云服务器** - 搭建自己的私有云
✅ **内网文件共享** - 局域网内文件共享
✅ **反向代理部署** - 域名访问
✅ **多域名支持** - 一个实例多个域名

---

## 🌐 访问方式

部署成功后，可以通过以下方式访问：

- **本地**：`http://localhost:4100`
- **IP**：`http://服务器IP:4100`
- **域名**：`http://your-domain.com`
- **反向代理**：通过 Nginx 等访问

---

## 🛠️ 常用命令

```bash
# 查看服务状态
ps aux | grep 'node.*run-selfhosted'

# 查看日志
tail -f /tmp/puter.log

# 重启服务
pkill -f 'node ./tools/run-selfhosted.js'
cd ~/docker/puter-unlocked
nohup npm start > /tmp/puter.log 2>&1 &

# 停止服务
pkill -f 'node ./tools/run-selfhosted.js'
```

---

## 🔒 默认登录凭据

首次启动时会自动创建管理员账户：
- **用户名**：`admin`
- **密码**：查看启动日志

**重要**：首次登录后请立即修改密码！

---

## 🌐 配置 HTTPS（推荐）

使用 Nginx 配置 HTTPS 反向代理：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4100;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

获取免费 SSL 证书：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ❓ 常见问题

### Q: 部署需要多久？
A: npm install 需要 2-5 分钟，启动秒级。

### Q: 占用多少资源？
A: 约占用 500MB-1GB 内存。

### Q: 数据安全吗？
A: 数据存储在 `volatile/runtime/` 目录，建议定期备份。

### Q: 支持多用户吗？
A: 支持，可以注册多个用户账号。

### Q: 如何备份数据？
A: 备份 `volatile/runtime/` 目录即可。

---

## 📞 需要帮助？

- 📖 查看详细文档：[README.md](README.md)
- 📋 版本差异：[VERSION_DIFFERENCE.md](VERSION_DIFFERENCE.md)
- 🐛 提交问题：[GitHub Issues](https://github.com/laaacf/puter-unlocked/issues)

---

## ⭐ 版本信息

- **版本**: v1.0
- **基于**: HeyPuter/puter
- **修改日期**: 2025-01-20
- **主要特性**: 反向代理支持、灵活域名访问

---

**开始使用你的私人云系统吧！** 🎉
