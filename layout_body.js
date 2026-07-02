/*
    layout_body.js — <body> 내부 HTML 레이아웃
    GitHub에서 관리, PHP에서 로드하여 innerHTML로 주입
*/
function initLayout(phpData) {
    var visits = phpData && phpData.visits ? Number(phpData.visits).toLocaleString() : '0';
    var totalVisits = phpData && phpData.totalVisits ? Number(phpData.totalVisits).toLocaleString() : '0';

    var html = ''
    /* ══ SIDEBAR ══ */
    + '<nav id="sidebar">'
    + '  <div class="sidebar-header"><div class="logo-info"><div class="name">macroBIM</div></div></div>'
    + '  <div class="nav-menu">'
    + '    <a class="nav-item active" href="#" id="dashboardMenu" data-page="dashboard"><i class="bi bi-grid-fill"></i> Dashboard</a>'
    + '    <div class="nav-section">UI Elements</div>'
    + '    <a class="nav-item" href="#" id="tablesToggle"><i class="bi bi-table"></i> Tables <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="tables-sub">'
    + '      <a href="#" data-page="rebar">Rebar Tables</a>'
    + '      <a href="#" data-page="steel">Steel Section Tables</a>'
    + '    </div>'
    + '    <a class="nav-item" href="#" id="drawingsToggle"><i class="bi bi-card-image"></i> Drawings <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="drawings-sub">'
    + '      <a href="#" data-page="draw-hsection">H Section</a>'
    + '      <a href="#" data-page="draw-channel">Channel</a>'
    + '      <a href="#" data-page="draw-splice">Splice</a>'
    + '      <a href="#" data-page="draw-liftinglug">Lifting Lug</a>'
    + '      <a href="#" data-page="draw-ibeam">I Beam</a>'
    + '      <a href="#" data-page="draw-box1cell">BOX1CELL</a>'
    + '      <a href="#" data-page="draw-rect">Rect</a>'
    + '    </div>'
    + '  </div>'
    + '</nav>'

    /* ══ MAIN ══ */
    + '<div id="main">'
    + '  <div class="content-wrap">'

    /* ── DASHBOARD ── */
    + '    <div class="page-view active" id="page-dashboard">'
    + '      <h1 class="page-heading">Dashboard</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <span>Dashboard</span></div>'
    + '      <div class="stat-grid">'
    + '        <div class="stat-card">'
    + '          <div>'
    + '            <div class="stat-value">' + visits + '</div>'
    + '            <div class="stat-label">Today Visits</div>'
    + '          </div>'
    + '          <div class="stat-icon blue"><i class="bi bi-person-check"></i></div>'
    + '        </div>'
    + '        <div class="stat-card">'
    + '          <div>'
    + '            <div class="stat-value">' + totalVisits + '</div>'
    + '            <div class="stat-label">Total Visits</div>'
    + '          </div>'
    + '          <div class="stat-icon green"><i class="bi bi-people"></i></div>'
    + '        </div>'
    + '      </div>'
    + '    </div>'

    /* ── REBAR TABLES ── */
    + '    <div class="page-view" id="page-rebar">'
    + '      <h1 class="page-heading">Rebar Specification Tables</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Rebar Tables</span></div>'
    + '      <div class="table-card"><div class="table-card-header"><div class="table-card-title">1. KS D 3504 (Korean Standard)</div><div class="table-card-desc">Deformed bars for concrete reinforcement</div></div><table class="ea-table striped rebar"><thead id="rebar-ks-head"></thead><tbody id="rebar-ks-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>'
    + '      <div class="table-card"><div class="table-card-header"><div class="table-card-title">2. ASTM A615M (US Standard)</div><div class="table-card-desc">Standard specification for deformed bars</div></div><table class="ea-table striped rebar"><thead id="rebar-astm-head"></thead><tbody id="rebar-astm-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>'
    + '      <div class="table-card"><div class="table-card-header"><div class="table-card-title">3. BS 4449 (British Standard)</div><div class="table-card-desc">Steel for the reinforcement of concrete</div></div><table class="ea-table striped rebar"><thead id="rebar-bs-head"></thead><tbody id="rebar-bs-body"><tr><td colspan="7" class="loading-row"><span class="spinner"></span> Loading...</td></tr></tbody></table></div>'
    + '    </div>'

    /* ── STEEL SECTION TABLES ── */
    + '    <div class="page-view" id="page-steel">'
    + '      <h1 class="page-heading">Section Properties</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Steel Section</span></div>'
    + '      <div class="section-selector-row">'
    + '        <div class="section-card selected" data-section="hsection" onclick="selectSection(\'hsection\')">'
    + '          <div class="section-card-img"><img src="https://macrobim.github.io/design/Hsection.jpg" alt="H-Section"></div>'
    + '          <div class="section-card-name">H-Section</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="channel" onclick="selectSection(\'channel\')">'
    + '          <div class="section-card-img"><img src="https://macrobim.github.io/design/channel.png" alt="Channel"></div>'
    + '          <div class="section-card-name">Channel</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="equalangle" onclick="selectSection(\'equalangle\')">'
    + '          <div class="section-card-img"><img src="https://macrobim.github.io/design/angle.png" alt="Equal Angle"></div>'
    + '          <div class="section-card-name">Equal Angle</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="unequalangle" onclick="selectSection(\'unequalangle\')">'
    + '          <div class="section-card-img"><img src="https://macrobim.github.io/design/angle.png" alt="Unequal Angle"></div>'
    + '          <div class="section-card-name">Unequal Angle</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="invertedangle" onclick="selectSection(\'invertedangle\')">'
    + '          <div class="section-card-img"><img src="https://macrobim.github.io/design/invertedangle.png" alt="Inverted Angle"></div>'
    + '          <div class="section-card-name">Inverted Angle</div>'
    + '        </div>'
    + '      </div>'
    + '      <div class="steel-table-wrap">'
    + '        <table class="steel-table">'
    + '          <thead id="steel-thead"></thead>'
    + '          <tbody id="steel-tbody"><tr><td colspan="20" class="loading-row"><span class="spinner"></span> Loading section data...</td></tr></tbody>'
    + '        </table>'
    + '      </div>'
    + '    </div>'

    /* ── DRAWING PAGES ── */
    + '    <div class="page-view" id="page-draw-hsection"><h1 class="page-heading">H Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>H Section</span></div><div id="mount-draw-hsection"></div></div>'
    + '    <div class="page-view" id="page-draw-channel"><h1 class="page-heading">Channel Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Channel</span></div><div id="mount-draw-channel"></div></div>'
    + '    <div class="page-view" id="page-draw-ibeam"><h1 class="page-heading">I Beam Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>I Beam</span></div><div id="mount-draw-ibeam"></div></div>'
    + '    <div class="page-view" id="page-draw-splice"><h1 class="page-heading">Bolt Splice Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Splice</span></div><div id="mount-draw-splice"></div></div>'
    + '    <div class="page-view" id="page-draw-liftinglug"><h1 class="page-heading">Lifting Lug Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Lifting Lug</span></div><div id="mount-draw-liftinglug"></div></div>'
    + '    <div class="page-view" id="page-draw-rect"><h1 class="page-heading">Rect Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Rect</span></div><div id="mount-draw-rect"></div></div>'
    + '    <div class="page-view" id="page-draw-box1cell"><h1 class="page-heading">BOX 1-Cell Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>BOX1CELL</span></div><div id="mount-draw-box1cell"></div></div>'

    + '  </div>'
    + '</div>';

    var root = document.getElementById('app-root');
    root.style.cssText = 'display:flex;height:100%;width:100%;gap:16px;';
    root.innerHTML = html;

    _createTemplates();
    _bindNavigation();
}

