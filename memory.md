# Puter 项目记忆

## 2026-01-27 - Viewer 图片查看器实现成功

### 背景
用户报告 Puter 开源版本的 builtin apps（viewer、editor、pdf 等）是半成品，无法正常使用。特别是 viewer 图片查看器打开图片时显示 "Error loading image"。

### 问题根源分析

**问题1：数据库 index_url 指向官方版本**
- 原数据库记录：`index_url='https://viewer.puter.com/index.html'`
- 导致系统加载官方的 HTTPS viewer，而文件 URL 是 HTTP 的 localhost
- 结果：混合内容错误（Mixed Content）和 CORS 错误

**问题2：viewer 应用没有使用 URL 参数传递文件信息**
- Puter 通过 URL 参数传递文件信息（`puter.item.uid`、`puter.item.read_url` 等）
- 原版 viewer 只通过 postMessage 等待父窗口发送消息
- 导致文件信息无法获取

### 解决方案

**修复1：更新数据库中 builtin apps 的 index_url**
```sql
-- 更新 viewer
UPDATE apps SET index_url='https://builtins.namespaces.puter.com/viewer' WHERE name='viewer';

-- 更新其他 apps
UPDATE apps SET index_url='https://builtins.namespaces.puter.com/editor' WHERE name='editor';
UPDATE apps SET index_url='https://builtins.namespaces.puter.com/pdf' WHERE name='pdf';
UPDATE apps SET index_url='https://builtins.namespaces.puter.com/player' WHERE name='player';
```

这样 `launch_app.js` 会将 URL 转换为 `${window.gui_origin}/builtin/${name}`，指向本地版本。

**修复2：修改 viewer 支持从 URL 参数加载文件**
```javascript
// 优先使用 URL 参数中的 read_url（最直接）
if (params.itemReadUrl) {
    displayImage(params.itemReadUrl, item);
    return;
}

// 备用：使用 SDK
if (typeof window.puter !== 'undefined') {
    const blob = await window.puter.fs.read({ uid: params.itemUid });
    const url = URL.createObjectURL(blob);
    displayImage(url, item);
    return;
}

// 最后备用：直接使用 /item/{uid}
const directUrl = `/item/${params.itemUid}`;
displayImage(directUrl, item);
```

**修复3：viewer 功能完整实现**
- ✅ 缩放：放大/缩小/适应屏幕/实际尺寸
- ✅ 旋转：左旋转/右旋转 90°
- ✅ 全屏模式
- ✅ 键盘快捷键（+, -, F, A, L, R, F11）
- ✅ 鼠标滚轮缩放（Ctrl+scroll）
- ✅ 文件信息显示（名称、大小、类型）
- ✅ 调试面板（实时日志）

### 修复效果
- ✅ Viewer 能正常显示图片
- ✅ 支持所有基本操作（缩放、旋转、全屏）
- ✅ 不依赖外部域名（viewer.puter.com）
- ✅ 使用本地 `/builtin/viewer` 路径
- ✅ 调试信息清晰可见

### 数据库变更记录
```bash
# 查看当前状态
sqlite3 volatile/runtime/puter-database.sqlite \
  "SELECT name, index_url FROM apps WHERE name IN ('viewer', 'editor', 'pdf', 'player');"

# 结果：
# viewer|https://builtins.namespaces.puter.com/viewer
# editor|https://builtins.namespaces.puter.com/editor
# pdf|https://builtins.namespaces.puter.com/pdf
# player|https://builtins.namespaces.puter.com/player
```

### 关键经验
1. **Builtin apps 需要使用特定的 index_url 格式**：`https://builtins.namespaces.puter.com/{name}` 会被转换为 `/builtin/{name}`
2. **URL 参数是传递文件信息的主要方式**：不要只依赖 postMessage
3. **read_url 是最可靠的加载方式**：不需要 SDK，直接使用签名 URL
4. **调试面板对开发很有帮助**：能快速定位问题
5. **数据库迁移可能不会自动执行**：需要手动检查和更新

### 下一步计划
- ✅ Viewer - 已完成
- ✅ Editor - 已完成
- ✅ PDF Viewer - 已完成
- ✅ Player - 已完成
- ✅ Draw - 已完成
- ✅ Code - 已完成

### 所有 Builtin Apps 实现完成（2026-01-27）

