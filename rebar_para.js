/*  rebar_para.js — REBAR PARA : 논문 시뮬레이션 화면 (공개 UI · 그리기만).
 *
 *  표준 I/T 단면(AASHTO Type III·IV, PCI BT-54·63·72)에서 같은 철근을 세 방법으로:
 *    (a) 파라메트릭 — 피복 평행선 교점으로 유도한 정답 좌표
 *    (b) APF        — 꼭짓점 에이전트가 정답(목표점)으로 가는 경로
 *    (c) J          — 형상 코드 + 대략 위치만 넣고 J 최소화로 앉은 결과
 *  계산은 전부 서버(rebar_api.php {"mode":"para"} — 비공개 PHP 엔진). 이 파일은 좌표를 받아 그린다.
 */
(function () {
    'use strict';
    var API = '/rebar_api.php';
    var SECTIONS = [
        ['AASHTO_IV', 'AASHTO Type IV (I)'], ['AASHTO_III', 'AASHTO Type III (I)'],
        ['PCI_BT72', 'PCI BT-72 (T)'], ['PCI_BT63', 'PCI BT-63 (T)'], ['PCI_BT54', 'PCI BT-54 (T)']
    ];
    var C = { ink: '#0f172a', mute: '#64748b', line: '#cbd5e1', blue: '#2563eb', conc: '#e2e8f0', concLine: '#334155',
              param: '#64748b', J: '#ea580c', Jinit: '#fdba74', lJ: '#ca8a04', lQ: '#dc2626', apf: '#2563eb' };

    function el(tag, attrs, html) {
        var e = document.createElement(tag);
        if (attrs) for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else e.setAttribute(k, attrs[k]); }
        if (html != null) e.innerHTML = html;
        return e;
    }
    function svgEl(tag, attrs) {
        var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        return e;
    }
    function f1(v) { return (v == null || !isFinite(v)) ? '-' : (Math.round(v * 10) / 10).toFixed(1); }
    function f2(v) { return (v == null || !isFinite(v)) ? '-' : (Math.round(v * 100) / 100).toFixed(2); }

    var CSS =
        '.rp-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:14px;overflow:hidden}' +
        '.rp-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;background:#f1f5f9;border-bottom:1px solid #e2e8f0;flex-wrap:wrap}' +
        '.rp-title{font-size:14.5px;font-weight:600;color:#0f172a}.rp-title:before{content:"";display:inline-block;width:4px;height:14px;border-radius:2px;background:#2563eb;margin-right:8px;vertical-align:-2px}' +
        '.rp-body{padding:12px 14px}' +
        '.rp-form{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end}' +
        '.rp-form label{display:flex;flex-direction:column;font-size:11.5px;color:#64748b;gap:3px;white-space:nowrap}' +
        '.rp-form input,.rp-form select{font:inherit;font-size:13px;padding:4px 7px;border:1px solid #cbd5e1;border-radius:6px;width:84px}' +
        '.rp-form select{width:190px}' +
        '.rp-btn{font:inherit;font-size:13px;font-weight:700;color:#fff;background:#2563eb;border:1px solid #2563eb;border-radius:6px;padding:7px 16px;cursor:pointer}' +
        '.rp-btn[disabled]{opacity:.55;cursor:wait}' +
        '.rp-status{font-size:12.5px;color:#64748b}' +
        '.rp-split{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px}' +
        '@media (max-width:1100px){.rp-split{grid-template-columns:1fr}}' +
        '.rp-svgwrap{position:relative;border:1px solid #e2e8f0;border-radius:8px;background:#fbfdff;aspect-ratio:4/5;overflow:hidden}' +
        '.rp-svgwrap svg{width:100%;height:100%;cursor:grab;touch-action:none}' +
        '.rp-layers{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:12px;color:#334155;margin-bottom:8px}' +
        '.rp-layers label{display:flex;align-items:center;gap:4px;cursor:pointer}' +
        '.rp-sw{display:inline-block;width:14px;height:3px;border-radius:2px}' +
        '.rp-kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:12px}' +
        '.rp-kpi{border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;background:#f8fafc}' +
        '.rp-kpi b{display:block;font-size:18px;color:#0f172a}.rp-kpi span{font-size:11.5px;color:#64748b}' +
        '.rp-tbl{width:100%;border-collapse:collapse;font-size:12px}' +
        '.rp-tbl th{background:#f1f5f9;color:#334155;font-weight:600;padding:5px 6px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap}' +
        '.rp-tbl th:first-child,.rp-tbl td:first-child{text-align:left}' +
        '.rp-tbl td{padding:4px 6px;border-bottom:1px solid #f1f5f9;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}' +
        '.rp-ok{color:#15803d;font-weight:600}.rp-bad{color:#b91c1c;font-weight:600}' +
        '.rp-note{font-size:12px;color:#64748b;line-height:1.55}' +
        '.rp-scroll{max-height:360px;overflow:auto}' +
        '.rp-warn{font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:6px 9px;margin-top:8px}';

    function mount(root) {
        if (!root || root.querySelector('.rp-root')) return;
        if (!document.getElementById('rp-css')) { var st = el('style', { id: 'rp-css' }); st.textContent = CSS; document.head.appendChild(st); }
        var wrap = el('div', { 'class': 'rp-root' });
        var opts = SECTIONS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('');
        wrap.innerHTML =
            '<div class="rp-card"><div class="rp-head"><div class="rp-title">입력 — 표준 단면 · 철근</div>' +
            '<span class="rp-status" id="rpStatus">계산하면 서버(비공개 엔진)가 세 방법의 좌표를 돌려줍니다.</span></div>' +
            '<div class="rp-body"><div class="rp-form">' +
            '<label>단면<select id="rpSec">' + opts + '</select></label>' +
            '<label>피복 c (mm)<input id="rpCover" type="number" value="40"></label>' +
            '<label>횡방향 d<sub>s</sub><input id="rpDs" type="number" value="13"></label>' +
            '<label>종방향 d<sub>l</sub><input id="rpDl" type="number" value="16"></label>' +
            '<label>종방향 ctc (최대)<input id="rpCtc" type="number" value="150"></label>' +
            '<label>임의배치 N<input id="rpN" type="number" value="20"></label>' +
            '<label>흔들기 ±x,y (mm)<input id="rpJxy" type="number" value="25"></label>' +
            '<label>흔들기 ±회전 (°)<input id="rpJr" type="number" value="5"></label>' +
            '<label>시드<input id="rpSeed" type="number" value="20261114" style="width:100px"></label>' +
            '<button class="rp-btn" id="rpRun" type="button">계산</button>' +
            '</div><div class="rp-note" style="margin-top:8px">' +
            '<b>(a) 파라메트릭</b> 피복 평행선 교점으로 유도(정답) · <b>(b) APF</b> 정답을 목표점으로 받아 감 · ' +
            '<b>(c) J</b> 형상 코드 + 대략 위치만 → J 최소화. 종방향은 면마다 한 줄(ctc)로만 넣고 절곡부 자리는 J 가 찾는다.</div></div></div>' +
            '<div class="rp-split">' +
            '<div class="rp-card"><div class="rp-head"><div class="rp-title">단면 · 철근</div><span class="rp-note">휠 확대 · 끌어서 이동 · 더블클릭 맞춤</span></div>' +
            '<div class="rp-body"><div class="rp-layers" id="rpLayers"></div><div class="rp-svgwrap"><svg id="rpSvg"></svg></div><div id="rpWarn"></div></div></div>' +
            '<div><div class="rp-card"><div class="rp-head"><div class="rp-title">요약</div></div><div class="rp-body"><div class="rp-kpis" id="rpKpis"><span class="rp-note">아직 계산 전</span></div><div class="rp-note" id="rpInputs"></div></div></div>' +
            '<div class="rp-card"><div class="rp-head"><div class="rp-title">횡방향 꺾임점 (파라메트릭 vs J)</div></div><div class="rp-body rp-scroll" id="rpBars"></div></div>' +
            '<div class="rp-card"><div class="rp-head"><div class="rp-title">종방향 절곡부 (정답 vs J)</div></div><div class="rp-body rp-scroll" id="rpLong"></div></div></div>' +
            '</div>';
        root.appendChild(wrap);
        initLayers();
        initZoom();
        document.getElementById('rpRun').addEventListener('click', run);
    }

    // ── 레이어 ──
    var LAYERS = [
        ['param', '(a) 파라메트릭 정답', C.param, true], ['Jinit', '(c) J 출발 형상', C.Jinit, true], ['J', '(c) J 결과', C.J, true],
        ['lQ', '종방향 정답', C.lQ, true], ['lJ', '종방향 J', C.lJ, true], ['apf', '(b) APF 경로', C.apf, false]
    ];
    var vis = {};
    function initLayers() {
        var box = document.getElementById('rpLayers'); box.innerHTML = '';
        LAYERS.forEach(function (L) {
            vis[L[0]] = L[3];
            var lab = el('label', null, '<input type="checkbox"' + (L[3] ? ' checked' : '') + '><span class="rp-sw" style="background:' + L[2] + '"></span>' + L[1]);
            lab.querySelector('input').addEventListener('change', function (e) { vis[L[0]] = e.target.checked; if (DATA) draw(DATA, true); });
            box.appendChild(lab);
        });
    }

    // ── 확대 · 이동 (viewBox) ──
    var VB = null, VB0 = null;
    function setVB(v) { VB = v; document.getElementById('rpSvg').setAttribute('viewBox', v.join(' ')); }
    function initZoom() {
        var svg = document.getElementById('rpSvg'), drag = null;
        svg.addEventListener('wheel', function (e) {
            if (!VB) return; e.preventDefault();
            var r = svg.getBoundingClientRect(), s = e.deltaY < 0 ? 0.85 : 1 / 0.85;
            var mx = VB[0] + (e.clientX - r.left) / r.width * VB[2], my = VB[1] + (e.clientY - r.top) / r.height * VB[3];
            setVB([mx - (mx - VB[0]) * s, my - (my - VB[1]) * s, VB[2] * s, VB[3] * s]);
        }, { passive: false });
        svg.addEventListener('pointerdown', function (e) { if (!VB) return; drag = { x: e.clientX, y: e.clientY, vb: VB.slice() }; svg.setPointerCapture(e.pointerId); svg.style.cursor = 'grabbing'; });
        svg.addEventListener('pointermove', function (e) {
            if (!drag) return; var r = svg.getBoundingClientRect();
            setVB([drag.vb[0] - (e.clientX - drag.x) / r.width * drag.vb[2], drag.vb[1] - (e.clientY - drag.y) / r.height * drag.vb[3], drag.vb[2], drag.vb[3]]);
        });
        svg.addEventListener('pointerup', function () { drag = null; svg.style.cursor = 'grab'; });
        svg.addEventListener('dblclick', function () { if (VB0) setVB(VB0.slice()); });
    }

    // ── 계산 요청 ──
    var DATA = null;
    function num(id) { return parseFloat(document.getElementById(id).value); }
    function run() {
        var btn = document.getElementById('rpRun'), st = document.getElementById('rpStatus');
        var body = {
            mode: 'para', section: document.getElementById('rpSec').value,
            cover: num('rpCover'), ds: num('rpDs'), dl: num('rpDl'), ctc: num('rpCtc'),
            n: num('rpN'), seed: num('rpSeed'), jitter: [num('rpJxy'), num('rpJxy'), num('rpJr')]
        };
        btn.disabled = true; st.textContent = '서버에서 계산 중…'; var t0 = Date.now();
        fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            .then(function (r) { return r.text(); })
            .then(function (txt) {
                var d; try { d = JSON.parse(txt); } catch (e) { throw new Error('응답이 JSON 이 아님: ' + txt.slice(0, 120)); }
                if (!d.ok) throw new Error(d.error || '서버 오류');
                if (!d.J || !d.param) throw new Error('서버 엔진이 옛 버전입니다 — pull.php 를 한 번 돌려 주세요 (시뮬레이션 모드 없음)');
                DATA = d; draw(d, false); tables(d);
                st.textContent = d.label + ' — 서버 ' + d.ms + ' ms · 왕복 ' + (Date.now() - t0) + ' ms' + (d.server && d.server.php ? ' · PHP ' + d.server.php : '');
            })
            .catch(function (e) { st.innerHTML = '<span class="rp-bad">' + e.message + '</span>'; })
            .then(function () { btn.disabled = false; });
    }

    // ── 그리기 (y 위로 → SVG 는 y 아래로 : y 를 뒤집는다) ──
    function draw(d, keepView) {
        var svg = document.getElementById('rpSvg'); while (svg.firstChild) svg.removeChild(svg.firstChild);
        var P = d.polygon, minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
        P.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
        var pad = Math.max(maxx - minx, maxy - miny) * 0.06;
        var vb = [minx - pad, -maxy - pad, (maxx - minx) + 2 * pad, (maxy - miny) + 2 * pad];
        // 화면 비율 4:5 에 맞춤
        var want = 4 / 5, have = vb[2] / vb[3];
        if (have < want) { var w = vb[3] * want; vb[0] -= (w - vb[2]) / 2; vb[2] = w; } else { var h = vb[2] / want; vb[1] -= (h - vb[3]) / 2; vb[3] = h; }
        VB0 = vb; if (!keepView || !VB) setVB(vb.slice());
        var px = function (p) { return p[0] + ',' + (-p[1]); };
        var poly = function (pts) { return pts.map(px).join(' '); };
        var g = svgEl('g', {}); svg.appendChild(g);
        g.appendChild(svgEl('polygon', { points: poly(P), fill: C.conc, stroke: C.concLine, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }));
        var ds = d.ds, dl = d.dl;
        if (vis.apf && d.apf && d.apf.bars) Object.keys(d.apf.bars).forEach(function (id) {
            (d.apf.bars[id].agents || []).forEach(function (a) {
                if (a && a.path && a.path.length > 1) g.appendChild(svgEl('polyline', { points: poly(a.path), fill: 'none', stroke: C.apf, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', opacity: 0.75 }));
            });
        });
        if (vis.Jinit && d.J.init) Object.keys(d.J.init).forEach(function (id) {
            g.appendChild(svgEl('polyline', { points: poly(d.J.init[id]), fill: 'none', stroke: C.Jinit, 'stroke-width': 1.2, 'stroke-dasharray': '4 3', 'vector-effect': 'non-scaling-stroke' }));
        });
        if (vis.param) d.param.bars.forEach(function (b) {
            g.appendChild(svgEl('polyline', { points: poly(b.pts), fill: 'none', stroke: C.param, 'stroke-width': 1.4, 'stroke-dasharray': '6 4', 'vector-effect': 'non-scaling-stroke' }));
        });
        if (vis.J) Object.keys(d.J.bars).forEach(function (id) {
            var pts = d.J.bars[id]; if (!pts || pts.length < 2) return;
            // 꺾임 원호 포함 prims 로 그린다 (실제 철근 꼴, 지름 = d_s)
            var prs = (d.J.prims || []).filter(function (pr) { return pr.bar === id; });
            if (prs.length) prs.forEach(function (pr) {
                if (pr.t === 'line') g.appendChild(svgEl('line', { x1: pr.p[0], y1: -pr.p[1], x2: pr.p[2], y2: -pr.p[3], stroke: C.J, 'stroke-width': ds, 'stroke-linecap': 'round' }));
                else {
                    var cx = pr.p[0], cy = pr.p[1], r = pr.p[2], a0 = pr.p[3] * Math.PI / 180, a1 = pr.p[4] * Math.PI / 180;
                    var sp = pr.p[4] - pr.p[3]; while (sp < 0) sp += 360; while (sp > 360) sp -= 360;
                    var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
                    // y 를 뒤집으면 반시계 → 시계 : sweep-flag 0
                    g.appendChild(svgEl('path', { d: 'M' + x0 + ',' + (-y0) + ' A' + r + ',' + r + ' 0 ' + (sp > 180 ? 1 : 0) + ' 0 ' + x1 + ',' + (-y1), fill: 'none', stroke: C.J, 'stroke-width': ds }));
                }
            });
            else g.appendChild(svgEl('polyline', { points: poly(pts), fill: 'none', stroke: C.J, 'stroke-width': ds, 'stroke-linejoin': 'round' }));
        });
        if (vis.lJ) (d.J.long || []).forEach(function (q) { g.appendChild(svgEl('circle', { cx: q[0], cy: -q[1], r: dl / 2, fill: C.lJ, stroke: '#713f12', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke' })); });
        if (vis.lQ) d.param.long.forEach(function (l) {
            if (l.kind !== 'pocket') return;
            g.appendChild(svgEl('circle', { cx: l.p[0], cy: -l.p[1], r: dl / 2, fill: 'none', stroke: C.lQ, 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke' }));
        });
        var w = document.getElementById('rpWarn');
        w.innerHTML = (d.param.warn && d.param.warn.length) ? '<div class="rp-warn">' + d.param.warn.join('<br>') + '</div>' : '';
    }

    // ── 표 ──
    function tables(d) {
        var errs = d.J.err || {}, nB = 0, okB = 0;
        Object.keys(errs).forEach(function (k) { nB++; if (errs[k] != null && errs[k] <= 1) okB++; });
        var le = d.J.longErr || {}, t = d.trials || {}, apf = d.apf || {};
        var nVert = d.polygon.length;
        var kpi = function (v, s, ok) { return '<div class="rp-kpi"><b class="' + (ok == null ? '' : (ok ? 'rp-ok' : 'rp-bad')) + '">' + v + '</b><span>' + s + '</span></div>'; };
        document.getElementById('rpKpis').innerHTML =
            kpi(okB + ' / ' + nB, 'J 횡방향 꺾임점 ≤ 1 mm (max ' + f2(d.J.errMax) + ')', okB === nB) +
            kpi((le.pocketHit || 0) + ' / ' + (le.pocketN || 0), 'J 종방향 절곡부 ≤ 1 mm (max ' + f2(le.pocketMax) + ')', le.pocketHit === le.pocketN) +
            kpi(t.jBarN ? Math.round(100 * t.jBarOk / t.jBarN) + '%' : '-', '임의배치 N=' + t.n + ' (±' + (t.jitter ? t.jitter[0] + 'mm ±' + t.jitter[2] + '°' : '') + ') 철근 성공', t.jBarN ? t.jBarOk === t.jBarN : null) +
            kpi((t.apfOk != null ? t.apfOk : '-') + ' / ' + (t.n || 0), 'APF 도달 (목표점 = 정답을 받음)', null) +
            kpi(4 + 11 * nVert, '파라메트릭 유도값 수 (엑셀 기준)', null) +
            kpi(f1(d.props_in.A) + ' in²', '단면적 (공표 ' + d.pub.A + ')', Math.abs(d.props_in.A - d.pub.A) < 1);
        var jin = (d.J.inputs || []).map(function (x) { return x.id + '(' + x.code + ')'; }).join(' · ');
        document.getElementById('rpInputs').innerHTML =
            '<b>J 입력</b> — 철근마다 형상 코드 · 대략 꺾임점(단면 모서리 안쪽 80 mm) · 대략 다리 길이 · 앉을 면. 좌표 유도 없음.<br>' + jin +
            '<br><b>APF</b> k<sub>att</sub> ' + apf.k_att + ' · k<sub>rep</sub> ' + apf.k_rep + ' · ρ₀ ' + f1(apf.rho0) + ' mm · 걸음 ' + apf.step + ' mm · ' + apf.iter + '회';
        // 횡방향 표
        var pb = {}; d.param.bars.forEach(function (b) { pb[b.id] = b; });
        var h = '<table class="rp-tbl"><tr><th>철근</th><th>코드</th><th>φ°</th><th>정답 x</th><th>정답 y</th><th>J x</th><th>J y</th><th>오차 mm</th></tr>';
        d.param.bars.forEach(function (b) {
            var j = d.J.bars[b.id], jm = j ? j[1] : null, e = errs[b.id];
            h += '<tr><td>' + b.id + '</td><td>' + b.code + '</td><td>' + f1(b.ang) + '</td><td>' + f1(b.pts[1][0]) + '</td><td>' + f1(b.pts[1][1]) + '</td>' +
                 '<td>' + (jm ? f1(jm[0]) : '-') + '</td><td>' + (jm ? f1(jm[1]) : '-') + '</td><td class="' + (e != null && e <= 1 ? 'rp-ok' : 'rp-bad') + '">' + f2(e) + '</td></tr>';
        });
        document.getElementById('rpBars').innerHTML = h + '</table>';
        // 종방향 표
        var each = le.each || {};
        h = '<table class="rp-tbl"><tr><th>모서리</th><th>종류</th><th>정답 x</th><th>정답 y</th><th>가장 가까운 J</th><th>오차 mm</th></tr>';
        d.param.long.forEach(function (l) {
            var e = each[l.at] || {};
            var pocket = l.kind === 'pocket';
            h += '<tr><td>' + l.at + '</td><td>' + (pocket ? '절곡부(볼록)' : '오목 — 평가 제외') + '</td><td>' + f1(l.p[0]) + '</td><td>' + f1(l.p[1]) + '</td><td>' + (e.by || '-') + '</td>' +
                 '<td class="' + (!pocket ? '' : (e.err != null && e.err <= 1 ? 'rp-ok' : 'rp-bad')) + '">' + f2(e.err) + '</td></tr>';
        });
        document.getElementById('rpLong').innerHTML = h + '</table>';
    }

    window.RebarPara = { mount: mount };
})();
