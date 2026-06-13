# 部署指南（从零搭建）

> 适用场景：在一台干净的 Linux 服务器上从零部署起名网。

## 📋 部署架构

```
用户浏览器 ──→ Nginx（80/443）
                ├─ / → 301 到 /app/
                ├─ /app/ → 静态 SPA（HTML/JS/CSS）
                └─ /api/*.php → PHP-FPM（Unix socket）
                                  ↓
                                MySQL（localhost:3306）
                                  ├─ name_records 起名记录
                                  ├─ users 用户
                                  ├─ redeem_codes 卡密
                                  ├─ admins 管理员
                                  └─ ...
```

## 🛠️ 服务器要求

| 组件 | 最低 | 推荐 |
|---|---|---|
| **OS** | Ubuntu 20.04 / CentOS 8 | Ubuntu 22.04 LTS |
| **CPU** | 1 vCPU | 2 vCPU |
| **内存** | 1 GB | 2 GB |
| **硬盘** | 10 GB | 20 GB |
| **PHP** | 8.0+ | 8.2+ |
| **MySQL** | 5.7+ | 8.0 |
| **Nginx** | 1.18+ | 1.24+ |
| **Node.js** | 16+ | 20+（仅构建时需要）|

## 📝 部署步骤

### 1. 安装基础环境

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql php8.2-curl php8.2-mbstring php8.2-zip php8.2-xml composer nodejs npm git

# 启动服务
sudo systemctl enable --now nginx mysql php8.2-fpm
```

### 2. 创建数据库

```bash
sudo mysql <<'SQL'
CREATE DATABASE name_imoons_cn DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'name_imoons_cn'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON name_imoons_cn.* TO 'name_imoons_cn'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 3. 克隆项目 + 初始化数据库

```bash
cd /var/www
sudo git clone https://github.com/iiiiber/imoons-naming.git
cd imoons-naming
sudo mysql -u name_imoons_cn -p name_imoons_cn < database/init.sql
```

### 4. 安装 PHP 依赖（6tail 排盘）

```bash
cd backend-php
sudo composer install --no-dev --optimize-autoloader
```

### 5. 构建前端

```bash
cd ../frontend
npm ci  # 用 package-lock.json 严格安装
npm run build
# 构建产物 dist/ 复制到 app/
sudo cp -r dist/* ../app/
```

### 6. 配置环境变量

```bash
cd /var/www/imoons-naming
sudo cp .env.example .env
sudo vim .env
# 填入真实 DB 密码、AI API key、微信 AppID/Secret
```

### 7. 配置 PHP（连接数据库）

编辑 `backend-php/lib/db.php`（或按你的项目结构改造）：

```php
$config = [
    'host'     => getenv('DB_HOST') ?: '127.0.0.1',
    'username' => getenv('DB_USER') ?: 'name_imoons_cn',
    'password' => getenv('DB_PASS') ?: '',
    'database' => getenv('DB_NAME') ?: 'name_imoons_cn',
];
```

> 进阶：可改为 `vlucas/phpdotenv` 自动读 `.env` 文件

### 8. 设置文件权限

```bash
sudo chown -R www-data:www-data /var/www/imoons-naming
sudo chmod -R 755 /var/www/imoons-naming
sudo chmod -R 775 /var/www/imoons-naming/backend-php/lib  # db.php 写入配置
```

### 9. 配置 Nginx

```bash
sudo vim /etc/nginx/sites-available/naming-app
```

写入（**替换 `your-domain.com` 为你的域名**）：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/imoons-naming;
    index index.php index.html;

    # 根 URL 跳 SPA
    location = / {
        return 301 https://$host/app/;
    }

    # 旧 admin 路径跳新后台
    location = /admin.html {
        return 301 https://$host/app/admin/login;
    }

    # SPA 静态资源
    location ^~ /app/assets/ {
        alias /var/www/imoons-naming/app/assets/;
        try_files $uri =404;
    }
    location ^~ /app/ {
        try_files $uri $uri/ /app/index.html;
    }

    # PHP API
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi.conf;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/naming-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 10. SSL 证书（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 11. 验证

```bash
# 1. 前端首页
curl -I https://your-domain.com/app/

# 2. API 起名（POST）
curl -X POST https://your-domain.com/api/naming.php \
  -H "Content-Type: application/json" \
  -d '{"surname":"李","gender":"boy","birthday":"2025-01-15","birthtime":"12:00","nameLength":3,"calendar":"solar","preferences":[]}'

# 3. 后台登录页
curl -I https://your-domain.com/app/admin/login
```

## 🔒 安全检查清单

| ✅ | 项 |
|---|---|
| ☐ | 数据库密码用强随机（≥ 16 位）|
| ☐ | AI API key 跟其他站点隔离 |
| ☐ | 微信 AppSecret 不要明文提交到 git |
| ☐ | `.env` 文件不在 git 仓库（已在 .gitignore）|
| ☐ | 管理员首次登录后改默认密码 `admin123` |
| ☐ | Nginx 禁止目录列表（已默认）|
| ☐ | 启用 HTTPS（Let's Encrypt 免费）|
| ☐ | 防火墙只开 80/443/22 |

## 🔧 升级

```bash
cd /var/www/imoons-naming
git pull

# 后端升级
cd backend-php && composer install

# 前端升级
cd ../frontend && npm ci && npm run build
sudo cp -r dist/* ../app/

# 数据库升级（如果有 migration）
mysql -uname_imoons_cn -p name_imoons_cn < database/migrations/2026_xx_xx.sql

# 重启服务
sudo systemctl reload php8.2-fpm nginx
```

## 🆘 故障排查

### 1. AI 起名无响应

```bash
# 看 PHP-FPM 慢日志
sudo tail -50 /var/log/php8.2-fpm.log.slow

# 看 nginx 错误日志
sudo tail -50 /var/log/nginx/error.log
```

### 2. SPA 路由 404

确认 `/app/` 路径有 `try_files $uri $uri/ /app/index.html;` 兜底。

### 3. 后台登录失败

确认 `admins` 表有 admin 账号 + 密码 hash 正确。