在成功实现 Viewer 后，继续实现了其余 4 个 builtin apps：

#### 1. Editor - 文本编辑器 ✅
**功能：**
- 打开和编辑文本文件
- 自动保存（2秒延迟）
- 手动保存（Ctrl+S）
- 撤销/重做
- Tab 键插入4个空格
- 实时显示行数和字符数
- 状态指示器（已保存/未保存/保存中/错误）

**文件：** `src/builtin/editor/index.html`

#### 2. PDF Viewer - PDF 查看器 ✅
**功能：**
- 使用 PDF.js 库渲染 PDF
- 翻页（上一页/下一页）
- 缩放（放大/缩小/适应宽度）
- 页面导航（键盘方向键）
- 全屏模式（F11）
- 显示页码和总页数
- 显示文件信息

**文件：** `src/builtin/pdf/index.html`

#### 3. Player - 媒体播放器 ✅
**功能：**
- 支持音频文件（mp3, wav, ogg, aac, flac, m4a）
- 支持视频文件（mp4, webm, ogg, mov, avi, mkv）
- 自动识别文件类型
- HTML5 原生控制器
- 键盘快捷键：
  - 空格/K：播放/暂停
  - 方向键：快进/快退5秒
  - 上/下：调整音量
  - F：全屏
  - M：静音
- 显示分辨率、时长、文件大小

**文件：** `src/builtin/player/index.html`

#### 4. Draw - 绘图工具 ✅
**功能：**
- 画笔工具（可调节颜色和粗细）
- 橡皮擦工具
- 颜色选择器
- 画笔大小调节（1-50px）
- 清空画布
- 保存到 Puter 或下载到本地
- 支持鼠标和触摸操作
- 键盘快捷键：B（画笔）、E（橡皮擦）、Ctrl+S（保存）
- 响应式画布（自动适应窗口大小）

**文件：** `src/builtin/draw/index.html`

#### 5. Code - 代码编辑器 ✅
**功能：**
- 语法高亮显示（根据文件扩展名识别语言）
- 行号显示
- 自动保存（2秒延迟）
- 手动保存（Ctrl+S）
- 撤销/重做
- Tab 键插入4个空格
- Ctrl+/ 注释/取消注释
- 显示语言类型、行数、字符数
- 支持 30+ 编程语言

**支持的语言：** JavaScript, TypeScript, Python, Java, C, C++, C#, PHP, Ruby, Go, Rust, Kotlin, Swift, HTML, CSS, SCSS, XML, JSON, YAML, Markdown, SQL, Shell, Bash 等

**文件：** `src/builtin/code/index.html`

### 实现总结

**共同特性：**
1. ✅ 所有应用都支持从 URL 参数加载文件
2. ✅ 优先使用 read_url（不依赖 SDK）
3. ✅ 统一的设计风格（暗色主题）
4. ✅ 键盘快捷键支持
5. ✅ 实时状态显示
6. ✅ 错误处理和用户提示
7. ✅ 完全独立运行（无外部依赖，除了 PDF.js）

**文件结构：**
```
src/builtin/
├── viewer/index.html  - 图片查看器
├── editor/index.html  - 文本编辑器
├── pdf/index.html     - PDF 查看器
├── player/index.html  - 媒体播放器
├── draw/index.html    - 绘图工具
└── code/index.html    - 代码编辑器
```

**数据库配置：**
所有 apps 的 index_url 都指向 `https://builtins.namespaces.puter.com/{name}`，系统会自动转换为 `/builtin/{name}`。

**测试建议：**
1. Viewer - 上传图片并打开测试缩放、旋转功能
2. Editor - 创建文本文件测试编辑和保存
3. PDF - 上传 PDF 测试翻页和缩放
4. Player - 上传音频/视频测试播放控制
5. Draw - 新建绘图画图并保存
6. Code - 创建代码文件测试编辑功能

---

## 2026-01-27 - 开发模式下强制使用打包 GUI

### 背景
用户报告 http://puter.localhost:4100/ 和 http://192.168.50.152:4100/ 都显示空白页面。之前虽然修复了 `use_bundled_gui` 默认值和 CSS 加载，但在开发环境（env = "dev"）下，HTML 仍然使用 `/src/` 路径而不是 `/dist/` 路径。

