# 起名网 / Naming App (name.imoons.cn)

> AI 智能起名 + 八字五行 + 会员卡密 + 后台管理 — PHP 后端 + React SPA 全栈开源版

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4.svg)](https://www.php.net)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev)

> ⚠️ **CI 状态**：本仓库因首次推送时的 GitHub PAT 缺少 `workflow` scope，CI workflow 文件未在 main 分支。如需启用：在 `.github/workflows/` 写好 `ci.yml`（已提供模板）后，从 [Actions 页面](https://github.com/iiiiber/imoons-naming/actions) 手动启用即可，参考 [`.github/README.md`](.github/README.md)。

## ✨ 功能特性

- 🧠 **AI 智能起名**：基于八字喜用神 + LLM（MiniMax / DeepSeek）生成 10 个寓意美好、符合命理的名字
- 📜 **八字排盘**：精确四柱（年月日时）+ 农历转换 + 五行强弱分析 + 喜用神
- 🐉 **生肖属相**：自动判断属龙/属马/属狗 等
- 💳 **会员卡密系统**：后台生成卡密 → 用户兑换 → 自动增加起名次数
- 👨‍💼 **后台管理**：用户/卡密/起名记录/文章/系统配置 全套 CRUD
- 📝 **公众号文章**：Markdown 渲染的起名知识文章
- 🎨 **现代 UI**：Tailwind CSS + 移动端响应式
- 🔐 **Session 鉴权**：原生 PHP session + 后台独立 base64 token

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| **前端** | React 18 + Vite 5 + Tailwind CSS 3 + Zustand + React Router 6 |
| **后端** | PHP 8.2 + MySQL 5.7+ + 6tail/lunar-php 排盘 |
| **AI** | MiniMax M3 / DeepSeek Chat（可配置）|
| **构建** | Vite 5 + Composer 2 |
| **部署** | Nginx + PHP-FPM |

## 📁 目录结构

```
naming-app/
├── frontend/              # React SPA 源码
│   ├── src/
│   │   ├── pages/         # 页面：Home/Naming/Result/User/Admin/*
│   │   ├── components/    # 公共组件：Header/Footer/Card/...
│   │   ├── api/           # axios 客户端
│   │   ├── stores/        # Zustand 状态管理
│   │   └── lib/           # 工具函数
│   ├── package.json
│   └── vite.config.js
│
├── backend-php/           # PHP 后端
│   ├── naming.php         # 起名主接口（AI + 6tail 排盘）
│   ├── article.php        # 公众号文章
│   ├── user-*.php         # 用户登录/历史/个人信息
│   ├── admin/             # 后台 API
│   │   ├── articles.php
│   │   ├── codes.php
│   │   ├── configs.php
│   │   ├── login.php
│   │   ├── records.php
│   │   ├── stats.php
│   │   └── users.php
│   ├── lib/db.php         # PDO 数据库连接
│   └── vendor/            # composer 依赖（自动生成）
│
├── app/                   # SPA 构建产物（部署时用）
│   ├── index.html
│   └── assets/
│
├── database/              # 数据库
│   └── init.sql           # 表结构 + 初始数据
│
├── docs/
│   ├── ARCHITECTURE.md    # 架构说明
│   └── DEPLOYMENT.md      # 部署指南
│
├── .env.example           # 环境变量模板
├── .gitignore
└── README.md
```

## 🚀 快速开始

### 0. 准备工作

| 依赖 | 版本 | 说明 |
|---|---|---|
| PHP | 8.2+ | 含 mysqli / pdo / curl 扩展 |
| MySQL | 5.7+ / 8.0 | |
| Node.js | 18+ | 前端构建 |
| Composer | 2+ | PHP 依赖管理 |
| Nginx | 1.20+ | Web 服务器 |

### 1. 克隆项目

```bash
git clone https://github.com/iiiiber/naming-app-fullstack.git
cd naming-app-fullstack
```

### 2. 初始化数据库

```bash
# 创建数据库 + 用户
mysql -uroot -e "
  CREATE DATABASE name_imoons_cn DEFAULT CHARACTER SET utf8mb4;
  CREATE USER 'name_imoons_cn'@'localhost' IDENTIFIED BY 'your_password';
  GRANT ALL ON name_imoons_cn.* TO 'name_imoons_cn'@'localhost';
  FLUSH PRIVILEGES;
"

# 导入表结构 + 初始数据
mysql -uname_imoons_cn -p'your_password' name_imoons_cn < database/init.sql
```

### 3. 配置后端

```bash
# 装 PHP 依赖
cd backend-php
composer install

# 复制环境配置
cp ../.env.example ../.env
# 编辑 .env 填入真实数据库密码 + AI API key

# 创建 admin 管理员（默认 admin/admin123，部署后改！）
# 在 init.sql 已包含，可直接登录 /app/admin/login
```

### 4. 构建前端

```bash
cd ../frontend
npm install
npm run build
# 构建产物在 frontend/dist/，覆盖到根目录的 app/
cp -r dist/* ../app/
```

### 5. 配置 Nginx

参考 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) 完整配置。

**最简配置**：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/naming-app-fullstack;
    index index.php index.html;

    # SSL 证书...

    # SPA 静态资源
    location ^~ /app/assets/ {
        alias /var/www/naming-app-fullstack/app/assets/;
    }
    location ^~ /app/ {
        try_files $uri $uri/ /app/index.html;
    }

    # PHP API
    location ~ \.php$ {
        fastcgi_pass unix:/tmp/php-fpm.sock;
        include fastcgi.conf;
    }

    # 根 URL 跳 SPA
    location = / { return 301 /app/; }
}
```

### 6. 访问

- **用户主站**：https://your-domain.com/app/
- **后台管理**：https://your-domain.com/app/admin/login（默认 `admin/admin123`）

## 📸 截图

（部署后补充）

## 🧪 开发模式

```bash
# 前端 dev server（Vite 热更新）
cd frontend
npm run dev
# 访问 http://localhost:5173

# 后端开发（直接用 PHP built-in server）
cd backend-php
php -S localhost:8000
# API 访问 http://localhost:8000/naming.php
```

## 🤝 贡献

欢迎 PR / Issue！

## 📄 License

MIT
