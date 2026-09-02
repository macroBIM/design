/*
    layout_body.js — <body> 내부 HTML 레이아웃 (검증 완료본 / index.html 용)
    - 포함 기능: Tables(Rebar·Steel·Bend Radius) / Code(Rebar Anchorage·Splice)
                 / Drawings(H·Channel·Splice·Lug·I·BOX1CELL·Rect·Circle·Octagon·Track)
                 / Retaining Wall(Gravity·Inverted-T·L-shaped) / Pier / QnA
    - Dashboard 제외, 기본 랜딩 페이지는 Home
    GitHub에서 관리, PHP에서 로드하여 innerHTML로 주입

    ── 동기화 ───────────────────────────────────────────────────────
    layout_body_test.js 를 이 파일 위에 덮지 않는다. 두 파일은 실수로
    벌어진 게 아니라 일부러 다르다 — 운영에는 Dashboard 와 PSCBOX 가 없고,
    도면 카드 스타일도 이전 것이다. MacroPLATE3D(Simple connector)는
    2026-09-02 에 런칭해서 이제 여기에도 있다.
    동기화란 이번에 만든 변경만 옮기는 것이다. 파일 전체가 아니라.
       node tools/check_sync_scope.js   ← 새어 들어갔는지 본다
    까닭과 목록은 SYNC.md.
    ─────────────────────────────────────────────────────────────────
*/
/* ── MB.confirm — 사이트의 확인 상자 ────────────────────────────────

   브라우저의 confirm() 은 "www.macrobim.com의 메시지" 를 달고 나오고,
   버튼 글자는 브라우저 언어를 따르며, 생김새를 우리가 정할 수 없다.
   묻는 것 자체는 맞았으니 상자만 우리 것으로 바꾼다.

   생김새는 지어내지 않았다. 파란 막대와 회색 머리띠는 이 사이트의
   .table-card 가 이미 쓰는 것이고, 라운드·그림자·글꼴·포커스 링도
   layout_style.css 에서 그대로 가져왔다. 새 모양이 하나 생기는 게 아니라
   있던 모양을 한 번 더 쓰는 것이다.

   여기 있고 layout_style.css 에 없는 까닭: 이 파일은 페이지가 이미
   불러오지만, CSS 는 페이지가 ?v= 를 달고 부를 수 있어서 그 숫자를 올리지
   않으면 새 규칙이 조용히 안 나온다. 상자가 통째로 한 파일에 있으면 그
   어긋남이 생길 자리가 없다. 같은 이유로 강도표(strength-css)도 이렇게 한다.

   쓰는 쪽:

       MB.confirm({ title: '...', body: '...', ok: 'Start over' })
         .then(function (yes) { if (yes) ... });

   Esc 와 바깥 클릭은 취소. 열리면 포커스가 상자 안에 갇히고 먼저 취소에
   앉으므로, 무심코 친 Enter 는 취소가 된다 — 잃는 쪽이 기본이 되면 안 된다.
   닫히면 포커스는 원래 있던 자리로 돌아간다.

   body 는 글자로만 넣는다(HTML 로 안 새긴다). 상자에 표시할 문구가 밖에서
   오는 값일 수 있고, 그때 마크업이 통과하면 그건 구멍이다. */