### 问题根源
**配置文件中 `env` 设置为 `"dev"`**，导致：
- `PuterHomepageService.js` 第 215-216 行的逻辑：`const asset_dir = env === 'dev' ? '/src' : '/dist'`
- 即使 `use_bundled_gui = true`，在 `env === 'dev'` 时仍使用 `/src/` 路径
- `/src/` 路径下的文件在打包构建后不存在，导致页面空白

**具体表现：**
- HTML 包含 `/src/favicons/` 等路径
- 但实际文件在 `/dist/` 目录
- 浏览器加载 404，页面空白

### 解决方案
**修改 `PuterHomepageService.js` 第 215-217 行逻辑：**
```javascript
// 修改前
const asset_dir = env === 'dev'
    ? '/src' : '/dist';

// 修改后
// 如果 use_bundled_gui 为 true，强制使用打包的 GUI
const asset_dir = (env === 'dev' && !use_bundled_gui)
    ? '/src' : '/dist';
```

**新逻辑：**
- 如果 `env === 'dev'` **且** `use_bundled_gui` 为 false → 使用 `/src`
- 其他所有情况 → 使用 `/dist`

这样即使环境是 "dev"，只要 `use_bundled_gui = true`（默认值），就会使用打包的 GUI。

### 修复效果
- ✅ HTML 正确使用 `/dist/` 路径
- ✅ `window.gui_env = 'prod'` 正确设置
- ✅ bundle.min.js (3.8MB) 正常加载
- ✅ bundle.min.css (145KB) 正常加载
- ✅ 页面能正常显示

### 配置说明
当前 `volatile/config/config.json` 设置：
```json
{
    "env": "dev",
    // use_bundled_gui 未设置，使用代码默认值 true
}
```

由于 `use_bundled_gui` 默认为 `true`（代码第 140 行：`config.use_bundled_gui ?? true`），即使用户保持 `env = "dev"`，也能正常使用打包的 GUI。

### 关键经验
1. **`use_bundled_gui` 应该优先于 `env` 判断**：打包 GUI 的选择应该由明确的配置控制，而不是隐式的环境判断
2. **本地测试也应该用打包 GUI**：避免开发环境和生产环境的行为差异
3. **配置默认值很关键**：`use_bundled_gui` 默认为 true 确保了合理的默认行为

---

## 2026-01-27 - Docker 部署 CSS 加载问题彻底解决

### 背景
Docker 部署后，即使设置了 `window.gui_env = 'prod'`，页面布局仍然混乱、图标大小不一。经过深入排查发现多个关联问题。

### 问题根源分析

**问题1：CSS 通过 JavaScript 动态加载，存在时序问题**
- 在打包模式下，CSS 通过 `index.js` 中的 `window.loadCSS('/dist/bundle.min.css')` 动态加载
- HTML 本身不包含 CSS `<link>` 标签（第342-345行的逻辑：只有 `!bundled` 时才添加）
- JavaScript 动态加载有时序问题，CSS 可能晚于页面渲染加载

**问题2：prod 模式加载外部 SDK 导致冲突**
- `index.js` 第77行在 prod 模式下会加载 `https://js.puter.com/v2/`（官方SDK）
- 这与本地打包的 `bundle.min.js` 产生冲突
- 外部SDK覆盖了本地代码的行为

**问题3：数据库不一致导致认证失败**
- Docker 容器和 npm start 使用不同的数据库文件
- 用户在 npm start 环境创建的账户在 Docker 中不存在

### 最终解决方案

**修复1：在 HTML 中直接添加 CSS link 标签**
```javascript
// PuterHomepageService.js 第369-372行
${use_bundled_gui
    ? '<link rel="stylesheet" href="/dist/bundle.min.css">'
    : ''
}
```
当 `use_bundled_gui = true` 时，HTML 直接包含 CSS 引用，确保页面加载时 CSS 立即生效。

**修复2：移除 prod 模式的外部 SDK 加载**
```javascript
// index.js 第76-81行
else if ( window.gui_env === 'prod' ) {
    // 不加载外部SDK，使用已打包的 bundle.min.js（已在HTML中加载）
    // await window.loadScript('https://js.puter.com/v2/');
    await window.loadCSS('/dist/bundle.min.css');
}
```
注释掉外部 SDK 加载，只使用本地打包资源。

