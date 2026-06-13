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
if ($method === 'GET' && !$id && !$toggle) {
    $conn = getDB();
    $result = $conn->query('SELECT rc.*, a.username as creator_name FROM redeem_codes rc LEFT JOIN admins a ON rc.created_by = a.id ORDER BY rc.created_at DESC LIMIT 100');
    $codes = [];
    while ($row = $result->fetch_assoc()) { $codes[] = $row; }
    $conn->close();
    json(['list'=>$codes,'total'=>count($codes)]);
}
if ($method === 'PUT' && $id) {
    $data = getRequestBody();
    $conn = getDB();
    $fields = []; $params = []; $types = '';
    if (isset($data['code'])) { $fields[] = 'code = ?'; $params[] = $data['code']; $types .= 's'; }
    if (isset($data['amount'])) { $fields[] = 'amount = ?'; $params[] = intval($data['amount']); $types .= 'i'; }
    if (isset($data['max_use'])) { $fields[] = 'max_use = ?'; $params[] = intval($data['max_use']); $types .= 'i'; }
    if (isset($data['status'])) { $fields[] = 'status = ?'; $params[] = intval($data['status']); $types .= 'i'; }
    if (isset($data['expired_at'])) { $fields[] = 'expired_at = ?'; $params[] = $data['expired_at']; $types .= 's'; }
    if (empty($fields)) { $conn->close(); json(['error'=>'无更新字段'],400); }
    $params[] = $id; $types .= 'i';
    $sql = 'UPDATE redeem_codes SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $conn->close();
    json(['success'=>true]);
}
if ($method === 'POST' && $id && $toggle) {
    $conn = getDB();
    $stmt = $conn->prepare('UPDATE redeem_codes SET status = IF(status=1,0,1) WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $r = $conn->query('SELECT status FROM redeem_codes WHERE id='.intval($id));
    $newStatus = $r ? $r->fetch_assoc()['status'] : null;
    $conn->close();
    json(['success'=>true,'status'=>$newStatus]);
}
if ($method === 'POST' && !$id) {
    $data = getRequestBody();
    $amount = intval($data['amount'] ?? 10);
    $maxUse = min(100, max(1, intval($data['max_use'] ?? 1)));
    $count = min(50, max(1, intval($data['count'] ?? 1)));
    $customCode = isset($data['code']) ? trim($data['code']) : '';
    $conn = getDB();
    $codes = [];
    for ($i = 0; $i < $count; $i++) {
        $code = $customCode && $i === 0 ? $customCode : generateCode();
        $check = $conn->prepare('SELECT id FROM redeem_codes WHERE code = ?');
        $check->bind_param('s', $code);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) { $code = $customCode . generateCode(3); }
        $check->close();
        $stmt = $conn->prepare('INSERT INTO redeem_codes (code, amount, max_use, created_by) VALUES (?, ?, ?, 0)');
        $stmt->bind_param('sii', $code, $amount, $maxUse);
        $stmt->execute();
        $codes[] = ['code'=>$code,'amount'=>$amount,'max_use'=>$maxUse];
    }
    $conn->close();
    json(['success'=>true,'codes'=>$codes]);
}
json(['error'=>'接口不存在'],404);
