<?php
/**
 * 系统配置（查询+更新）
 */
require_once __DIR__ . '/../lib/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

requireAuth();

// 查询配置
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conn = getDB();
    $result = $conn->query('SELECT config_key, value FROM configs');
    $configs = [];
    while ($row = $result->fetch_assoc()) {
        $configs[$row['config_key']] = $row['value'];
    }
    $conn->close();
    json($configs);
}

// 更新配置
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getRequestBody();
    if (!is_array($data)) {
        json(['error' => '参数格式错误'], 400);
    }

    $conn = getDB();
    $updated = 0;
    foreach ($data as $key => $value) {
        $key = trim($key);
        if (!$key) continue;
        $stmt = $conn->prepare('INSERT INTO configs (config_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)');
        $stmt->bind_param('ss', $key, $value);
        $stmt->execute();
        $updated++;
    }
    $conn->close();
    json(['success' => true, 'updated' => $updated]);
}
