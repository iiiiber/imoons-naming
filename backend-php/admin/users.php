<?php
require_once __DIR__ . '/../lib/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

if ($method === 'GET' && !$id) {
    $conn = getDB();
    $keyword = $_GET['keyword'] ?? '';
    if ($keyword) {
        $stmt = $conn->prepare('SELECT id, username, phone, openid, balance, status, created_at, updated_at FROM users WHERE username LIKE ? OR openid LIKE ? ORDER BY created_at DESC LIMIT 100');
        $kw = '%' . $keyword . '%';
        $stmt->bind_param('ss', $kw, $kw);
    } else {
        $stmt = $conn->prepare('SELECT id, username, phone, openid, balance, status, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 100');
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) { $users[] = $row; }
    $conn->close();
    json(['list'=>$users,'total'=>count($users)]);
}

if ($method === 'POST' && $id && $action === 'toggle') {
    $conn = getDB();
    $stmt = $conn->prepare('UPDATE users SET status = IF(status=1,0,1) WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $r = $conn->query('SELECT status FROM users WHERE id='.intval($id));
    $newStatus = $r ? $r->fetch_assoc()['status'] : null;
    $conn->close();
    json(['success'=>true,'status'=>$newStatus]);
}

if ($method === 'POST' && $id && $action === 'credits') {
    $data = getRequestBody();
    $credits = intval($data['credits'] ?? 0);
    $conn = getDB();
    $stmt = $conn->prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
    $stmt->bind_param('ii', $credits, $id);
    $stmt->execute();
    $conn->close();
    json(['success'=>true,'credits'=>$credits]);
}

json(['error'=>'接口不存在'],404);
