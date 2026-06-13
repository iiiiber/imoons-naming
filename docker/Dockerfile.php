FROM php:8.2-fpm-alpine

# 安装系统依赖
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_mysql mysqli mbstring zip

# 装 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 装 PHP 依赖（6tail 排盘）
WORKDIR /var/www/html/api
COPY backend-php/composer.json backend-php/composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-scripts || true

# 复制后端代码
COPY backend-php/ ./

# 权限
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
