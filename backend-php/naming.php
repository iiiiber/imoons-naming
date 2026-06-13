<?php
/**
 * 起名接口
 * POST /api/naming        - AI生成名字（服务器端精确八字排盘 + 五行分析）
 * POST /api/naming/record - 保存起名记录
 */
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/lib/db.php';

use com\nlf\calendar\Solar;
use com\nlf\calendar\Lunar;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 保存起名记录
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'record') {
    // 启 session 取 userId（登录用户才会有关联；游客存 null）
    if (session_status() === PHP_SESSION_NONE) {
        session_name('NAME_SESSID');
        @session_start();
    }
    $userId = $_SESSION['user_id'] ?? null;

    $data = getRequestBody();
    $surname   = $data['surname']   ?? '';
    $gender    = $data['gender']    ?? 'boy';
    $birthday  = $data['birthday']  ?? '';
    $birthtime = $data['birthtime'] ?? '';
    $names     = $data['names']     ?? [];
    $bazi      = $data['bazi']      ?? null;
    $source    = $data['source']    ?? 'local';
    $preferences  = $data['preferences']  ?? [];

    if (!$surname || !$birthday || empty($names)) {
        json(['error' => '缺少必要参数'], 400);
    }

    $conn = getDB();
    $fullData = json_encode([
        'bazi'         => $bazi,
        'names'        => $names,
        'preferences'  => $preferences
    ], JSON_UNESCAPED_UNICODE);

    $stmt = $conn->prepare('INSERT INTO name_records (user_id, surname, gender, birthday, `name`, source) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('isssss', $userId, $surname, $gender, $birthday, $fullData, $source);
    if (!$stmt->execute()) {
        error_log('SAVE-RECORD ERROR: ' . $stmt->error);
        json(['error' => '数据库写入失败: ' . $stmt->error], 500);
    }
    $recordId = $conn->insert_id;
    $conn->close();
    json(['success' => true, 'id' => $recordId]);
}

// AI生成名字（主逻辑）
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json(['error' => '不支持的请求方法'], 405);
}

$data = getRequestBody();
$surname        = $data['surname']        ?? '';
$gender         = $data['gender']         ?? 'boy';
$birthday       = $data['birthday']       ?? '';       // 公历 YYYY-MM-DD
$birthtime      = $data['birthtime']      ?? '';       // HH:MM
$lunarBirthday  = $data['lunar_birthday'] ?? null;     // 农历字符串（仅供参考展示）
$nameLength     = intval($data['nameLength'] ?? 3);
$preferences    = $data['preferences']    ?? [];       // 用户偏好（tag + 自定义）

if (!$surname || !$birthday) {
    json(['error' => '缺少必要参数'], 400);
}

// ============================================================
// 第一步：服务器端精确八字排盘（使用 6tail/lunar-php）
// ============================================================
$hour = 12;
$minute = 0;
if ($birthtime) {
    $parts = explode(':', $birthtime);
    $hour = intval($parts[0]);
    $minute = isset($parts[1]) ? intval($parts[1]) : 0;
}

$birthDateTime = DateTime::createFromFormat('Y-m-d H:i', $birthday . ' ' . $birthtime);
if (!$birthDateTime) {
    $birthDateTime = DateTime::createFromFormat('Y-m-d', $birthday);
}

// 根据 calendar 字段决定构造方式
// - solar: 直接用公历日期构造 Solar
// - lunar: 用农历日期构造 Lunar，再反推 Solar（6tail 标准做法）
$calendar = $data['calendar'] ?? 'solar';
if ($calendar === 'lunar') {
    // 农历输入：先构造 Lunar 对象
    $lunar = Lunar::fromYmdHms(
        (int)$birthDateTime->format('Y'),
        (int)$birthDateTime->format('n'),
        (int)$birthDateTime->format('j'),
        $hour,
        $minute,
        0
    );
    // 6tail 的 Lunar::fromYmdHms 在闰月不合法时返回的 Solar 可能为空，做一次兜底
    $solar = $lunar->getSolar();
    if (!$solar) {
        json(['error' => '农历日期暂不支持闰月，请切换为公历输入'], 400);
    }
} else {
    // 公历输入（默认）
    $solar = Solar::fromYmdHms(
        (int)$birthDateTime->format('Y'),
        (int)$birthDateTime->format('n'),
        (int)$birthDateTime->format('j'),
        $hour,
        $minute,
        0
    );
    $lunar = $solar->getLunar();
}
$ec = $lunar->getEightChar();

// 四柱天干地支（精确计算结果）
$yearPillar  = $ec->getYear();   // 如 "癸卯"
$monthPillar = $ec->getMonth();  // 如 "乙丑"
$dayPillar   = $ec->getDay();    // 如 "戊寅"
$hourPillar  = $ec->getTime();   // 如 "丁巳"