window.MB = window.MB || {};
(function () {
    var CSS = [
        '.mb-back{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9000;',
        '  background:rgba(15,23,42,.45);display:flex;align-items:center;',
        '  justify-content:center;padding:20px}',
        ".mb-box{background:#fff;border-radius:12px;width:100%;max-width:430px;overflow:hidden;",
        '  box-shadow:0 12px 34px rgba(15,23,42,.16),0 2px 6px rgba(15,23,42,.06);',
        "  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}",
        '.mb-hd{display:flex;align-items:center;padding:13px 20px;',
        '  border-bottom:1px solid #e2e8f0;background:#f1f5f9}',
        '.mb-hd h2{display:flex;align-items:center;margin:0;font-size:15px;font-weight:600;',
        '  color:#0f172a}',
        // .table-card-title 이 쓰는 그 막대
        ".mb-hd h2::before{content:'';display:inline-block;width:4px;height:15px;",
        '  border-radius:2px;background:#2563eb;margin-right:9px;flex-shrink:0}',
        '.mb-bd{padding:18px 20px;font-size:13px;color:#64748b;line-height:1.6}',
        '.mb-ft{display:flex;justify-content:flex-end;gap:8px;padding:0 20px 18px}',
        '.mb-btn{font:inherit;font-size:13px;font-weight:600;padding:8px 16px;',
        '  border-radius:8px;cursor:pointer;border:1px solid #e2e8f0;background:#fff;',
        '  color:#475569;transition:background .13s,border-color .13s,box-shadow .13s}',
        '.mb-btn:hover{background:#f1f5f9}',
        // 사이트가 입력칸에 쓰는 바로 그 포커스 링
        '.mb-btn:focus{outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.1)}',
        '.mb-btn.pri{background:#2563eb;border-color:#2563eb;color:#fff}',
        '.mb-btn.pri:hover{background:#1d4ed8;border-color:#1d4ed8;',
        '  box-shadow:0 2px 8px rgba(37,99,235,.32)}',
        '.mb-btn.pri:focus{box-shadow:0 0 0 3px rgba(37,99,235,.35)}'
    ].join('');

    function ensureCSS() {
        if (document.getElementById('mb-dialog-css')) return;
        var st = document.createElement('style');
        st.id = 'mb-dialog-css';
        st.textContent = CSS;
        document.head.appendChild(st);
    }
    function esc(s) {
        return String(s === undefined || s === null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var open = null;                       // 한 번에 하나만

    window.MB.confirm = function (o) {
        o = o || {};
        return new Promise(function (resolve) {
            /* 이미 하나 떠 있으면 새로 열지 않는다. 두 장이 겹치면 어느 쪽에
               대답하는지 알 수 없고, 뒤엣것이 앞엣것을 영영 매달아 둔다. */
            if (open) { resolve(false); return; }
            ensureCSS();
            var was = document.activeElement;
            var back = document.createElement('div');
            back.className = 'mb-back';
            back.setAttribute('role', 'dialog');
            back.setAttribute('aria-modal', 'true');
            back.setAttribute('aria-labelledby', 'mb-dlg-t');
            back.innerHTML =
                '<div class="mb-box">' +
                '  <div class="mb-hd"><h2 id="mb-dlg-t">' + esc(o.title || 'Are you sure?') +
                '  </h2></div>' +
                '  <div class="mb-bd">' + esc(o.body || '') + '</div>' +
                '  <div class="mb-ft">' +
                '    <button type="button" class="mb-btn" data-mb="no">' +
                       esc(o.cancel || 'Cancel') + '</button>' +
                '    <button type="button" class="mb-btn pri" data-mb="yes">' +
                       esc(o.ok || 'OK') + '</button>' +
                '  </div></div>';
            document.body.appendChild(back);
            open = back;

            var no = back.querySelector('[data-mb="no"]');
            var yes = back.querySelector('[data-mb="yes"]');

            function done(v) {
                if (!open) return;
                open = null;
                document.removeEventListener('keydown', onKey, true);
                if (back.parentNode) back.parentNode.removeChild(back);
                if (was && was.focus) { try { was.focus(); } catch (e) {} }
                resolve(v);
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.preventDefault(); done(false); return; }
                /* Enter 는 가로채지 않는다. 포커스가 앉은 버튼이 알아서 눌리는
                   것이 맞고, 포커스는 취소에서 시작한다. 여기서 Enter 를 확인
                   으로 처리하면, 취소로 옮겨 놓고 Enter 를 친 사람이 확인을
                   누른 것이 된다 — 안 잃으려고 옮겼는데 잃는다. */
                if (e.key !== 'Tab') return;
                /* 포커스를 상자 안에 가둔다. 안 가두면 Tab 이 뒤에 깔린 화면의
                   버튼으로 넘어가고, 사람은 대답한 줄 알고 그것을 누른다. */
                var f = [no, yes];
                var i = f.indexOf(document.activeElement);
                e.preventDefault();
                f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
            }
            no.addEventListener('click', function () { done(false); });
            yes.addEventListener('click', function () { done(true); });
            // 바깥은 취소. 상자 위를 눌렀다가 바깥에서 뗀 것까지 취소로 세지 않게
            // mousedown 이 아니라 click 의 target 을 본다.
            back.addEventListener('click', function (e) { if (e.target === back) done(false); });
            document.addEventListener('keydown', onKey, true);
            // 취소에 먼저 앉힌다 — 무심코 누른 Enter 로 잃는 것이 없도록
            no.focus();
        });
    };
})();

function initLayout(phpData) {
    var html = ''
    /* ══ SIDEBAR ══ */
    + '<nav id="sidebar">'
    + '  <div class="sidebar-header"><div class="logo-info"><a href="http://www.macrobim.com" class="name" style="text-decoration:none;color:inherit;">macroBIM</a></div></div>'
    + '  <div class="nav-menu">'
    + '    <a class="nav-item" href="#" data-page="home"><i class="bi bi-house-door"></i> Home</a>'
    + '    <a class="nav-item" href="#" id="tablesToggle"><i class="bi bi-table"></i> Tables <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="tables-sub">'
    + '      <a href="#" data-page="rebar">Rebar Tables</a>'
    + '      <a href="#" data-page="strength">Steel Strength</a>'
    + '      <a href="#" data-page="steel">Steel Section Tables</a>'
    + '      <a href="#" data-page="bendradius">Rebar Bend Radius</a>'
    + '    </div>'
    /* Tables 바로 아래는 실제로 무언가를 만들고 검토하는 자리다 — 표를
       찾아보고 나면 다음은 이쪽이다. MacroBEAM 은 견디는지를 보고,
       PLATE3D 는 시트로 형상을 만든다. */
    + '    <a class="nav-item" href="#" id="macrobeamToggle"><i class="bi bi-bar-chart-line"></i> MacroBEAM <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="macrobeam-sub">'
    + '      <a href="#" data-page="beam-formula">SimpleBEAM</a>'
    + '      <a href="#" data-page="beam-multi">MultiBEAM</a>'
    + '    </div>'
    /* MacroPLATE3D — PLATE3D 가 만드는 모델을 시트 대신 화면에서 적는 방식.
       PLATE3D 바로 위에 둔다: 같은 엔진을 쓰고, 시트를 쓸지 폼을 쓸지가
       고르는 자리이므로 둘이 붙어 있어야 고를 수 있다. */
    + '    <a class="nav-item" href="#" id="quick3dToggle"><i class="bi bi-lightning-charge"></i> MacroPLATE3D <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="quick3d-sub">'
    + '      <a href="#" data-page="quick-simpleconn">Simple connector</a>'
    + '    </div>'
    + '    <a class="nav-item" href="#" data-page="draw-plate3d"><i class="bi bi-stack"></i> PLATE3D</a>'
    + '    <a class="nav-item" href="#" id="codeToggle"><i class="bi bi-calculator"></i> Code <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="code-sub">'
    + '      <a href="#" data-page="rebarleng">Rebar Anchorage / Splice</a>'
    + '    </div>'
    + '    <a class="nav-item" href="#" id="drawingsToggle"><i class="bi bi-card-image"></i> Drawings <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="drawings-sub">'
    + '      <a href="#" data-page="draw-hsection">H Section</a>'
    + '      <a href="#" data-page="draw-channel">Channel</a>'
    + '      <a href="#" data-page="draw-liftinglug">Lifting Lug</a>'
    + '      <a href="#" data-page="draw-ibeam">I Beam</a>'
    + '      <a href="#" data-page="draw-box1cell">BOX1CELL</a>'
    + '      <a href="#" data-page="draw-rect">Rect</a>'
    + '      <a href="#" data-page="draw-circle">Circle</a>'
    + '      <a href="#" data-page="draw-octagon">Octagon</a>'
    + '      <a href="#" data-page="draw-track">Track</a>'
    + '    </div>'
    + '    <a class="nav-item" href="#" id="retainingToggle"><i class="bi bi-bricks"></i> Retaining Wall <span class="arrow">&#8250;</span></a>'
    + '    <div class="nav-sub" id="retaining-sub">'
    + '      <a href="#" data-page="draw-gravitywall">Gravity Wall</a>'
    + '      <a href="#" data-page="draw-invtwall">Inverted-T Wall</a>'
    + '      <a href="#" data-page="draw-lwall">L-shaped Wall</a>'
    + '    </div>'
    + '    <a class="nav-item" href="#" data-page="draw-pier"><i class="bi bi-building"></i> Pier</a>'
    + '    <a class="nav-item" href="#" data-page="qna"><i class="bi bi-question-circle"></i> QnA</a>'
    + '  </div>'
    + '</nav>'

    /* ══ MAIN ══ */
    + '<div id="main">'
    + '  <div class="content-wrap">'

    /* ── HOME ── */
    + '    <div class="page-view active" id="page-home">'
    + '      <div style="max-width:1140px;margin:0 auto;">'
    + '        <div style="background:#0c1222;padding:42px 32px;border-radius:14px;margin-bottom:32px;position:relative;overflow:hidden;">'
    + '          <div style="position:absolute;top:-120px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%);pointer-events:none;"></div>'
    + '          <div style="position:relative;z-index:1;">'
    + '            <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#06b6d4;border:1px solid rgba(6,182,212,0.25);padding:5px 14px;border-radius:20px;margin-bottom:18px;"><i class="bi bi-lightning-charge-fill"></i> Fast &amp; Simple BIM Tools</div>'
    + '            <h1 style="font-size:38px;font-weight:800;line-height:1.1;color:#e8edf6;margin:0 0 12px;">3D BIM &amp; Drawings, <span style="background:linear-gradient(135deg,#2563eb,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">faster.</span></h1>'
    + '            <p style="font-size:14px;color:#8899b4;max-width:500px;line-height:1.7;margin:0;">Hours of drafting — done in seconds. Parametric sections, structures, and joints, all in your browser. No install. Just open and go.</p>'
    + '          </div>'
    + '        </div>'
    + '        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-left:14px;border-left:4px solid #2563eb;">Macro Products</h2>'
    + '        <p style="font-size:13px;color:#64748b;margin:0 0 16px;">Easy and convenient drawing tools</p>'
    + '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:36px;">'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'beam-formula\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:12px;padding:24px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#2563eb\'" onmouseout="this.style.borderColor=\'#e0e7f1\'">'
    + '            <div style="font-size:26px;color:#2563eb;margin-bottom:12px;"><i class="bi bi-bar-chart-line"></i></div>'
    + '            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 8px;">MacroBEAM</h3>'
    + '            <p style="font-size:13px;color:#3b4963;line-height:1.65;margin:0 0 12px;">Fast beam analysis directly in the browser. Input loads, supports, and section properties — get shear, moment, and deflection results instantly.</p>'
    + '            <div style="display:flex;flex-wrap:wrap;gap:6px;">'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:rgba(37,99,235,0.1);color:#2563eb;">SimpleBEAM</span>'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:rgba(37,99,235,0.1);color:#2563eb;">MultiBEAM</span>'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:#f1f5fb;color:#64748b;border:1px solid #e0e7f1;">SFD / BMD</span>'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:#f1f5fb;color:#64748b;border:1px solid #e0e7f1;">Deflection</span>'
    + '            </div>'
    + '          </a>'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'draw-plate3d\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:12px;padding:24px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#2563eb\'" onmouseout="this.style.borderColor=\'#e0e7f1\'">'
    + '            <div style="font-size:26px;color:#2563eb;margin-bottom:12px;"><i class="bi bi-stack"></i></div>'
    + '            <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 8px;">PLATE 3D</h3>'
    + '            <p style="font-size:13px;color:#3b4963;line-height:1.65;margin:0 0 12px;">A spreadsheet that builds a steel structure. Parts become modules, modules become the assembly &mdash; change one cell and every copy follows. Exports drawings, a take-off, STL and IFC.</p>'
    + '            <div style="display:flex;flex-wrap:wrap;gap:6px;">'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:rgba(37,99,235,0.1);color:#2563eb;">Spreadsheet-driven</span>'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:#f1f5fb;color:#64748b;border:1px solid #e0e7f1;">Steel</span>'
    + '              <span style="font-size:10.5px;font-weight:600;padding:3px 10px;border-radius:6px;background:#f1f5fb;color:#64748b;border:1px solid #e0e7f1;">Drawings &middot; STL &middot; IFC</span>'
    + '            </div>'
    + '          </a>'
    + '        </div>'
    + '        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-left:14px;border-left:4px solid #2563eb;">Engineering Tables</h2>'
    + '        <p style="font-size:13px;color:#64748b;margin:0 0 16px;">Rebar specifications, steel sections, and code-based data at your fingertips</p>'
    + '        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:36px;">'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'rebar\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:10px;padding:14px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#f59e0b\'" onmouseout="this.style.borderColor=\'#e0e7f1\'"><div style="font-size:17px;color:#f59e0b;margin-bottom:6px;"><i class="bi bi-grid-3x3"></i></div><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 3px;">Rebar Tables</h4><p style="font-size:11.5px;color:#64748b;margin:0;">KS D 3504 · ASTM A615M · BS 4449</p></a>'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'strength\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:10px;padding:14px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#f59e0b\'" onmouseout="this.style.borderColor=\'#e0e7f1\'"><div style="font-size:17px;color:#f59e0b;margin-bottom:6px;"><i class="bi bi-grid-3x3"></i></div><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 3px;">Steel Strength</h4><p style="font-size:11.5px;color:#64748b;margin:0;">Steel material strength properties</p></a>'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'steel\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:10px;padding:14px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#f59e0b\'" onmouseout="this.style.borderColor=\'#e0e7f1\'"><div style="font-size:17px;color:#f59e0b;margin-bottom:6px;"><i class="bi bi-grid-3x3"></i></div><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 3px;">Steel Section Tables</h4><p style="font-size:11.5px;color:#64748b;margin:0;">H-Section, Channel, Angle, Tube, Pipe — 7 types</p></a>'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'bendradius\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:10px;padding:14px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#f59e0b\'" onmouseout="this.style.borderColor=\'#e0e7f1\'"><div style="font-size:17px;color:#f59e0b;margin-bottom:6px;"><i class="bi bi-grid-3x3"></i></div><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 3px;">Rebar Bend Radius</h4><p style="font-size:11.5px;color:#64748b;margin:0;">ACI · AASHTO · Eurocode · KDS</p></a>'
    + '          <a href="#" onclick="event.preventDefault();showPage(\'rebarleng\')" style="background:#fff;border:1px solid #e0e7f1;border-radius:10px;padding:14px;text-decoration:none;display:block;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor=\'#8b5cf6\'" onmouseout="this.style.borderColor=\'#e0e7f1\'"><div style="font-size:17px;color:#8b5cf6;margin-bottom:6px;"><i class="bi bi-rulers"></i></div><h4 style="font-size:13px;font-weight:600;color:#0f172a;margin:0 0 3px;">Anchorage / Splice</h4><p style="font-size:11.5px;color:#64748b;margin:0;">Eurocode-based anchorage and splice length calculator</p></a>'
    + '        </div>'
    + '        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;padding-left:14px;border-left:4px solid #2563eb;">Parametric Sections &amp; Structures</h2>'
    + '        <p style="font-size:13px;color:#64748b;margin:0 0 36px;">Pier, Retaining Walls (Gravity / Inverted-T / L-shaped), H Section, Channel, I Beam, BOX 1-Cell, Circle, Octagon, Track, Rect, Bolt Splice, Lifting Lug — multi-view 3D parametric drawings with batch CSV input and DXF export</p>'
    + '        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;padding-left:14px;border-left:4px solid #2563eb;">Recent Updates</h2>'
    + '        <div id="recent-updates" style="margin-bottom:36px;max-height:240px;overflow-y:auto;"><p style="font-size:13px;color:#64748b;margin:0;">No updates yet.</p></div>'
    + '        <div style="background:#f1f5f9;border-top:2px solid #cbd5e1;border-radius:12px;padding:20px 32px;margin-top:32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">'
    + '          <div>'
    + '            <h2 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 4px;">Contact Us</h2>'
    + '            <p style="font-size:12px;color:#64748b;margin:0;max-width:480px;line-height:1.6;">Built by <strong style="color:#0f172a;">MacroEngineering</strong> — engineering automation, simplified. From civil and structural to architectural and mechanical, we pursue one-click solutions for repetitive engineering work. Business inquiries, custom automation requests, and collaboration are always welcome.</p>'
    + '          </div>'
    + '          <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end;">'
    + '            <a href="http://www.macrobim.com" style="display:flex;align-items:center;gap:8px;font-size:13px;color:#2563eb;text-decoration:none;font-weight:500;"><i class="bi bi-globe2"></i> www.macrobim.com</a>'
    + '            <a href="mailto:macrobim@macrobim.com" style="display:flex;align-items:center;gap:8px;font-size:13px;color:#2563eb;text-decoration:none;font-weight:500;"><i class="bi bi-envelope"></i> macrobim@macrobim.com</a>'
    + '          </div>'
    + '        </div>'
    + '        <div style="text-align:center;padding:16px 0 20px;font-size:11px;color:#94a3b8;">&copy; 2026 macroBIM. All rights reserved.</div>'
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

    /* ── STEEL STRENGTH ── */
    + '    <div class="page-view" id="page-strength">'
    + '      <h1 class="page-heading">Steel Strength</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Steel Strength</span></div>'
    + '      <div id="strength-mount"><div class="table-card"><div class="loading-row"><span class="spinner"></span> Loading strength data...</div></div></div>'
    + '    </div>'

    /* ── STEEL SECTION TABLES ── */
    + '    <div class="page-view" id="page-steel">'
    + '      <h1 class="page-heading">Section Properties</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Steel Section</span></div>'
    + '      <div class="section-selector-row chips">'
    + '        <div class="section-card selected" data-section="hsection" onclick="selectSection(\'hsection\')">'
    + '          <div class="section-card-name">H-Section</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="channel" onclick="selectSection(\'channel\')">'
    + '          <div class="section-card-name">Channel</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="equalangle" onclick="selectSection(\'equalangle\')">'
    + '          <div class="section-card-name">Equal Angle</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="unequalangle" onclick="selectSection(\'unequalangle\')">'
    + '          <div class="section-card-name">Unequal Angle</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="squaretube" onclick="selectSection(\'squaretube\')">'
    + '          <div class="section-card-name">Square Tube</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="pipe" onclick="selectSection(\'pipe\')">'
    + '          <div class="section-card-name">Pipe</div>'
    + '        </div>'
    + '        <div class="section-card" data-section="invertedangle" onclick="selectSection(\'invertedangle\')">'
    + '          <div class="section-card-name">Inverted Angle</div>'
    + '        </div>'
    + '      </div>'
    /* The dimension drawing, above the table it explains, and the only place
       a drawing appears. The cards used to carry a thumbnail each; at 100px
       the letters a heading is read by — D and t on a pipe, A/B/t/r on a tube
       — were unreadable mush, and the same picture then showed twice. The
       cards are names now. This follows the selection, so it is always the
       one being looked at. */
    + '      <div class="steel-fig" id="steel-fig"><img id="steel-fig-img" alt=""></div>'
    + '      <div class="steel-table-wrap">'
    + '        <table class="steel-table">'
    + '          <thead id="steel-thead"></thead>'
    + '          <tbody id="steel-tbody"><tr><td colspan="20" class="loading-row"><span class="spinner"></span> Loading section data...</td></tr></tbody>'
    + '        </table>'
    + '      </div>'
    + '    </div>'

    /* ── TABLES : REBAR BEND RADIUS ── */
    + '    <div class="page-view" id="page-bendradius">'
    + '      <h1 class="page-heading">Rebar Bend Radius</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Tables</a> / <span>Bend Radius</span></div>'
    + '      <div class="table-card">'
    + '        <div class="table-card-header"><div class="table-card-title">Main Bars (Standard Hooks)</div><div class="table-card-desc">Min. inside bend <b>diameter</b> ( parenthesis = radius )</div></div>'
    + '        <div style="overflow-x:auto;"><table class="ea-table striped rebar">'
    + '          <thead>'
    + '            <tr><th rowspan="2">Bar Size</th><th colspan="2">ACI-based</th><th colspan="2">Eurocode-based (LSD)</th></tr>'
    + '            <tr><th>KDS 14 20 50<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Concrete Structures (KR)</span></th><th>AASHTO LRFD<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Highway Bridge (US)</span></th><th>KDS 24 14 21<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Highway Bridge (KR)</span></th><th>EN 1992-1-1<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Eurocode 2 (EU)</span></th></tr>'
    + '          </thead>'
    + '          <tbody>'
    + '            <tr><td>D16 &amp; smaller<br><span style="color:#94a3b8;font-size:11px;">#5 / &le;16mm</span></td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td></tr>'
    + '            <tr><td>D19 ~ D25<br><span style="color:#94a3b8;font-size:11px;">#6~8 / 20~25mm</span></td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td></tr>'
    + '            <tr><td>D29 ~ D35<br><span style="color:#94a3b8;font-size:11px;">#9~11 / 28~32mm</span></td><td>8d<sub>b</sub> (4d<sub>b</sub>)</td><td>8d<sub>b</sub> (4d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td></tr>'
    + '            <tr><td>D38 &amp; larger<br><span style="color:#94a3b8;font-size:11px;">#14~ / 40mm~</span></td><td>10d<sub>b</sub> (5d<sub>b</sub>)</td><td>10d<sub>b</sub> (5d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td></tr>'
    + '          </tbody>'
    + '        </table></div>'
    + '      </div>'
    + '      <div class="table-card">'
    + '        <div class="table-card-header"><div class="table-card-title">Shear Reinforcement (Stirrups / Ties)</div><div class="table-card-desc">Min. inside bend <b>diameter</b> ( parenthesis = radius )</div></div>'
    + '        <div style="overflow-x:auto;"><table class="ea-table striped rebar">'
    + '          <thead>'
    + '            <tr><th rowspan="2">Bar Size</th><th colspan="2">ACI-based</th><th colspan="2">Eurocode-based (LSD)</th></tr>'
    + '            <tr><th>KDS 14 20 50<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Concrete Structures (KR)</span></th><th>AASHTO LRFD<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Highway Bridge (US)</span></th><th>KDS 24 14 21<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Highway Bridge (KR)</span></th><th>EN 1992-1-1<br><span style="color:#94a3b8;font-size:11px;font-weight:400;">Eurocode 2 (EU)</span></th></tr>'
    + '          </thead>'
    + '          <tbody>'
    + '            <tr><td>D16 &amp; smaller<br><span style="color:#94a3b8;font-size:11px;">#5 / &le;16mm</span></td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td><td>4d<sub>b</sub> (2d<sub>b</sub>)</td></tr>'
    + '            <tr><td>D19 ~ D25<br><span style="color:#94a3b8;font-size:11px;">#6~8 / 20~25mm</span></td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>6d<sub>b</sub> (3d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td><td>7d<sub>b</sub> (3.5d<sub>b</sub>)</td></tr>'
    + '          </tbody>'
    + '        </table></div>'
    + '      </div>'
    + '      <div style="font-size:12px;color:#64748b;line-height:1.7;padding:2px 4px;">'
    + '        &bull; Values are the minimum inside bend <b>diameter</b>; the value in parenthesis is the <b>radius</b> (diameter / 2).<br>'
    + '        &bull; ACI-based codes (KDS 14 20 50 &middot; AASHTO) vary by bar size; Eurocode-based codes (KDS 24 14 21 &middot; EN 1992-1-1) use &le;16 / &gt;16 mm diameter.<br>'
    + '        &bull; US (#) and EU (mm) designations are approximate references only.<br>'
    + '        &bull; Eurocode / bridge values are mandrel diameters to avoid bar damage (EN 1992 Table 8.1N); larger mandrels may be required when checking concrete bearing inside the bend.'
    + '      </div>'
    + '    </div>'

    /* ── CODE : REBAR ANCHORAGE / SPLICE ── */
    + '    <div class="page-view" id="page-rebarleng">'
    + '      <style>'
    + '        #mount-rebarleng .rl-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px 16px;padding:9px 0;border-bottom:1px solid #f1f5f9;}'
    + '        #mount-rebarleng .rl-row:last-child{border-bottom:none;}'
    + '        #mount-rebarleng .rl-lbl{font-size:12px;font-weight:600;color:#0f172a;min-width:190px;}'
    + '        #mount-rebarleng .rl-opts{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;}'
    + '        #mount-rebarleng .rl-opts label{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:500;color:#334155;cursor:pointer;margin:0;}'
    + '        #mount-rebarleng .rl-opts input[type=radio]{accent-color:#2563eb;width:15px;height:15px;cursor:pointer;margin:0;}'
    + '        #mount-rebarleng .rl-opts input[type=number],#mount-rebarleng .rl-opts input:not([type]){width:80px;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:12.5px;}'
    + '        #mount-rebarleng .rl-sec-title{font-size:12px;font-weight:700;color:#2563eb;margin:16px 0 6px;}'
    + '        #mount-rebarleng .rl-hint{color:#94a3b8;font-size:12px;}'
    + '        #mount-rebarleng .rl-readonly{display:flex;align-items:center;gap:8px;}'
    + '        #mount-rebarleng .fctk-val{font-weight:700;color:#2563eb;font-size:13.5px;}'
    + '      </style>'
    + '      <h1 class="page-heading">Rebar Anchorage / Splice Length</h1>'
    + '      <div class="breadcrumb"><a href="#">Home</a> / <a href="#">Code</a> / <span>Anchorage / Splice</span></div>'
    + '      <div id="mount-rebarleng"></div>'
    + '    </div>'

    /* ── DRAWING PAGES ── */
    + '    <div class="page-view" id="page-draw-hsection"><h1 class="page-heading">H Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>H Section</span></div><div id="mount-draw-hsection"></div></div>'
    + '    <div class="page-view" id="page-draw-channel"><h1 class="page-heading">Channel Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Channel</span></div><div id="mount-draw-channel"></div></div>'
    + '    <div class="page-view" id="page-draw-ibeam"><h1 class="page-heading">I Beam Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>I Beam</span></div><div id="mount-draw-ibeam"></div></div>'
    + '    <div class="page-view" id="page-draw-liftinglug"><h1 class="page-heading">Lifting Lug Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Lifting Lug</span></div><div id="mount-draw-liftinglug"></div></div>'
    + '    <div class="page-view" id="page-draw-rect"><h1 class="page-heading">Rect Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Rect</span></div><div id="mount-draw-rect"></div></div>'
    + '    <div class="page-view" id="page-draw-box1cell"><h1 class="page-heading">BOX 1-Cell Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>BOX1CELL</span></div><div id="mount-draw-box1cell"></div></div>'
    + '    <div class="page-view" id="page-draw-circle"><h1 class="page-heading">Circle Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Circle</span></div><div id="mount-draw-circle"></div></div>'
    + '    <div class="page-view" id="page-draw-octagon"><h1 class="page-heading">Octagon Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Octagon</span></div><div id="mount-draw-octagon"></div></div>'
    + '    <div class="page-view" id="page-draw-track"><h1 class="page-heading">Track Section Drawing</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Drawings</a> / <span>Track</span></div><div id="mount-draw-track"></div></div>'
    + '    <div class="page-view" id="page-draw-gravitywall"><h1 class="page-heading">Gravity Wall Layout</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Retaining Wall</a> / <span>Gravity Wall</span></div><div id="mount-draw-gravitywall"></div></div>'
    + '    <div class="page-view" id="page-draw-invtwall"><h1 class="page-heading">Inverted-T Wall Layout</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Retaining Wall</a> / <span>Inverted-T Wall</span></div><div id="mount-draw-invtwall"></div></div>'
    + '    <div class="page-view" id="page-draw-lwall"><h1 class="page-heading">L-shaped Wall Layout</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">Retaining Wall</a> / <span>L-shaped Wall</span></div><div id="mount-draw-lwall"></div></div>'
    + '    <div class="page-view" id="page-draw-pier"><h1 class="page-heading">Pier Input</h1><div class="breadcrumb"><a href="#">Home</a> / <span>Pier</span></div><div id="mount-draw-pier"></div></div>'
    + '    <div class="page-view" id="page-draw-plate3d"><h1 class="page-heading">PLATE3D</h1><div class="breadcrumb"><a href="#">Home</a> / <span>PLATE3D</span></div><div id="mount-draw-plate3d"></div></div>'
    + '    <div class="page-view" id="page-quick-simpleconn"><h1 class="page-heading">Simple connector</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">MacroPLATE3D</a> / <span>Simple connector</span></div><div id="mount-quick-simpleconn"></div></div>'
    + '    <div class="page-view" id="page-beam-formula"><h1 class="page-heading">SimpleBEAM</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">MacroBEAM</a> / <span>SimpleBEAM</span></div><div id="mount-beam-formula"></div></div>'
    + '    <div class="page-view" id="page-beam-multi"><h1 class="page-heading">MultiBEAM</h1><div class="breadcrumb"><a href="#">Home</a> / <a href="#">MacroBEAM</a> / <span>MultiBEAM</span></div><div id="mount-beam-multi"></div></div>'
    + '    <div class="page-view" id="page-qna"><h1 class="page-heading">QnA Board</h1><div class="breadcrumb"><a href="#">Home</a> / <span>QnA</span></div><div id="mount-qna"></div></div>'

    + '  </div>'
    + '</div>';

    var root = document.getElementById('app-root');
    root.style.cssText = 'display:flex;flex:1;height:100%;min-height:0;gap:16px;overflow:hidden;';
    root.innerHTML = html;

    _createTemplates();
    _bindNavigation();
    loadRecentUpdates();
}

/* ══ TEMPLATES ══ */
function _createTemplates() {
    var root = document.getElementById('app-root');

    /* ── HSECTION ── */
    _addTemplate(root, 'tpl-draw-hsection',
        '<style>'
      + '.hs-root{--dim:#2563eb;--muted:#64748b;--line:#cbd5e1;--hair:#e2e8f0;--panel:#fff;--chip:#f1f5f9;--ink:#182430;color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;}'
      + '.hs-root *{box-sizing:border-box}'
      + '.hs-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}'
      + '@media(max-width:900px){.hs-grid{grid-template-columns:1fr}}'
      + '.hs-card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}'
      + '.hs-hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid var(--hair);background:var(--chip)}'
      + '.hs-ttl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--muted)}'
      + '.hs-inputs{padding:14px}'
      + '.hs-inrow{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--hair)}'
      + '.hs-inrow:last-child{border-bottom:0}'
      + '.hs-inrow label{font-size:13px;display:flex;align-items:baseline;gap:8px;margin:0}'
      + '.hs-inrow .var{font-weight:600;color:var(--dim);min-width:40px;display:inline-block;font-family:ui-monospace,Menlo,Consolas,monospace}'
      + '.hs-inrow .desc{color:var(--muted);font-size:12px}'
      + '.hs-inrow input{width:120px;text-align:right;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);font-size:13px}'
      + '.hs-inrow input:focus{outline:2px solid var(--dim);outline-offset:1px;border-color:var(--dim)}'
      + '.hs-unit{color:var(--muted);font-size:11px;margin-left:6px}'
      + '.hs-btn{font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--dim);border:1px solid var(--dim);border-radius:6px;padding:5px 12px;cursor:pointer}'
      + '.hs-btn:hover{filter:brightness(1.1)}'
      + '.hs-vbtn{padding:5px 10px;border:1px solid #cbd5e1;background:#eef2f6;color:#475569;cursor:pointer;border-radius:6px;font-size:11px;font-weight:700}'
      + '.hs-batch-wrap{padding:0 0 10px;margin-bottom:8px;border-bottom:1px dashed var(--hair)}'
      + '.hs-batch-lbl{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}'
      + '.hs-batch-hint{font-weight:400;text-transform:none;letter-spacing:0;color:var(--dim);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px}'
      + '.hs-batch{width:100%;resize:none;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}'
      + '.hs-plot #hsecplot{width:100%}'
      + '</style>'
      + '<div class="hs-root"><div class="hs-grid">'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
      + '      <span id="hsec-viewbar" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">'
      + '        <button type="button" class="hs-vbtn" data-hview="front" onclick="hsec_setview(\'front\')" style="background:#2563eb;color:#fff;border-color:#2563eb;">Front</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="back" onclick="hsec_setview(\'back\')">Back</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="left" onclick="hsec_setview(\'left\')">Left</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="center" onclick="hsec_setview(\'center\')">Center</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="right" onclick="hsec_setview(\'right\')">Right</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="top" onclick="hsec_setview(\'top\')">Top</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="bottom" onclick="hsec_setview(\'bottom\')">Bottom</button>'
      + '        <button type="button" class="hs-vbtn" data-hview="3d" onclick="hsec_setview(\'3d\')">3D</button>'
      + '        <button type="button" class="hs-btn" onclick="fdraw_hsection()"><i class="bi bi-arrow-repeat"></i> Regen</button>'
      + '      </span></div>'
      + '    <div class="hs-plot"><div id="hsecplot"></div></div>'
      + '  </div>'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input &mdash; live redraw on edit</span>'
      + '      <button type="button" class="hs-btn" onclick="odxf_hsec.download(\'Hsection.dxf\')">DXF out</button></div>'
      + '    <div class="hs-inputs">'
      + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">line1: H,Bt,Bb,tw,tft,tfb,R &nbsp;/&nbsp; line2: L</span></div>'
      + '        <textarea class="hs-batch" id="sUserText" rows="2" spellcheck="false" onchange="putParams_hsection(\'sUserText\'); fdraw_hsection();">300,300,300,10,15,15,19\n500</textarea></div>'
      + '      <div class="hs-inrow"><label><span class="var">H</span><span class="desc">Section height</span></label><span><input type="number" id="dsech" value="300" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">Bt</span><span class="desc">Top flange width</span></label><span><input type="number" id="dbt" value="300" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">Bb</span><span class="desc">Bottom flange width</span></label><span><input type="number" id="dbb" value="300" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">tw</span><span class="desc">Web thickness</span></label><span><input type="number" id="dtw" value="10" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">tft</span><span class="desc">Top flange thickness</span></label><span><input type="number" id="dttf" value="15" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">tbf</span><span class="desc">Bottom flange thickness</span></label><span><input type="number" id="dtbf" value="15" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">R</span><span class="desc">Fillet radius (0 = none)</span></label><span><input type="number" id="dradius" value="19" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">L</span><span class="desc">Beam length</span></label><span><input type="number" id="dseg_leng" value="500" onchange="fdraw_hsection()"><span class="hs-unit">mm</span></span></div>'
      + '    </div>'
      + '  </div>'
      + '</div></div>'
    );

    /* ── CHANNEL ── */
    _addTemplate(root, 'tpl-draw-channel',
        '<style>'
      + '.hs-root{--dim:#2563eb;--muted:#64748b;--line:#cbd5e1;--hair:#e2e8f0;--panel:#fff;--chip:#f1f5f9;--ink:#182430;color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;}'
      + '.hs-root *{box-sizing:border-box}'
      + '.hs-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}'
      + '@media(max-width:900px){.hs-grid{grid-template-columns:1fr}}'
      + '.hs-card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}'
      + '.hs-hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid var(--hair);background:var(--chip)}'
      + '.hs-ttl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--muted)}'
      + '.hs-inputs{padding:14px}'
      + '.hs-inrow{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--hair)}'
      + '.hs-inrow:last-child{border-bottom:0}'
      + '.hs-inrow label{font-size:13px;display:flex;align-items:baseline;gap:8px;margin:0}'
      + '.hs-inrow .var{font-weight:600;color:var(--dim);min-width:40px;display:inline-block;font-family:ui-monospace,Menlo,Consolas,monospace}'
      + '.hs-inrow .desc{color:var(--muted);font-size:12px}'
      + '.hs-inrow input{width:120px;text-align:right;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);font-size:13px}'
      + '.hs-inrow input:focus{outline:2px solid var(--dim);outline-offset:1px;border-color:var(--dim)}'
      + '.hs-unit{color:var(--muted);font-size:11px;margin-left:6px}'
      + '.hs-btn{font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--dim);border:1px solid var(--dim);border-radius:6px;padding:5px 12px;cursor:pointer}'
      + '.hs-btn:hover{filter:brightness(1.1)}'
      + '.hs-vbtn{padding:5px 10px;border:1px solid #cbd5e1;background:#eef2f6;color:#475569;cursor:pointer;border-radius:6px;font-size:11px;font-weight:700}'
      + '.hs-batch-wrap{padding:0 0 10px;margin-bottom:8px;border-bottom:1px dashed var(--hair)}'
      + '.hs-batch-lbl{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}'
      + '.hs-batch-hint{font-weight:400;text-transform:none;letter-spacing:0;color:var(--dim);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px}'
      + '.hs-batch{width:100%;resize:none;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}'
      + '.hs-plot #channelplot{width:100%}'
      + '</style>'
      + '<div class="hs-root"><div class="hs-grid">'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
      + '      <span id="chan-viewbar" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">'
      + '        <button type="button" class="hs-vbtn" data-cview="front" onclick="chan_setview(\'front\')" style="background:#2563eb;color:#fff;border-color:#2563eb;">Front</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="back" onclick="chan_setview(\'back\')">Back</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="left" onclick="chan_setview(\'left\')">Left</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="center" onclick="chan_setview(\'center\')">Center</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="right" onclick="chan_setview(\'right\')">Right</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="top" onclick="chan_setview(\'top\')">Top</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="bottom" onclick="chan_setview(\'bottom\')">Bottom</button>'
      + '        <button type="button" class="hs-vbtn" data-cview="3d" onclick="chan_setview(\'3d\')">3D</button>'
      + '        <button type="button" class="hs-btn" onclick="fdraw_channel()"><i class="bi bi-arrow-repeat"></i> Regen</button>'
      + '      </span></div>'
      + '    <div class="hs-plot"><div id="channelplot"></div></div>'
      + '  </div>'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input &mdash; live redraw on edit</span>'
      + '      <button type="button" class="hs-btn" onclick="odxf_channel.download(\'Channel.dxf\')">DXF out</button></div>'
      + '    <div class="hs-inputs">'
      + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">line1: H,B,tw,tf,Rw,Rf &nbsp;/&nbsp; line2: L</span></div>'
      + '        <textarea class="hs-batch" id="sUserText" rows="2" spellcheck="false" onchange="putParams_channel(\'sUserText\'); fdraw_channel();">300,90,12,16,19,9.5\n500</textarea></div>'
      + '      <div class="hs-inrow"><label><span class="var">H</span><span class="desc">Section height</span></label><span><input type="number" id="dsech" value="300" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">B</span><span class="desc">Flange width</span></label><span><input type="number" id="db" value="90" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">tw</span><span class="desc">Web thickness</span></label><span><input type="number" id="dtw" value="12" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">tf</span><span class="desc">Flange thickness</span></label><span><input type="number" id="dtf" value="16" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">Rw</span><span class="desc">Inner fillet radius (0 = none)</span></label><span><input type="number" id="drw" value="19" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">Rf</span><span class="desc">Flange-tip fillet radius (0 = none)</span></label><span><input type="number" id="drf" value="9.5" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">L</span><span class="desc">Channel length</span></label><span><input type="number" id="dseg_leng" value="500" onchange="fdraw_channel()"><span class="hs-unit">mm</span></span></div>'
      + '    </div>'
      + '  </div>'
      + '</div></div>'
    );

    /* ── IBEAM ── */
    _addTemplate(root, 'tpl-draw-ibeam', _beTpl({
      name: 'ibeam', plot: 'ibeamplot', bar: 'ibeam-viewbar', dxf: 'IBeam.dxf', guide: 'https://macrobim.github.io/macroBIM/ibeam_vars.png',
      hint: 'line1: Begin (13) / line2: End (13) / line3: L', brows: 4,
      bdef: '1500,1235,985,85,45,135,140,160,50,200,100,50,20\n1500,1235,985,85,45,135,140,160,50,200,100,50,20\n500', len: 500,
      rows: [['h', 'Section height', 'dh', 1500, 1500], ['bt', 'Top flange width', 'dbt', 1235, 1235], ['bb', 'Bottom flange width', 'dbb', 985, 985],
        ['ttf', 'Top flange thick', 'dttf', 85, 85], ['ttf1', 'Top flange taper', 'dttf1', 45, 45], ['tbf', 'Bottom flange thick', 'dtbf', 135, 135], ['tbf1', 'Bottom flange taper', 'dtbf1', 140, 140],
        ['tw', 'Web thickness', 'dtw', 160, 160], ['rtf', 'Top fillet R', 'drtf', 50, 50], ['rwt', 'Upper web fillet R', 'drwt', 200, 200], ['rwb', 'Lower web fillet R', 'drwb', 100, 100],
        ['rbf', 'Bottom fillet R', 'drbf', 50, 50], ['chb', 'Chamfer', 'dchb', 20, 20]]
    }));

    /* ── LIFTING LUG ── */
    _addTemplate(root, 'tpl-draw-liftinglug', _HSCSS()
      + '<div class="hs-root"><div class="hs-grid">'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
      + '      <span id="lug-viewbar" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">'
      + '        <button type="button" class="hs-vbtn" data-sview="front" onclick="lug_setview(\'front\')" style="background:#2563eb;color:#fff;border-color:#2563eb;">Front</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="back" onclick="lug_setview(\'back\')">Back</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="left" onclick="lug_setview(\'left\')">Left</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="center" onclick="lug_setview(\'center\')">Center</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="right" onclick="lug_setview(\'right\')">Right</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="top" onclick="lug_setview(\'top\')">Top</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="bottom" onclick="lug_setview(\'bottom\')">Bottom</button>'
      + '        <button type="button" class="hs-vbtn" data-sview="3d" onclick="lug_setview(\'3d\')">3D</button>'
      + '        <button type="button" class="hs-btn" onclick="fdraw_liftinglug()"><i class="bi bi-arrow-repeat"></i> Regen</button>'
      + '      </span></div>'
      + '    <div class="hs-plot"><div id="liftinglugplot"></div></div>'
      + '  </div>'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input &mdash; live redraw on edit</span>'
      + '      <button type="button" class="hs-btn" onclick="odxf_lug.download(\'LiftingLug.dxf\')">DXF out</button></div>'
      + '    <div class="hs-inputs">'
      + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">lugW,lugH,baseH,outerR,innerR,padeyeR,lugT,padeyeT</span></div>'
      + '        <textarea class="hs-batch" id="sUserText" rows="2" spellcheck="false" onchange="putParams_liftinglug(\'sUserText\'); fdraw_liftinglug();">120,120,30,40,10,30,20,30</textarea></div>'
      + '      <div class="hs-inrow"><label><span class="var">lugW</span><span class="desc">Lug width</span></label><span><input type="number" id="lugW" value="120" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">lugH</span><span class="desc">Lug height</span></label><span><input type="number" id="lugH" value="120" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">baseH</span><span class="desc">Base straight height</span></label><span><input type="number" id="baseH" value="30" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">outerR</span><span class="desc">Outer arc radius</span></label><span><input type="number" id="outerR" value="40" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">innerR</span><span class="desc">Hole radius</span></label><span><input type="number" id="innerR" value="10" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">padeyeR</span><span class="desc">Padeye radius</span></label><span><input type="number" id="padeyeR" value="30" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">lugT</span><span class="desc">Lug plate thickness</span></label><span><input type="number" id="lugT" value="20" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">padeyeT</span><span class="desc">Padeye plate thickness</span></label><span><input type="number" id="padeyeT" value="30" onchange="fdraw_liftinglug()"><span class="hs-unit">mm</span></span></div>'
      + '    </div>'
      + '  </div>'
      + '</div></div>'
    );

    /* ── BOX1CELL ── */
    _addTemplate(root, 'tpl-draw-box1cell', _beTpl({
      name: 'box1cell', plot: 'box1cellplot', bar: 'box1cell-viewbar', dxf: 'Box1Cell.dxf', guide: 'https://macrobim.github.io/macroBIM/box1cell_vars.png',
      hint: 'line1: Begin (23) / line2: End (23) / line3: L', brows: 5,
      bdef: '6600,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3\n8000,12000,6000,1500,1500,1500,300,300,600,600,300,300,840,500,200,200,100,300,200,400,-2,5,3\n5000', len: 5000,
      rows: [['h', 'Section height', 'dh', 6600, 8000], ['bt', 'Top slab width', 'dbt', 12000, 12000], ['bb', 'Bottom slab width', 'dbb', 6000, 6000],
        ['btsh', 'Top slab haunch', 'dbth', 1500, 1500], ['bcanh', 'Cantilever haunch', 'dbch', 1500, 1500], ['bcan', 'Cantilever', 'dbc', 1500, 1500],
        ['t1', 'Slab t1', 'dt1', 300, 300], ['t2', 'Slab t2', 'dt2', 300, 300], ['t3', 'Slab t3', 'dt3', 600, 600], ['t4', 'Slab t4', 'dt4', 600, 600], ['t5', 'Slab t5', 'dt5', 300, 300], ['t6', 'Slab t6', 'dt6', 300, 300],
        ['tb', 'Bottom slab thick', 'dtb', 840, 840], ['tw', 'Web thickness', 'dtw', 500, 500], ['bh', 'Bottom haunch', 'dbbh', 200, 200], ['vh1', 'Void haunch 1', 'dbh1', 200, 200], ['vh2', 'Void haunch 2', 'dbh2', 100, 100],
        ['rwt', 'Web-top fillet R', 'drwt', 300, 300], ['rwtin', 'Web-top inner R', 'drwtin', 200, 200], ['rb', 'Bottom fillet R', 'drb', 400, 400],
        ['sl_tl', 'Top-left slope %', 'dsltl', -2, -2], ['sl_tr', 'Top-right slope %', 'dsltr', 5, 5], ['sl_b', 'Bottom slope %', 'dslb', 3, 3]]
    }));

    /* ── TAPERED BEGIN/END SECTIONS (rect / circle / track / octagon) ──
       Retaining-wall style: left Layout card (header view buttons + SVG plot),
       right Dimension Input card with Front/Back columns. Rendering is provided
       by bim_section_test.js (window.makeSectionTest), loaded on demand. */
    var HSCSS = _HSCSS();

    function _sectDrawTpl(o) {
      var setview = o.name + '_setview', fdraw = 'fdraw_' + o.name, odxf = 'odxf_' + o.name, putp = 'putParams_' + o.name;
      function vb(v, label, active) { return '<button type="button" class="hs-vbtn" data-sview="' + v + '" onclick="' + setview + '(\'' + v + '\')"' + (active ? ' style="background:#2563eb;color:#fff;border-color:#2563eb;"' : '') + '>' + label + '</button>'; }
      var buttons = vb('front', 'Front', true) + vb('back', 'Back') + vb('left', 'Left') + vb('center', 'Center') + vb('right', 'Right') + vb('top', 'Top') + vb('bottom', 'Bottom') + vb('3d', '3D')
        + '<button type="button" class="hs-btn" onclick="' + fdraw + '()"><i class="bi bi-arrow-repeat"></i> Regen</button>';
      var rows = o.rows.map(function (r) {
        return '<div class="hs-inrow be"><label><span class="var">' + r[0] + '</span><span class="desc">' + r[1] + '</span></label>'
          + '<input type="number" id="' + r[2] + '_s" value="' + r[3] + '" onchange="' + fdraw + '()">'
          + '<input type="number" id="' + r[2] + '_e" value="' + r[4] + '" onchange="' + fdraw + '()"></div>';
      }).join('');
      return HSCSS
        + '<div class="hs-root"><div class="hs-grid">'
        + '  <div class="hs-card">'
        + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
        + '      <span id="' + o.bar + '" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">' + buttons + '</span></div>'
        + '    <div class="hs-plot"><div id="' + o.plot + '"></div></div>'
        + '  </div>'
        + '  <div class="hs-card">'
        + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input &mdash; Front / Back</span>'
        + '      <button type="button" class="hs-btn" onclick="' + odxf + '.download(\'' + o.dxf + '\')">DXF out</button></div>'
        + '    <div class="hs-inputs">'
        + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">' + o.hint + '</span></div>'
        + '        <textarea class="hs-batch" id="sUserText" rows="' + o.brows + '" spellcheck="false" onchange="' + putp + '(\'sUserText\'); ' + fdraw + '();">' + o.bdef + '</textarea></div>'
        + '      <div class="hs-behd"><span>Variable</span><span class="c">Front</span><span class="c">Back</span></div>'
        + rows
        + '      <div class="hs-inrow"><label><span class="var">L</span><span class="desc">Segment length</span></label><span><input type="number" id="dseg_leng" value="' + o.len + '" onchange="' + fdraw + '()"><span class="hs-unit">mm</span></span></div>'
        + '      <div class="hs-inrow"><label><span class="var">Hollow</span><span class="desc">Hollow section</span></label><span><input type="checkbox" id="' + o.hollow + '" checked onchange="' + fdraw + '()" style="width:16px;height:16px;accent-color:#2563eb;vertical-align:middle;"></span></div>'
        + '    </div>'
        + '  </div>'
        + '</div></div>';
    }

    /* ── Cross-section preview builds (bim_xsect_test.js, window.XSECT) ── */
    _addTemplate(root, 'tpl-draw-rect', _xsectTpl({ name: 'rect', rows: [
      ['H', 'Outer height', 800], ['B', 'Outer width', 600],
      ['twl', 'Wall thickness left', 120], ['twr', 'Wall thickness right', 120],
      ['tf1', 'Top flange thickness', 120], ['tf2', 'Bottom flange thickness', 120],
      ['ha', 'Inner haunch (horizontal)', 150], ['hb', 'Inner haunch (vertical)', 150] ] }));

    _addTemplate(root, 'tpl-draw-circle', _xsectTpl({ name: 'circle', rows: [
      ['D', 'Outer diameter', 800], ['tw', 'Wall thickness', 120] ] }));

    _addTemplate(root, 'tpl-draw-octagon', _xsectTpl({ name: 'octagon', rows: [
      ['H', 'Outer height', 800], ['B', 'Outer width', 1000],
      ['a', 'Chamfer width (horiz)', 200], ['b', 'Chamfer height (vert)', 200],
      ['t', 'Wall thickness', 120] ] }));

    _addTemplate(root, 'tpl-draw-track', _xsectTpl({ name: 'track', rows: [
      ['H', 'Outer height', 800], ['B', 'Outer width', 1400],
      ['R', 'Corner radius', 400], ['t', 'Wall thickness', 120] ] }));
}

/* Cross-section preview template (single hollow section on the shared draw core).
   o = { name, rows:[[var,desc,default],...], hollowDefault? } */
function _xsectTpl(o) {
    var fdraw = 'fdraw_' + o.name, plot = 'xs_' + o.name + '_plot';
    var rows = o.rows.map(function (r) {
      return '<div class="hs-inrow"><label><span class="var">' + r[0] + '</span><span class="desc">' + r[1] + '</span></label>'
        + '<span><input type="number" id="xs_' + o.name + '_' + r[0] + '" value="' + r[2] + '" onchange="' + fdraw + '()"><span class="hs-unit">mm</span></span></div>';
    }).join('');
    var bhint = o.rows.map(function (r) { return r[0]; }).join(',') + ',hollow';
    var bdef = o.rows.map(function (r) { return r[2]; }).join(',') + ',1';
    var setview = o.name + '_setview';
    function vb(v, label, active) { return '<button type="button" class="hs-vbtn" data-sview="' + v + '" onclick="' + setview + '(\'' + v + '\')"' + (active ? ' style="background:#2563eb;color:#fff;border-color:#2563eb;"' : '') + '>' + label + '</button>'; }
    var vbar = vb('front', 'Front', true) + vb('back', 'Back') + vb('left', 'Left') + vb('center', 'Center') + vb('right', 'Right') + vb('top', 'Top') + vb('bottom', 'Bottom') + vb('3d', '3D')
      + '<button type="button" class="hs-btn" onclick="' + fdraw + '()"><i class="bi bi-arrow-repeat"></i> Regen</button>';
    return _HSCSS()
      + '<div class="hs-root"><div class="hs-grid">'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
      + '      <span id="' + o.name + '-viewbar" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">' + vbar + '</span></div>'
      + '    <div class="hs-plot"><div id="' + plot + '"></div></div>'
      + '  </div>'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input</span>'
      + '      <button type="button" class="hs-btn" onclick="if(window.XSECT)window.XSECT.dxf(\'' + o.name + '\')">DXF out</button></div>'
      + '    <div class="hs-inputs">'
      + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">' + bhint + '</span></div>'
      + '        <textarea class="hs-batch" id="xs_' + o.name + '_batch" rows="1" spellcheck="false" onchange="if(window.XSECT)window.XSECT.applyBatch(\'' + o.name + '\');">' + bdef + '</textarea></div>'
      + rows
      + '      <div class="hs-inrow"><label><span class="var">L</span><span class="desc">Segment length</span></label><span><input type="number" id="xs_' + o.name + '_L" value="3000" onchange="' + fdraw + '()"><span class="hs-unit">mm</span></span></div>'
      + '      <div class="hs-inrow"><label><span class="var">Hollow</span><span class="desc">Hollow section</span></label><span><input type="checkbox" id="xs_' + o.name + '_hollow" ' + (o.hollowDefault === false ? '' : 'checked') + ' onchange="' + fdraw + '()" style="width:16px;height:16px;accent-color:#2563eb;vertical-align:middle;"></span></div>'
      + '    </div>'
      + '  </div>'
      + '</div></div>';
}

function _HSCSS() {
    return '<style>'
      + '.hs-root{--dim:#2563eb;--muted:#64748b;--line:#cbd5e1;--hair:#e2e8f0;--panel:#fff;--chip:#f1f5f9;--ink:#182430;color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;}'
      + '.hs-root *{box-sizing:border-box}'
      + '.hs-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}'
      + '@media(max-width:900px){.hs-grid{grid-template-columns:1fr}}'
      + '.hs-card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}'
      + '.hs-hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid var(--hair);background:var(--chip)}'
      + '.hs-ttl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--muted)}'
      + '.hs-inputs{padding:14px}'
      + '.hs-inrow{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--hair)}'
      + '.hs-inrow:last-child{border-bottom:0}'
      + '.hs-inrow label{font-size:13px;display:flex;align-items:baseline;gap:8px;margin:0}'
      + '.hs-inrow .var{font-weight:600;color:var(--dim);min-width:40px;display:inline-block;font-family:ui-monospace,Menlo,Consolas,monospace}'
      + '.hs-inrow .desc{color:var(--muted);font-size:12px}'
      + '.hs-inrow input{width:120px;text-align:right;padding:5px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);font-size:13px}'
      + '.hs-inrow input:focus{outline:2px solid var(--dim);outline-offset:1px;border-color:var(--dim)}'
      + '.hs-inrow.be{grid-template-columns:1fr 92px 92px}'
      + '.hs-inrow.be input{width:100%}'
      + '.hs-behd{display:grid;grid-template-columns:1fr 92px 92px;gap:8px;padding:2px 0 6px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border-bottom:1px dashed var(--hair);margin-bottom:4px}'
      + '.hs-behd .c{text-align:right}'
      + '.hs-unit{color:var(--muted);font-size:11px;margin-left:6px}'
      + '.hs-btn{font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--dim);border:1px solid var(--dim);border-radius:6px;padding:5px 12px;cursor:pointer}'
      + '.hs-btn:hover{filter:brightness(1.1)}'
      + '.hs-vbtn{padding:5px 10px;border:1px solid #cbd5e1;background:#eef2f6;color:#475569;cursor:pointer;border-radius:6px;font-size:11px;font-weight:700}'
      + '.hs-batch-wrap{padding:0 0 10px;margin-bottom:8px;border-bottom:1px dashed var(--hair)}'
      + '.hs-batch-lbl{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}'
      + '.hs-batch-hint{font-weight:400;text-transform:none;letter-spacing:0;color:var(--dim);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px}'
      + '.hs-batch{width:100%;resize:none;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}'
      + '.hs-plot > div{width:100%}'
      + '</style>';
}

// Begin/End drawing template builder (retaining-wall style), used by ibeam & box1cell.
// o = { name, plot, bar, dxf, hint, brows, bdef, len, rows:[[var,desc,idBase,vFront,vBack],...], guide? }
function _beTpl(o) {
    var setview = o.name + '_setview', fdraw = 'fdraw_' + o.name, odxf = 'odxf_' + o.name, putp = 'putParams_' + o.name;
    function vb(v, label, active) { return '<button type="button" class="hs-vbtn" data-sview="' + v + '" onclick="' + setview + '(\'' + v + '\')"' + (active ? ' style="background:#2563eb;color:#fff;border-color:#2563eb;"' : '') + '>' + label + '</button>'; }
    var buttons = vb('front', 'Front', true) + vb('back', 'Back') + vb('left', 'Left') + vb('center', 'Center') + vb('right', 'Right') + vb('top', 'Top') + vb('bottom', 'Bottom') + vb('3d', '3D')
      + '<button type="button" class="hs-btn" onclick="' + fdraw + '()"><i class="bi bi-arrow-repeat"></i> Regen</button>';
    var rows = o.rows.map(function (r) {
      return '<div class="hs-inrow be"><label><span class="var">' + r[0] + '</span><span class="desc">' + r[1] + '</span></label>'
        + '<input type="number" id="' + r[2] + '_s" value="' + r[3] + '" onchange="' + fdraw + '()">'
        + '<input type="number" id="' + r[2] + '_e" value="' + r[4] + '" onchange="' + fdraw + '()"></div>';
    }).join('');
    return _HSCSS()
      + '<div class="hs-root"><div class="hs-grid">'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Layout</span>'
      + '      <span id="' + o.bar + '" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">' + buttons + '</span></div>'
      + '    <div class="hs-plot"><div id="' + o.plot + '"></div></div>'
      + '  </div>'
      + '  <div class="hs-card">'
      + '    <div class="hs-hd"><span class="hs-ttl">Dimension Input &mdash; Front / Back</span>'
      + '      <span style="display:flex;gap:6px;align-items:center;">'
      + (o.guide ? '<button type="button" class="hs-vbtn" onclick="var g=document.getElementById(\'' + o.name + '_guide_img\');g.style.display=(g.style.display===\'none\'?\'block\':\'none\');"><i class="bi bi-image"></i> Guide</button>' : '')
      + '        <button type="button" class="hs-btn" onclick="' + odxf + '.download(\'' + o.dxf + '\')">DXF out</button></span></div>'
      + (o.guide ? '<div id="' + o.name + '_guide_img" style="display:none;padding:10px;background:#f8f9fa;border-bottom:1px solid var(--hair);text-align:center;"><img src="' + o.guide + '" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:6px;"></div>' : '')
      + '    <div class="hs-inputs">'
      + '      <div class="hs-batch-wrap"><div class="hs-batch-lbl">Batch Input (CSV) <span class="hs-batch-hint">' + o.hint + '</span></div>'
      + '        <textarea class="hs-batch" id="sUserText" rows="' + o.brows + '" spellcheck="false" onchange="' + putp + '(\'sUserText\'); ' + fdraw + '();">' + o.bdef + '</textarea></div>'
      + '      <div class="hs-behd"><span>Variable</span><span class="c">Front</span><span class="c">Back</span></div>'
      + rows
      + '      <div class="hs-inrow"><label><span class="var">L</span><span class="desc">Segment length</span></label><span><input type="number" id="dseg_leng" value="' + o.len + '" onchange="' + fdraw + '()"><span class="hs-unit">mm</span></span></div>'
      + '    </div>'
      + '  </div>'
      + '</div></div>';
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

        // PLATE3D runs in an iframe that mountDrawing does not touch, so it has to
        // be dropped by hand on the way out. Leaving the page throws away whatever
        // sheet was loaded; coming back rebuilds the frame on its built-in model.
        if (pageId !== 'draw-plate3d') {
            var pm = document.getElementById('mount-draw-plate3d');
            if (pm && pm.firstElementChild) pm.innerHTML = '';
        }
        // Simple connector carries an iframe of its own, and the same reasoning
        // applies: drop it on the way out so a model does not follow you around.
        if (pageId !== 'quick-simpleconn') {
            var qm = document.getElementById('mount-quick-simpleconn');
            if (qm && qm.firstElementChild) qm.innerHTML = '';
        }

        if (pageId === 'rebar' && !window._rebarLoaded) { loadRebarTables(); window._rebarLoaded = true; }
        if (pageId === 'strength' && !window._strengthLoaded) { loadStrengthTables(); window._strengthLoaded = true; }
        if (pageId === 'rebarleng' && !window._rebarLengLoaded) {
            if (typeof mod_rebar_leng !== 'undefined') { mod_rebar_leng.init('mount-rebarleng'); window._rebarLengLoaded = true; }
            else { document.getElementById('mount-rebarleng').innerHTML = '<p style="color:#b91c1c;padding:16px;">mod_rebar_leng.js / mod_rebar.js / mod_concrete.js 스크립트가 로드되지 않았습니다.</p>'; }
        }
        if (pageId === 'steel' && !window._steelLoaded) { selectSection('hsection'); window._steelLoaded = true; }
        if (pageId === 'draw-hsection') { mountDrawing('hsection'); ensureHsectionTest(function(){ if (typeof fdraw_hsection === 'function') fdraw_hsection(); }); }
        if (pageId === 'draw-channel') { mountDrawing('channel'); ensureChannelTest(function(){ if (typeof fdraw_channel === 'function') fdraw_channel(); }); }
        if (pageId === 'draw-ibeam') { mountDrawing('ibeam'); ensureIbeamTest(function(){ if (typeof fdraw_ibeam === 'function') fdraw_ibeam(); }); }
        if (pageId === 'draw-liftinglug') { mountDrawing('liftinglug'); ensureLugTest(function(){ if (typeof fdraw_liftinglug === 'function') fdraw_liftinglug(); }); }
        if (pageId === 'draw-box1cell') { mountDrawing('box1cell'); ensureBox1cellTest(function(){ if (typeof fdraw_box1cell === 'function') fdraw_box1cell(); }); }
        if (pageId === 'draw-rect') { mountDrawing('rect'); ensureXsect('rect'); }
        if (pageId === 'draw-circle') { mountDrawing('circle'); ensureXsect('circle'); }
        if (pageId === 'draw-octagon') { mountDrawing('octagon'); ensureXsect('octagon'); }
        if (pageId === 'draw-track') { mountDrawing('track'); ensureXsect('track'); }
        if (pageId === 'draw-gravitywall') { mountDrawing('gravitywall'); ensureGravityWall(); }
        if (pageId === 'draw-invtwall') { mountDrawing('invtwall'); ensureInvtWall(); }
        if (pageId === 'draw-lwall') { mountDrawing('lwall'); ensureLWall(); }
        if (pageId === 'draw-pier') { mountDrawing('pier'); ensurePier(); }
        if (pageId === 'draw-plate3d') { ensurePlate3d(); }
        if (pageId === 'quick-simpleconn') { ensureQuickSimpleConn(); }
        if (pageId === 'beam-formula') { ensureBeamFormula(); }
        if (pageId === 'beam-multi') { ensureBeamMulti(); }
        if (pageId === 'qna') { ensureQna(); }
    }
    window.showPage = showPage;

    /* 이미 보고 있는 메뉴를 다시 누르면 "이 화면을 처음부터" 라는 뜻이다.
       PLATE3D 에 시트를 하나 올려놓고 처음 화면으로 돌아가려면 지금까지는
       브라우저를 새로 고치는 수밖에 없었다.

       페이지별 초기화 코드는 없다. 여기 있는 페이지는 전부 mount 요소 안에
       지어지고, 그 빌더들은 mount 가 비어 있을 때만(또는 "이미 지었다" 플래그가
       내려가 있을 때만) 짓는다 — showPage 가 페이지를 떠날 때와 들어올 때
       쓰는 그 두 짝이다. 그래서 초기화는 "내용을 버리고, 플래그를 내리고,
       showPage 에게 다시 짓게 한다" 하나면 된다. 나중에 페이지가 늘어도
       "이미 지었다"를 기억하는 제3의 방법을 새로 만들지만 않으면 여기 손댈
       것이 없다. */
    var PAGE_BUILT_FLAG = {
        rebar: '_rebarLoaded', strength: '_strengthLoaded',
        steel: '_steelLoaded', rebarleng: '_rebarLengLoaded'
    };
    function resetPage(pageId) {
        var m = document.getElementById('mount-' + pageId);
        if (m) m.innerHTML = '';
        var f = PAGE_BUILT_FLAG[pageId];
        if (f) window[f] = false;
        delete pageTouched[pageId];
    }

    /* 다시 누르면 화면이 버려진다. 그러니 버릴 게 있을 때만 묻는다.

       어느 페이지에서 물을지를 목록으로 박아두지 않는다. 목록은 페이지가
       늘 때마다 손으로 고쳐야 하고, 고치는 걸 잊으면 새 페이지가 조용히
       아무것도 안 묻는 쪽으로 떨어진다. 대신 규칙 두 개로 본다:

         · 그 페이지 입력칸을 한 번이라도 건드렸다 — 사람이 적어 넣은 것이
           있다는 뜻이다
         · mount 안에 iframe 이 있다 — PLATE3D 와 Simple connector 다.
           안에 무엇이 들어 있는지 밖에서 볼 수 없으므로 있다고 본다

       그래서 표(Rebar·Steel·Strength·Bend Radius)와 Home 은 묻지 않는다.
       읽기만 하는 화면이라 버릴 것이 없다. 물어볼 일이 없는 곳에서 묻는
       상자는 몇 번 만에 그냥 눌러 넘기는 것이 되고, 그러면 정작 물어야 할
       때도 눌러 넘긴다.

       확인은 브라우저의 confirm 이다. 새 대화상자를 그리면 이 사이트에
       없던 모양이 하나 생기고, 그건 물어보고 정할 일이다. */
    var pageTouched = {};
    document.addEventListener('input', markTouched, true);
    document.addEventListener('change', markTouched, true);
    function markTouched(e) {
        var t = e.target;
        var m = t && t.closest ? t.closest('[id^="mount-"]') : null;
        if (m) pageTouched[m.id.slice(6)] = true;      // 'mount-' 는 여섯 글자
    }
    function hasSomethingToLose(pageId) {
        if (pageTouched[pageId]) return true;
        var m = document.getElementById('mount-' + pageId);
        return !!(m && m.querySelector('iframe'));
    }
    /* 메뉴에서 들어오는 길. 대시보드 카드처럼 다른 곳에서 부르는 showPage 는
       그대로 둔다 — 거기서는 지금 보고 있지 않은 페이지로 가므로 초기화할
       것이 없고, 있다 해도 그건 이동이지 다시 누른 게 아니다. */
    function goPage(pageId) {
        var p = document.getElementById('page-' + pageId);
        if (!(p && p.classList.contains('active'))) { showPage(pageId); return; }
        if (!hasSomethingToLose(pageId)) { resetPage(pageId); showPage(pageId); return; }
        /* 물어보는 동안 아무 일도 일어나지 않는다. 대답이 오고 나서 버린다. */
        MB.confirm({
            title: 'Start this page over?',
            body: 'Whatever is loaded or typed on it will be discarded.',
            ok: 'Start over'
        }).then(function (yes) {
            if (!yes) return;
            resetPage(pageId);
            showPage(pageId);
        });
    }

    function ensureQna() {
        if (typeof QNA !== 'undefined') { QNA.init('mount-qna'); return; }
        if (window._qnaLoading) return;
        window._qnaLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/design/mod_qna.js?v=9';
        sc.onload = function() { window._qnaLoading = false; if (typeof QNA !== 'undefined') QNA.init('mount-qna'); };
        sc.onerror = function() { window._qnaLoading = false; var m = document.getElementById('mount-qna'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">mod_qna.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // Pier input module (bim_pier_test.js) — single-page, single entry fdraw_pier. Load on demand.
    function ensurePier() {
        if (typeof fdraw_pier === 'function') { fdraw_pier('mount-draw-pier'); return; }
        if (window._pierLoading) return;
        window._pierLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_pier_test.js?v=71';
        sc.onload = function () { window._pierLoading = false; if (typeof fdraw_pier === 'function') fdraw_pier('mount-draw-pier'); };
        sc.onerror = function () { window._pierLoading = false; var m = document.getElementById('mount-draw-pier'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">bim_pier_test.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // PLATE3D (plate3d/plate_builder.js) runs in its own document, not as a module
    // on this page: it wants three.js r147 where the page carries r0.128, and its
    // shell is laid out against 100vw/100vh. An iframe gives it both, and keeps
    // its globals off the host page. showPage drops the frame whenever you
    // navigate away, so a sheet you loaded does not follow you around: come back
    // and PLATE3D is on its built-in model again.
    /* MacroPLATE3D — Simple connector. The form and the model live on one page:
       the same PLATE3D iframe as below, driven by values typed here instead of
       a workbook. Loaded on demand like every other module. */
    function ensureQuickSimpleConn() {
        if (typeof fquick_simpleconn === 'function') { fquick_simpleconn('mount-quick-simpleconn'); return; }
        if (window._qscLoading) return;
        window._qscLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/plate3d/quick_simpleconn.js?v=88';
        sc.onload = function () { window._qscLoading = false; if (typeof fquick_simpleconn === 'function') fquick_simpleconn('mount-quick-simpleconn'); };
        sc.onerror = function () { window._qscLoading = false; var m = document.getElementById('mount-quick-simpleconn'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">quick_simpleconn.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    function ensurePlate3d() {
        var mount = document.getElementById('mount-draw-plate3d');
        if (!mount || mount.firstElementChild) return;
        var fr = document.createElement('iframe');
        fr.src = 'https://macrobim.github.io/macroBIM/plate3d/embed.html?v=88';
        fr.title = 'PLATE3D';
        fr.allow = 'fullscreen';
        // 높이를 100vh 에서 상수를 빼서 잡던 방식은 추정이었다. 프레임 위에 무엇이
        // 얼마나 오는지 이 스크립트는 알 수 없고, 추정이 조금만 모자라면 페이지가
        // 스크롤되고 조금만 남으면 도면 아래가 허옇게 뜬다. 두 값 모두 실측으로 잡는다:
        //   위쪽 — 프레임의 실제 위치에서 창 아래까지 (= 쓸 수 있는 최대)
        //   아래쪽 — PLATE3D 가 postMessage 로 알려주는 "실제 필요한 높이"
        // 둘 중 작은 값을 쓴다. 그래서 넘치지도, 남지도 않는다.
        fr.style.cssText = 'width:100%;height:520px;min-height:520px;'
                         + 'border:1px solid #e3e6ea;border-radius:8px;display:block;background:#15181c;';
        mount.appendChild(fr);

        var want = 0;                       // 프레임이 스스로 요청한 높이
        function sizeFrame() {
            var top = fr.getBoundingClientRect().top;
            var room = Math.floor(window.innerHeight - top - 12);
            var h = want ? Math.min(want, room) : room;
            fr.style.height = Math.max(520, h) + 'px';
        }
        window.addEventListener('message', function (e) {
            var d = e && e.data;
            if (!d || d.plate3d !== 'height' || !(d.h > 0)) return;
            want = d.h;
            sizeFrame();
        });
        window.addEventListener('resize', sizeFrame);
        sizeFrame();
    }

    /* MacroBEAM — SimpleBEAM. 단경간 보를 표준 처짐공식으로 푼다.
       계산은 beam_engine.js 가 하고, beam_formula.js 가 그 엔진을 스스로
       불러온다 — 여기서는 모듈 하나만 붙이면 된다. 운영이므로 ?v= 는 고정이다:
       방문자는 아는 빌드 위에 있어야 하고, 올릴 때는 손으로 올린다. */
    function ensureBeamFormula() {
        if (typeof fbeam_formula === 'function') { fbeam_formula('mount-beam-formula'); return; }
        if (window._bfLoading) return;
        window._bfLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/beam_formula.js?v=5';
        sc.onload = function () { window._bfLoading = false; if (typeof fbeam_formula === 'function') fbeam_formula('mount-beam-formula'); };
        sc.onerror = function () { window._bfLoading = false; var m = document.getElementById('mount-beam-formula'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">beam_formula.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    /* MacroBEAM — MultiBEAM. 연속보(1~5경간)를 모멘트분배법으로 푼다.
       SimpleBEAM 과 같은 방식이다: 모듈이 beam_engine.js 를 스스로 챙기므로
       여기서는 스크립트 하나만 붙인다. 운영이므로 ?v= 는 고정이다. */
    function ensureBeamMulti() {
        if (typeof fbeam_multi === 'function') { fbeam_multi('mount-beam-multi'); return; }
        if (window._bmLoading) return;
        window._bmLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/beam_multi.js?v=1';
        sc.onload = function () { window._bmLoading = false; if (typeof fbeam_multi === 'function') fbeam_multi('mount-beam-multi'); };
        sc.onerror = function () { window._bmLoading = false; var m = document.getElementById('mount-beam-multi'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">beam_multi.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // Gravity wall module (bim_gravitywall.js) may not be in the page's script list — load on demand.
    function ensureGravityWall() {
        if (typeof fdraw_gravitywall === 'function') { fdraw_gravitywall('mount-draw-gravitywall'); return; }
        if (window._gwLoading) return;
        window._gwLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_gravitywall.js?v=10';
        sc.onload = function () { window._gwLoading = false; if (typeof fdraw_gravitywall === 'function') fdraw_gravitywall('mount-draw-gravitywall'); };
        sc.onerror = function () { window._gwLoading = false; var m = document.getElementById('mount-draw-gravitywall'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">bim_gravitywall.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // Inverted-T wall module (bim_invtwall.js) — load on demand.
    function ensureInvtWall() {
        if (typeof fdraw_invtwall === 'function') { fdraw_invtwall('mount-draw-invtwall'); return; }
        if (window._iwLoading) return;
        window._iwLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_invtwall_test.js?v=4';
        sc.onload = function () { window._iwLoading = false; if (typeof fdraw_invtwall === 'function') fdraw_invtwall('mount-draw-invtwall'); };
        sc.onerror = function () { window._iwLoading = false; var m = document.getElementById('mount-draw-invtwall'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">bim_invtwall.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // L-shaped wall module (bim_lwall.js) — load on demand.
    function ensureLWall() {
        if (typeof fdraw_lwall === 'function') { fdraw_lwall('mount-draw-lwall'); return; }
        if (window._lwLoading) return;
        window._lwLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_lwall.js?v=1';
        sc.onload = function () { window._lwLoading = false; if (typeof fdraw_lwall === 'function') fdraw_lwall('mount-draw-lwall'); };
        sc.onerror = function () { window._lwLoading = false; var m = document.getElementById('mount-draw-lwall'); if (m) m.innerHTML = '<p style="color:#b91c1c;padding:16px;">bim_lwall.js failed to load.</p>'; };
        document.head.appendChild(sc);
    }

    // H-section TEST build (bim_hsection_test.js) — overrides fdraw_hsection for the header-driven single view.
    function ensureHsectionTest(cb) {
        if (window._hsecTestLoaded) { if (cb) cb(); return; }
        if (window._hsecTestLoading) return;
        window._hsecTestLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_hsection_test.js?v=6';
        sc.onload = function () { window._hsecTestLoaded = true; window._hsecTestLoading = false; if (cb) cb(); };
        sc.onerror = function () { window._hsecTestLoading = false; if (typeof fdraw_hsection === 'function') fdraw_hsection(); };
        document.head.appendChild(sc);
    }

    // Channel TEST build (bim_channel_test.js) — overrides fdraw_channel for the header-driven single view.
    function ensureChannelTest(cb) {
        if (window._chanTestLoaded) { if (cb) cb(); return; }
        if (window._chanTestLoading) return;
        window._chanTestLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_channel_test.js?v=2';
        sc.onload = function () { window._chanTestLoaded = true; window._chanTestLoading = false; if (cb) cb(); };
        sc.onerror = function () { window._chanTestLoading = false; if (typeof fdraw_channel === 'function') fdraw_channel(); };
        document.head.appendChild(sc);
    }

    // Tapered Begin/End sections TEST build (bim_section_test.js) — installs
    // window.makeSectionTest, which overrides fdraw_<sec> for the header-driven views.
    function ensureSectionTest(name, cb) {
        function run() { if (typeof window.makeSectionTest === 'function') window.makeSectionTest(name); if (cb) cb(); }
        if (window.makeSectionTest) { run(); return; }
        window._sectCbs = window._sectCbs || [];
        window._sectCbs.push(run);
        if (window._sectLoading) return;
        window._sectLoading = true;
        var sc = document.createElement('script');
        sc.src = 'https://macrobim.github.io/macroBIM/bim_section_test.js?v=2';
        sc.onload = function () { window._sectLoading = false; var q = window._sectCbs; window._sectCbs = []; q.forEach(function (f) { f(); }); };
        sc.onerror = function () { window._sectLoading = false; window._sectCbs = []; if (typeof window['fdraw_' + name] === 'function') window['fdraw_' + name](); };
        document.head.appendChild(sc);
    }

    // Shared draw-test core (bim_draw_test_core.js — window.RWSVG) then a section
    // module (lifting lug / I-beam / box1cell). Loads the core once, then the module.
    // Uses a per-module load-completion flag (the production fdraw_* already exists,
    // so we must not gate on function existence — the test module OVERRIDES it).
    function ensureRWModule(moduleFile, flag, cb) {
        function afterCore() {
            if (window['_' + flag + 'Done']) { if (cb) cb(); return; }
            if (window['_' + flag + 'ing']) { (window['_' + flag + 'q'] = window['_' + flag + 'q'] || []).push(cb); return; }
            window['_' + flag + 'ing'] = true;
            window['_' + flag + 'q'] = cb ? [cb] : [];
            var sc = document.createElement('script');
            sc.src = 'https://macrobim.github.io/macroBIM/' + moduleFile;
            sc.onload = function () { window['_' + flag + 'Done'] = true; window['_' + flag + 'ing'] = false; var q = window['_' + flag + 'q'] || []; window['_' + flag + 'q'] = []; q.forEach(function (f) { if (f) f(); }); };
            sc.onerror = function () { window['_' + flag + 'ing'] = false; window['_' + flag + 'q'] = []; };
            document.head.appendChild(sc);
        }
        if (window.RWSVG) { afterCore(); return; }
        if (window._rwCoreLoading) { (window._rwCoreCbs = window._rwCoreCbs || []).push(afterCore); return; }
        window._rwCoreLoading = true;
        window._rwCoreCbs = [afterCore];
        var sc0 = document.createElement('script');
        sc0.src = 'https://macrobim.github.io/macroBIM/bim_draw_test_core.js?v=6';
        sc0.onload = function () { window._rwCoreLoading = false; var q = window._rwCoreCbs || []; window._rwCoreCbs = []; q.forEach(function (f) { f(); }); };
        sc0.onerror = function () { window._rwCoreLoading = false; window._rwCoreCbs = []; };
        document.head.appendChild(sc0);
    }
    function ensureLugTest(cb) { ensureRWModule('bim_liftinglug_test.js?v=1', 'lugTest', cb); }
    function ensureIbeamTest(cb) { ensureRWModule('bim_ibeam_test.js?v=2', 'ibeamTest', cb); }
    function ensureBox1cellTest(cb) { ensureRWModule('bim_box1cell_test.js?v=3', 'box1cellTest', cb); }
    // Cross-section preview builds (bim_xsect_test.js — window.XSECT) on the shared core.
    function ensureXsect(name) { ensureRWModule('bim_xsect_test.js?v=10', 'xsect', function () { if (window.XSECT) { window.XSECT.install(name); window.XSECT.mount(name); } }); }

    function mountDrawing(kind) {
        ['hsection','channel','ibeam','liftinglug','box1cell','rect','circle','octagon','track','gravitywall','invtwall','lwall','pier'].forEach(function(k) {
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
    document.getElementById('codeToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('code-sub').classList.toggle('show');
    });
    document.getElementById('drawingsToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('drawings-sub').classList.toggle('show');
    });
    document.getElementById('quick3dToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('quick3d-sub').classList.toggle('show');
    });
    document.getElementById('macrobeamToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('macrobeam-sub').classList.toggle('show');
    });
    document.getElementById('retainingToggle').addEventListener('click', function(e) {
        e.preventDefault(); this.classList.toggle('open'); document.getElementById('retaining-sub').classList.toggle('show');
    });
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
        el.addEventListener('click', function(e) { e.preventDefault(); goPage(this.getAttribute('data-page')); });
    });
    document.querySelectorAll('.nav-sub a[data-page]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault(); goPage(this.getAttribute('data-page'));
            var pt = this.closest('.nav-sub').previousElementSibling;
            if (pt) { pt.classList.add('open'); this.closest('.nav-sub').classList.add('show'); }
        });
    });
    // default landing page (Dashboard removed) — open Pier and load its module
    showPage('home');                     // the site opens on Home
}


/* ══════════════════════════════════════════════════════════════════════
   Tables › Steel Strength

   Everything for the page rides in this file on purpose: the PHP page
   carries a fixed <script> list and pins layout_body.js to a jsDelivr
   commit, so a new file or a layout_style.css edit would need a PHP
   change on top of the pin bump this file already needs.

   On merge this splits the way the rebar page already is:
     mod_strength          → mod_strength.js  (+ steel_strength_*.csv)
     loadStrengthTables()  → steelstrength_claude.js
     _STRENGTHCSS()        → four rules in layout_style.css
   ══════════════════════════════════════════════════════════════════════ */

/* The five rules the page adds. Colours are taken from pairs already in
   layout_style.css — .nav-item.active for the divider, .qna-badge-reply
   for the badge — so nothing new enters the palette. */
function _STRENGTHCSS() {
    return '<style id="strength-css">'
      + '.steel-table thead th small{display:block;font-size:10px;font-weight:400;color:#94a3b8;margin-top:2px;}'
      + '.steel-table tbody tr.group-row td{background:#eff6ff !important;color:#2563eb;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;text-align:left;padding:8px 12px;border-right:none;position:static;}'
      + '.eq{display:inline-block;padding:2px 7px;border-radius:4px;background:#e0e7ff;color:#3730a3;font-weight:600;font-size:11.5px;}'
      + '.na{color:#cbd5e1;}'
      + '.sub{color:#94a3b8;font-weight:400;}'
      + '</style>';
}

/* Data module — same shape as mod_rebar.js.
   In a grade cell, a leading '*' marks a grade whose Fy and Fu are
   effectively identical to the KS grade on that row, a leading '-'
   greys the text out, and a bare '-' means the standard does not
   define one. In a KDS/JIS row, fy is the per-thickness-band list and
   fy1 the single value used where the grade takes no reduction. */
var mod_strength = new function () {

    /* ── 1. Grade equivalents ── */
    var equiv = [
        { group: 'Rolled Steel for General Structure &middot; KS D 3503' },
        { ks:'SS235', old:'SS330', jis:'SS330', en:'*S235JR', astm:'A283 Gr.C', gb:'Q235' },
        { ks:'SS275', old:'SS400', jis:'SS400', en:'*S275JR', astm:'*A36', gb:'Q235B' },
        { ks:'SS315', old:'SS490', jis:'SS490', en:'between S275 &amp; S355', astm:'A572 Gr.42', gb:'Q355' },
        { ks:'SS410', old:'SS540', jis:'SS540', en:'S420N', astm:'A572 Gr.60', gb:'Q420' },
        { ks:'SS450', old:'SS590', jis:'SS590', en:'*S450J0', astm:'A572 Gr.65', gb:'Q460' },
        { ks:'SS550', old:'-', jis:'-', en:'S550Q', astm:'A514 (partial)', gb:'-' },

        { group: 'Rolled Steel for Welded Structure &middot; KS D 3515' },
        { ks:'SM275', old:'SM400', jis:'SM400 A/B/C', en:'*S275J0/J2', astm:'A36', gb:'Q235B' },
        { ks:'SM355', old:'SM490', jis:'SM490Y / SM520', en:'*S355J0/J2', astm:'*A572 Gr.50 &middot; A992', gb:'Q355' },
        { ks:'SM420', old:'SM490Y &middot; SM520', jis:'SM520 B/C', en:'*S420N/NL', astm:'A572 Gr.60', gb:'Q420' },
        { ks:'SM460', old:'SM570', jis:'*SM570', en:'*S460N/NL', astm:'A572 Gr.65 &middot; A913 Gr.65', gb:'Q460' },

        { group: 'Atmospheric Corrosion Resisting Steel for Welded Structure &middot; KS D 3529' },
        { ks:'SMA275', old:'SMA400W', jis:'SMA400 AW/BW/CW', en:'*S235J0W/J2W', astm:'A242 &middot; A588', gb:'Q235NH' },
        { ks:'SMA355', old:'SMA490W', jis:'SMA490 AW/BW/CW', en:'*S355J0W/J2W/K2W', astm:'*A588 &middot; A709 Gr.50W', gb:'Q355NH' },
        { ks:'SMA460', old:'SMA570W', jis:'SMA570W', en:'-no equivalent grade', astm:'A709 HPS 70W', gb:'Q460NH' },

        { group: 'High-Performance Steel for Bridges &amp; Buildings &middot; KS D 3868 / KS D 5994' },
        { ks:'HSB380', old:'HSB500', jis:'*SBHS400', en:'S420M &middot; S460M', astm:'A709 Gr.50W &middot; HPS 50W', gb:'-' },
        { ks:'HSB460', old:'HSB600', jis:'*SBHS500', en:'*S500Q', astm:'*A709 HPS 70W', gb:'-' },
        { ks:'HSB690', old:'HSB800', jis:'*SBHS700', en:'*S690Q', astm:'*A709 HPS 100W &middot; A514', gb:'Q690' },
        { ks:'HSA650', old:'HSA800', jis:'-Korea-developed', en:'S620Q ~ S690Q', astm:'A514 (approx.)', gb:'-' },

        { group: 'Thermo-Mechanical Control Process (TMCP)' },
        { ks:'SM275-TMC', old:'SM400-TMC', jis:'SM400-TMC', en:'*S275M/ML', astm:'-', gb:'-' },
        { ks:'SM355-TMC', old:'SM490-TMC', jis:'SM490-TMC', en:'*S355M/ML', astm:'-', gb:'-' },
        { ks:'SM420-TMC', old:'SM520-TMC', jis:'SM520-TMC', en:'*S420M/ML', astm:'-', gb:'-' },
        { ks:'SM460-TMC', old:'SM570-TMC', jis:'SM570-TMC', en:'*S460M/ML', astm:'-', gb:'-' }
    ];

    /* ── 2. KDS 14 31 05 Table 3.4-1 — fy bands [t<=16, 16-40, 40-75, 75-100, t>100] ── */
    var kds = [
        { g:'SS235', fy:[235,225,205,205,195], fu:330 },
        { g:'SS275', fy:[275,265,245,245,235], fu:410 },
        { g:'SM275 &middot; SMA275<sup>1)</sup>', fy:[275,265,255,245,235], fu:410 },
        { g:'SS315', fy:[315,305,295,295,275], fu:490 },
        { g:'SM355 &middot; SMA355<sup>1)</sup>', fy:[355,345,335,325,305], fu:490 },
        { g:'SS410', fy:[410,400,'-','-','-'], fu:540 },
        { g:'SM420', fy:[420,410,400,390,380], fu:520 },
        { g:'SS450', fy:[450,440,'-','-','-'], fu:590 },
        { g:'SM460<sup>2)</sup> &middot; SMA460<sup>3)</sup>', fy:[460,450,430,420,'-'], fu:570 },
        { g:'SS550', fy:[550,540,'-','-','-'], fu:690 },

        { group: 'No thickness reduction — High-Performance &amp; TMCP steels' },
        { g:'HSB380 &middot; HSM380<sup>4)</sup>', fy1:380, note:'(HSB: t &le; 100mm)', fu:500 },
        { g:'HSB460', fy1:460, note:'(t &le; 100mm)', fu:600 },
        { g:'HSB690<sup>5)</sup>', fy1:690, note:'(t &le; 80mm)', fu:800 },
        { g:'HSA650<sup>5)</sup>', fy1:650, note:'(t &le; 80mm)', fu:800 },
        { g:'SM275-TMC<sup>6)</sup>', fy1:275, fu:410 },
        { g:'SM355-TMC<sup>6)</sup>', fy1:355, fu:490 },
        { g:'SM420-TMC<sup>6)</sup>', fy1:420, fu:520 },
        { g:'SM460-TMC<sup>6)</sup>', fy1:460, fu:570 }
    ];

    /* ── 3. EN 1993-1-1 Table 3.1 — fy / fu : [t<=40, 40<t<=80] ── */
    var en = [
        { group: 'EN 10025-2 &nbsp;— Non-alloy structural steels' },
        { g:'S235', fy:[235,215], fu:[360,360], ks:'&#8776; SS235' },
        { g:'S275', fy:[275,255], fu:[430,410], ks:'&#8776; SS275 &middot; SM275' },
        { g:'S355', fy:[355,335], fu:[490,470], ks:'&#8776; SM355' },
        { g:'S450', fy:[440,410], fu:[550,550], ks:'&#8776; SS450' },
        { group: 'EN 10025-3 &nbsp;— Normalized (N / NL)' },
        { g:'S275 N/NL', fy:[275,255], fu:[390,370], ks:'&#8776; SM275' },
        { g:'S355 N/NL', fy:[355,335], fu:[490,470], ks:'&#8776; SM355' },
        { g:'S420 N/NL', fy:[420,390], fu:[520,520], ks:'&#8776; SM420' },
        { g:'S460 N/NL', fy:[460,430], fu:[540,540], ks:'&#8776; SM460' },
        { group: 'EN 10025-4 &nbsp;— Thermomechanical rolled (M / ML) = TMCP' },
        { g:'S275 M/ML', fy:[275,255], fu:[370,360], ks:'&#8776; SM275-TMC' },
        { g:'S355 M/ML', fy:[355,335], fu:[470,450], ks:'&#8776; SM355-TMC' },
        { g:'S420 M/ML', fy:[420,390], fu:[520,500], ks:'&#8776; SM420-TMC' },
        { g:'S460 M/ML', fy:[460,430], fu:[540,530], ks:'&#8776; SM460-TMC' },
        { group: 'EN 10025-5 / -6 &nbsp;— Weathering (W) &middot; Quenched &amp; tempered (Q)' },
        { g:'S235 W', fy:[235,215], fu:[360,340], ks:'&#8776; SMA275' },
        { g:'S355 W', fy:[355,335], fu:[490,490], ks:'&#8776; SMA355' },
        { g:'S460 Q/QL/QL1', fy:[460,440], fu:[570,550], ks:'&#8776; SM460' }
    ];

    /* ── 4. ASTM / AISC 360 ── */
    var astm = [
        { group: 'Buildings &amp; general plate' },
        { g:'A36', fyk:'36', fuk:'58&ndash;80', fym:'250', fum:'400&ndash;550', use:'Plate &amp; shapes, general &nbsp;&#8776; SS275' },
        { g:'A572 Gr.42', fyk:'42', fuk:'60', fym:'290', fum:'415', use:'&#8776; SS315' },
        { g:'A572 Gr.50', fyk:'50', fuk:'65', fym:'345', fum:'450', use:'Most common &nbsp;&#8776; SM355' },
        { g:'A572 Gr.55', fyk:'55', fuk:'70', fym:'380', fum:'485', use:'' },
        { g:'A572 Gr.60', fyk:'60', fuk:'75', fym:'415', fum:'520', use:'t &le; 32mm &nbsp;&#8776; SM420' },
        { g:'A572 Gr.65', fyk:'65', fuk:'80', fym:'450', fum:'550', use:'t &le; 32mm &nbsp;&#8776; SM460' },
        { g:'A992', fyk:'50&ndash;65', fuk:'&ge; 65', fym:'345&ndash;450', fum:'450', use:'W-shapes only &nbsp;&#8776; SM355' },
        { g:'A529 Gr.50 / 55', fyk:'50 / 55', fuk:'65&ndash;100', fym:'345 / 380', fum:'450&ndash;620', use:'' },
        { g:'A913 Gr.50/60/65/70', fyk:'50/60/65/70', fuk:'65/75/80/90', fym:'345/415/450/485', fum:'450/520/550/620', use:'QST shapes' },
        { group: 'Bridges &middot; weathering &middot; quenched and tempered' },
        { g:'A588', fyk:'50', fuk:'70', fym:'345', fum:'485', use:'Weathering &nbsp;&#8776; SMA355' },
        { g:'A709 Gr.50W', fyk:'50', fuk:'70', fym:'345', fum:'485', use:'Bridge weathering &nbsp;&#8776; SMA355' },
        { g:'A709 HPS 70W', fyk:'70', fuk:'85&ndash;110', fym:'485', fum:'585&ndash;760', use:'Bridge high-performance &nbsp;&#8776; HSB460' },
        { g:'A709 HPS 100W', fyk:'100', fuk:'110&ndash;130', fym:'690', fum:'760&ndash;895', use:'Bridge high-performance &nbsp;&#8776; HSB690' },
        { g:'A514', fyk:'100', fuk:'110&ndash;130', fym:'690', fum:'760&ndash;895', use:'t &le; 65mm &nbsp;&#8776; HSB690' }
    ];

    /* ── 5. JIS — fy bands [t<=16, 16-40, 40-75, 75-100] ── */
    var jis = [
        { group: 'JIS G3101 &middot; G3106 — General &amp; welded structure' },
        { g:'SS400', fy:[245,235,215,215], fu:'400&ndash;510', ks:'SS275 <span class="na">(lower F<sub>y</sub>)</span>' },
        { g:'SS490', fy:[285,275,255,245], fu:'490&ndash;610', ks:'SS315 <span class="na">(lower F<sub>y</sub>)</span>' },
        { g:'SM400 A/B/C', fy:[245,235,215,215], fu:'400&ndash;510', ks:'SM275 <span class="na">(lower F<sub>y</sub>)</span>' },
        { g:'SM490 A/B/C', fy:[325,315,295,295], fu:'490&ndash;610', ks:'<span class="na">not SM355</span>' },
        { g:'SM490Y A/B', fy:[365,355,335,325], fu:'490&ndash;610', ks:'*SM355' },
        { g:'SM520 B/C', fy:[365,355,335,325], fu:'520&ndash;640', ks:'*SM355' },
        { g:'SM570', fy:[460,450,430,420], fu:'570&ndash;720', ks:'*SM460' },
        { group: 'JIS G3114 — Weathering' },
        { g:'SMA400 W', fy:[245,235,215,215], fu:'400&ndash;540', ks:'SMA275 <span class="na">(lower F<sub>y</sub>)</span>' },
        { g:'SMA490 W', fy:[365,355,335,325], fu:'490&ndash;610', ks:'*SMA355' },
        { g:'SMA570 W', fy:[460,450,430,420], fu:'570&ndash;720', ks:'*SMA460' },
        { group: 'JIS G3140 — Higher yield strength plates for bridges (SBHS, no thickness reduction)' },
        { g:'SBHS400', fy1:400, note:'(t &le; 100)', fu:'&ge; 490', ks:'HSB380' },
        { g:'SBHS500', fy1:500, note:'(t &le; 100)', fu:'&ge; 570', ks:'HSB460' },
        { g:'SBHS700', fy1:700, note:'(t &le; 75)', fu:'&ge; 780', ks:'*HSB690' }
    ];

    /* ── 6. GB/T 1591 ── */
    var gb = [
        { g:'Q235B', fy:235, fu:'370&ndash;500', ks:'SS235 &middot; SM275', en:'S235' },
        { g:'Q355 <span class="sub">(formerly Q345)</span>', fy:355, fu:'470&ndash;630', ks:'SM355', en:'S355' },
        { g:'Q390', fy:390, fu:'490&ndash;650', ks:'-', en:'-' },
        { g:'Q420', fy:420, fu:'520&ndash;680', ks:'SM420', en:'S420' },
        { g:'Q460', fy:460, fu:'550&ndash;720', ks:'SM460', en:'S460' }
    ];

    /* ── 7. What actually differs between the codes ── */
    var caution = [
        { item:'F<sub>y</sub> thickness bands', kds:'5 bands<br><span class="sub">16 / 40 / 75 / 100 / over</span>', en:'2 bands<br><span class="sub">40 / 80</span>', astm:'no reduction', jis:'5 bands<br><span class="sub">same as KDS</span>' },
        { item:'How F<sub>u</sub> is specified', kds:'single minimum', en:'single design value', astm:'range (min&ndash;max)', jis:'range (min&ndash;max)' },
        { item:'Modulus of elasticity E', kds:'210,000 MPa', en:'210,000 MPa', astm:'200,000 MPa<br><span class="sub">29,000 ksi</span>', jis:'205,000 MPa' },
        { item:'Naming basis', kds:'yield strength<br><span class="sub">revised 2016&ndash;2018</span>', en:'yield strength', astm:'ksi grade', jis:'tensile strength' }
    ];

    this.get_EQUIV   = function () { return equiv; };
    this.get_KDS     = function () { return kds; };
    this.get_EN      = function () { return en; };
    this.get_ASTM    = function () { return astm; };
    this.get_JIS     = function () { return jis; };
    this.get_GB      = function () { return gb; };
    this.get_CAUTION = function () { return caution; };

};

/* Builds every card on the Steel Strength page. Named and shaped after
   loadRebarTables() in rebartable_claude.js; helpers stay local because
   this file shares global scope with every other module the page loads. */
function loadStrengthTables() {

    if (!document.getElementById('strength-css')) {
        document.head.insertAdjacentHTML('beforeend', _STRENGTHCSS());
    }

    function fmt(v) {
        if (v === undefined || v === null || v === '' || v === '-') return '<span class="na">&ndash;</span>';
        v = String(v);
        if (v.charAt(0) === '*') return '<span class="eq">' + v.slice(1) + '</span>';
        if (v.charAt(0) === '-') return '<span class="na">' + v.slice(1) + '</span>';
        return v;
    }
    function tds(vals) {
        var out = '', i;
        for (i = 0; i < vals.length; i++) out += '<td>' + fmt(vals[i]) + '</td>';
        return out;
    }
    function card(title, desc, minw, thead, tbody) {
        return '<div class="table-card">'
             +   '<div class="table-card-header">'
             +     '<div class="table-card-title">' + title + '</div>'
             +     '<div class="table-card-desc">' + desc + '</div>'
             +   '</div>'
             +   '<div class="steel-table-wrap">'
             +     '<table class="steel-table" style="min-width:' + minw + 'px;">'
             +       '<thead>' + thead + '</thead><tbody>' + tbody + '</tbody>'
             +     '</table>'
             +   '</div>'
             + '</div>';
    }
    /* one <tr> per record; a record carrying .group becomes a full-width divider */
    function rows(data, ncol, rowFn) {
        var out = '', i, r;
        for (i = 0; i < data.length; i++) {
            r = data[i];
            if (r.group) out += '<tr class="group-row"><td colspan="' + ncol + '">' + r.group + '</td></tr>';
            else out += '<tr>' + rowFn(r) + '</tr>';
        }
        return out;
    }
    /* banded Fy, or one value spanning every band where the grade takes no reduction */
    function fyCells(r, bands) {
        if (r.fy) return tds(r.fy);
        return '<td colspan="' + bands + '">' + r.fy1
             + (r.note ? ' <span class="sub">' + r.note + '</span>' : '') + '</td>';
    }
    function note(html) { return '<div class="table-note">' + html + '</div>'; }

    var m = mod_strength, h = '';

    h += card('1. Grade Equivalents &mdash; KS &amp; Overseas Standards',
          'Current KS symbols follow the same <b>yield-strength</b> naming as EN', 880,
          '<tr><th style="text-align:left;">KS Grade<small>current</small></th>'
        + '<th>Old Symbol<small>before 2016</small></th><th>JIS<small>Japan</small></th>'
        + '<th>EN 10025<small>Europe</small></th><th>ASTM<small>USA</small></th>'
        + '<th>GB/T<small>China</small></th></tr>',
          rows(m.get_EQUIV(), 6, function (r) {
              return '<td>' + r.ks + '</td>' + tds([r.old, r.jis, r.en, r.astm, r.gb]);
          }));

    h += note('&bull; A <span class="eq">shaded</span> entry has essentially the <b>same</b> yield and tensile strength. All others are approximate &mdash; verify the design values directly.<br>'
        + '&bull; <b>A matching JIS name does not mean a matching value.</b> Current KS SM355 (F<sub>y</sub> 355) corresponds to <b>JIS SM490Y / SM520</b> (F<sub>y</sub> 355), <b>not</b> JIS SM490 (F<sub>y</sub> 325). This is the most common error when substituting legacy material or sourcing overseas.<br>'
        + '&bull; The 2016&ndash;2018 KS revision changed grade naming from <b>tensile strength to yield strength</b> (SS400 &rarr; SS275) &mdash; the same system EN 10025 uses for S355.');

    h += card('2. KDS 14 31 05 (Table 3.4-1) &mdash; Korea',
          '<b>Five</b> thickness bands &middot; MPa', 860,
          '<tr><th rowspan="2" style="text-align:left;">Designation</th>'
        + '<th colspan="5">F<sub>y</sub> &mdash; Yield Strength<small>Plate Thickness (mm)</small></th>'
        + '<th rowspan="2">F<sub>u</sub><small>Tensile Strength</small></th></tr>'
        + '<tr><th>t &le; 16</th><th>16 &lt; t<br>&le; 40</th><th>40 &lt; t<br>&le; 75</th>'
        + '<th>75 &lt; t<br>&le; 100</th><th>t &gt; 100</th></tr>',
          rows(m.get_KDS(), 7, function (r) {
              return '<td>' + r.g + '</td>' + fyCells(r, 5) + '<td>' + r.fu + '</td>';
          }));

    h += note('Note 1) SMA275CW, CP &middot; SMA355CW, CP &mdash; applicable thickness 100mm or less &nbsp;&bull;&nbsp;'
        + 'Note 2) SM460B, C &mdash; plates up to 150mm may be produced by agreement between purchaser and manufacturer &nbsp;&bull;&nbsp;'
        + 'Note 3) SMA460W, P &mdash; applicable thickness 100mm or less<br>'
        + 'Note 4) HSM380 &mdash; applicable thickness 40mm or less &nbsp;&bull;&nbsp;'
        + 'Note 5) HSA650, HSB690 &mdash; applicable thickness 80mm or less &nbsp;&bull;&nbsp;'
        + 'Note 6) For thermo-mechanical controlled (TMC) steel, the base value (yield strength for t &le; 16mm) applies with no reduction for thickness. TMC steel used in steel building structures: applicable thickness 80mm or less.');

    h += card('3. EN 1993-1-1 Table 3.1 &mdash; Eurocode 3',
          'Only <b>two</b> thickness bands defined &middot; MPa', 740,
          '<tr><th rowspan="2" style="text-align:left;">Designation</th>'
        + '<th colspan="2">f<sub>y</sub> &mdash; Yield Strength</th>'
        + '<th colspan="2">f<sub>u</sub> &mdash; Tensile Strength</th>'
        + '<th rowspan="2">KS Equivalent</th></tr>'
        + '<tr><th>t &le; 40</th><th>40 &lt; t &le; 80</th><th>t &le; 40</th><th>40 &lt; t &le; 80</th></tr>',
          rows(m.get_EN(), 6, function (r) {
              return '<td>' + r.g + '</td>' + tds([r.fy[0], r.fy[1], r.fu[0], r.fu[1], r.ks]);
          }));

    h += card('4. ASTM / AISC 360 &mdash; USA',
          '<b>No</b> reduction for thickness &middot; graded in ksi', 820,
          '<tr><th rowspan="2" style="text-align:left;">Designation</th>'
        + '<th colspan="2">Original (ksi)</th><th colspan="2">Converted (MPa)</th>'
        + '<th rowspan="2">Use &amp; KS Equivalent</th></tr>'
        + '<tr><th>F<sub>y</sub></th><th>F<sub>u</sub></th><th>F<sub>y</sub></th><th>F<sub>u</sub></th></tr>',
          rows(m.get_ASTM(), 6, function (r) {
              return '<td>' + r.g + '</td><td>' + r.fyk + '</td><td>' + r.fuk + '</td>'
                   + '<td>' + r.fym + '</td><td>' + r.fum + '</td><td>' + (r.use || '') + '</td>';
          }));

    h += card('5. JIS &mdash; Japan',
          '<b>Tensile-strength</b> naming, same as legacy KS &middot; MPa', 820,
          '<tr><th rowspan="2" style="text-align:left;">Designation</th>'
        + '<th colspan="4">F<sub>y</sub> &mdash; Yield Point<small>Plate Thickness (mm)</small></th>'
        + '<th rowspan="2">F<sub>u</sub><small>Tensile Strength</small></th>'
        + '<th rowspan="2">Current KS Equivalent</th></tr>'
        + '<tr><th>t &le; 16</th><th>16&ndash;40</th><th>40&ndash;75</th><th>75&ndash;100</th></tr>',
          rows(m.get_JIS(), 7, function (r) {
              return '<td>' + r.g + '</td>' + fyCells(r, 4)
                   + '<td>' + r.fu + '</td><td>' + fmt(r.ks) + '</td>';
          }));

    h += card('6. GB/T 1591 &mdash; China (reference)',
          'Follows EN &middot; yield-strength naming &middot; MPa', 600,
          '<tr><th style="text-align:left;">Designation</th>'
        + '<th>F<sub>y</sub><small>t &le; 16</small></th><th>F<sub>u</sub></th>'
        + '<th>KS Equivalent</th><th>EN Equivalent</th></tr>',
          rows(m.get_GB(), 5, function (r) {
              return '<td>' + r.g + '</td>' + tds([r.fy, r.fu, r.ks, r.en]);
          }));

    h += card('Before Substituting Across Standards',
          'A matching grade name is not a matching design value', 720,
          '<tr><th style="text-align:left;">Item</th><th>KDS 14 31 05</th>'
        + '<th>EN 1993-1-1</th><th>AISC 360</th><th>JIS</th></tr>',
          rows(m.get_CAUTION(), 5, function (r) {
              return '<td>' + r.item + '</td><td>' + r.kds + '</td><td>' + r.en + '</td>'
                   + '<td>' + r.astm + '</td><td>' + r.jis + '</td>';
          }));

    h += note('&bull; <b>Equivalence depends on thickness.</b> At t = 60mm, KS SM355 = 335 and EN S355 = 335 happen to agree; at t = 90mm, KS gives 325 while EN Table 3.1 is outside its defined range. Compare <b>design values at the actual member thickness</b>, not grade names.<br>'
        + '&bull; <b>E differs by 5%.</b> AISC (200,000) against KDS/EN (210,000) shows up directly in buckling and deflection checks.<br>'
        + '&bull; For steels whose yield and tensile strengths are not defined in Table 3.4-1, use the material strength values given in the relevant KS standard listed in Table 3.1-1.');

    var mount = document.getElementById('strength-mount');
    if (mount) mount.innerHTML = h;
}

/* 대시보드의 Recent Updates — design/updates.json 을 읽어 그린다.
   테스트 레이아웃에 있던 것을 그대로 옮긴다. 운영에는 렌더러가 아예 없고
   "No updates yet." 이 마크업에 박혀 있어서, json 에 무엇을 적어도 화면에
   나올 길이 없었다. */
function loadRecentUpdates() {
    var container = document.getElementById('recent-updates');
    if (!container) return;
    var typeColors = { 'new': '#10b981', 'feat': '#2563eb', 'fix': '#f59e0b', 'remove': '#ef4444' };
    var typeLabels = { 'new': 'NEW', 'feat': 'FEATURE', 'fix': 'FIX', 'remove': 'REMOVED' };
    fetch('https://macrobim.github.io/design/updates.json?t=' + Date.now())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data || !data.length) {
                container.innerHTML = '<p style="font-size:13px;color:#64748b;margin:0;">No updates yet.</p>';
                return;
            }
            var html = '';
            data.forEach(function(item) {
                var color = typeColors[item.type] || '#64748b';
                var label = typeLabels[item.type] || item.type.toUpperCase();
                html += '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #e0e7f1;">'
                    + '<span style="font-size:12px;color:#94a3b8;min-width:70px;padding-top:2px;">' + item.date + '</span>'
                    + '<span style="width:8px;height:8px;border-radius:50%;background:' + color + ';margin-top:6px;flex-shrink:0;"></span>'
                    + '<div style="flex:1;">'
                    + '<span style="font-size:13px;font-weight:600;color:#0f172a;">' + item.title + '</span>'
                    + ' <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:' + color + '18;color:' + color + ';margin-left:6px;">' + label + '</span>'
                    + (item.desc ? '<p style="font-size:12px;color:#64748b;margin:4px 0 0;line-height:1.5;">' + item.desc + '</p>' : '')
                    + '</div></div>';
            });
            container.innerHTML = html;
        })
        .catch(function() {});
}
