<?php
header("Content-Type: application/json");

// MySQL 연결
$mysqli = new mysqli("localhost", "root", "autoset", "study_mbti");

if ($mysqli->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $mysqli->connect_error]));
}

// JSON 데이터 수신
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['username'])) {
    die(json_encode(["error" => "Missing username"]));
}

$username = $mysqli->real_escape_string($data['username']);

// 이미 존재하는 아이디인지 확인
$result = $mysqli->query("SELECT * FROM users WHERE username = '$username'");
if ($result->num_rows > 0) {
    echo json_encode(["error" => "Username already exists"]);
} else {
    // 신규 사용자 등록
    $stmt = $mysqli->prepare("INSERT INTO users (username) VALUES (?)");
    $stmt->bind_param("s", $username);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "User registered"]);
    } else {
        echo json_encode(["error" => "Failed to register user"]);
    }

    $stmt->close();
}

$mysqli->close();
?>
