<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json(['error' => '不支持的请求方法'], 405); }

$data = getRequestBody();
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) { json(['error' => '用户名或密码不能为空'], 400); }

$conn = getDB();
$stmt = $conn->prepare('SELECT * FROM admins WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$conn->close();

if (!$admin) { json(['error' => '用户名或密码错误'], 401); }

// bcrypt 验证
if (!password_verify($password, $admin['password'])) {
    json(['error' => '用户名或密码错误'], 401);
}

$token = base64_encode(json_encode([
    'admin_id' => $admin['id'],
    'username' => $admin['username'],
    'time' => time()
]));

json(['success' => true, 'token' => $token, 'username' => $admin['username']]);