**修复3：Docker 挂载 npm start 的数据库**
```yaml
# docker-compose.yml
volumes:
  - /home/laaa/docker/puter-unlocked/volatile/runtime/puter-database.sqlite:/var/puter/puter-database.sqlite
```
确保 Docker 容器和 npm start 使用同一个数据库，账户和session共享。

### 修复效果
- ✅ HTML 直接包含 CSS link 标签
- ✅ CSS 在页面加载时立即生效
- ✅ 无时序问题，页面布局正常
- ✅ 图标大小统一
- ✅ 不再依赖外部资源
- ✅ Docker 和 npm start 数据一致

### 部署步骤
```bash
# 1. 停止容器
cd ~/docker-puter && docker compose down

# 2. 重新构建（包含最新代码）
docker compose build

# 3. 启动容器
docker compose up -d

# 4. 清除浏览器缓存（重要！）
# Ctrl+Shift+R 或使用隐私模式
```

### Git 提交记录
- `ac0538d0` fix: 在HTML中直接添加CSS link标签，确保打包模式下CSS正确加载
- `27112bb1` fix: 设置 globalThis.PUTER_API_ORIGIN 确保使用正确的API origin
- `4c941d9b` fix: 默认使用打包 GUI，确保 window.gui_env 被设置

### 关键经验
1. **CSS 应该在 HTML 中静态引用**：避免 JavaScript 动态加载的时序问题
2. **打包模式不应依赖外部资源**：所有资源应该包含在本地 bundle 中
3. **Docker 部署需要数据一致性**：确保测试环境和生产环境使用相同数据
4. **浏览器缓存很顽固**：修改前端资源后必须强制刷新或清除缓存
5. **多个小问题会叠加**：CSS 加载、外部SDK、数据库不一致三个问题叠加导致排查困难

---

## 2026-01-27 - Docker 部署 CSS 加载问题修复（第一次尝试）

### 背景
Docker 部署完成后，访问、登录、反向代理都正常，但页面布局混乱、图标大小不一。CSS 文件存在但未被加载。

### 问题根源
1. **window.gui_env 未设置**：HTML 中缺少 `window.gui_env` 变量
2. **use_bundled_gui 默认为 false**：`PuterHomepageService.js` 从配置读取 `use_bundled_gui`，但配置文件中没有此字段
3. **导致走 dev 分支**：`window.gui_env` 为 undefined 时，index.js 走 dev 分支，不加载 CSS

**具体表现：**
- 功能正常 ✅（登录、API 调用）
- 页面能显示，但布局混乱 ❌
- CSS 文件存在但未加载 ❌

### 解决方案
修改 `PuterHomepageService.js` 第 140 行：
```javascript
// 修改前
use_bundled_gui: config.use_bundled_gui,

// 修改后
use_bundled_gui: config.use_bundled_gui ?? true,
```

使用空值合并运算符（`??`），当配置中未定义时默认为 `true`。

### 修复效果
- ✅ HTML 中包含 `<script>window.gui_env = 'prod';</script>`
- ✅ index.js 走 prod 分支，加载 CSS
- ✅ 页面布局恢复正常
- ✅ 图标大小正常

### 部署步骤
1. 更新代码：`git pull origin main`
2. 停止容器：`docker compose down`
3. 重新构建：`docker compose build`
4. 启动容器：`docker compose up -d`

### Git 提交记录
- `4c941d9b` fix: 默认使用打包 GUI，确保 window.gui_env 被设置

### 关键经验
1. **配置默认值很重要**：使用 `?? true` 确保合理的默认行为
2. **生产环境应该用打包 GUI**：`use_bundled_gui` 应该默认为 true
3. **Docker 部署需要完整测试**：不能只看服务启动，还要检查前端功能

---

## 2026-01-27 - Docker 部署成功完成

### 背景
为了便于部署和管理，在 Debian 服务器（192.168.50.123）上使用 Docker 部署 Puter 应用。

### 部署方式
使用本地构建的 Docker 镜像，基于 `/home/laaa/docker/puter-unlocked` 源代码。

### 部署结果
- ✅ Docker 容器正常运行（状态：healthy）
- ✅ 服务地址：http://192.168.50.123:4100
- ✅ 配置目录：~/docker-puter/config
- ✅ 数据目录：~/docker-puter/data
- ✅ 容器名称：puter