// 农历详细信息（用于展示）
$lunarYear  = $lunar->getYearInChinese();
$lunarMonth = $lunar->getMonthInChinese();
$lunarDay   = $lunar->getDayInChinese();
$lunarStr   = $lunarYear . '年' . $lunarMonth . '月' . $lunarDay;

// 五行原始数据（用于结构化传给AI）
$wuxing = [
    '木' => 0, '火' => 0, '土' => 0, '金' => 0, '水' => 0
];
$ganList = [
    $ec->getYearGan(), $ec->getMonthGan(),
    $ec->getDayGan(),  $ec->getTimeGan()
];
$zhiList = [
    $ec->getYearZhi(), $ec->getMonthZhi(),
    $ec->getDayZhi(),  $ec->getTimeZhi()
];

$ganMap  = ['甲' => '木', '乙' => '木', '丙' => '火', '丁' => '火',
            '戊' => '土', '己' => '土', '庚' => '金', '辛' => '金',
            '壬' => '水', '癸' => '水'];
$zhiMap  = ['子' => '水', '丑' => '土', '寅' => '木', '卯' => '木',
            '辰' => '土', '巳' => '火', '午' => '火', '未' => '土',
            '申' => '金', '酉' => '金', '戌' => '土', '亥' => '水'];
$zhiHiddenGan = [
    '子' => ['癸'], '丑' => ['己', '癸', '辛'],
    '寅' => ['甲', '丙', '戊'], '卯' => ['乙'],
    '辰' => ['戊', '乙', '癸'], '巳' => ['丙', '庚', '戊'],
    '午' => ['丁', '己'], '未' => ['己', '丁', '乙'],
    '申' => ['庚', '壬', '戊'], '酉' => ['辛'],
    '戌' => ['戊', '辛', '丁'], '亥' => ['壬', '甲']
];

foreach ($ganList as $g) { if (isset($ganMap[$g])) $wuxing[$ganMap[$g]]++; }
foreach ($zhiList as $z) {
    if (isset($zhiMap[$z])) $wuxing[$zhiMap[$z]]++;
}

// 日主信息
$dayGan = $ec->getDayGan();
$dayGanElement = $ganMap[$dayGan] ?? '土';
$dayMasterMap = ['木' => '甲木', '火' => '丙火', '土' => '戊土', '金' => '庚金', '水' => '壬水'];
$dayMaster = $dayMasterMap[$dayGanElement] ?? $dayGan . $dayGanElement;

// 计算日主强弱（简化版：统计总分）
$ganTotal = count($ganList);  // 天干4个
$zhiTotal = count($zhiList);  // 地支4个（每个含藏干）
// 藏干计分：日干自身1分，本气0.5分，余气0.3分
$selfScore    = 1.0;
$mainScore    = 0.5;
$hiddenScore  = 0.3;

$dayZhi = $ec->getDayZhi();
$dayHidden = $zhiHiddenGan[$dayZhi] ?? [];
$selfInZhi = in_array($dayGan, $dayHidden) ? 1 : 0;

// 五行得分（简单评估）
$elementScores = $wuxing; // 拷贝

// 日主自身强度评估
$selfStrength = $selfScore + ($selfInZhi ? $mainScore : 0);
// 其他天干对日主的生克
$otherGan = array_filter($ganList, fn($g) => $g !== $dayGan);
$support = 0; $抑制 = 0;
$shengMap = ['木' => '水', '火' => '木', '土' => '火', '金' => '土', '水' => '金'];
$keMap       = ['木' => '金', '火' => '水', '土' => '木', '金' => '火', '水' => '土'];
$woShengMap = ['木' => '火', '火' => '土', '土' => '金', '金' => '水', '水' => '木'];  // 我生者(食伤)
$woKeMap    = ['木' => '土', '火' => '金', '土' => '水', '金' => '木', '水' => '火'];   // 我克者(财)
$mySheng = $shengMap[$dayGanElement] ?? '';
$myKe    = $keMap[$dayGanElement] ?? '';
$woSheng = $woShengMap[$dayGanElement] ?? '';
$woKe    = $woKeMap[$dayGanElement] ?? '';
foreach ($otherGan as $og) {
    $oge = $ganMap[$og] ?? '';
    if ($oge === $mySheng) $support++;
    if ($oge === $myKe) $抑制++;
}

