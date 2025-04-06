[Read this in English (阅读英文版本)](README.md)

# Fruition ：免费、开源的 Notion 页面定制工具包

## 项目概述

Fruition 是一个免费、开源的工具包，用于定制和部署 Notion 页面作为独立网站。通过将 Notion 页面通过 Cloudflare Workers 代理，实现自定义域名、美化 URL、增强 SEO 等功能，同时保持与 Notion 后端的连接。

*   用途：非常适合用于您的个人作品集、博客、落地页和商业网站
*   特性：优化的 URL (Pretty URLs)、自定义域名、Google 字体、SEO 支持、脚本注入
*   优点：完全免费、无供应商锁定、开源

详细的设置步骤，请访问 https://fruitionsite.com

本项目包含两个主要部分：
1. 一个 React 应用程序，提供用户友好的界面来配置和生成 Worker 脚本
2. 一个静态的 worker.js 文件，你可以直接粘贴至 Cloudflare 的编辑器中

## 核心功能【基于[原作者仓库](https://github.com/stephenou/fruitionsite)修改】

### 1. 自定义域名支持

允许用户将 Notion 页面托管在自己的域名下，而不是默认的 notion.so 域名。只需设置 DNS 记录指向 Cloudflare，然后部署 Worker 脚本即可。  
**理论上**，使用 Fruition 并绑定自定义域名有可能帮助绕过 GFW 对 notion.site 域名的直接限制。（幽默的是，Cloudflare自己也被墙了。因此最好的方法还是[自己建站](https://github.com/tangly1024/NotionNext)并部署在服务器上🤣）

### 2. 简洁 URL (Pretty URLs)

将 Notion 默认的长 ID（例如：`https://www.notion.so/username/771ef38657244c27b9389734a9cbff44`）转换为简洁易记的 URL（例如：`https://yourdomain.com/about`）。

实现原理：
- 服务器端配置 slug 到 Notion 页面 ID 的映射
- 客户端 JavaScript 动态替换 URL，使用 History API

### 3. SEO 增强

提升 Notion 页面在搜索引擎的可见度：
- 自定义页面标题和描述
- 自动生成 sitemap.xml
- 提供 robots.txt
- 删除不必要的浏览器 CSP 头

### 4. 自定义样式和脚本

- 支持 Google 字体集成
- 可选隐藏 Notion 水印
- 允许注入自定义 JavaScript

### 5. 增强的浏览体验

- 修复浏览历史导航（前进/后退按钮）
- 优化与 Notion 服务器的通信
- 阻止不必要的 WebSocket 连接以减少控制台错误

### 6. 多语言支持

- 提供英文和中文界面
- 支持基于浏览器语言的自动检测
- 允许手动切换语言

### 7. 主题切换

- 支持浅色/深色模式
- 可根据系统设置自动适应
- 支持用户手动设置偏好

## 技术实现

### Cloudflare Worker 原理

Cloudflare Worker 作为代理层，位于用户和 Notion 服务器之间：

1. **请求拦截**：Worker 捕获所有对自定义域名的请求
2. **请求转发**：根据请求类型将其转发到相应的 Notion 服务器
   - 主页面内容 → www.notion.so
   - API 请求 → www.notion.so
   - 实时消息 → msgstore.www.notion.so
3. **响应修改**：
   - 替换绝对链接中的域名
   - 注入自定义脚本和样式
   - 移除安全限制头（例如 CSP）
4. **特殊路径处理**：
   - `/robots.txt`：自动生成并返回
   - `/sitemap.xml`：基于配置的 slug 生成
   - Slug 路径：重定向到对应的 Notion 页面 ID

### 客户端增强

Worker 向页面注入 JavaScript 以提供额外功能：

1. **URL 替换**：
   - 使用 MutationObserver 监听页面变化
   - 在导航栏加载时执行 URL 更新
   - 覆盖 History API (pushState/replaceState) 以处理导航

2. **请求拦截**：
   - 覆盖 XMLHttpRequest 和 fetch API
   - 将 API 请求重新路由到 Notion 服务器
   - 阻止或模拟某些无用请求的响应

3. **WebSocket 管理**：
   - 重写 WebSocket 构造函数
   - 返回模拟的已关闭 WebSocket 对象
   - 防止不必要的实时连接和相关错误

## 配置选项

Worker 脚本支持以下配置：

1. `MY_DOMAIN`：自定义域名
2. `SLUG_TO_PAGE`：URL 路径到 Notion 页面 ID 的映射
3. `PAGE_TITLE`/`PAGE_DESCRIPTION`：SEO 元数据
4. `GOOGLE_FONT`：自定义 Google 字体
5. `CUSTOM_SCRIPT`：用户自定义脚本
6. `HIDE_WATERMARK`：是否隐藏 Notion 水印
7. `ENABLE_PRETTY_URL`：启用简洁 URL 功能
8. `ENABLE_NAV_AND_API`：启用历史导航和 API 代理优化
9. `DEBUG_MODE`：启用详细的调试日志


## 部署流程

1. 创建 Cloudflare 账户并添加域名
2. 设置 DNS 记录指向 Cloudflare
3. 在 Cloudflare Workers 中创建新 Worker
4. 使用 Fruition UI 生成 Worker 脚本
5. 将生成的脚本复制到 Cloudflare Worker 编辑器
6. 部署 Worker 并将其绑定到自定义域名

详细的设置步骤，请访问 https://fruitionsite.com


## 局限性

1. 无法代理 Notion 页面中嵌入的子页面（实际上指向的还是原始发布链接）
2. 某些高级 Notion 功能（如实时协作）可能受限
3. Cloudflare Workers 免费套餐的每日请求限制
4. 依赖 Notion 的 API 稳定性