<?php
/**
 * 获取当前登录用户信息
 * GET /api/user-me.php
 * 用于前端 Header 显示登录态
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 30 * 24 * 3600,
        'path'     => '/',
        'domain'   => '.name.imoons.cn',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('NAME_SESSID');
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    json(['user' => null], 200); // 未登录：返回 null，不报错
}

$conn = getDB();
$stmt = $conn->prepare('SELECT id, username, nickname, balance, status FROM users WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$user || $user['status'] != 1) {
    session_destroy();
    json(['user' => null], 200);
}

json([
    'user' => [
        'id'       => (int)$user['id'],
        'username' => $user['username'],
        'nickname' => $user['nickname'] ?: $user['username'],
        'balance'  => (int)$user['balance'],
        'isMember' => $user['balance'] > 0,
    ],
]);