$strength = $selfStrength + ($support * 0.3) - ($抑制 * 0.3);
if ($strength >= 2.0) {
    $strengthText = '身强';
    // 身强: 喜用=克(官杀)+我生者(食伤)+我克者(财), 忌神=生我者(印)+同我者(比劫)+日主
    $xiyongList = [$myKe, $woSheng, $woKe];       // 克我者+我生者+我克者
    $avoidList  = [$mySheng, $dayGanElement];      // 生我者+日主
} else {
    $strengthText = '身弱';
    // 身弱: 喜用=生我者(印)+同我者(比劫)+日主, 忌神=克(官杀)+我生者(食伤)+我克者(财)
    $xiyongList = [$mySheng, $dayGanElement];      // 生我者+日主
    $avoidList  = [$myKe, $woSheng, $woKe];        // 克我者+我生者+我克者
}
// 保证喜用神和忌神不重复、互斥
$xiyongList = array_values(array_unique($xiyongList));
$avoidList  = array_values(array_unique($avoidList));
// 喜用神最多保留3个，忌神最多保留3个
$xiyongList = array_slice($xiyongList, 0, 3);
$avoidList  = array_slice($avoidList, 0, 3);

$wuxingJson = json_encode($wuxing, JSON_UNESCAPED_UNICODE);
$xiyongshenJson = json_encode($xiyongList, JSON_UNESCAPED_UNICODE);
$avoidJson = json_encode(array_values($avoidList), JSON_UNESCAPED_UNICODE);

// ============================================================
// 第二步：调用AI生成名字
// ============================================================

// 读取AI配置
$conn = getDB();
$result = $conn->query('SELECT config_key, value FROM configs');
$configs = [];
while ($row = $result->fetch_assoc()) {
    $configs[$row['config_key']] = $row['value'];
}
$conn->close();

$apiUrl = $configs['ai_api_url'] ?? 'https://api.deepseek.com/v1/chat/completions';
$apiKey = $configs['ai_api_key'] ?? '';
$model  = $configs['ai_model']   ?? 'deepseek-chat';

$genderText    = $gender === 'boy' ? '男孩' : '女孩';
$nameCharCount = $nameLength === 2 ? '1个' : '2个';
$nameOnly      = $nameLength === 2 ? '1个字' : '2个字';

// 格式化用户偏好（tag + 自定义）注入到 prompt
$prefLines = '';
if (is_array($preferences) && !empty($preferences)) {
    $prefLines = "- 起名偏好（用户已选）：" . implode('、', array_map(fn($p) => '"' . $p . '"', $preferences)) . "\n";
}

// 系统已经精确计算好八字，直接告诉AI
$prompt = "你是一个精通八字五行、诗词典故的传统起名大师。宝宝的八字已由服务器精确计算，请直接使用以下数据进行分析和起名，**不要重新推算八字**。

【宝宝信息】（以下数据已精确计算，请直接使用）
- 姓氏：{$surname}
- 性别：{$genderText}
- 出生日期（公历）：{$birthday} {$birthtime}
- 出生日期（农历）：{$lunarStr}
- 四柱八字：
  * 年柱：{$yearPillar}
  * 月柱：{$monthPillar}
  * 日柱：{$dayPillar}
  * 时柱：{$hourPillar}
- 五行分布：{$wuxingJson}（木、火、土、金、水各自数量）
- 日主：{$dayMaster}（即出生日天干）
- 日主强弱：{$strengthText}
- 喜用神（五行）：{$xiyongshenJson}
- 忌神（五行）：{$avoidJson}
- 期望名字字数：{$nameLength}个字（即名字部分{$nameOnly}）
{$prefLines}【你的任务】

第一步：验证四柱是否正确（若有不合理之处可微调时柱地支）。

第二步：详细分析八字五行。在八字中，天干地支各自属什么五行，统计木、火、土、金、水各多少个（包含藏干）。根据同我者帮、我克者泄、克我者抑、生我者助的原则，分析日主的强弱，给出喜用神的详细确定原因。

第三步：根据喜用神，结合姓氏五行、性别、诗词典故、**用户起名偏好**，生成10个寓意美好、符合八字命理的好名字。每个名字要五行属喜用神，名字本身五行为宜。**严格遵循用户偏好**（如「现代简约」不要用生僻字，「诗词典故」要引用诗经楚辞唐诗宋词原文，「周易国学」参考易经/道德经/四书五经，「自然意象」用山水花鸟天地星辰等自然元素，「品德志向」体现仁义礼智信或志向远大，「自定义」内容必须满足）。

**【硬性规则 — 不可违反】**
- **每个字五行必须严格按康熙字典笔画法判断**（不能凭字形推测、不能「圆场」）
- **名字中所有字必须落在喜用神五行内**（喜用神之外的五行**绝对禁止**）
- **不要用「之」/「乎」/「者」/「也」/「兮」/「其」等无五行的虚字凑字**（这些字不在康熙字库）
- **不确定五行的字不要用**（宁可少字、宁可换字）
- **suitable_reason 必须如实标注每个字的康熙字典五行**，不能「虽 X 但 Y」强行圆场
- 如有把握不准的字，**宁可换掉也不要保留**

