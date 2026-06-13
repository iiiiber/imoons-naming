# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**请勿在 GitHub Issues 公开安全漏洞。**

私密报告方式：

📧 **Email**：iiiiber@github.com （加密邮件推荐用 GPG key `4F1A 2B3C ...`）

或在 GitHub 上用 [Private Vulnerability Reporting](https://github.com/iiiiber/naming-app-fullstack/security/advisories/new)。

**请提供**：
- 漏洞描述
- 复现步骤
- 影响范围
- 修复建议（可选）

**响应时效**：
- 48 小时内确认收到
- 7 天内评估严重性
- 30 天内修复 Critical/High

## 已知安全考虑

部署前请检查：
- [ ] 修改默认 admin 密码 (`admin123` → 强密码)
- [ ] 数据库密码用强随机（≥ 16 位）
- [ ] `.env` 文件不在版本控制（已在 .gitignore）
- [ ] HTTPS 启用（Let's Encrypt）
- [ ] 关闭 PHP 错误显示 (`display_errors = Off`)
- [ ] 防火墙只开 80/443/22
