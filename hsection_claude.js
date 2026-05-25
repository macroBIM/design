// hsection_claude.js
//
// 리디자인 대시보드의 "H Section" 작도 페이지 전용 글루 코드.
// macroBIM 레포(https://macrobim.github.io/macroBIM/)에서 로드되는
// 작도 엔진을 그대로 재사용한다.
//   - KonvaViewer        (konvaviewer.js)  : 4분할 동기화 캔버스 + 치수선
//   - plotly_hbeam       (bim_plotly_geo.js): H형강 단면 형상
//   - dxf_generator      (bim_dxf.js)      : DXF 생성/다운로드
//
// 입력은 새 디자인 페이지의 inp-* 필드를 읽고,
// 캔버스는 #hsec-canvas 컨테이너에 그린다.

(function (global) {

  var CANVAS_ID = 'hsec-canvas';
  var INPUT_IDS = ['inp-H', 'inp-Bt', 'inp-Bb', 'inp-tw', 'inp-tft', 'inp-tfb', 'inp-R', 'inp-L'];

  // DXF 생성기 인스턴스(지연 생성, 매 작도 시 재구성)
  var odxf = null;
  function ensureDxf() {
    if (!odxf && typeof dxf_generator === 'function') odxf = dxf_generator();
    return odxf;
  }

  function num(id, fallback) {
    var el = document.getElementById(id);
    var v = el ? parseFloat(el.value) : NaN;
    return isNaN(v) ? fallback : v;
  }

  function readParams() {
    return {
      dsech:   num('inp-H', 300),   // H형강 높이
      dbt:     num('inp-Bt', 300),  // 상부 플랜지 폭
      dbb:     num('inp-Bb', 300),  // 하부 플랜지 폭
      dtw:     num('inp-tw', 10),   // 복부 두께
      dttf:    num('inp-tft', 15),  // 상부 플랜지 두께
      dtbf:    num('inp-tfb', 15),  // 하부 플랜지 두께
      dradius: num('inp-R', 0),     // 필렛 반경
      dleng:   num('inp-L', 500)    // 보 길이
    };
  }

  // 배치 입력(CSV: H,Bt,Bb,tw,tft,tfb,R,L) → 개별 입력 반영 후 재작도
  function parseHSectionBatch() {
    var batch = document.getElementById('inp-batch');
    if (!batch) return;
    var vals = String(batch.value).split(',').map(function (v) { return parseFloat(v.trim()); });
    for (var i = 0; i < INPUT_IDS.length; i++) {
      var el = document.getElementById(INPUT_IDS[i]);
      if (el && !isNaN(vals[i])) el.value = vals[i];
    }
    drawHSectionClaude();
  }

  // 개별 입력 → 배치 텍스트박스 동기화
  function syncHSectionBatch() {
    var batch = document.getElementById('inp-batch');
    if (!batch) return;
    batch.value = INPUT_IDS.map(function (id) {
      var el = document.getElementById(id);
      return el ? el.value : '0';
    }).join(',');
  }

  // ── DXF 구성 (4개 뷰를 서로 겹치지 않는 원점에 배치) ──
  function buildDXF(p) {
    var dxf = ensureDxf();
    if (!dxf) return;

    var dsech = p.dsech, dbt = p.dbt, dbb = p.dbb, dtw = p.dtw,
        dttf = p.dttf, dtbf = p.dtbf, dradius = p.dradius, dleng = p.dleng;

    dxf.init();
    dxf.layer('hsec_cent', 1, 'CENTER');
    dxf.layer('hsec_hidden', 4, 'HIDDEN');
    dxf.layer('hsec_solid', 4, 'CONTINUOUS');
    dxf.layer('hsec_dim', 1, 'CONTINUOUS');

    var dOx = 0, dOy = 0;
    var dOx_side = dleng * 2, dOy_side = 0;
    var dOx_top = 0, dOy_top = dleng * 3.0;
    var dOx_bot = dleng * 2, dOy_bot = dleng * 3.0;

    dxf.hbeam(dOx, dOy + dsech / 2, dsech, dbt, dbb, dttf, dtbf, dtw, dradius, 'hsec_solid');
    dxf.hbeam_top(dOx_top, dOy_top - dleng / 2, dsech, dbt, dbb, dttf, dtbf, dtw, dleng, 'hsec_solid', 'hsec_hidden');
    dxf.hbeam_bot(dOx_bot, dOy_bot - dleng / 2, dsech, dbt, dbb, dttf, dtbf, dtw, dleng, 'hsec_solid', 'hsec_hidden');
    dxf.hbeam_side(dOx_side, dOy_side + dsech / 2, dsech, dbt, dbb, dttf, dtbf, dtw, dleng, 'hsec_solid', 'hsec_hidden');
  }

  // ── 화면 작도 (KonvaViewer 4분할 + 치수선) ──
  function drawCanvas(p) {
    var host = document.getElementById(CANVAS_ID);
    if (!host) return;
    if (typeof KonvaViewer !== 'function' || typeof plotly_hbeam !== 'function') return;
    // 페이지가 아직 보이지 않으면(폭/높이 0) 캔버스 작도는 생략
    if (!host.offsetWidth || !host.offsetHeight) return;

    var dsech = p.dsech, dbt = p.dbt, dbb = p.dbb, dtw = p.dtw,
        dttf = p.dttf, dtbf = p.dtbf, dradius = p.dradius, dleng = p.dleng;

    var ocvs = new KonvaViewer(CANVAS_ID);
    ocvs.addLayer('hsec_solid', 'cyan', 'solid', 2);
    ocvs.addLayer('hsec_hidden', 'cyan', 'hidden', 1.5);
    ocvs.addLayer('hsec_center', 'red', 'solid', 2);
    var alayer = ['hsec_solid', 'hsec_hidden', 'hsec_center'];

    var ddim_ext = 20, ddim_off = 20;
    var dOx = 0, dOy = 0;
    var dp1x, dp1y, dp2x, dp2y;

    /* front view */
    plotly_hbeam(ocvs, 0, alayer, dOx, dOy, dsech, dbt, dbb, dttf, dtbf, dtw, dradius, dleng);

    dp1x = dOx - dbt / 2; dp1y = dOy + dsech + ddim_off;
    dp2x = dOx + dbt / 2; dp2y = dOy + dsech + ddim_off;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dtw / 2; dp1y = dOy + dsech / 2;
    dp2x = dOx + dtw / 2; dp2y = dOy + dsech / 2;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 1);

    dp1x = dOx - dbt / 2 - ddim_off; dp1y = dOy;
    dp2x = dOx - dbt / 2 - ddim_off; dp2y = dOy + dsech;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dbt / 2 - ddim_off; dp1y = dOy;
    dp2x = dOx - dbt / 2 - ddim_off; dp2y = dOy + dtbf;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    dp1x = dp2x; dp1y = dp2y;
    dp2x = dp1x; dp2y = dOy + dsech - dttf;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    dp1x = dp2x; dp1y = dp2y;
    dp2x = dp1x; dp2y = dOy + dsech;
    ocvs.addDimLinear('front', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    if (dradius > 0) {
      dp1x = dOx - dtw / 2 - dradius; dp1y = dOy + dsech - dttf - dradius;
      ocvs.addDimRadius('front', dp1x, dp1y, dradius, 45);

      dp1x = dOx - dtw / 2 - dradius; dp1y = dOy + dtbf + dradius;
      ocvs.addDimRadius('front', dp1x, dp1y, dradius, -45);
    }

    /* top view */
    plotly_hbeam(ocvs, 1, alayer, dOx, dOy, dsech, dbt, dbb, dttf, dtbf, dtw, dradius, dleng);

    dp1x = dOx - dbt / 2 - ddim_off; dp1y = dOy - dleng / 2;
    dp2x = dOx - dbt / 2 - ddim_off; dp2y = dOy + dleng / 2;
    ocvs.addDimLinear('top', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dbt / 2; dp1y = dOy + dleng / 2 + ddim_off;
    dp2x = dOx + dbt / 2; dp2y = dOy + dleng / 2 + ddim_off;
    ocvs.addDimLinear('top', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dtw / 2; dp1y = dOy + dleng / 2 + ddim_off;
    dp2x = dOx + dtw / 2; dp2y = dOy + dleng / 2 + ddim_off;
    ocvs.addDimLinear('top', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    /* bottom view */
    plotly_hbeam(ocvs, 2, alayer, dOx, dOy, dsech, dbt, dbb, dttf, dtbf, dtw, dradius, dleng);

    dp1x = dOx - dbb / 2 - ddim_off; dp1y = dOy - dleng / 2;
    dp2x = dOx - dbb / 2 - ddim_off; dp2y = dOy + dleng / 2;
    ocvs.addDimLinear('bottom', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dbb / 2; dp1y = dOy + dleng / 2 + ddim_off;
    dp2x = dOx + dbb / 2; dp2y = dOy + dleng / 2 + ddim_off;
    ocvs.addDimLinear('bottom', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dtw / 2; dp1y = dOy + dleng / 2 + ddim_off;
    dp2x = dOx + dtw / 2; dp2y = dOy + dleng / 2 + ddim_off;
    ocvs.addDimLinear('bottom', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    /* side view */
    plotly_hbeam(ocvs, 3, alayer, dOx, dOy, dsech, dbt, dbb, dttf, dtbf, dtw, dradius, dleng);

    dp1x = dOx - dleng / 2 - ddim_off; dp1y = dOy;
    dp2x = dOx - dleng / 2 - ddim_off; dp2y = dOy + dsech;
    ocvs.addDimLinear('side', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    dp1x = dOx - dleng / 2 - ddim_off; dp1y = dOy;
    dp2x = dOx - dleng / 2 - ddim_off; dp2y = dOy + dtbf;
    ocvs.addDimLinear('side', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    dp1x = dOx - dleng / 2 - ddim_off; dp1y = dOy + dsech - dttf;
    dp2x = dOx - dleng / 2 - ddim_off; dp2y = dOy + dsech;
    ocvs.addDimLinear('side', dp1x, dp1y, dp2x, dp2y, ddim_ext * 3);

    dp1x = dOx - dleng / 2; dp1y = dOy + dsech + ddim_off;
    dp2x = dOx + dleng / 2; dp2y = dOy + dsech + ddim_off;
    ocvs.addDimLinear('side', dp1x, dp1y, dp2x, dp2y, ddim_ext * 6);

    ocvs.render();
  }

  // 메인: 입력 읽기 → 배치 동기화 → DXF 구성 → 캔버스 작도
  function drawHSectionClaude() {
    var p = readParams();
    syncHSectionBatch();
    buildDXF(p);
    drawCanvas(p);
  }

  // DXF 다운로드 (현재 입력값으로 재구성 후 저장)
  function downloadHSectionDXF() {
    var dxf = ensureDxf();
    if (!dxf) { alert('DXF 엔진이 로드되지 않았습니다. (bim_dxf.js)'); return; }
    buildDXF(readParams());
    dxf.download('Hsection.dxf');
  }

  global.drawHSectionClaude = drawHSectionClaude;
  global.parseHSectionBatch = parseHSectionBatch;
  global.syncHSectionBatch = syncHSectionBatch;
  global.downloadHSectionDXF = downloadHSectionDXF;

})(window);
