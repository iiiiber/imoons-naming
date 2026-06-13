<?php
require_once __DIR__ . '/lib/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$requestUri = $_SERVER['REQUEST_URI'];
$uriPath = parse_url($requestUri, PHP_URL_PATH);
$id = null;
// 路径形式：/api/article/<id>（nginx rewrite 后会是 /api/article/<id>.php，需从 path 提取）
if (preg_match('#^/api/article(?:/(\d+))?$#', $uriPath, $m)) {
    $id = isset($m[1]) ? intval($m[1]) : null;
}
// query 形式：?id=7（直接请求 /api/article.php?id=7）
if (!$id && isset($_GET['id'])) {
    $id = intval($_GET['id']);
}
if (!$id && isset($_GET['path'])) {
    if (preg_match('#^article/(?:(\d+))$#', $_GET['path'], $m)) {
        $id = isset($m[1]) ? intval($m[1]) : null;
    }
}
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/article - 列表
if ($method === 'GET' && !$id) {
    $conn = getDB();
    $page = max(1, intval($_GET['page'] ?? 1));
    $pageSize = min(50, max(1, intval($_GET['pageSize'] ?? 10)));
    $offset = ($page - 1) * $pageSize;
    $where = 'WHERE status = 1';
    if (isset($_GET['featured'])) { $where .= ' AND is_featured = 1'; }
    $total = intval($conn->query("SELECT COUNT(*) as t FROM knowledge_articles $where")->fetch_assoc()['t']);
    $sql = "SELECT id, title, summary, cover_image, views, likes, is_featured, created_at FROM knowledge_articles $where ORDER BY is_featured DESC, id DESC LIMIT $pageSize OFFSET $offset";
    $result = $conn->query($sql);
    $list = [];
    while ($row = $result->fetch_assoc()) { $list[] = $row; }
    $conn->close();
    json(['list' => $list, 'total' => $total, 'page' => $page, 'pageSize' => $pageSize]);
}

// GET /api/article/<id> - 详情
if ($method === 'GET' && $id) {
    $conn = getDB();
    $stmt = $conn->prepare('SELECT * FROM knowledge_articles WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $article = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$article) { $conn->close(); json(['error' => '文章不存在'], 404); }
    $conn->query("UPDATE knowledge_articles SET views = views + 1 WHERE id = $id");
    $conn->close();
    json($article);
}

// 鉴权
$token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION'] ?? '');
if (!verifyToken($token)) { json(['error' => '未登录'], 401); }

// POST 新建
if ($method === 'POST' && !$id) {
    $data = getRequestBody();
    $title = trim($data['title'] ?? '');
    $summary = $data['summary'] ?? '';
    $content = $data['content'] ?? '';
    $cover_image = $data['cover_image'] ?? '';
    $category = $data['category'] ?? '';
    $is_featured = isset($data['is_featured']) ? intval($data['is_featured']) : 0;
    $status = isset($data['status']) ? intval($data['status']) : 1;
    if (!$title || !$content) { json(['error' => '标题和内容不能为空'], 400); }
    $conn = getDB();
    $stmt = $conn->prepare('INSERT INTO knowledge_articles (title, summary, content, cover_image, category, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssii', $title, $summary, $content, $cover_image, $category, $is_featured, $status);
    if (!$stmt->execute()) { $err = $stmt->error; $stmt->close(); $conn->close(); json(['error' => '创建失败: ' . $err], 500); }
    $newId = $conn->insert_id;
    $stmt->close();
    $conn->close();
    json(['success' => true, 'id' => $newId]);
}

// PUT 更新（支持部分更新）
if ($method === 'PUT' && $id) {
    $data = getRequestBody();
    $conn = getDB();
    $stmt = $conn->prepare('SELECT * FROM knowledge_articles WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$existing) { $conn->close(); json(['error' => '文章不存在'], 404); }
    $title = array_key_exists('title', $data) ? trim($data['title']) : $existing['title'];
    $summary = array_key_exists('summary', $data) ? $data['summary'] : $existing['summary'];
    $content = array_key_exists('content', $data) ? $data['content'] : $existing['content'];
    $cover_image = array_key_exists('cover_image', $data) ? $data['cover_image'] : $existing['cover_image'];
    $category = array_key_exists('category', $data) ? $data['category'] : $existing['category'];
    $is_featured = array_key_exists('is_featured', $data) ? intval($data['is_featured']) : $existing['is_featured'];
    $status = array_key_exists('status', $data) ? intval($data['status']) : $existing['status'];
    $stmt = $conn->prepare('UPDATE knowledge_articles SET title=?, summary=?, content=?, cover_image=?, category=?, is_featured=?, status=?, updated_at=NOW() WHERE id=?');
    $stmt->bind_param('sssssiii', $title, $summary, $content, $cover_image, $category, $is_featured, $status, $id);
    if (!$stmt->execute()) { $err = $stmt->error; $stmt->close(); $conn->close(); json(['error' => '更新失败: ' . $err], 500); }
    $stmt->close();
    $conn->close();
    json(['success' => true]);
}

// DELETE 删除
if ($method === 'DELETE' && $id) {
    $conn = getDB();
    $stmt = $conn->prepare('DELETE FROM knowledge_articles WHERE id = ?');
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) { $err = $stmt->error; $stmt->close(); $conn->close(); json(['error' => '删除失败: ' . $err], 500); }
    $stmt->close();
    $conn->close();
    json(['success' => true]);
}

json(['error' => '不支持的请求'], 404);