**严格命名规则**：
- “name” 字段**只填名字部分**（不含姓“{$surname}”），**绝不能把姓氏带进 name**
- 正确示例：“name”: “桐”（不含姓“李”）
- 错误示例：“name”: “李桐”（带姓，绝对禁止）
- 拼音只填名字部分的拼音声调
- 每个名字五行属喜用神（如喜木火，则名字字形带木/火偏旁）

【输出格式】（严格返回JSON，不要任何其他文字）
{
  \“bazi\”: {
    \“year\”: \“{$yearPillar}\”,
    \“month\”: \“{$monthPillar}\”,
    \“day\”: \“{$dayPillar}\”,
    \“hour\”: \“{$hourPillar}\”,
    \“wuxing\”: {$wuxingJson},
    \“day_master\”: \“{$dayMaster}\”,
    \“day_master_strength\”: \“{$strengthText}\”,
    \“xiyongshen\”: {$xiyongshenJson},
    \“avoid\”: {$avoidJson},
    \“analysis\”: \“详细的八字五行分析（150字以上，包含年柱月柱日柱时柱的解读，以及喜用神确定的原因）\”
  },
  \“names\”: [
    {
      \“name\”: \“名字（不含姓氏）\”,
      \“pinyin\”: \“拼音\”,
      \“wuxing\”: \“该名字的五行属性\”,
      \“meaning\”: \“名字寓意解释\”,
      \“source\”: \“出处（诗词、成语、典故）\”,
      \“score\”: 评分1-100,
      \“suitable_reason\”: \“为什么这个名字适合该宝宝（结合喜用神和八字）\”
    }
  ]
}

请直接返回JSON，不要有任何前缀或解释文字。";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $model,
    'messages' => [
        ['role' => 'user', 'content' => $prompt]
    ],
    'temperature' => 0.85,
    'max_tokens' => 4000,
    'thinking' => ['type' => 'disabled']
], JSON_UNESCAPED_UNICODE));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    error_log("AI API Error: httpCode=$httpCode curlErr=$curlErr");
    json(['error' => 'AI服务暂时不可用，请稍后重试', 'detail' => $curlErr], 502);
}

$resultData = json_decode($response, true);
$content = $resultData['choices'][0]['message']['content'] ?? '';

// 去掉 M3 等思考模型的 <think>...</think> 块（避免 parse JSON 失败）
$content = preg_replace('/<think>.*?<\/think>/s', '', $content);

// 提取JSON
$json = null;
$content = trim($content);
if (substr($content, 0, 1) === '{') {
    $json = json_decode($content, true);
}
if (!$json) {
    preg_match('/\{.*\}/s', $content, $matches);
    if ($matches) {
        $json = json_decode($matches[0], true);
    }
}

if (!$json || !isset($json['bazi']) || !isset($json['names'])) {
    error_log("AI Response parse error: " . substr($content, 0, 500));
    json(['error' => 'AI返回格式异常，请重试', 'raw' => substr($content, 0, 200)], 502);
}

// ==================== 会员状态判断（决定返回几个名字）====================
$isMember = false;
$userBalance = 0;
if (session_status() === PHP_SESSION_NONE) {
    session_name('NAME_SESSID');
    @session_start();
}
$userId = $_SESSION['user_id'] ?? null;
if ($userId) {
    $memberConn = getDB();
    $stmt = $memberConn->prepare('SELECT balance, status FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $u = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($u && $u['status'] == 1 && $u['balance'] > 0) {
        $isMember = true;
        $userBalance = (int)$u['balance'];
        // 扣减 1 次
        $stmt = $memberConn->prepare('UPDATE users SET balance = balance - 1 WHERE id = ? AND balance > 0');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $stmt->close();
        $userBalance -= 1;
    }
    $memberConn->close();
}

// 把服务器端精确计算的八字（bazi数组）也一并返回给前端展示
$response = [
    'success' => true,
    'source' => 'ai',
    'bazi' => $json['bazi'],
    'names' => $isMember ? $json['names'] : array_slice($json['names'], 0, 3),
    'isMember' => $isMember,
    'userBalance' => $userBalance,
    'totalNames' => count($json['names']),
    'visibleNames' => $isMember ? count($json['names']) : min(3, count($json['names'])),
    'bazi_computed' => [
        'year'  => $yearPillar,
        'month' => $monthPillar,
        'day'   => $dayPillar,
        'hour'  => $hourPillar,
        'lunar' => $lunarStr,
        'wuxing'=> $wuxing,
        'shengxiao' => $lunar->getYearShengXiao(),  // 🆕 6tail 年生肖
        'day_master'      => $dayMaster,
        'day_master_strength' => $strengthText,
        'xiyongshen'      => $xiyongList,
        'avoid'           => array_values($avoidList)
    ]
];
json($response);
