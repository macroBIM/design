<?php
session_start();

/*
	우비에서 디폴트로 dbname은 주소명과 동일하게 제공한다
	주어진 db에 들어가서 counter라는 테이블을 생성하고
	아래와 같이 field를 생성한다

		no		(int) primary key : autoincrement 됨..
		year 	(int)
		month 	(int)
		day		(int)
		visit	(bigint)
		total_visits	(bigint)

*/

	// 데이터베이스 연결 설정
	$servername = "localhost";
	$username = "macrobim";
	$password = "yjp@072072";
	$dbname = "macrobim";

	// MySQL 연결
	$conn = new mysqli($servername, $username, $password, $dbname);

	// 현재 연도와 월 가져오기
	$currentYear = date("Y");
	$currentMonth = date("n");
	$currentDay = date("d");

	//echo "<script>alert( ' $currentMonth ' );</script>";

	// 방문 기록 가져오기
	$sql = "SELECT * FROM counter WHERE year = ? AND month = ? AND day = ?";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param("iii", $currentYear, $currentMonth, $currentDay);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {

		if ( isset( $_SESSION['mecad'] ) ){

			// f5 면, 카운트 증가하지 않음
			$row = $result->fetch_assoc();
			$visits = $row['visit'];

		} else {
			// ctrl + f5일때만..
			// 현재 달의 기록이 있으면 방문 횟수 증가
			$row = $result->fetch_assoc();
			$visits = $row['visit'] + 1;

			$_SESSION['mecad'] = 'warluck';

		}

		$updateSql = "UPDATE counter SET visit = ? WHERE no = ? ";
		$updateStmt = $conn->prepare($updateSql);
		$updateStmt->bind_param("ii", $visits, $row['no']);
		$updateStmt->execute();

	} else {
		// 현재 달의 기록이 없으면 새 레코드 생성
		$visits = 1;
		$insertSql = "INSERT INTO counter (year, month, day, visit) VALUES (?, ?, ?, ?)";
		$insertStmt = $conn->prepare($insertSql);
		$insertStmt->bind_param("iiii", $currentYear, $currentMonth, $currentDay, $visits);
		$insertStmt->execute();
	}

	// 총 방문 횟수 가져오기
	$totalVisitsSql = "SELECT SUM(visit) AS total_visits FROM counter";
	$totalResult = $conn->query($totalVisitsSql);
	$totalRow = $totalResult->fetch_assoc();
	$totalVisits = $totalRow['total_visits'];

	// DB 연결 종료
	$conn->close();

	// 캐시 무효화용 버전 (macroBIM JS ?v= 뒤에 붙음)
	$_BIM_V = time();

?>

