# Puter 项目记忆

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
- 考虑 Docker 部署（更灵活、更安全）
- 与服务器适当隔离

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
