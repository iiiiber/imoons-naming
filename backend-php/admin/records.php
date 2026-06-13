<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
requireAuth();

$page = max(1, intval($_GET['page'] ?? 1));
$pageSize = min(50, max(10, intval($_GET['pageSize'] ?? 20)));
$offset = ($page - 1) * $pageSize;
$surname = $_GET['surname'] ?? '';
$gender = $_GET['gender'] ?? '';
$source = $_GET['source'] ?? '';
$dateFrom = $_GET['dateFrom'] ?? '';
$dateTo = $_GET['dateTo'] ?? '';

$conn = getDB();
$where = [];
$params = [];
$types = '';

if ($surname) { $where[] = 'surname LIKE ?'; $params[] = "%$surname%"; $types .= 's'; }
if ($gender) { $where[] = 'gender = ?'; $params[] = $gender; $types .= 's'; }
if ($source) { $where[] = 'source = ?'; $params[] = $source; $types .= 's'; }
if ($dateFrom) { $where[] = 'created_at >= ?'; $params[] = $dateFrom . ' 00:00:00'; $types .= 's'; }
if ($dateTo) { $where[] = 'created_at <= ?'; $params[] = $dateTo . ' 23:59:59'; $types .= 's'; }

$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$countSql = "SELECT COUNT(*) as total FROM name_records $whereSql";
if ($params) {
    $stmt = $conn->prepare($countSql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $total = intval($stmt->get_result()->fetch_assoc()['total']);
} else {
    $total = intval($conn->query($countSql)->fetch_assoc()['total']);
}

$listSql = "SELECT id, user_id, surname, gender, birthday, `name` as name_json, source, created_at FROM name_records $whereSql ORDER BY created_at DESC LIMIT ? OFFSET ?";
$fetchParams = $params;
$fetchParams[] = $pageSize;
$fetchParams[] = $offset;
$fetchTypes = $types . 'ii';

$stmt = $conn->prepare($listSql);
$stmt->bind_param($fetchTypes, ...$fetchParams);
$stmt->execute();
$result = $stmt->get_result();

$list = [];
while ($row = $result->fetch_assoc()) {
    $decoded = json_decode($row['name_json'], true);
    $names = [];
    $bazi = null;

    if (is_array($decoded)) {
        // 新格式: {"bazi": {...}, "names": [...]]
        if (isset($decoded['names']) && is_array($decoded['names'])) {
            foreach ($decoded['names'] as $n) {
                if (is_array($n) && isset($n['name'])) {
                    $names[] = $n['name'];
                }
            }
            $bazi = $decoded['bazi'] ?? null;
        }
        // 旧格式: [{"name": "xxx", ...}, ...]
        elseif (isset($decoded[0])) {
            foreach ($decoded as $item) {
                if (is_string($item)) {
                    $names[] = $item;
                } elseif (is_array($item) && isset($item['name'])) {
                    $names[] = $item['name'];
                }
            }
        }
        // 旧格式: {"ba": "xxx", ...} (只有八字没有names)
        else {
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
    'totalPages' => $total > 0 ? ceil($total / $pageSize) : 0
]);
