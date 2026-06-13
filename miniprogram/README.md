# 微信小程序端 / Miniprogram

> name.imoons.cn 的微信小程序版本，**完整复刻** Web 端 18 个页面（10 个 C 端 + 3 个 B 端管理）。

## ✨ 特性

- **零后端改动**：复用现有 PHP 后端，13 个页面都调现有 API
- **13 个页面**：4 tabBar（首页/起名/文章/我的）+ 9 个非 tabBar
- **完整功能**：八字起名、AI 推荐、文章浏览、卡密兑换、后台管理
- **现代 UI**：对齐 Web 端的蓝白配色 + Tailwind 风格

## 📁 目录

```
miniprogram/
├── app.js                 # 全局入口 + token 管理
├── app.json               # 13 个页面路由 + tabBar
├── app.wxss               # 全局样式（CSS 变量）
├── project.config.json    # 微信开发者工具配置
├── sitemap.json
│
├── pages/
│   ├── home/              # 首页（banner + 快捷入口 + 推荐文章）
│   ├── naming/            # 八字起名表单
│   ├── naming-result/     # 起名结果（八字 + 名字列表）
│   ├── name-detail/       # 名字详情
│   ├── articles/          # 文章列表
│   ├── article-detail/    # 文章详情
│   ├── user/              # 个人中心
│   ├── user-records/      # 我的起名记录
│   ├── login-account/     # 账号登录
│   ├── login-card/        # 卡密登录
│   ├── admin-login/       # 后台登录
│   ├── admin-dashboard/   # 后台仪表盘
│   └── admin-records/     # 起名记录管理
│
└── utils/
    ├── api.js             # 后端 API 封装（6 组）
    ├── auth.js            # token 管理
    ├── storage.js         # 本地存储
    └── util.js            # 工具函数（时间/五行/复制）
```

## 🚀 开发与发布

### 1. 准备工作

| 依赖 | 说明 |
|---|---|
| 微信开发者工具 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |
| AppID | 微信小程序 AppID（注册：mp.weixin.qq.com）|
| 后端 HTTPS | 必须是 https（小程序强制要求）|

### 2. 修改 AppID

打开 `project.config.json`，替换 `"appid": "touristappid"` 为你的真实 AppID。

### 3. 配置后端地址

打开 `app.js`，修改 `apiBase`：

```js
apiBase: 'https://your-domain.com/api'  // 改成你的实际后端
```

### 4. 配置业务域名（生产环境必须）

登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) → 开发管理 → 服务器域名：

| 类型 | 域名 |
|---|---|
| request 合法域名 | `name.imoons.cn`（或你的域名）|
| uploadFile 合法域名 | 同上（暂未用到）|
| downloadFile 合法域名 | 同上（暂未用到）|

> ⚠️ **必须 HTTPS** + **必须 ICP 备案**
> ⚠️ **开发期**可在开发者工具勾选"不校验合法域名"（详情 → 本地设置）

### 5. 调试

1. 打开微信开发者工具
2. 导入项目：选择 `miniprogram/` 目录
3. AppID 选"测试号"（首次调试可以）
4. 编译 → 模拟器预览
5. 真机预览：点"预览"扫码

### 6. 上传与发布

1. 开发者工具右上角"上传" → 填写版本号 → 上传
2. 登录 mp.weixin.qq.com → 版本管理 → 提交审核
3. 审核通过后"发布"上线

## 🔌 API 对接

所有 6 组后端 API 都封装在 `utils/api.js`：

| 客户端 | 后端端点 | 用途 |
|---|---|---|
| `authApi` | `/user-login.php`, `/user-logout.php`, `/user-me.php` | 用户登录/登出/信息 |
| `chartApi` | `/naming.php` (action=chart/recommend/record) | 排盘/AI 推荐/保存记录 |
| `orderApi` | `/order.php` | 订单（暂未使用，预留）|
| `articleApi` | `/article.php` | 文章列表/详情 |
| `userApi` | `/user-history.php`, `/user-me.php` | 用户历史/信息 |
| `adminApi` | `/admin/*` | 后台管理（独立 Bearer token）|

**超时设置**：
- 普通 API：30s
- AI 起名（chart/recommend）：60s（对齐 Web 端 chartApi 120s 但小程序端 60s 已足够实测）

## 🎨 样式系统

`app.wxss` 提供 CSS 变量：

```css
--primary: #3b82f6;        /* 主色 */
--primary-light: #dbeafe;
--text-primary: #1f2937;
--wuxing-mu: #10b981;      /* 五行 - 木 */
--wuxing-huo: #ef4444;     /* 五行 - 火 */
--wuxing-tu: #f59e0b;      /* 五行 - 土 */
--wuxing-jin: #6b7280;     /* 五行 - 金 */
--wuxing-shui: #3b82f6;    /* 五行 - 水 */
```

## 🧪 测试账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 用户（账号密码）| 在 PHP 后台 admins/users 表注册 | - |
| 用户（卡密）| 在 PHP 后台 admin → 卡密管理生成 | 卡密形式 |
| 管理员 | `admin` | `admin123`（init.sql 默认）|

## 📝 已知差异（vs Web 端）

| 项 | Web 端 | 小程序端 |
|---|---|---|
| 路由 | React Router (SPA) | 原生 WXML 页面栈 |
| 状态管理 | Zustand | 页面 data + 全局 globalData |
| 状态持久化 | localStorage | wx.setStorageSync |
| 后台管理 | 完整 5 大模块 + 图表 | 简化：登录 + 仪表盘 + 记录 |
| 鉴权 | session cookie / base64 token | session cookie (wx 自动带) / Bearer token |
| AI 起名超时 | 120s | 60s（足够，AI 实测 30-40s）|

## 📄 License

MIT
