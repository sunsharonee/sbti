<?php
header("Content-Type: application/json");

// 모든 PHP 오류를 표시
error_reporting(E_ALL);
ini_set('display_errors', 1);

// JSON 데이터 받기
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON received"]);
    exit;
}

// ✅ 과목(전공) 유형 (P, C, B, G, I, M)
$majors = ['P', 'C', 'B', 'G', 'I', 'M'];
$majorType = "";

// ✅ 실험형/이론형 (E, T)
$approaches = ['E', 'T'];
$approachType = "";

// ✅ 교과서 중심/탐구 중심 (S, R)
$studyStyles = ['S', 'R'];
$studyStyleType = "";

// ✅ 혼자 공부/팀 공부 (A, U)
$groupStyles = ['A', 'U'];
$groupStyleType = "";

// ✅ 각 그룹별 점수 계산
function getMaxType($categories, $data) {
    $maxScore = -INF;
    $maxType = "";
    
    foreach ($categories as $type) {
        if (isset($data[$type]) && $data[$type] > $maxScore) {
            $maxScore = $data[$type];
            $maxType = $type;
        }
    }
    return $maxType;
}

// ✅ 각 유형 결정
$majorType = getMaxType($majors, $data);
$approachType = getMaxType($approaches, $data);
$studyStyleType = getMaxType($studyStyles, $data);
$groupStyleType = getMaxType($groupStyles, $data);

// ✅ 최종 4글자 유형 조합
$userType = $majorType . $approachType . $studyStyleType . $groupStyleType;

// ✅ MySQL 연결
$mysqli = new mysqli("localhost", "root", "autoset", "study_mbti");

if ($mysqli->connect_error) {
    echo json_encode(["error" => "Database connection failed: " . $mysqli->connect_error]);
    exit;
}

// ✅ 데이터 저장
$stmt = $mysqli->prepare("INSERT INTO users (username, score_json, user_type) VALUES (?, ?, ?)");
$username = "user_" . time();
$score_json = json_encode($data);
$stmt->bind_param("sss", $username, $score_json, $userType);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "user_type" => $userType]);
} else {
    echo json_encode(["error" => "Failed to save result"]);
}

$stmt->close();
$mysqli->close();
?>
