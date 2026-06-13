<?php
require_once __DIR__ . "/../lib/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(0); }

requireAuth();
$conn = getDB();

// 基础统计
$users   = $conn->query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active FROM users")->fetch_assoc();
$codes   = $conn->query("SELECT COUNT(*) as total, COALESCE(SUM(used_count), 0) as used FROM redeem_codes WHERE status = 1")->fetch_assoc();
$records = $conn->query("SELECT COUNT(*) as total, SUM(CASE WHEN source = 'ai' THEN 1 ELSE 0 END) as ai, SUM(CASE WHEN source = 'local' THEN 1 ELSE 0 END) as lx FROM name_records")->fetch_assoc();
$todayR  = $conn->query("SELECT COUNT(*) as cnt FROM name_records WHERE DATE(created_at) = CURDATE()")->fetch_assoc();
$todayU  = $conn->query("SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = CURDATE()")->fetch_assoc();

// 每日趋势（最近30天）
$dailyRecords = [];
$dailyUsers = [];
$r = $conn->query("SELECT DATE(created_at) as d, COUNT(*) as cnt FROM name_records WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY d");
while ($row = $r->fetch_assoc()) { $dailyRecords[$row["d"]] = intval($row["cnt"]); }
$r = $conn->query("SELECT DATE(created_at) as d, COUNT(*) as cnt FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY d");
while ($row = $r->fetch_assoc()) { $dailyUsers[$row["d"]] = intval($row["cnt"]); }

// 补齐最近30天
$trend = [];
for ($i = 29; $i >= 0; $i--) {
    $d = date("Y-m-d", strtotime("-" . $i . " day"));
    $trend[] = [
        "date" => $d,
        "records" => $dailyRecords[$d] ?? 0,
        "users"  => $dailyUsers[$d] ?? 0
    ];
}

$conn->close();
json([
    "users"   => ["total" => intval($users["total"]),   "active" => intval($users["active"])],
    "codes"   => ["total" => intval($codes["total"]),   "used"   => intval($codes["used"])],
    "records" => ["total" => intval($records["total"]), "ai"     => intval($records["ai"]),     "local" => intval($records["lx"])],
    "today"   => ["records" => intval($todayR["cnt"]),   "users"  => intval($todayU["cnt"])],
    "trend"   => $trend
]);
