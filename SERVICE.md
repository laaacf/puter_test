# Puter 服务管理指南

## ⚠️ 重要提示

**不要使用 `npm start`！** 使用 `npm start` 可能会调用错误版本的 Node.js（v20），导致服务启动失败。

**始终使用以下方式启动服务：**

```bash
cd ~/docker/puter-unlocked
./start.sh
```

或手动启动：

```bash
cd ~/docker/puter-unlocked
nohup /usr/bin/node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &
```

---

## 🚀 启动服务

### 方式 1：使用启动脚本（推荐）

```bash
cd ~/docker/puter-unlocked
./start.sh
```

### 方式 2：手动启动

```bash
cd ~/docker/puter-unlocked
nohup /usr/bin/node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &
```

---

## 🛠️ 管理命令

### 查看服务状态

```bash
# 查看进程
ps aux | grep 'node.*run-selfhosted'

# 查看日志
tail -f /tmp/puter.log

# 查看 Node.js 版本
/usr/bin/node --version
```

### 重启服务

```bash
# 使用脚本（推荐）
cd ~/docker/puter-unlocked
./start.sh

# 或手动重启
cd ~/docker/puter-unlocked
pkill -f 'node.*run-selfhosted'
nohup /usr/bin/node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &
```

### 停止服务

```bash
pkill -f 'node.*run-selfhosted'
```

---

## 🔍 故障排除

### 问题 1：服务启动失败

**症状**：查看日志显示 "Cannot use import statement outside a module"

**原因**：使用了错误的 Node.js 版本（v20 而不是 v24）

**解决**：
```bash
# 确保使用 /usr/bin/node
/usr/bin/node --version  # 应该显示 v24.x.x

# 使用正确的方式启动
cd ~/docker/puter-unlocked
nohup /usr/bin/node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &
```

### 问题 2：域名重定向循环

**症状**：使用某个域名访问时提示"重定向次数过多"

**原因**：某些域名的子域名提取逻辑有问题

**当前状态**：已回退修复，使用 https://gpt.3868088.xyz 可以正常访问

**临时方案**：如果需要使用新域名，建议使用 https://gpt.3868088.xyz

---

## 📊 当前配置

- **Node.js 版本**：v24.13.0（位于 `/usr/bin/node`）
- **服务端口**：4100
- **日志文件**：/tmp/puter.log
- **数据目录**：~/docker/puter-unlocked/volatile/runtime/

---

## 🌐 访问地址

- **本地访问**：http://192.168.50.123:4100/
- **反向代理**：https://gpt.3868088.xyz/
- **管理员账号**：admin（密码查看日志）

---

## ⚙️ 为什么不用 npm start？

服务器上安装了多个 Node.js 版本：
- **系统 Node.js v24**：`/usr/bin/node` ✅ 正确版本
- **NVM Node.js v20**：`~/.nvm/versions/node/v20.18.3/bin/node` ❌ 错误版本

当使用 `npm start` 时，npm 可能会调用 NVM 的 Node.js v20，导致启动失败。

**解决方案**：直接使用 `/usr/bin/node` 启动服务。

---

## 💡 最佳实践

1. **始终使用启动脚本**：`./start.sh`
2. **定期查看日志**：`tail -f /tmp/puter.log`
3. **监控服务状态**：`ps aux | grep 'node.*run-selfhosted'`
4. **备份重要数据**：备份 `volatile/runtime/` 目录

---

## 📞 需要帮助？

- 查看日志：`tail -f /tmp/puter.log`
- 检查进程：`ps aux | grep 'node.*run-selfhosted'`
- 提交问题：[GitHub Issues](https://github.com/laaacf/puter-unlocked/issues)