### 管理命令
```bash
# 使用管理脚本
cd ~/docker-puter
./manage.sh logs     # 查看实时日志
./manage.sh restart  # 重启服务
./manage.sh stop     # 停止服务
./manage.sh start    # 启动服务
./manage.sh status   # 查看状态

# 或直接使用 docker compose
cd ~/docker-puter
docker compose logs -f      # 查看日志
docker compose restart      # 重启
docker compose down         # 停止
docker compose up -d        # 启动
docker compose ps           # 状态
```

### 配置文件位置
- Docker Compose: `~/docker-puter/docker-compose.yml`
- Puter 配置: `~/docker-puter/config/config.json`
- 数据持久化: `~/docker-puter/data/`

### Git 提交记录
- `b954b1a3` fix: 更新 Docker 配置，添加必需的密钥和 nginx_mode
- `684ab854` docs: 添加部署脚本和前端构建问题记录

### 关键经验
1. **Docker 环境需要预先检查**：确保 Docker 和 Docker Compose 已安装
2. **配置文件需要完整密钥**：缺少认证密钥会导致登录失败
3. **数据持久化很重要**：通过 volume 映射保存配置和数据
4. **健康检查配置**：容器配置了健康检查，自动监控服务状态

---

## 2026-01-27 - 前端构建缺失导致页面布局混乱

### 背景
将本地完全正常的项目代码复制到 Debian 服务器后，登录功能正常，但页面布局混乱、图标大小异常。前端 bundle.min.js 存在且能正常加载，但样式没有应用。

### 问题根源
1. **缺少前端构建产物**：`src/gui/dist/bundle.min.css` 文件不存在
2. **构建产物未包含在代码中**：`src/gui/dist/` 目录下的文件是构建产物，不应该依赖版本控制中的旧文件
3. **部署流程不完整**：从 git clone 或复制代码后，缺少前端构建步骤

**具体表现：**
- 登录功能正常 ✅
- API 调用正常 ✅
- 页面能显示，但布局混乱、图标大小异常 ❌
- 浏览器控制台显示 404 错误：`/dist/bundle.min.css`

### 解决方案
**关键步骤：在服务器上构建前端**

```bash
cd ~/docker/puter-unlocked/src/gui
node ./build.js
```

构建后生成：
- `src/gui/dist/bundle.min.js` (2.5M)
- `src/gui/dist/bundle.min.css` (143K)
- `src/gui/dist/bundle.min.js.LICENSE.txt`

### 完整的部署流程
```bash
# 1. 确保使用 Node.js v24
export PATH="/usr/bin:$PATH"

# 2. 安装依赖
npm install

# 3. 编译后端 TypeScript
npm run build:ts

# 4. 重新编译 better-sqlite3（如果换了 Node 版本）
npm rebuild better-sqlite3

# 5. **构建前端 GUI（关键步骤！）**
cd src/gui
node ./build.js
cd ../..

# 6. 配置
cp volatile/config/config.json.example volatile/config/config.json
# 编辑配置，添加必需设置

# 7. 设置权限
mkdir -p volatile/runtime
chmod 777 volatile/runtime

# 8. 启动服务
nohup node ./tools/run-selfhosted.js > /tmp/puter.log 2>&1 &
```

### 关键经验
1. **dist 目录是构建产物，必须重新构建**：不能依赖版本控制或本地复制的旧文件
2. **部署到新环境必须完整构建**：包括后端 TypeScript 编译和前端 GUI 构建
3. **Node.js 版本变更需要重新编译原生模块**：better-sqlite3 等原生 C++ 模块需要重新编译
4. **配置文件很重要**：缺少 `experimental_no_subdomain` 等配置会导致 API 调用错误

### Git 提交记录
- `732b69c2` fix: 添加 window.api_origin 和 window.app_origin 全局变量以修复前端 API 调用问题
- `5069918d` fix: 修复反向代理重定向循环问题
- `6ae82d5d` docs: 记录反向代理重定向循环问题的修复过程

### 技术细节
- 前端构建工具：webpack 5.103.0
- 构建时间：约 8-10 秒
- 构建产物：
  - bundle.min.js: 2.5MB（包含所有前端代码）
  - bundle.min.css: 143KB（包含所有样式）
- 本地开发环境使用 `window.gui_env="dev"`，不加载 CSS 文件
- 生产环境需要完整的 bundle.min.css

---

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
