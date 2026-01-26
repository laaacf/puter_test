# Puter 项目记忆

## 2026-01-26 - 反向代理重定向循环问题修复

### 背景
在本地 Mac mini 环境测试时发现，通过反向代理访问 Puter 时出现重定向循环错误，导致页面无法打开。但直接通过 IP 或 localhost 访问正常。

### 问题根源
1. **子域名提取逻辑缺陷**：原代码假设所有访问都基于 `config.domain`（如 `puter.localhost`）
2. **反向代理场景失败**：当通过反向代理域名（如 `puter.example.com`）访问时，原逻辑会错误地从反向代理域名中提取基于 `puter.localhost` 的子域名
3. **缺少 trust proxy 设置**：Express 没有配置信任反向代理，导致 `X-Forwarded-*` headers 被忽略

**具体表现：**
- 直接访问：http://localhost:4100 ✅ 正常
- 反向代理访问：❌ 重定向循环，页面无法打开

### 解决方案
修改了两个关键文件：

1. **WebServerService.js (第330-331行)**
   - 添加 `app.set('trust proxy', true)`
   - 让 Express 信任反向代理的 `X-Forwarded-*` headers

2. **_default.js (第62-78行)**
   - 重写子域名提取逻辑
   - 只在 hostname 真正匹配 `config.domain` 时提取子域名
   - 对于反向代理或自定义域名，将 subdomain 设为空字符串

**修改后的逻辑：**
```javascript
let subdomain;
const hostname = req.hostname;
const domain_suffix = '.' + config.domain;

if (hostname === config.domain) {
    subdomain = '';
} else if (hostname.endsWith(domain_suffix)) {
    subdomain = hostname.slice(0, -1 * (config.domain.length + 1));
} else {
    // 反向代理或自定义域名
    subdomain = '';
}
```

### 关键经验
1. **反向代理需要 trust proxy 设置**：Express 必须显式配置 `app.set('trust proxy', true)` 才能正确处理反向代理的 headers
2. **子域名提取要考虑边界情况**：不能假设所有请求都符合 `{subdomain}.{domain}` 格式
3. **本地测试很重要**：在本地 Mac mini 测试发现了服务器上未曾发现的问题
4. **版本控制很重要**：之前能工作的修改在 GitHub 版本中丢失，导致问题反复出现

### 最终结果
✅ 直接访问 http://localhost:4100 - 正常
✅ 反向代理访问 - 正常

### Git 提交记录
- `5069918d` fix: 修复反向代理重定向循环问题
- 已推送到 GitHub main 分支

### 技术细节
- 配置：`config.domain = "puter.localhost"`
- 反向代理域名：可以是任意自定义域名（如 `puter.example.com`）
- Express trust proxy：必须设置为 true 才能读取 `X-Forwarded-Host` 等 headers

---

## 2025-01-20 - 多域名访问问题解决

### 背景
用户报告 Puter 在反向代理环境下只能通过一个域名（https://gpt.3868088.xyz）访问，另一个域名（https://puter.3868088.xyz）出现重定向循环问题。

### 问题根源
1. **错误的修复尝试**：最初尝试修改子域名提取逻辑，添加复杂的条件判断，结果导致所有域名都无法访问
2. **服务异常**：修改后服务出现请求无响应的问题
3. **误判问题**：实际上配置文件中的设置已经足够支持多域名访问

### 解决方案
**回退到最简单的原始代码**：
```javascript
const subdomain = req.hostname.slice(0, -1 * (config.domain.length + 1));
```

配合配置文件中的关键设置：
```json
{
    "allow_all_host_values": true,        // 允许任意域名访问
    "allow_nipio_domains": true,          // 允许 nip.io 域名
    "disable_ip_validate_event": true,    // 允许 IP 直接访问
    "custom_domains_enabled": true,       // 允许自定义域名
    "experimental_no_subdomain": true     // API 不使用子域名
}
```

### 关键经验
1. **简单方案往往更好**：复杂的子域名提取逻辑反而破坏了功能，简单的原始代码配合正确的配置设置即可工作
2. **配置很重要**：`allow_all_host_values`, `disable_ip_validate_event`, `experimental_no_subdomain` 这三个设置是支持多域名访问的关键
3. **反向代理支持**：之前修改的 `X-Forwarded-Proto` 和 `X-Forwarded-Host` 头检查是必要的，确保 HTTPS 反向代理正常工作

