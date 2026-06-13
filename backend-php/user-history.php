<?php
/**
 * 当前用户的起名记录列表（个人中心用）
 * GET /api/user-history.php?page=1&pageSize=20
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

// 必须登录
if (session_status() === PHP_SESSION_NONE) {
    session_name('NAME_SESSID');
    @session_start();
}
$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    json(['error' => '请先登录'], 401);
}

$page = max(1, intval($_GET['page'] ?? 1));
$pageSize = min(50, max(5, intval($_GET['pageSize'] ?? 10)));
$offset = ($page - 1) * $pageSize;

$conn = getDB();

// 总数
$stmt = $conn->prepare('SELECT COUNT(*) AS total FROM name_records WHERE user_id = ?');
$stmt->bind_param('i', $userId);
$stmt->execute();
$total = intval($stmt->get_result()->fetch_assoc()['total']);

// 列表
$stmt = $conn->prepare('SELECT id, surname, gender, birthday, `name` AS name_json, source, created_at FROM name_records WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?');
$stmt->bind_param('iii', $userId, $pageSize, $offset);
$stmt->execute();
$res = $stmt->get_result();
$list = [];
while ($row = $res->fetch_assoc()) {
    // 解析 name JSON 拿到 names + bazi（跟 AdminRecords 同结构）
    $decoded = json_decode($row['name_json'], true);
    $names = [];
    $bazi = null;
    if (is_array($decoded)) {
        if (isset($decoded['names']) && is_array($decoded['names'])) {
            foreach ($decoded['names'] as $n) {
                if (is_array($n) && isset($n['name'])) $names[] = $n['name'];
            }
            $bazi = $decoded['bazi'] ?? null;
        } elseif (isset($decoded[0])) {
            foreach ($decoded as $item) {
                if (is_string($item)) $names[] = $item;
                elseif (is_array($item) && isset($item['name'])) $names[] = $item['name'];
            }
        } else {
            $bazi = $decoded;
        }
    }
    $row['names_parsed'] = $names;
    $row['bazi'] = $bazi;
    $list[] = $row;
}
$conn->close();

json([
    'list' => $list,
    'total' => $total,
    'page' => $page,
    'pageSize' => $pageSize,
    'totalPages' => $total > 0 ? ceil($total / $pageSize) : 0,
]);