<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>macroBIM</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css">
<link rel="stylesheet" href="style.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#444;display:flex;height:100vh;overflow:hidden;font-size:14px;padding:16px;gap:16px;}

  /* ── SIDEBAR ── */
  #sidebar{width:270px;min-width:270px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;}
  #sidebar::-webkit-scrollbar{width:4px;}
  #sidebar::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}
  .sidebar-header{display:flex;align-items:center;gap:12px;padding:20px 20px 16px;}
  .logo-info .name{font-size:15px;font-weight:700;color:#0f172a;}
  .nav-menu{padding:4px 12px;flex:1;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;border-radius:6px;margin-bottom:1px;text-decoration:none;transition:all .15s;}
  .nav-item:hover{background:#f1f5f9;color:#334155;}
  .nav-item.active{background:#eff6ff;color:#2563eb;}
  .nav-item i{font-size:17px;width:22px;text-align:center;flex-shrink:0;}
  .nav-item .arrow{margin-left:auto;font-size:11px;color:#94a3b8;transition:transform .2s;}
  .nav-item.open .arrow{transform:rotate(90deg);}
  .nav-section{font-size:10px;font-weight:600;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;padding:18px 12px 8px;}
  .nav-sub{display:none;padding-left:22px;}
  .nav-sub.show{display:block;}
  .nav-sub a{display:flex;align-items:center;gap:8px;padding:7px 12px;font-size:13px;font-weight:400;color:#94a3b8;text-decoration:none;border-radius:6px;transition:all .15s;position:relative;}
  .nav-sub a::before{content:'';width:5px;height:5px;border-radius:50%;background:#cbd5e1;flex-shrink:0;transition:background .15s;}
  .nav-sub a:hover{color:#334155;}
  .nav-sub a:hover::before{background:#64748b;}
  .nav-sub a.active{color:#2563eb;font-weight:500;}
  .nav-sub a.active::before{background:#2563eb;}

  /* ── MAIN ── */
  #main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .content-wrap{flex:1;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06);padding:24px;}
  .content-wrap::-webkit-scrollbar{width:6px;}
  .content-wrap::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}

  .page-view{display:none;}
  .page-view.active{display:block;}

  /* ── COMMON ── */
  .page-heading{font-size:22px;font-weight:700;color:#0f172a;margin-bottom:4px;}
  .breadcrumb{font-size:13px;color:#94a3b8;margin-bottom:24px;}
  .breadcrumb a{color:#94a3b8;text-decoration:none;}
  .breadcrumb a:hover{color:#2563eb;}
  .breadcrumb span{color:#64748b;}
  .table-card{background:#fff;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:20px;overflow:hidden;}
  .table-card-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #e2e8f0;}
  .table-card-title{font-size:15px;font-weight:600;color:#0f172a;}
  .table-card-desc{font-size:12.5px;color:#94a3b8;}

  /* ── REBAR TABLE ── */
  .ea-table{width:100%;border-collapse:collapse;font-size:13.5px;}
  .ea-table.striped tbody tr:nth-child(even){background:#fafbfc;}
  .ea-table.striped tbody tr:hover{background:#f1f5f9;}
  .ea-table.rebar thead th{background:#1e293b;color:#fff;font-size:12px;font-weight:600;text-transform:none;letter-spacing:0;border-bottom:1px solid #334155;padding:12px 16px;text-align:center;}
  .ea-table.rebar tbody td{text-align:center;padding:12px 16px;font-size:13px;border-bottom:1px solid #f1f5f9;color:#475569;}
  .ea-table.rebar tbody td:nth-child(1){font-weight:700;color:#0f172a;background:#f8fafc;}
  .ea-table.rebar tbody tr:last-child td{border-bottom:none;}

  /* ── STEEL SECTION ── */
  .section-selector-row{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px;}
  .section-card{border:2px solid #e2e8f0;border-radius:12px;padding:16px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:10px;background:#fff;position:relative;overflow:hidden;}
  .section-card:hover{border-color:#94a3b8;box-shadow:0 4px 12px rgba(0,0,0,.08);}
  .section-card.selected{border-color:#2563eb;background:#eff6ff;box-shadow:0 4px 16px rgba(37,99,235,.15);}
  .section-card.selected::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:#2563eb;border-radius:12px 12px 0 0;}
  .section-card-img{width:100%;height:100px;display:flex;align-items:center;justify-content:center;background:#f8fafc;border-radius:8px;overflow:hidden;}
  .section-card-img img{max-width:90%;max-height:90%;object-fit:contain;}
  .section-card-name{font-size:13px;font-weight:600;color:#0f172a;text-align:center;}

  .steel-table-wrap{overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0;}
  .steel-table-wrap::-webkit-scrollbar{height:6px;}
  .steel-table-wrap::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px;}
  .steel-table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:900px;}
  .steel-table thead th{background:#1e293b;color:#fff;font-size:11px;font-weight:600;padding:10px 12px;text-align:center;border-right:1px solid #334155;border-bottom:1px solid #334155;white-space:nowrap;position:sticky;top:0;z-index:10;}
  .steel-table thead th:last-child{border-right:none;}
  .steel-table tbody td{padding:10px 12px;text-align:center;color:#475569;font-size:12px;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;white-space:nowrap;}
  .steel-table tbody td:last-child{border-right:none;}
  .steel-table tbody td:first-child{font-weight:700;color:#0f172a;background:#f8fafc;position:sticky;left:0;z-index:5;}
  .steel-table tbody tr:nth-child(even){background:#fafbfc;}
  .steel-table tbody tr:nth-child(even) td:first-child{background:#f1f5f9;}
  .steel-table tbody tr{transition:background .12s;}
  .steel-table tbody tr:hover{background:#eef2ff !important;}
  .steel-table tbody tr:hover td:first-child{background:#e0e7ff !important;}
  .steel-table tbody tr:last-child td{border-bottom:none;}

  /* ── DRAWING PAGE ── */
  .draw-card{background:#fff;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:20px;overflow:hidden;}
  .draw-card-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #e2e8f0;}
  .draw-card-title{font-size:15px;font-weight:600;color:#0f172a;}
  .draw-card-desc{font-size:12.5px;color:#94a3b8;}
  .draw-card-body{padding:20px;}

  .form-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px 24px;}
  .form-group{display:flex;flex-direction:column;gap:5px;}
  .form-group.full{grid-column:1/-1;}
  .form-label{font-size:13px;font-weight:600;color:#0f172a;}
  .form-label span{font-weight:400;color:#94a3b8;}
  .form-input{
    padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;
    font-size:13.5px;font-family:inherit;color:#334155;
    transition:border-color .15s,box-shadow .15s;outline:none;
    background:#fff;
  }
  .form-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
  .form-input::placeholder{color:#cbd5e1;}
  .btn-generate{
    display:inline-flex;align-items:center;gap:8px;
    padding:10px 24px;border:none;border-radius:8px;cursor:pointer;
    font-size:13.5px;font-weight:600;font-family:inherit;
    background:#1e293b;color:#fff;transition:background .15s;
    margin-top:8px;
  }
  .btn-generate:hover{background:#334155;}

  /* ── DRAWING VIEWPORT (KonvaViewer 컨테이너) ── */
  .drawing-viewport{
    background:#1e293b;border-radius:10px;overflow:hidden;
    min-height:560px;
  }
  #spliceplot{
    width:100%;height:560px;background:#000;border-radius:10px;
    cursor:grab;
  }
  #hsecplot,#channelplot,#ibeamplot,#box1cellplot,#liftinglugplot,#rectplot{
    width:100%;background:#000;border-radius:10px;
    cursor:grab;
  }

  /* ── DASHBOARD STAT CARDS ── */
  .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:24px;}
  .stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .stat-card .stat-value{font-size:30px;font-weight:700;color:#0f172a;line-height:1.1;}
  .stat-card .stat-label{font-size:13.5px;color:#64748b;margin-top:8px;}
  .stat-card .stat-icon{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;}
  .stat-icon.blue{background:#eff6ff;color:#2563eb;}
  .stat-icon.green{background:#ecfdf5;color:#10b981;}
  @media(max-width:720px){.stat-grid{grid-template-columns:1fr;}}

  /* ── BOX1CELL 9-COLUMN GRID (3 pairs of Variable/Begin/End per row) ── */
  .form-grid-9col{display:grid;grid-template-columns:80px 1fr 1fr 80px 1fr 1fr 80px 1fr 1fr;gap:8px 10px;align-items:center;}
  .form-grid-9col .col-label{font-size:12px;font-weight:600;color:#0f172a;}
  .form-grid-9col .col-header{font-size:11px;font-weight:700;color:#2563eb;text-align:center;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
  .form-grid-9col .col-header.var-header{text-align:left;}
  .form-grid-9col .form-input{padding:8px 8px;font-size:12.5px;}

  /* ── HSEC / CHANNEL / LIFTINGLUG 6-COLUMN GRID (3 pairs of Variable/Value per row) ── */
  .form-grid-6col{display:grid;grid-template-columns:130px 1fr 130px 1fr 130px 1fr;gap:8px 12px;align-items:center;}
  .form-grid-6col .col-label{font-size:12px;font-weight:600;color:#0f172a;}
  .form-grid-6col .col-header{font-size:11px;font-weight:700;color:#2563eb;text-align:center;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
  .form-grid-6col .col-header.var-header{text-align:left;}
  .form-grid-6col .form-input{padding:8px 10px;font-size:12.5px;}

  /* ── LOADING / ERROR ── */
  .loading-row{text-align:center;padding:40px 20px !important;color:#94a3b8;}
  .spinner{display:inline-block;width:18px;height:18px;border:2px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .error-msg{text-align:center;padding:30px 20px;color:#dc2626;font-size:13px;}
</style>

<!-- ═══════ DRAWING ENGINE (macroBIM, GitHub Pages) ═══════ -->
<script src="https://unpkg.com/konva@9/konva.min.js"></script>
<script src="https://macrobim.github.io/macroBIM/konvaviewer.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_plotly_geo.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_dxf.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/geomath.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_hsection.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_channel.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_ibeam.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_boltsplice.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_liftinglug.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_box1cell.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_rect.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_gravitywall.js?v=<?php echo $_BIM_V; ?>"></script>

<!-- ═══════ THREE.js for 3D Box Girder & I-Beam ═══════ -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://macrobim.github.io/macroBIM/bim_box1cell_3d.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_ibeam_3d.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_hsection_3d.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_channel_3d.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_liftinglug_3d.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/macroBIM/bim_rect_3d.js?v=<?php echo $_BIM_V; ?>"></script>

<!-- ═══════ EXTERNAL PAGE SCRIPTS (GitHub) ═══════ -->
<script src="https://macrobim.github.io/design/rebartable_claude.js?v=<?php echo $_BIM_V; ?>"></script>
<script src="https://macrobim.github.io/design/steelsection_claude.js?v=<?php echo $_BIM_V; ?>"></script>

</head>
<body>

<!-- ══ SIDEBAR ══ -->
<nav id="sidebar">
  <div class="sidebar-header"><div class="logo-info"><div class="name">macroBIM</div></div></div>
  <div class="nav-menu">
    <a class="nav-item active" href="#" id="dashboardMenu" data-page="dashboard"><i class="bi bi-grid-fill"></i> Dashboard</a>
    <div class="nav-section">UI Elements</div>
    <!-- Tables -->
    <a class="nav-item" href="#" id="tablesToggle"><i class="bi bi-table"></i> Tables <span class="arrow">&#8250;</span></a>
    <div class="nav-sub" id="tables-sub">
      <a href="#" data-page="rebar">Rebar Tables</a>
      <a href="#" data-page="steel">Steel Section Tables</a>
    </div>
    <!-- Drawings -->
    <a class="nav-item" href="#" id="drawingsToggle"><i class="bi bi-card-image"></i> Drawings <span class="arrow">&#8250;</span></a>
    <div class="nav-sub" id="drawings-sub">
      <a href="#" data-page="draw-hsection">H Section</a>
      <a href="#" data-page="draw-channel">Channel</a>
      <a href="#" data-page="draw-ibeam">I Beam</a>
      <a href="#" data-page="draw-splice">Splice</a>
      <a href="#" data-page="draw-liftinglug">Lifting Lug</a>
      <a href="#" data-page="draw-box1cell">BOX1CELL</a>
      <a href="#" data-page="draw-rect">Rect</a>
    </div>
  </div>
</nav>

<!-- ══ MAIN ══ -->
<div id="main">
  <div class="content-wrap">

    <!-- ── DASHBOARD ── -->
    <div class="page-view active" id="page-dashboard">
      <h1 class="page-heading">Dashboard</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <span>Dashboard</span></div>
      <div class="stat-grid">
        <div class="stat-card">
          <div>
            <div class="stat-value"><?php echo number_format($visits); ?></div>
            <div class="stat-label">Today Visits</div>
          </div>
          <div class="stat-icon blue"><i class="bi bi-person-check"></i></div>
        </div>
        <div class="stat-card">
          <div>
            <div class="stat-value"><?php echo number_format($totalVisits); ?></div>
            <div class="stat-label">Total Visits</div>
          </div>
          <div class="stat-icon green"><i class="bi bi-people"></i></div>
        </div>
      </div>
    </div>

    <!-- ── REBAR TABLES ── -->
    <div class="page-view" id="page-rebar">
      <h1 class="page-heading">Rebar Specification Tables</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Rebar Tables</span></div>
      <div class="table-card"><div class="table-card-header"><div class="table-card-title">1. KS D 3504 (Korean Standard)</div><div class="table-card-desc">Deformed bars for concrete reinforcement</div></div><table class="ea-table striped rebar"><thead id="rebar-ks-head"></thead><tbody id="rebar-ks-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>
      <div class="table-card"><div class="table-card-header"><div class="table-card-title">2. ASTM A615M (US Standard)</div><div class="table-card-desc">Standard specification for deformed bars</div></div><table class="ea-table striped rebar"><thead id="rebar-astm-head"></thead><tbody id="rebar-astm-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>
      <div class="table-card"><div class="table-card-header"><div class="table-card-title">3. BS 4449 (British Standard)</div><div class="table-card-desc">Steel for the reinforcement of concrete</div></div><table class="ea-table striped rebar"><thead id="rebar-bs-head"></thead><tbody id="rebar-bs-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>
    </div>

    <!-- ── STEEL SECTION TABLES ── -->
    <div class="page-view" id="page-steel">
      <h1 class="page-heading">Section Properties</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Steel Section</span></div>
      <div class="section-selector-row">
        <div class="section-card selected" data-section="hsection" onclick="selectSection('hsection')">
          <div class="section-card-img"><img src="https://macrobim.github.io/design/Hsection.jpg" alt="H-Section"></div>
          <div class="section-card-name">H-Section</div>
        </div>
        <div class="section-card" data-section="channel" onclick="selectSection('channel')">
          <div class="section-card-img"><img src="https://macrobim.github.io/design/channel.png" alt="Channel"></div>
          <div class="section-card-name">Channel</div>
        </div>
        <div class="section-card" data-section="equalangle" onclick="selectSection('equalangle')">
          <div class="section-card-img"><img src="https://macrobim.github.io/design/angle.png" alt="Equal Angle"></div>
          <div class="section-card-name">Equal Angle</div>
        </div>
        <div class="section-card" data-section="unequalangle" onclick="selectSection('unequalangle')">
          <div class="section-card-img"><img src="https://macrobim.github.io/design/angle.png" alt="Unequal Angle"></div>
          <div class="section-card-name">Unequal Angle</div>
        </div>
        <div class="section-card" data-section="invertedangle" onclick="selectSection('invertedangle')">
          <div class="section-card-img"><img src="https://macrobim.github.io/design/invertedangle.png" alt="Inverted Angle"></div>
          <div class="section-card-name">Inverted Angle</div>
        </div>
      </div>
      <div class="steel-table-wrap">
        <table class="steel-table">
          <thead id="steel-thead"></thead>
          <tbody id="steel-tbody"><tr><td colspan="20" class="loading-row"><span class="spinner"></span> Loading section data...</td></tr></tbody>
        </table>
      </div>
    </div>

    <!-- ── DRAWINGS ── -->
    <div class="page-view" id="page-draw-hsection">
      <h1 class="page-heading">H Section Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>H Section</span></div>
      <div id="mount-draw-hsection"></div>
    </div>
    <div class="page-view" id="page-draw-channel">
      <h1 class="page-heading">Channel Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Channel</span></div>
      <div id="mount-draw-channel"></div>
    </div>

    <!--
      작도 폼 템플릿.
      bim_hsection.js / bim_channel.js 가 동일한 ID(sUserText, dsech, dtw, dseg_leng)를
      하드코딩으로 쓰므로, 두 폼을 동시에 DOM에 두면 getElementById 가 충돌한다.
      따라서 <template> 안에 보관하고(템플릿 내부는 getElementById 에 잡히지 않음)
      메뉴 클릭 시 해당 폼 하나만 마운트한다.
    -->
    <!-- ── HSECTION TEMPLATE (box1cell 패턴: 6-col Variable/Value + 3D/2D Viewport) ── -->
    <template id="tpl-draw-hsection">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input H-beam cross-section parameters</div>
          </div>
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: H,Bt,Bb,tw,tft,tfb,R / 2줄: L</span></div>
            <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_hsection('sUserText'); fdraw_hsection();">300,300,300,10,15,15,19
500</textarea>
          </div>

          <div class="form-grid-6col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
          </div>
          <div class="form-grid-6col">
            <div class="col-label">H (height)</div>
            <input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_hsection()">
            <div class="col-label">Bt (top flange)</div>
            <input class="form-input" type="number" id="dbt" value="300" onchange="fdraw_hsection()">
            <div class="col-label">Bb (bot flange)</div>
            <input class="form-input" type="number" id="dbb" value="300" onchange="fdraw_hsection()">

            <div class="col-label">tw (web)</div>
            <input class="form-input" type="number" id="dtw" value="10" onchange="fdraw_hsection()">
            <div class="col-label">tft (top flange t)</div>
            <input class="form-input" type="number" id="dttf" value="15" onchange="fdraw_hsection()">
            <div class="col-label">tbf (bot flange t)</div>
            <input class="form-input" type="number" id="dtbf" value="15" onchange="fdraw_hsection()">

            <div class="col-label">R <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="dradius" value="19" onchange="fdraw_hsection()">
            <div class="col-label">Beam Length</div>
            <input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_hsection()">

            <button class="btn-generate" onclick="odxf_hsec.download('Hsection.dxf')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_hsection()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="hsecplot"></div>
        </div>
      </div>
    </template>

    <!-- ── CHANNEL TEMPLATE (box1cell 패턴: 6-col Variable/Value + 3D/2D Viewport) ── -->
    <template id="tpl-draw-channel">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input channel cross-section parameters</div>
          </div>
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: H,B,tw,tf,Rw,Rf / 2줄: L</span></div>
            <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_channel('sUserText'); fdraw_channel();">300,90,12,16,19,9.5
500</textarea>
          </div>

          <div class="form-grid-6col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
          </div>
          <div class="form-grid-6col">
            <div class="col-label">H (height)</div>
            <input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_channel()">
            <div class="col-label">B (width)</div>
            <input class="form-input" type="number" id="db" value="90" onchange="fdraw_channel()">
            <div class="col-label">tw (web)</div>
            <input class="form-input" type="number" id="dtw" value="12" onchange="fdraw_channel()">

            <div class="col-label">tf (flange)</div>
            <input class="form-input" type="number" id="dtf" value="16" onchange="fdraw_channel()">
            <div class="col-label">Rw <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drw" value="19" onchange="fdraw_channel()">
            <div class="col-label">Rf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drf" value="9.5" onchange="fdraw_channel()">

            <div class="col-label">Channel Length</div>
            <input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_channel()">
            <div></div><div></div>
            <button class="btn-generate" onclick="odxf_channel.download('Channel.dxf')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_channel()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="channelplot"></div>
        </div>
      </div>
    </template>
    <div class="page-view" id="page-draw-ibeam">
      <h1 class="page-heading">I Beam Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>I Beam</span></div>
      <div id="mount-draw-ibeam"></div>
    </div>

    <!-- ── IBEAM TEMPLATE (box1cell 패턴: 9-col Begin/End + 3D/2D Viewport) ── -->
    <template id="tpl-draw-ibeam">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input I-beam (plate girder) cross-section parameters (Begin / End)</div>
          </div>
          <button class="btn-generate" onclick="document.getElementById('ibeam_guide_img').style.display=document.getElementById('ibeam_guide_img').style.display==='none'?'block':'none'" style="margin:0;font-size:12px;padding:6px 14px;"><i class="bi bi-image"></i> VIEW GUIDE</button>
        </div>
        <div id="ibeam_guide_img" style="display:none;padding:10px;background:#f8f9fa;border-bottom:1px solid #e2e8f0;text-align:center;">
          <img src="https://macrobim.github.io/macroBIM/ibeam_vars.png" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:4px;">
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: Begin / 2줄: End / 3줄: Beam Length</span></div>
            <textarea class="form-input" id="sUserText" rows="4" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_ibeam('sUserText'); fdraw_ibeam();">1500,1235,985,85,45,135,140,160,50,200,100,50,20
1500,1235,985,85,45,135,140,160,50,200,100,50,20
500</textarea>
          </div>

          <div class="form-grid-9col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
          </div>
          <div class="form-grid-9col">
            <div class="col-label">h</div>
            <input class="form-input" type="number" id="dh_s" value="1500" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dh_e" value="1500" onchange="fdraw_ibeam()">
            <div class="col-label">bt</div>
            <input class="form-input" type="number" id="dbt_s" value="1235" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dbt_e" value="1235" onchange="fdraw_ibeam()">
            <div class="col-label">bb</div>
            <input class="form-input" type="number" id="dbb_s" value="985" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dbb_e" value="985" onchange="fdraw_ibeam()">

            <div class="col-label">ttf</div>
            <input class="form-input" type="number" id="dttf_s" value="85" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dttf_e" value="85" onchange="fdraw_ibeam()">
            <div class="col-label">ttf1</div>
            <input class="form-input" type="number" id="dttf1_s" value="45" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dttf1_e" value="45" onchange="fdraw_ibeam()">
            <div class="col-label">tbf</div>
            <input class="form-input" type="number" id="dtbf_s" value="135" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dtbf_e" value="135" onchange="fdraw_ibeam()">

            <div class="col-label">tbf1</div>
            <input class="form-input" type="number" id="dtbf1_s" value="140" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dtbf1_e" value="140" onchange="fdraw_ibeam()">
            <div class="col-label">tw</div>
            <input class="form-input" type="number" id="dtw_s" value="160" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dtw_e" value="160" onchange="fdraw_ibeam()">
            <div class="col-label">rtf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drtf_s" value="50" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="drtf_e" value="50" onchange="fdraw_ibeam()">

            <div class="col-label">rwt <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drwt_s" value="200" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="drwt_e" value="200" onchange="fdraw_ibeam()">
            <div class="col-label">rwb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drwb_s" value="100" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="drwb_e" value="100" onchange="fdraw_ibeam()">
            <div class="col-label">rbf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drbf_s" value="50" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="drbf_e" value="50" onchange="fdraw_ibeam()">

            <div class="col-label">chb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="dchb_s" value="20" onchange="fdraw_ibeam()">
            <input class="form-input" type="number" id="dchb_e" value="20" onchange="fdraw_ibeam()">
            <div class="col-label">Beam Length</div>
            <input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_ibeam()" style="grid-column:span 5;">

            <button class="btn-generate" onclick="odxf_ibeam.download('IBeam.dxf')" style="grid-column:7 / 10;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_ibeam()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="ibeamplot"></div>
        </div>
      </div>
    </template>

    <div class="page-view" id="page-draw-splice">
      <h1 class="page-heading">Bolt Splice Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Splice</span></div>
      <div id="mount-draw-splice"></div>
    </div>
    <div class="page-view" id="page-draw-liftinglug">
      <h1 class="page-heading">Lifting Lug Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Lifting Lug</span></div>
      <div id="mount-draw-liftinglug"></div>
    </div>

    <!-- ── RECT ── -->
    <div class="page-view" id="page-draw-rect">
      <h1 class="page-heading">Rect Section Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Rect</span></div>
      <div id="mount-draw-rect"></div>
    </div>

    <!-- ── BOX1CELL ── -->
    <div class="page-view" id="page-draw-box1cell">
      <h1 class="page-heading">BOX 1-Cell Drawing</h1>
      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>BOX1CELL</span></div>
      <div id="mount-draw-box1cell"></div>
    </div>

    <!-- ── SPLICE TEMPLATE (compact 6-col: 3 pairs of Label/Value per row) ── -->
    <template id="tpl-draw-splice">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">H-beam, splice plates &amp; bolt layout</div>
          </div>
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:16px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: H형강 / 2줄: 플레이트 / 3줄: 볼트</span></div>
            <textarea class="form-input" id="sUserText" rows="3" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_boltsplice('sUserText'); fdraw_boltsplice();">300,300,300,10,15,15,18
280,300,10,110,300,5,220,280,10,110,300,5,280,300,10
5,12,8,30,10,80,10,5,12,10,60,10,0,10,5,12,8,30,10,80,10</textarea>
          </div>

          <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">1) H Beam</div>
          <div class="form-grid-6col" style="margin-bottom:14px;">
            <div class="col-label">Height</div>
            <input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_boltsplice()">
            <div class="col-label">Top Flange W</div>
            <input class="form-input" type="number" id="dbt" value="300" onchange="fdraw_boltsplice()">
            <div class="col-label">Bot Flange W</div>
            <input class="form-input" type="number" id="dbb" value="300" onchange="fdraw_boltsplice()">

            <div class="col-label">Web Thick</div>
            <input class="form-input" type="number" id="dtw" value="10" onchange="fdraw_boltsplice()">
            <div class="col-label">Top Flange t</div>
            <input class="form-input" type="number" id="dttf" value="15" onchange="fdraw_boltsplice()">
            <div class="col-label">Bot Flange t</div>
            <input class="form-input" type="number" id="dtbf" value="15" onchange="fdraw_boltsplice()">

            <div class="col-label">Fillet R <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="dradius" value="18" onchange="fdraw_boltsplice()">
          </div>

          <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">2) Splice Plate <span style="font-weight:400;color:#94a3b8;">(Width, Length, Thick)</span></div>
          <div class="form-grid-6col" style="margin-bottom:14px;">
            <div class="col-label">Top Plate</div>
            <input class="form-input" type="text" id="splt" value="280,300,10" onchange="fdraw_boltsplice()">
            <div class="col-label">Top Inner</div>
            <input class="form-input" type="text" id="splti" value="110,300,5" onchange="fdraw_boltsplice()">
            <div class="col-label">Web Plate</div>
            <input class="form-input" type="text" id="splw" value="220,280,10" onchange="fdraw_boltsplice()">

            <div class="col-label">Bot Inner</div>
            <input class="form-input" type="text" id="splbi" value="110,300,5" onchange="fdraw_boltsplice()">
            <div class="col-label">Bot Plate</div>
            <input class="form-input" type="text" id="splb" value="280,300,10" onchange="fdraw_boltsplice()">
          </div>

          <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">3) Bolt Layout <span style="font-weight:400;color:#94a3b8;">(Dia, Long N, Trans N / Space: In, Out, In, Out)</span></div>
          <div class="form-grid-6col">
            <div class="col-label">Top Bolt</div>
            <input class="form-input" type="text" id="slayt" value="5,12,8" onchange="fdraw_boltsplice()">
            <div class="col-label">Top Space</div>
            <input class="form-input" type="text" id="slaytsp" value="30,10,80,10" onchange="fdraw_boltsplice()">
            <div class="col-label">Web Bolt</div>
            <input class="form-input" type="text" id="slayw" value="5,12,10" onchange="fdraw_boltsplice()">

            <div class="col-label">Web Space <span style="color:#94a3b8;font-size:10px;">(I,O,0,O)</span></div>
            <input class="form-input" type="text" id="slaywsp" value="60,10,0,10" onchange="fdraw_boltsplice()">
            <div class="col-label">Bot Bolt</div>
            <input class="form-input" type="text" id="slayb" value="5,12,8" onchange="fdraw_boltsplice()">
            <div class="col-label">Bot Space</div>
            <input class="form-input" type="text" id="slaybsp" value="30,10,80,10" onchange="fdraw_boltsplice()">

            <button class="btn-generate" onclick="odxf_boltsplice.download('BoltSplice.dxf')" style="grid-column:5 / 7;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <!-- DRAWING CARD -->
      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_boltsplice()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="spliceplot"></div>
        </div>
      </div>
    </template>

    <!-- ── LIFTING LUG TEMPLATE (box1cell 패턴: 6-col + 3D/2D Viewport) ── -->
    <template id="tpl-draw-liftinglug">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input lifting lug parameters</div>
          </div>
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— lugW,lugH,baseH,outerR,innerR,padeyeR,lugT,padeyeT</span></div>
            <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_liftinglug('sUserText'); fdraw_liftinglug();">120,120,30,40,10,30,20,30</textarea>
          </div>

          <div class="form-grid-6col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
          </div>
          <div class="form-grid-6col">
            <div class="col-label">lugW (width)</div>
            <input class="form-input" type="number" id="lugW" value="120" onchange="fdraw_liftinglug()">
            <div class="col-label">lugH (height)</div>
            <input class="form-input" type="number" id="lugH" value="120" onchange="fdraw_liftinglug()">
            <div class="col-label">baseH</div>
            <input class="form-input" type="number" id="baseH" value="30" onchange="fdraw_liftinglug()">

            <div class="col-label">outerR</div>
            <input class="form-input" type="number" id="outerR" value="40" onchange="fdraw_liftinglug()">
            <div class="col-label">innerR (hole)</div>
            <input class="form-input" type="number" id="innerR" value="10" onchange="fdraw_liftinglug()">
            <div class="col-label">padeyeR</div>
            <input class="form-input" type="number" id="padeyeR" value="30" onchange="fdraw_liftinglug()">

            <div class="col-label">lugT (thick)</div>
            <input class="form-input" type="number" id="lugT" value="20" onchange="fdraw_liftinglug()">
            <div class="col-label">padeyeT (thick)</div>
            <input class="form-input" type="number" id="padeyeT" value="30" onchange="fdraw_liftinglug()">

            <button class="btn-generate" onclick="odxf_lug.download('LiftingLug.dxf')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_liftinglug()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="liftinglugplot"></div>
        </div>
      </div>
    </template>

    <!-- ── BOX1CELL TEMPLATE ── -->
    <template id="tpl-draw-box1cell">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input 1-Cell Box section parameters (Begin / End)</div>
          </div>
          <button class="btn-generate" onclick="document.getElementById('box1cell_guide_img').style.display=document.getElementById('box1cell_guide_img').style.display==='none'?'block':'none'" style="margin:0;font-size:12px;padding:6px 14px;"><i class="bi bi-image"></i> VIEW GUIDE</button>
        </div>
        <div id="box1cell_guide_img" style="display:none;padding:10px;background:#f8f9fa;border-bottom:1px solid #e2e8f0;text-align:center;">
          <img src="https://macrobim.github.io/macroBIM/box1cell_vars.png" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:4px;">
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: Begin / 2줄: End / 3줄: Seg Length</span></div>
            <textarea class="form-input" id="sUserText" rows="4" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_box1cell('sUserText'); fdraw_box1cell();">6600,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3
8000,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3
5000</textarea>
          </div>

          <div class="form-grid-9col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Begin</div>
            <div class="col-header">End</div>
          </div>
          <div class="form-grid-9col">
            <div class="col-label">h</div>
            <input class="form-input" type="number" id="dh_s" value="6600" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dh_e" value="8000" onchange="fdraw_box1cell()">
            <div class="col-label">bt</div>
            <input class="form-input" type="number" id="dbt_s" value="12000" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbt_e" value="12000" onchange="fdraw_box1cell()">
            <div class="col-label">bb</div>
            <input class="form-input" type="number" id="dbb_s" value="6000" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbb_e" value="6000" onchange="fdraw_box1cell()">

            <div class="col-label">btsh</div>
            <input class="form-input" type="number" id="dbth_s" value="1500" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbth_e" value="1500" onchange="fdraw_box1cell()">
            <div class="col-label">bcanh</div>
            <input class="form-input" type="number" id="dbch_s" value="1500" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbch_e" value="1500" onchange="fdraw_box1cell()">
            <div class="col-label">bcan</div>
            <input class="form-input" type="number" id="dbc_s" value="1500" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbc_e" value="1500" onchange="fdraw_box1cell()">

            <div class="col-label">t1</div>
            <input class="form-input" type="number" id="dt1_s" value="300" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt1_e" value="300" onchange="fdraw_box1cell()">
            <div class="col-label">t2</div>
            <input class="form-input" type="number" id="dt2_s" value="300" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt2_e" value="300" onchange="fdraw_box1cell()">
            <div class="col-label">t3</div>
            <input class="form-input" type="number" id="dt3_s" value="600" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt3_e" value="600" onchange="fdraw_box1cell()">

            <div class="col-label">t4</div>
            <input class="form-input" type="number" id="dt4_s" value="600" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt4_e" value="600" onchange="fdraw_box1cell()">
            <div class="col-label">t5</div>
            <input class="form-input" type="number" id="dt5_s" value="300" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt5_e" value="300" onchange="fdraw_box1cell()">
            <div class="col-label">t6</div>
            <input class="form-input" type="number" id="dt6_s" value="300" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dt6_e" value="300" onchange="fdraw_box1cell()">

            <div class="col-label">tb</div>
            <input class="form-input" type="number" id="dtb_s" value="840" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dtb_e" value="840" onchange="fdraw_box1cell()">
            <div class="col-label">tw</div>
            <input class="form-input" type="number" id="dtw_s" value="500" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dtw_e" value="500" onchange="fdraw_box1cell()">
            <div class="col-label">bh</div>
            <input class="form-input" type="number" id="dbbh_s" value="200" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbbh_e" value="200" onchange="fdraw_box1cell()">

            <div class="col-label">vh1</div>
            <input class="form-input" type="number" id="dbh1_s" value="200" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbh1_e" value="200" onchange="fdraw_box1cell()">
            <div class="col-label">vh2</div>
            <input class="form-input" type="number" id="dbh2_s" value="100" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dbh2_e" value="100" onchange="fdraw_box1cell()">
            <div class="col-label">rwt <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drwt_s" value="300" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="drwt_e" value="300" onchange="fdraw_box1cell()">

            <div class="col-label">rwtin <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drwtin_s" value="200" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="drwtin_e" value="200" onchange="fdraw_box1cell()">
            <div class="col-label">rb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div>
            <input class="form-input" type="number" id="drb_s" value="400" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="drb_e" value="400" onchange="fdraw_box1cell()">
            <div class="col-label">sl_tl (%)</div>
            <input class="form-input" type="number" id="dsltl_s" value="-2" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dsltl_e" value="-2" onchange="fdraw_box1cell()">

            <div class="col-label">sl_tr (%)</div>
            <input class="form-input" type="number" id="dsltr_s" value="5" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dsltr_e" value="5" onchange="fdraw_box1cell()">
            <div class="col-label">sl_b (%)</div>
            <input class="form-input" type="number" id="dslb_s" value="3" onchange="fdraw_box1cell()">
            <input class="form-input" type="number" id="dslb_e" value="3" onchange="fdraw_box1cell()">
            <div class="col-label">Seg Length</div>
            <input class="form-input" type="number" id="dseg_leng" value="5000" onchange="fdraw_box1cell()" style="grid-column:span 2;">

            <button class="btn-generate" onclick="odxf_box1cell.download('Box1Cell.dxf')" style="grid-column:7 / 10;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_box1cell()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="box1cellplot"></div>
        </div>
      </div>
    </template>

    <!-- ── RECT TEMPLATE (6-col + hollow/solid option + 3D/2D Viewport) ── -->
    <template id="tpl-draw-rect">
      <div class="draw-card">
        <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="draw-card-title">Dimension (mm)</div>
            <div class="draw-card-desc">Input rectangular cross-section parameters</div>
          </div>
        </div>
        <div class="draw-card-body">
          <div style="margin-bottom:20px;">
            <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">— 1줄: H,B,h,b,hollow(1/0) / 2줄: L</span></div>
            <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_rect('sUserText'); fdraw_rect();">400,300,300,200,1
1000</textarea>
          </div>

          <div class="form-grid-6col" style="margin-bottom:12px;">
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
            <div class="col-header var-header">Variable</div>
            <div class="col-header">Value</div>
          </div>
          <div class="form-grid-6col">
            <div class="col-label">H (outer height)</div>
            <input class="form-input" type="number" id="drect_H" value="400" onchange="fdraw_rect()">
            <div class="col-label">B (outer width)</div>
            <input class="form-input" type="number" id="drect_B" value="300" onchange="fdraw_rect()">
            <div class="col-label">h (inner height)</div>
            <input class="form-input" type="number" id="drect_h" value="300" onchange="fdraw_rect()">

            <div class="col-label">b (inner width)</div>
            <input class="form-input" type="number" id="drect_b" value="200" onchange="fdraw_rect()">
            <div class="col-label">Section Length</div>
            <input class="form-input" type="number" id="dseg_leng" value="1000" onchange="fdraw_rect()">
            <div class="col-label" style="display:flex;align-items:center;gap:8px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;">
                <input type="checkbox" id="drect_hollow" checked onchange="fdraw_rect()" style="width:16px;height:16px;accent-color:#2563eb;">
                Hollow (중공)
              </label>
            </div>
            <div></div>

            <div></div><div></div>
            <div></div><div></div>
            <button class="btn-generate" onclick="odxf_rect.download('Rect.dxf')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>
          </div>
        </div>
      </div>

      <div class="draw-card">
        <div class="draw-card-header">
          <div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>
          <button class="btn-generate" onclick="fdraw_rect()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button>
        </div>
        <div class="drawing-viewport">
          <div id="rectplot"></div>
        </div>
      </div>
    </template>

  </div>
</div>


<script>
/* ═══════ NAVIGATION ═══════ */
function showPage(pageId){
  document.querySelectorAll('.page-view').forEach(function(p){p.classList.remove('active');});
  var t=document.getElementById('page-'+pageId);
  if(t) t.classList.add('active');
  document.querySelectorAll('.nav-sub a').forEach(function(s){s.classList.remove('active');});
  var sb=document.querySelector('.nav-sub a[data-page="'+pageId+'"]');
  if(sb) sb.classList.add('active');
  document.querySelectorAll('.nav-item[data-page]').forEach(function(s){s.classList.remove('active');});
  var topItem=document.querySelector('.nav-item[data-page="'+pageId+'"]');
  if(topItem) topItem.classList.add('active');
  if(pageId==='rebar'&&!window._rebarLoaded){loadRebarTables();window._rebarLoaded=true;}
  if(pageId==='steel'&&!window._steelLoaded){selectSection('hsection');window._steelLoaded=true;}
  if(pageId==='draw-hsection'){mountDrawing('hsection'); if(typeof fdraw_hsection==='function') fdraw_hsection();}
  if(pageId==='draw-channel'){mountDrawing('channel'); if(typeof fdraw_channel==='function') fdraw_channel();}
  if(pageId==='draw-ibeam'){mountDrawing('ibeam'); if(typeof fdraw_ibeam==='function') fdraw_ibeam();}
  if(pageId==='draw-splice'){mountDrawing('splice'); if(typeof fdraw_boltsplice==='function') fdraw_boltsplice();}
  if(pageId==='draw-liftinglug'){mountDrawing('liftinglug'); if(typeof fdraw_liftinglug==='function') fdraw_liftinglug();}
  if(pageId==='draw-box1cell'){mountDrawing('box1cell'); if(typeof fdraw_box1cell==='function') fdraw_box1cell();}
  if(pageId==='draw-rect'){mountDrawing('rect'); if(typeof fdraw_rect==='function') fdraw_rect();}
}

/* ═══════ 작도 폼 마운트 (한 번에 하나만 DOM 에 존재 → ID 충돌 방지) ═══════ */
function mountDrawing(kind){
  ['hsection','channel','ibeam','splice','liftinglug','box1cell','rect'].forEach(function(k){
    if(k!==kind){
      var other=document.getElementById('mount-draw-'+k);
      if(other) other.innerHTML='';
    }
  });
  var mount=document.getElementById('mount-draw-'+kind);
  if(mount && !mount.firstElementChild){
    var tpl=document.getElementById('tpl-draw-'+kind);
    if(tpl) mount.appendChild(tpl.content.cloneNode(true));
  }
}

// Sub-menu toggles
document.getElementById('tablesToggle').addEventListener('click',function(e){e.preventDefault();this.classList.toggle('open');document.getElementById('tables-sub').classList.toggle('show');});
document.getElementById('drawingsToggle').addEventListener('click',function(e){e.preventDefault();this.classList.toggle('open');document.getElementById('drawings-sub').classList.toggle('show');});

// Top-level menu clicks (Dashboard)
document.querySelectorAll('.nav-item[data-page]').forEach(function(el){
  el.addEventListener('click',function(e){
    e.preventDefault();
    showPage(this.getAttribute('data-page'));
  });
});

// Sub-menu page clicks
document.querySelectorAll('.nav-sub a[data-page]').forEach(function(el){
  el.addEventListener('click',function(e){
    e.preventDefault();
    showPage(this.getAttribute('data-page'));
    var pt=this.closest('.nav-sub').previousElementSibling;
    if(pt){pt.classList.add('open');this.closest('.nav-sub').classList.add('show');}
  });
});
</script>
</body>
</html>


<?php ob_end_flush(); ?>
