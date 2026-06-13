# 架构说明

## 🎯 系统概览

```
┌─────────────────────────────────────────────────────────────┐
│                     用户浏览器                                │
│  (React SPA - HTML5 + JS + CSS - 移动端响应式)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   Nginx (Reverse Proxy)                       │
│  ├─ / → 301 跳转 → /app/                                     │
│  ├─ /app/ 静态 SPA 文件                                       │
│  ├─ /api/*.php → PHP-FPM                                     │
│  └─ /admin.html → 301 跳 /app/admin/login                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ FastCGI (Unix socket)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  PHP 8.2 (FPM)                                │
│  ├─ API 接口层 (naming.php / user-*.php / admin/*)            │
│  ├─ 业务逻辑层 (AI 调用 + 6tail 排盘 + 数据组装)               │
│  └─ 数据访问层 (PDO + db.php 封装)                            │
└────┬─────────────────────┬──────────────────┬───────────────┘
     │                     │                  │
     ↓                     ↓                  ↓
┌──────────┐         ┌──────────────┐    ┌──────────┐
│ MySQL 8  │         │ AI 服务     │    │ 6tail    │
│ 5.7/8.0  │         │ MiniMax /   │    │ lunar-   │
│          │         │ DeepSeek    │    │ php      │
│ name_    │         │ (HTTPS)     │    │ (本地    │
│ imoons_  │         │             │    │  Composer│
│ cn       │         │             │    │  依赖)   │
└──────────┘         └──────────────┘    └──────────┘
```

## 🔄 核心数据流：用户起名

```
1. 用户填写表单（Naming.jsx）
   ├─ 姓氏（Input）
   ├─ 性别（Radio: 男/女）
   ├─ 历法（Radio: 公历/农历）  ← 🆕 6.13 加
   ├─ 出生日期（Date）
   ├─ 出生时辰（Select：子丑寅...）
   ├─ 名字字数（Radio：单字名/双字名）  ← 🆕 6.13 改文案
   └─ 起名偏好（Chip：诗词典故/周易国学/...）  ← 🆕 6.13 加 3 个

2. 前端 onSubmit
   ├─ birthTime "11-13" → "12:00"（取区间中点）
   ├─ preferences tags + 自定义文字 合并
   └─ POST /api/naming 携带 { calendar, nameLength, ... }

3. 后端 naming.php 接收
   ├─ 解析历法：
   │  ├─ calendar === 'solar' → Solar::fromYmdHms
   │  └─ calendar === 'lunar' → Lunar::fromYmdHms → getSolar 反推
   ├─ 6tail 算八字：四柱天干地支 + 农历 + 五行分布 + 日主
   ├─ 子平真诠算法：日主强弱 → 喜用神/忌神
   ├─ 读 configs 表 → AI 配置（URL/Key/Model）
   ├─ 组装 prompt（宝宝信息 + 八字 + 喜用神 + 偏好）
   └─ curl POST 到 AI 服务（timeout 120s）

4. AI 返回 JSON
   ├─ 解析：bazi + names[10个]
   ├─ 会员判断：登录 + balance > 0 → 10个，游客 → 3个
   ├─ 扣减 balance（如果会员）
   └─ 记录入库：name_records 表

5. 前端 Result 页面
   ├─ 读 sessionStorage 显示八字
   ├─ 名字卡片：含名字+评分+五行 chip+寓意+出处
   └─ "查看详情" 跳 /name/:fullName?idx=:index
```

## 🗄️ 数据库表

| 表 | 用途 | 关键字段 |
|---|---|---|
| `users` | 用户 | id / openid / balance / status |
| `admins` | 管理员 | id / username / password (bcrypt) |
| `redeem_codes` | 卡密 | code / amount / max_use / used_count |
| `name_records` | 起名记录 | user_id / surname / gender / birthday / name (JSON) |
| `configs` | 系统配置 | config_key / value (AI URL/Key/Model/WX) |
| `articles` | 公众号文章 | id / title / content / category / status |

`name_records.name` 是 JSON，结构：
```json
{
  "bazi": { "year": "甲辰", "month": "丁丑", "day": "甲申", "hour": "庚午", ... },
  "names": [
    { "name": "一澈", "wuxing": "水水", "score": 95, "pinyin": "yī chè", "source": "《说文》...", "meaning": "..." }
  ],
  "preferences": ["周易国学", "自然意象"]
}
```

## 🔐 鉴权方案

| 角色 | 鉴权方式 | 存储 |
|---|---|---|
| **用户** | PHP Session (NAME_SESSID cookie) | 服务器端 `$_SESSION['user_id']` |
| **管理员** | base64 编码 token (24h 过期) | localStorage `admin_token` |

**为什么不用同一套？**
- 用户：登录态长（30 天）、多端共享
- 管理员：登录态短（24h）、跨域调用方便、可一键清

## 🧠 关键算法

### 1. 6tail/lunar-php 排盘
- 输入：公历或农历日期 + 时辰
- 输出：八字四柱、农历日期、生肖、五行
- 特点：权威、广泛使用、行业标准

### 2. 子平真诠（日主强弱 + 喜用神）
- 藏干计分：日干 1.0 + 本气 0.5 + 余气 0.3
- 阈值：strength >= 2.0 为身强
- 身强喜：克(官杀)+我生(食伤)+我克(财)
- 身弱喜：生我(印)+同我(比劫)+日主

### 3. 会员卡密
- 首次登录：创建虚拟用户，balance = amount
- 重复登录：balance = amount（**6.13 修复，覆盖式同步**）
- max_use = 卡密可被 N 个用户用

### 4. AI 名字生成
- 提示词工程：八字 + 喜用神 + 偏好 → 10 个名字
- 硬性规则（6.13 加）：名字所有字五行必须喜用神、不能"圆场"虚字
- 后处理（暂无）：依赖 AI 自我约束

## 📦 部署架构

### 容器化（未来）

```yaml
# docker-compose.yml（待补）
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
  php:
    build: ./backend-php
  mysql:
    image: mysql:8.0
```

### 当前（传统 LEMP）

```
Nginx  ← 反代 + 静态文件
PHP-FPM ← 业务逻辑
MySQL ← 数据
```

## 🔍 性能指标

| 指标 | 数值 |
|---|---|
| **AI 响应时间** | 30-60s（M3）/ 5-10s（DeepSeek）|
| **PHP 处理时间** | < 1s（除 AI 调用）|
| **首屏加载** | < 1s（静态 SPA）|
| **数据库查询** | < 50ms |

## 🔄 6 月关键变更

| 日期 | 改动 | 文件 |
|---|---|---|
| 6/10 | 老站清理（删 16MB 静态 HTML）| api/ / pages/ |
| 6/10 | 旧 admin.html 改 301 跳转 | nginx |
| 6/11 | SPA 路由 nginx 配置 | nginx |
| 6/12 | 卡密登录 amount 同步（覆盖式）| user-login.php |
| 6/13 | 农历/公历切换支持（6tail 反推）| naming.php + Naming.jsx |
| 6/13 | 加 3 个起名偏好（周易/自然/品德）| Naming.jsx + naming.php |
| 6/13 | AI 名字"避忌神字"硬性规则 | naming.php prompt |
| 6/13 | 名字卡片加五行 chip | Result.jsx |
| 6/13 | 名字详情页补全 | NameDetail.jsx |
| 6/13 | 加生肖显示 | Result.jsx + naming.php |
| 6/13 | 名字字数文案改"单/双字名" | Naming.jsx |
