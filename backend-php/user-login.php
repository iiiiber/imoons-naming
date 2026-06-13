<?php
/**
 * 用户端登录（账号 + 卡密两路）
 * POST /api/user-login.php
 *   { "type": "account", "username": "xxx", "password": "xxx" }
 *   { "type": "card", "cardCode": "XXXX" }
 * 成功：返回 user 资料 + token + 会员状态
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Session-Token');
header('Access-Control-Allow-Credentials: true');

// 启动 session
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
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json(['error' => '不支持的请求方法'], 405); }

$data = getRequestBody();
$type = $data['type'] ?? '';

if (!in_array($type, ['account', 'card'], true)) {
    json(['error' => 'type 必须为 account 或 card'], 400);
}

// ==================== 账号登录 ====================
if ($type === 'account') {
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (!$username || !$password) {
        json(['error' => '请输入用户名和密码'], 400);
    }

    $conn = getDB();
    $stmt = $conn->prepare('SELECT id, username, nickname, password, balance, status FROM users WHERE username = ? LIMIT 1');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $conn->close();

    if (!$user) {
        json(['error' => '用户名或密码错误'], 401);
    }
    if (!$user['password']) {
        json(['error' => '此账号未设置密码，请联系管理员'], 401);
    }
    if (!password_verify($password, $user['password'])) {
        json(['error' => '用户名或密码错误'], 401);
    }
    if ($user['status'] != 1) {
        json(['error' => '账号已被禁用'], 403);
    }

    // 设置 session
    $_SESSION['user_id']       = (int)$user['id'];
    $_SESSION['username']      = $user['username'];
    $_SESSION['login_type']    = 'account';
    $_SESSION['login_time']    = time();

    json([
        'success'    => true,
        'loginType'  => 'account',
        'user'       => [
            'id'       => (int)$user['id'],
            'username' => $user['username'],
            'nickname' => $user['nickname'] ?: $user['username'],
            'balance'  => (int)$user['balance'],
            'isMember' => $user['balance'] > 0,
        ],
    ]);
}

// ==================== 卡密登录 ====================
if ($type === 'card') {
    $code = strtoupper(trim($data['cardCode'] ?? ''));

    if (!$code) {
        json(['error' => '请输入卡密'], 400);
    }

    $conn = getDB();

    // 查卡密
    $stmt = $conn->prepare('SELECT id, code, amount, max_use, used_count, status, expired_at FROM redeem_codes WHERE code = ? LIMIT 1');
    $stmt->bind_param('s', $code);
    $stmt->execute();
    $rc = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$rc) { $conn->close(); json(['error' => '卡密不存在'], 404); }
    if ($rc['status'] != 1) { $conn->close(); json(['error' => '卡密已被禁用'], 403); }
    if ($rc['used_count'] >= $rc['max_use']) { $conn->close(); json(['error' => '卡密已被使用完'], 403); }
    if ($rc['expired_at'] && strtotime($rc['expired_at']) < time()) { $conn->close(); json(['error' => '卡密已过期'], 403); }

    // 生成/获取虚拟用户
    $cardUsername = 'card_' . $rc['id'];
    $stmt = $conn->prepare('SELECT id, username, nickname, balance, status FROM users WHERE username = ? LIMIT 1');
    $stmt->bind_param('s', $cardUsername);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        $nick = '卡密用户' . substr($code, -4);
        $stmt = $conn->prepare('INSERT INTO users (username, nickname, balance, status) VALUES (?, ?, ?, 1)');
        $stmt->bind_param('ssi', $cardUsername, $nick, $rc['amount']);
        $stmt->execute();
        $userId = $conn->insert_id;
        $stmt->close();
        $balance = (int)$rc['amount'];
    } else {
        // 修复：后台修改卡密 amount 后，用户重新登录需同步最新 amount
        // 改为"覆盖"而非"累加"，避免 max_use>1 时数据膨胀
        $userId = (int)$user['id'];
        $stmt = $conn->prepare('UPDATE users SET balance = ? WHERE id = ?');
        $stmt->bind_param('ii', $rc['amount'], $userId);
        $stmt->execute();
        $stmt->close();
        $balance = (int)$rc['amount'];
    }

    // 增加卡密使用次数
    $stmt = $conn->prepare('UPDATE redeem_codes SET used_count = used_count + 1 WHERE id = ?');
    $stmt->bind_param('i', $rc['id']);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    $_SESSION['user_id']    = $userId;
    $_SESSION['username']   = $cardUsername;
    $_SESSION['login_type'] = 'card';
    $_SESSION['login_time'] = time();

    json([
        'success'   => true,
        'loginType' => 'card',
        'user'      => [
            'id'       => $userId,
            'username' => $cardUsername,
            'nickname' => '卡密用户' . substr($code, -4),
            'balance'  => $balance,
            'isMember' => true, // 用卡密登录即会员
        ],
    ]);
}