/* ══ TEMPLATES ══ */
function _createTemplates() {
    var root = document.getElementById('app-root');

    /* ── HSECTION ── */
    _addTemplate(root, 'tpl-draw-hsection',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input H-beam cross-section parameters</div></div></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: H,Bt,Bb,tw,tft,tfb,R / 2줄: L</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_hsection(\'sUserText\'); fdraw_hsection();">300,300,300,10,15,15,19\n500</textarea>'
      + '    </div>'
      + '    <div class="form-grid-6col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '    </div>'
      + '    <div class="form-grid-6col">'
      + '      <div class="col-label">H (height)</div><input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_hsection()">'
      + '      <div class="col-label">Bt (top flange)</div><input class="form-input" type="number" id="dbt" value="300" onchange="fdraw_hsection()">'
      + '      <div class="col-label">Bb (bot flange)</div><input class="form-input" type="number" id="dbb" value="300" onchange="fdraw_hsection()">'
      + '      <div class="col-label">tw (web)</div><input class="form-input" type="number" id="dtw" value="10" onchange="fdraw_hsection()">'
      + '      <div class="col-label">tft (top flange t)</div><input class="form-input" type="number" id="dttf" value="15" onchange="fdraw_hsection()">'
      + '      <div class="col-label">tbf (bot flange t)</div><input class="form-input" type="number" id="dtbf" value="15" onchange="fdraw_hsection()">'
      + '      <div class="col-label">R <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="dradius" value="19" onchange="fdraw_hsection()">'
      + '      <div class="col-label">Beam Length</div><input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_hsection()">'
      + '      <button class="btn-generate" onclick="odxf_hsec.download(\'Hsection.dxf\')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_hsection()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="hsecplot"></div></div>'
      + '</div>'
    );

    /* ── CHANNEL ── */
    _addTemplate(root, 'tpl-draw-channel',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input channel cross-section parameters</div></div></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: H,B,tw,tf,Rw,Rf / 2줄: L</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_channel(\'sUserText\'); fdraw_channel();">300,90,12,16,19,9.5\n500</textarea>'
      + '    </div>'
      + '    <div class="form-grid-6col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '    </div>'
      + '    <div class="form-grid-6col">'
      + '      <div class="col-label">H (height)</div><input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_channel()">'
      + '      <div class="col-label">B (width)</div><input class="form-input" type="number" id="db" value="90" onchange="fdraw_channel()">'
      + '      <div class="col-label">tw (web)</div><input class="form-input" type="number" id="dtw" value="12" onchange="fdraw_channel()">'
      + '      <div class="col-label">tf (flange)</div><input class="form-input" type="number" id="dtf" value="16" onchange="fdraw_channel()">'
      + '      <div class="col-label">Rw <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drw" value="19" onchange="fdraw_channel()">'
      + '      <div class="col-label">Rf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drf" value="9.5" onchange="fdraw_channel()">'
      + '      <div class="col-label">Channel Length</div><input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_channel()">'
      + '      <div></div><div></div>'
      + '      <button class="btn-generate" onclick="odxf_channel.download(\'Channel.dxf\')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_channel()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="channelplot"></div></div>'
      + '</div>'
    );

    /* ── IBEAM ── */
    _addTemplate(root, 'tpl-draw-ibeam',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input I-beam (plate girder) cross-section parameters (Begin / End)</div></div>'
      + '  <button class="btn-generate" onclick="document.getElementById(\'ibeam_guide_img\').style.display=document.getElementById(\'ibeam_guide_img\').style.display===\'none\'?\'block\':\'none\'" style="margin:0;font-size:12px;padding:6px 14px;"><i class="bi bi-image"></i> VIEW GUIDE</button></div>'
      + '  <div id="ibeam_guide_img" style="display:none;padding:10px;background:#f8f9fa;border-bottom:1px solid #e2e8f0;text-align:center;"><img src="https://macrobim.github.io/macroBIM/ibeam_vars.png" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:4px;"></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: Begin / 2줄: End / 3줄: Beam Length</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="4" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_ibeam(\'sUserText\'); fdraw_ibeam();">1500,1235,985,85,45,135,140,160,50,200,100,50,20\n1500,1235,985,85,45,135,140,160,50,200,100,50,20\n500</textarea>'
      + '    </div>'
      + '    <div class="form-grid-9col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '    </div>'
      + '    <div class="form-grid-9col">'
      + '      <div class="col-label">h</div><input class="form-input" type="number" id="dh_s" value="1500" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dh_e" value="1500" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">bt</div><input class="form-input" type="number" id="dbt_s" value="1235" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dbt_e" value="1235" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">bb</div><input class="form-input" type="number" id="dbb_s" value="985" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dbb_e" value="985" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">ttf</div><input class="form-input" type="number" id="dttf_s" value="85" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dttf_e" value="85" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">ttf1</div><input class="form-input" type="number" id="dttf1_s" value="45" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dttf1_e" value="45" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">tbf</div><input class="form-input" type="number" id="dtbf_s" value="135" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dtbf_e" value="135" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">tbf1</div><input class="form-input" type="number" id="dtbf1_s" value="140" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dtbf1_e" value="140" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">tw</div><input class="form-input" type="number" id="dtw_s" value="160" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dtw_e" value="160" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">rtf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drtf_s" value="50" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="drtf_e" value="50" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">rwt <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drwt_s" value="200" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="drwt_e" value="200" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">rwb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drwb_s" value="100" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="drwb_e" value="100" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">rbf <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drbf_s" value="50" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="drbf_e" value="50" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">chb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="dchb_s" value="20" onchange="fdraw_ibeam()"><input class="form-input" type="number" id="dchb_e" value="20" onchange="fdraw_ibeam()">'
      + '      <div class="col-label">Beam Length</div><input class="form-input" type="number" id="dseg_leng" value="500" onchange="fdraw_ibeam()" style="grid-column:span 5;">'
      + '      <button class="btn-generate" onclick="odxf_ibeam.download(\'IBeam.dxf\')" style="grid-column:7 / 10;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_ibeam()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="ibeamplot"></div></div>'
      + '</div>'
    );

    /* ── SPLICE ── */
    _addTemplate(root, 'tpl-draw-splice',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">H-beam, splice plates &amp; bolt layout</div></div></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:16px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: H형강 / 2줄: 플레이트 / 3줄: 볼트</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="3" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_boltsplice(\'sUserText\'); fdraw_boltsplice();">300,300,300,10,15,15,18\n280,300,10,110,300,5,220,280,10,110,300,5,280,300,10\n5,12,8,30,10,80,10,5,12,10,60,10,0,10,5,12,8,30,10,80,10</textarea>'
      + '    </div>'
      + '    <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">1) H Beam</div>'
      + '    <div class="form-grid-6col" style="margin-bottom:14px;">'
      + '      <div class="col-label">Height</div><input class="form-input" type="number" id="dsech" value="300" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Top Flange W</div><input class="form-input" type="number" id="dbt" value="300" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Flange W</div><input class="form-input" type="number" id="dbb" value="300" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Web Thick</div><input class="form-input" type="number" id="dtw" value="10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Top Flange t</div><input class="form-input" type="number" id="dttf" value="15" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Flange t</div><input class="form-input" type="number" id="dtbf" value="15" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Fillet R <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="dradius" value="18" onchange="fdraw_boltsplice()">'
      + '    </div>'
      + '    <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">2) Splice Plate <span style="font-weight:400;color:#94a3b8;">(Width, Length, Thick)</span></div>'
      + '    <div class="form-grid-6col" style="margin-bottom:14px;">'
      + '      <div class="col-label">Top Plate</div><input class="form-input" type="text" id="splt" value="280,300,10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Top Inner</div><input class="form-input" type="text" id="splti" value="110,300,5" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Web Plate</div><input class="form-input" type="text" id="splw" value="220,280,10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Inner</div><input class="form-input" type="text" id="splbi" value="110,300,5" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Plate</div><input class="form-input" type="text" id="splb" value="280,300,10" onchange="fdraw_boltsplice()">'
      + '    </div>'
      + '    <div class="form-label" style="margin:4px 0 8px;font-size:12px;font-weight:700;color:#2563eb;">3) Bolt Layout <span style="font-weight:400;color:#94a3b8;">(Dia, Long N, Trans N / Space: In, Out, In, Out)</span></div>'
      + '    <div class="form-grid-6col">'
      + '      <div class="col-label">Top Bolt</div><input class="form-input" type="text" id="slayt" value="5,12,8" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Top Space</div><input class="form-input" type="text" id="slaytsp" value="30,10,80,10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Web Bolt</div><input class="form-input" type="text" id="slayw" value="5,12,10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Web Space <span style="color:#94a3b8;font-size:10px;">(I,O,0,O)</span></div><input class="form-input" type="text" id="slaywsp" value="60,10,0,10" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Bolt</div><input class="form-input" type="text" id="slayb" value="5,12,8" onchange="fdraw_boltsplice()">'
      + '      <div class="col-label">Bot Space</div><input class="form-input" type="text" id="slaybsp" value="30,10,80,10" onchange="fdraw_boltsplice()">'
      + '      <button class="btn-generate" onclick="odxf_boltsplice.download(\'BoltSplice.dxf\')" style="grid-column:5 / 7;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_boltsplice()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="spliceplot"></div></div>'
      + '</div>'
    );

    /* ── LIFTING LUG ── */
    _addTemplate(root, 'tpl-draw-liftinglug',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input lifting lug parameters</div></div></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; lugW,lugH,baseH,outerR,innerR,padeyeR,lugT,padeyeT</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_liftinglug(\'sUserText\'); fdraw_liftinglug();">120,120,30,40,10,30,20,30</textarea>'
      + '    </div>'
      + '    <div class="form-grid-6col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Value</div>'
      + '    </div>'
      + '    <div class="form-grid-6col">'
      + '      <div class="col-label">lugW (width)</div><input class="form-input" type="number" id="lugW" value="120" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">lugH (height)</div><input class="form-input" type="number" id="lugH" value="120" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">baseH</div><input class="form-input" type="number" id="baseH" value="30" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">outerR</div><input class="form-input" type="number" id="outerR" value="40" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">innerR (hole)</div><input class="form-input" type="number" id="innerR" value="10" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">padeyeR</div><input class="form-input" type="number" id="padeyeR" value="30" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">lugT (thick)</div><input class="form-input" type="number" id="lugT" value="20" onchange="fdraw_liftinglug()">'
      + '      <div class="col-label">padeyeT (thick)</div><input class="form-input" type="number" id="padeyeT" value="30" onchange="fdraw_liftinglug()">'
      + '      <button class="btn-generate" onclick="odxf_lug.download(\'LiftingLug.dxf\')" style="grid-column:5 / 7;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_liftinglug()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="liftinglugplot"></div></div>'
      + '</div>'
    );

    /* ── BOX1CELL ── */
    _addTemplate(root, 'tpl-draw-box1cell',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input 1-Cell Box section parameters (Begin / End)</div></div>'
      + '  <button class="btn-generate" onclick="document.getElementById(\'box1cell_guide_img\').style.display=document.getElementById(\'box1cell_guide_img\').style.display===\'none\'?\'block\':\'none\'" style="margin:0;font-size:12px;padding:6px 14px;"><i class="bi bi-image"></i> VIEW GUIDE</button></div>'
      + '  <div id="box1cell_guide_img" style="display:none;padding:10px;background:#f8f9fa;border-bottom:1px solid #e2e8f0;text-align:center;"><img src="https://macrobim.github.io/macroBIM/box1cell_vars.png" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:4px;"></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: Begin / 2줄: End / 3줄: Seg Length</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="4" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_box1cell(\'sUserText\'); fdraw_box1cell();">6600,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3\n8000,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3\n5000</textarea>'
      + '    </div>'
      + '    <div class="form-grid-9col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '    </div>'
      + '    <div class="form-grid-9col">'
      + '      <div class="col-label">h</div><input class="form-input" type="number" id="dh_s" value="6600" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dh_e" value="8000" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">bt</div><input class="form-input" type="number" id="dbt_s" value="12000" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbt_e" value="12000" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">bb</div><input class="form-input" type="number" id="dbb_s" value="6000" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbb_e" value="6000" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">btsh</div><input class="form-input" type="number" id="dbth_s" value="1500" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbth_e" value="1500" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">bcanh</div><input class="form-input" type="number" id="dbch_s" value="1500" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbch_e" value="1500" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">bcan</div><input class="form-input" type="number" id="dbc_s" value="1500" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbc_e" value="1500" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t1</div><input class="form-input" type="number" id="dt1_s" value="300" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt1_e" value="300" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t2</div><input class="form-input" type="number" id="dt2_s" value="300" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt2_e" value="300" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t3</div><input class="form-input" type="number" id="dt3_s" value="600" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt3_e" value="600" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t4</div><input class="form-input" type="number" id="dt4_s" value="600" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt4_e" value="600" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t5</div><input class="form-input" type="number" id="dt5_s" value="300" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt5_e" value="300" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">t6</div><input class="form-input" type="number" id="dt6_s" value="300" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dt6_e" value="300" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">tb</div><input class="form-input" type="number" id="dtb_s" value="840" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dtb_e" value="840" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">tw</div><input class="form-input" type="number" id="dtw_s" value="500" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dtw_e" value="500" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">bh</div><input class="form-input" type="number" id="dbbh_s" value="200" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbbh_e" value="200" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">vh1</div><input class="form-input" type="number" id="dbh1_s" value="200" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbh1_e" value="200" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">vh2</div><input class="form-input" type="number" id="dbh2_s" value="100" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dbh2_e" value="100" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">rwt <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drwt_s" value="300" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="drwt_e" value="300" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">rwtin <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drwtin_s" value="200" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="drwtin_e" value="200" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">rb <span style="color:#94a3b8;font-size:10px;">(0=없음)</span></div><input class="form-input" type="number" id="drb_s" value="400" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="drb_e" value="400" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">sl_tl (%)</div><input class="form-input" type="number" id="dsltl_s" value="-2" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dsltl_e" value="-2" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">sl_tr (%)</div><input class="form-input" type="number" id="dsltr_s" value="5" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dsltr_e" value="5" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">sl_b (%)</div><input class="form-input" type="number" id="dslb_s" value="3" onchange="fdraw_box1cell()"><input class="form-input" type="number" id="dslb_e" value="3" onchange="fdraw_box1cell()">'
      + '      <div class="col-label">Seg Length</div><input class="form-input" type="number" id="dseg_leng" value="5000" onchange="fdraw_box1cell()" style="grid-column:span 2;">'
      + '      <button class="btn-generate" onclick="odxf_box1cell.download(\'Box1Cell.dxf\')" style="grid-column:7 / 10;margin:8px 0 0 0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_box1cell()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="box1cellplot"></div></div>'
      + '</div>'
    );

    /* ── RECT ── */
    _addTemplate(root, 'tpl-draw-rect',
        '<div class="draw-card">'
      + '  <div class="draw-card-header" style="display:flex;justify-content:space-between;align-items:center;"><div><div class="draw-card-title">Dimension (mm)</div><div class="draw-card-desc">Input rectangular cross-section parameters (Begin / End)</div></div></div>'
      + '  <div class="draw-card-body">'
      + '    <div style="margin-bottom:20px;">'
      + '      <div class="form-label" style="margin-bottom:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Batch Input (CSV) <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;">&mdash; 1줄: H_s,B_s,h_s,b_s,H_e,B_e,h_e,b_e,hollow(1/0) / 2줄: L</span></div>'
      + '      <textarea class="form-input" id="sUserText" rows="2" style="width:100%;resize:vertical;font-size:12px;" onchange="putParams_rect(\'sUserText\'); fdraw_rect();">400,300,300,200,400,300,300,200,1\n1000</textarea>'
      + '    </div>'
      + '    <div class="form-grid-9col" style="margin-bottom:12px;">'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '      <div class="col-header var-header">Variable</div><div class="col-header">Front</div><div class="col-header">Back</div>'
      + '    </div>'
      + '    <div class="form-grid-9col">'
      + '      <div class="col-label">H (outer h)</div><input class="form-input" type="number" id="drect_H_s" value="400" onchange="fdraw_rect()"><input class="form-input" type="number" id="drect_H_e" value="400" onchange="fdraw_rect()">'
      + '      <div class="col-label">B (outer w)</div><input class="form-input" type="number" id="drect_B_s" value="300" onchange="fdraw_rect()"><input class="form-input" type="number" id="drect_B_e" value="300" onchange="fdraw_rect()">'
      + '      <div class="col-label">h (inner h)</div><input class="form-input" type="number" id="drect_h_s" value="300" onchange="fdraw_rect()"><input class="form-input" type="number" id="drect_h_e" value="300" onchange="fdraw_rect()">'
      + '      <div class="col-label">b (inner w)</div><input class="form-input" type="number" id="drect_b_s" value="200" onchange="fdraw_rect()"><input class="form-input" type="number" id="drect_b_e" value="200" onchange="fdraw_rect()">'
      + '      <div class="col-label">Seg Length</div><input class="form-input" type="number" id="dseg_leng" value="1000" onchange="fdraw_rect()" style="grid-column:span 2;">'
      + '      <div class="col-label" style="display:flex;align-items:center;gap:8px;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;"><input type="checkbox" id="drect_hollow" checked onchange="fdraw_rect()" style="width:16px;height:16px;accent-color:#2563eb;">Hollow</label></div><div></div><div></div>'
      + '      <div></div><div></div><div></div><div></div><div></div><div></div>'
      + '      <button class="btn-generate" onclick="odxf_rect.download(\'Rect.dxf\')" style="grid-column:7 / 10;margin:0;justify-content:center;"><i class="bi bi-download"></i> DXF DOWNLOAD</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      + '<div class="draw-card">'
      + '  <div class="draw-card-header"><div class="draw-card-title">Drawing View <span style="font-weight:400;color:#94a3b8;font-size:12px;">(Synchronized Zoom / Pan)</span></div>'
      + '  <button class="btn-generate" onclick="fdraw_rect()" style="margin-top:0;"><i class="bi bi-arrow-repeat"></i> REGEN</button></div>'
      + '  <div class="drawing-viewport"><div id="rectplot"></div></div>'
      + '</div>'
    );
}

function _addTemplate(root, id, html) {
    var tpl = document.createElement('template');
    tpl.id = id;
    tpl.innerHTML = html;
    root.appendChild(tpl);
}

/* ══ NAVIGATION ══ */
function _bindNavigation() {

    function showPage(pageId) {
        document.querySelectorAll('.page-view').forEach(function(p) { p.classList.remove('active'); });
        var t = document.getElementById('page-' + pageId);
        if (t) t.classList.add('active');
        document.querySelectorAll('.nav-sub a').forEach(function(s) { s.classList.remove('active'); });
        var sb = document.querySelector('.nav-sub a[data-page="' + pageId + '"]');
        if (sb) sb.classList.add('active');
        document.querySelectorAll('.nav-item[data-page]').forEach(function(s) { s.classList.remove('active'); });
        var topItem = document.querySelector('.nav-item[data-page="' + pageId + '"]');
        if (topItem) topItem.classList.add('active');

        if (pageId === 'rebar' && !window._rebarLoaded) { loadRebarTables(); window._rebarLoaded = true; }
        if (pageId === 'steel' && !window._steelLoaded) { selectSection('hsection'); window._steelLoaded = true; }
        if (pageId === 'draw-hsection') { mountDrawing('hsection'); if (typeof fdraw_hsection === 'function') fdraw_hsection(); }
        if (pageId === 'draw-channel') { mountDrawing('channel'); if (typeof fdraw_channel === 'function') fdraw_channel(); }
        if (pageId === 'draw-ibeam') { mountDrawing('ibeam'); if (typeof fdraw_ibeam === 'function') fdraw_ibeam(); }
        if (pageId === 'draw-splice') { mountDrawing('splice'); if (typeof fdraw_boltsplice === 'function') fdraw_boltsplice(); }
        if (pageId === 'draw-liftinglug') { mountDrawing('liftinglug'); if (typeof fdraw_liftinglug === 'function') fdraw_liftinglug(); }
        if (pageId === 'draw-box1cell') { mountDrawing('box1cell'); if (typeof fdraw_box1cell === 'function') fdraw_box1cell(); }
        if (pageId === 'draw-rect') { mountDrawing('rect'); if (typeof fdraw_rect === 'function') fdraw_rect(); }
    }
    window.showPage = showPage;

    function mountDrawing(kind) {
        ['hsection','channel','ibeam','splice','liftinglug','box1cell','rect'].forEach(function(k) {
            if (k !== kind) {
                var other = document.getElementById('mount-draw-' + k);
                if (other) other.innerHTML = '';
            }
        });
        var mount = document.getElementById('mount-draw-' + kind);
        if (mount && !mount.firstElementChild) {
            var tpl = document.getElementById('tpl-draw-' + kind);
            if (tpl) mount.appendChild(tpl.content.cloneNode(true));
        }
    }
    window.mountDrawing = mountDrawing;

    document.getElementById('tablesToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('tables-sub').classList.toggle('show');
    });
    document.getElementById('drawingsToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('drawings-sub').classList.toggle('show');
    });
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
        el.addEventListener('click', function(e) { e.preventDefault(); showPage(this.getAttribute('data-page')); });
    });
    document.querySelectorAll('.nav-sub a[data-page]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault(); showPage(this.getAttribute('data-page'));
            var pt = this.closest('.nav-sub').previousElementSibling;
            if (pt) { pt.classList.add('open'); this.closest('.nav-sub').classList.add('show'); }
        });
    });
}
