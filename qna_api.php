<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$servername = "localhost";
$username = "macrobim";
$password = "yjp@072072";
$dbname = "macrobim";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
$conn->set_charset("utf8");

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// 글 목록
if ($action === 'list') {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = 10;
    $offset = ($page - 1) * $perPage;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    $where = '';
    $params = [];
    $types = '';
    if ($search !== '') {
        $where = " WHERE (title LIKE ? OR content LIKE ? OR id LIKE ?)";
        $like = '%' . $search . '%';
        $params = [$like, $like, $like];
        $types = 'sss';
    }

    // 전체 개수
    $countSql = "SELECT COUNT(*) AS cnt FROM qna" . $where;
    $countStmt = $conn->prepare($countSql);
    if ($types) $countStmt->bind_param($types, ...$params);
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_assoc()['cnt'];

    // 목록 조회
    $sql = "SELECT no, parent_no, depth, id, title, content, is_secret, is_answered, image_path, created_at FROM qna" . $where . " ORDER BY no DESC LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    if ($types) {
        $allTypes = $types . 'ii';
        $allParams = array_merge($params, [$perPage, $offset]);
        $stmt->bind_param($allTypes, ...$allParams);
    } else {
        $stmt->bind_param('ii', $perPage, $offset);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        // 비밀글이면 내용 숨김
        if ($row['is_secret'] && (!isset($_SESSION['qna_auth_' . $row['no']])) ) {
            $row['content'] = '';
            $row['image_path'] = '';
        }
        $rows[] = $row;
    }

    echo json_encode(['rows' => $rows, 'total' => intval($total), 'page' => $page, 'perPage' => $perPage]);
    $conn->close();
    exit;
}

// 글 상세
if ($action === 'view') {
    $no = isset($_GET['no']) ? intval($_GET['no']) : 0;
    $stmt = $conn->prepare("SELECT * FROM qna WHERE no = ?");
    $stmt->bind_param("i", $no);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) {
        echo json_encode(['error' => 'not found']);
        $conn->close();
        exit;
    }

    // 비밀글 체크
    if ($row['is_secret'] && !isset($_SESSION['qna_auth_' . $no])) {
        echo json_encode(['error' => 'secret', 'no' => $no]);
        $conn->close();
        exit;
    }

    // 답글 목록
    $replyStmt = $conn->prepare("SELECT * FROM qna WHERE parent_no = ? ORDER BY no ASC");
    $replyStmt->bind_param("i", $no);
    $replyStmt->execute();
    $replies = [];
    $replyResult = $replyStmt->get_result();
    while ($r = $replyResult->fetch_assoc()) {
        $replies[] = $r;
    }

    echo json_encode(['post' => $row, 'replies' => $replies]);
    $conn->close();
    exit;
}

// 비밀글 비밀번호 확인
if ($action === 'unlock') {
    $no = isset($_POST['no']) ? intval($_POST['no']) : 0;
    $pw = isset($_POST['password']) ? $_POST['password'] : '';

    $stmt = $conn->prepare("SELECT password FROM qna WHERE no = ?");
    $stmt->bind_param("i", $no);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if ($row && password_verify($pw, $row['password'])) {
        $_SESSION['qna_auth_' . $no] = true;
        echo json_encode(['ok' => true]);
    } else {
        echo json_encode(['error' => 'wrong password']);
    }
    $conn->close();
    exit;
}

// 글 작성
if ($action === 'write') {
    $id = isset($_POST['id']) ? trim($_POST['id']) : '';
    $pw = isset($_POST['password']) ? $_POST['password'] : '';
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $content = isset($_POST['content']) ? trim($_POST['content']) : '';
    $is_secret = isset($_POST['is_secret']) ? intval($_POST['is_secret']) : 0;
    $parent_no = isset($_POST['parent_no']) ? intval($_POST['parent_no']) : 0;
    $depth = 0;

    if ($id === '' || $pw === '' || $title === '') {
        echo json_encode(['error' => 'required fields missing']);
        $conn->close();
        exit;
    }

    if ($parent_no > 0) {
        $pStmt = $conn->prepare("SELECT depth FROM qna WHERE no = ?");
        $pStmt->bind_param("i", $parent_no);
        $pStmt->execute();
        $pRow = $pStmt->get_result()->fetch_assoc();
        if ($pRow) $depth = $pRow['depth'] + 1;
    }

    $hashedPw = password_hash($pw, PASSWORD_DEFAULT);

    // 이미지 처리
    $imagePath = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $maxSize = 2 * 1024 * 1024; // 2MB
        if ($_FILES['image']['size'] > $maxSize) {
            echo json_encode(['error' => 'image too large (max 2MB)']);
            $conn->close();
            exit;
        }
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($_FILES['image']['type'], $allowed)) {
            echo json_encode(['error' => 'invalid image type']);
            $conn->close();
            exit;
        }
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'qna_' . time() . '_' . mt_rand(1000,9999) . '.' . $ext;
        $uploadDir = __DIR__ . '/qna_upload/';
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
            $imagePath = 'qna_upload/' . $filename;
        }
    }

    $stmt = $conn->prepare("INSERT INTO qna (parent_no, depth, id, password, title, content, is_secret, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iisssis", $parent_no, $depth, $id, $hashedPw, $title, $content, $is_secret, $imagePath);
    $stmt->execute();

    echo json_encode(['ok' => true, 'no' => $conn->insert_id]);
    $conn->close();
    exit;
}

// 답변완료 토글
if ($action === 'toggle_answered') {
    $no = isset($_POST['no']) ? intval($_POST['no']) : 0;
    $pw = isset($_POST['password']) ? $_POST['password'] : '';

    $stmt = $conn->prepare("SELECT password, is_answered FROM qna WHERE no = ?");
    $stmt->bind_param("i", $no);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($pw, $row['password'])) {
        echo json_encode(['error' => 'wrong password']);
        $conn->close();
        exit;
    }

    $newVal = $row['is_answered'] ? 0 : 1;
    $upStmt = $conn->prepare("UPDATE qna SET is_answered = ? WHERE no = ?");
    $upStmt->bind_param("ii", $newVal, $no);
    $upStmt->execute();

    echo json_encode(['ok' => true, 'is_answered' => $newVal]);
    $conn->close();
    exit;
}

// 글 삭제
if ($action === 'delete') {
    $no = isset($_POST['no']) ? intval($_POST['no']) : 0;
    $pw = isset($_POST['password']) ? $_POST['password'] : '';

    $stmt = $conn->prepare("SELECT password, image_path FROM qna WHERE no = ?");
    $stmt->bind_param("i", $no);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($pw, $row['password'])) {
        echo json_encode(['error' => 'wrong password']);
        $conn->close();
        exit;
    }

    // 이미지 파일 삭제
    if ($row['image_path'] && file_exists(__DIR__ . '/' . $row['image_path'])) {
        @unlink(__DIR__ . '/' . $row['image_path']);
    }

    // 답글도 삭제
    $delReply = $conn->prepare("DELETE FROM qna WHERE parent_no = ?");
    $delReply->bind_param("i", $no);
    $delReply->execute();

    $del = $conn->prepare("DELETE FROM qna WHERE no = ?");
    $del->bind_param("i", $no);
    $del->execute();

    echo json_encode(['ok' => true]);
    $conn->close();
    exit;
}

echo json_encode(['error' => 'unknown action']);
$conn->close();
?>