### 最终结果
✅ https://gpt.3868088.xyz - 正常访问
✅ https://puter.3868088.xyz - 正常访问
✅ http://192.168.50.123:4100 - 正常访问

### Git 提交记录
- `27af4c79` revert: 回退子域名提取修改，恢复到可用状态
- `81a93c8b` fix: 修复子域名提取逻辑，支持多域名访问（有问题）
- `30e0e1c5` Revert "fix: 修复多域名访问时的重定向循环问题"
- `8d197255` fix: 修复多域名访问时的重定向循环问题（有问题）

### 服务部署
- **位置**：~/docker/puter-unlocked
- **启动方式**：`/usr/bin/node ./tools/run-selfhosted.js`
- **注意**：不要使用 `npm start`，会调用错误的 Node.js 版本（NVM 的 v20）
- **管理命令**：
  - 查看日志：`tail -f /tmp/puter.log`
  - 重启服务：`pkill -f 'node.*run-selfhosted' && cd ~/docker/puter-unlocked && nohup /usr/bin/node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &`

### 后续计划
- ✅ Docker 部署已完成 - 详见 deployment/docker-deploy/

---

## 2025-01-26 - Docker 部署方案实现

### 背景
用户在重启 Puter 服务时遇到 Node.js 版本问题。系统顽固地使用 Node.js v20.18.3，而项目需要 v24.13.0。错误信息：
```
SyntaxError: Cannot use import statement outside a module
```

### 解决方案
**实现完整的 Docker 部署方案**，彻底避免 Node.js 版本冲突。

### 改动内容
创建 `deployment/docker-deploy/` 目录，包含：

1. **config.json** - Puter 配置文件
   - 启用多域名支持（allow_all_host_values）
   - 禁用 IP 验证（disable_ip_validate_event）
   - 启用自定义域名（custom_domains_enabled）

2. **docker-compose.yml** - Docker Compose 配置
   - 使用本地 Dockerfile 构建
   - 挂载配置和数据目录
   - 暴露 4100 端口

3. **deploy.sh** - 自动部署脚本
   - 检查 Docker 环境
   - 自动创建目录结构
   - 构建并启动容器

4. **README.md** - 详细部署文档
   - 快速开始指南
   - 管理命令说明
   - 反向代理配置
   - 数据备份方案
   - 常见问题解答

### 部署优势
- ✅ **固定 Node.js 版本**：使用 Docker 镜像中的 Node.js 24-alpine
- ✅ **环境隔离**：不影响系统 Node.js 版本
- ✅ **一键部署**：`./deploy.sh` 自动完成
- ✅ **易于管理**：简单的 Docker Compose 命令
- ✅ **数据持久化**：配置和数据独立存储

### 快速使用
```bash
# 上传到服务器
scp -r deployment/docker-deploy your-server:~/

# 在服务器上运行
cd ~/docker-deploy
chmod +x deploy.sh
./deploy.sh
```

### 管理命令
- 查看日志：`docker compose logs -f`
- 重启服务：`docker compose restart`
- 停止服务：`docker compose down`

### 文件位置
- 部署文件：`deployment/docker-deploy/`
- 文档：`deployment/docker-deploy/README.md`

---

## 2025-01-20 - 项目初始化和反向代理支持（之前的记录）

### 背景
Puter 开源项目默认限制了域名访问，只允许特定格式的主机名访问。用户需要通过反向代理使用自定义域名访问。

### 主要修改
1. **支持反向代理的协议识别**：
   - 文件：`src/backend/src/routers/_default.js`
   - 修改：检查 `X-Forwarded-Proto` 和 `X-Forwarded-Host` 头

2. **API 配置动态生成**：
   - 文件：`src/backend/src/services/PuterHomepageService.js`
   - 修改：使用实际的协议和主机名

3. **简化认证流程**：
   - 禁用注册的 bot 检测（`src/backend/src/routers/signup.js`）
   - 禁用登录的 captcha（`src/backend/src/routers/login.js`）

### 配置文件
创建 `volatile/config/config.json`，关键设置：
- `allow_all_host_values: true`
- `disable_ip_validate_event: true`
- `custom_domains_enabled: true`
- `experimental_no_subdomain: true`

### 部署方式
- 当前：npm start（使用 `/usr/bin/node` 直接启动）
- 计划：Docker 部署

### 技术栈
- Node.js v24.13.0（必须）
- SQLite 数据库
- Dynalite（DynamoDB 本地模拟）
