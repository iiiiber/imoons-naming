<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$toggle = isset($_GET['toggle']);

// GET 列表（带搜索/筛选/分页）
if ($method === 'GET' && !$id && !$toggle) {
    $page = max(1, intval($_GET['page'] ?? 1));
    $pageSize = min(50, max(10, intval($_GET['pageSize'] ?? 20)));
    $offset = ($page - 1) * $pageSize;
    $keyword = $_GET['keyword'] ?? '';
    $status = $_GET['status'] ?? '';
    $category = $_GET['category'] ?? '';

    $conn = getDB();
    $where = []; $params = []; $types = '';
    if ($keyword) { $where[] = 'title LIKE ?'; $params[] = "%$keyword%"; $types .= 's'; }
    if ($status !== '') { $where[] = 'status = ?'; $params[] = intval($status); $types .= 'i'; }
    if ($category) { $where[] = 'category = ?'; $params[] = $category; $types .= 's'; }
    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $countSql = "SELECT COUNT(*) as total FROM knowledge_articles $whereSql";
    if ($params) {
        $stmt = $conn->prepare($countSql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $total = intval($stmt->get_result()->fetch_assoc()['total']);
    } else {
        $total = intval($conn->query($countSql)->fetch_assoc()['total']);
    }

    $sql = "SELECT id, title, summary, cover_image, category, views, likes, is_featured, status, created_at, updated_at FROM knowledge_articles $whereSql ORDER BY id DESC LIMIT ? OFFSET ?";
    $fetchParams = $params; $fetchParams[] = $pageSize; $fetchParams[] = $offset;
    $fetchTypes = $types . 'ii';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($fetchTypes, ...$fetchParams);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $conn->close();

    json([
        'list' => $rows,
        'total' => $total,
        'page' => $page,
        'pageSize' => $pageSize,
        'totalPages' => $total > 0 ? ceil($total / $pageSize) : 0
    ]);
}

// GET 单条（编辑时用）
if ($method === 'GET' && $id) {
    $conn = getDB();
    $stmt = $conn->prepare('SELECT * FROM knowledge_articles WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $conn->close();
    if (!$row) json(['error' => '文章不存在'], 404);
    json($row);
}

// POST 创建
if ($method === 'POST' && !$id) {
    $data = getRequestBody();
    $title = trim($data['title'] ?? '');
    $summary = trim($data['summary'] ?? '');
    $content = trim($data['content'] ?? '');
    $coverImage = trim($data['cover_image'] ?? '');
    $category = trim($data['category'] ?? '');
    $isFeatured = isset($data['is_featured']) ? intval($data['is_featured']) : 0;
    $status = isset($data['status']) ? intval($data['status']) : 1;

    if (!$title) json(['error' => '标题不能为空'], 400);
    if (!$content) json(['error' => '内容不能为空'], 400);

    $conn = getDB();
    $stmt = $conn->prepare('INSERT INTO knowledge_articles (title, summary, content, cover_image, category, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssii', $title, $summary, $content, $coverImage, $category, $isFeatured, $status);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $conn->close();
    json(['success' => true, 'id' => $newId]);
}

// PUT 更新
if ($method === 'PUT' && $id) {
    $data = getRequestBody();
    $fields = []; $params = []; $types = '';
    foreach (['title' => 's', 'summary' => 's', 'content' => 's', 'cover_image' => 's', 'category' => 's'] as $k => $t) {
        if (isset($data[$k])) { $fields[] = "$k = ?"; $params[] = $data[$k]; $types .= $t; }
    }
    foreach (['is_featured' => 'i', 'status' => 'i'] as $k => $t) {
        if (isset($data[$k])) { $fields[] = "$k = ?"; $params[] = intval($data[$k]); $types .= $t; }
    }
    if (empty($fields)) json(['error' => '无更新字段'], 400);
    $params[] = $id; $types .= 'i';
    $sql = 'UPDATE knowledge_articles SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $conn = getDB();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $conn->close();
    json(['success' => true]);
}

// POST toggle 启用/禁用
if ($method === 'POST' && $id && $toggle) {
    $conn = getDB();
    $stmt = $conn->prepare('UPDATE knowledge_articles SET status = IF(status=1, 0, 1) WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $r = $conn->query('SELECT status FROM knowledge_articles WHERE id = ' . intval($id));
    $newStatus = $r ? $r->fetch_assoc()['status'] : null;
    $conn->close();
    json(['success' => true, 'status' => intval($newStatus)]);
}

// DELETE 删除
if ($method === 'DELETE' && $id) {
    $conn = getDB();
    $stmt = $conn->prepare('DELETE FROM knowledge_articles WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $conn->close();
    if ($affected === 0) json(['error' => '文章不存在或已删除'], 404);
    json(['success' => true]);
}

json(['error' => '接口不存在'], 404);
