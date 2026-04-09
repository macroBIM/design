//
// h section, angle, channel 데이터 업로드 v001
//
// 메뉴 클릭 시 실행되는 메인 함수
function steelsection_click() {
    // 1. 사이드바 영역 설정
    const sideArea = document.getElementById('wrap_side');
    if(sideArea) {
        sideArea.innerHTML = `
            <li class="nav-item">
                <a class="nav-link active" href="#">강구조 단면성능표</a>
            </li>
        `;
    }

    // 2. 표 전용 CSS 디자인 동적 삽입
    if (!document.getElementById('steel-table-style')) {
        const style = document.createElement('style');
        style.id = 'steel-table-style';
        style.innerHTML = `
            .steel-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; margin-top: 10px;}
            .steel-scroll { max-height: 75vh; overflow-y: auto; }
            .steel-table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 1000px; }
            .steel-table thead th { background-color: #212529 !important; color: white; font-size: 12px; text-align: center; vertical-align: middle; border-bottom: 1px solid #444; border-right: 1px solid #444; }
            .steel-table thead tr:nth-child(1) th { position: sticky; top: 0; height: 46px; z-index: 102; border-top: 1px solid #444;}
            .steel-table thead tr:nth-child(2) th { position: sticky; top: 45px; height: 36px; z-index: 101; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.4); }
            .steel-table tbody td { font-size: 12px; text-align: center; white-space: nowrap; border-bottom: 1px solid #dee2e6; border-right: 1px solid #dee2e6; }
            .steel-table tbody td:first-child { border-left: 1px solid #dee2e6; font-weight: bold; }
            .table-secondary { background-color: #e9ecef !important; color: #555;}
        `;
        document.head.appendChild(style);
    }

    // 3. 메인 영역 HTML (드롭다운 메뉴 포함)
    const mainArea = document.getElementById('wrap_main');
    mainArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">강구조 단면성능표</h1>
            
            <div class="btn-toolbar mb-2 mb-md-0">
                <select id="section-selector" class="form-control font-weight-bold shadow-sm" onchange="loadSelectedSection()" style="cursor: pointer; width: auto; font-size: 1.1rem;">
                    <option value="hsection">H형강 (H-Section)</option>
                    <option value="channel">ㄷ형강 (Channel)</option>
                    <option value="equalangle">등변 ㄱ형강 (Equal Angle)</option>
                    <option value="unequalangle">부등변 ㄱ형강 (Unequal Angle)</option>
                    <option value="invertedangle">부등변 부등두께 ㄱ형강 (Inverted Angle)</option>
                </select>
            </div>
        </div>
        <p class="text-muted small">* 표시는 KS(JIS)에 없는 규격입니다.</p>

        <div class="steel-card mb-4">
            <div class="steel-scroll">
                <table class="table table-sm table-hover mb-0 steel-table">
                    <thead id="data-table-head"></thead>
                    <tbody id="data-table-body">
                        <tr><td class="text-center py-5">데이터를 준비 중입니다...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 4. 화면이 그려지면 기본값(H형강) 즉시 로드
    loadSelectedSection();
}

// 각 철골 규격별 URL 및 헤더(thead) 설정 객체
const sectionConfigs = {
    'hsection': {
        url: 'https://macrobim.github.io/design/hsection.csv',
        thead: `<tr><th rowspan="2">호칭치수<br>(H x B)</th><th rowspan="2">단위무게<br>(kg/m)</th><th colspan="5">표준단면치수 (mm)</th><th>단면적</th><th colspan="2">단면 2차 모멘트</th><th colspan="2">단면 2차 반경</th><th colspan="2">단면계수</th><th colspan="2">소성단면계수</th><th>뒤틀림상수</th><th>비틀림상수</th></tr><tr><th>H</th><th>B</th><th>t1</th><th>t2</th><th>r</th><th>(cm²)</th><th>Ix</th><th>Iy</th><th>ix</th><th>iy</th><th>Sx</th><th>Sy</th><th>Zx</th><th>Zy</th><th>Cw</th><th>J</th></tr>`
    },
    'channel': {
        url: 'https://macrobim.github.io/design/channel.csv',
        thead: `<tr><th rowspan="2">호칭치수<br>(H x B)</th><th colspan="6">표준단면치수 (mm)</th><th rowspan="2">단면적<br>(cm²)</th><th rowspan="2">단위무게<br>(kg/m)</th><th colspan="2">중심의 위치 (cm)</th><th colspan="2">단면 2차 모멘트 (cm⁴)</th><th colspan="2">단면 2차 반경 (cm)</th><th colspan="2">단면계수 (cm³)</th></tr><tr><th>H</th><th>B</th><th>t1</th><th>t2</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>ix</th><th>iy</th><th>Zx</th><th>Zy</th></tr>`
    },
    'equalangle': {
        url: 'https://macrobim.github.io/design/equalangle.csv',
        thead: `<tr><th rowspan="2">호칭치수<br>(A x B)</th><th colspan="5">표준단면치수 (mm)</th><th rowspan="2">단면적<br>(cm²)</th><th rowspan="2">단위무게<br>(kg/m)</th><th rowspan="2">중심위치<br>Cx, Cy (cm)</th><th colspan="3">단면 2차 모멘트 (cm⁴)</th><th colspan="3">단면 2차 반경 (cm)</th><th rowspan="2">단면계수<br>Zx, Zy (cm³)</th></tr><tr><th>A</th><th>B</th><th>t</th><th>r1</th><th>r2</th><th>Ix, Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix, iy</th><th>max.iu</th><th>min.iv</th></tr>`
    },
    'unequalangle': {
        url: 'https://macrobim.github.io/design/unequalangle.csv',
        thead: `<tr><th rowspan="2">호칭치수<br>(A x B)</th><th colspan="5">표준단면치수 (mm)</th><th rowspan="2">단면적<br>(cm²)</th><th rowspan="2">단위무게<br>(kg/m)</th><th colspan="2">중심위치 (cm)</th><th colspan="4">단면 2차 모멘트 (cm⁴)</th><th colspan="4">단면 2차 반경 (cm)</th><th rowspan="2">Tan α</th><th colspan="2">단면계수 (cm³)</th></tr><tr><th>A</th><th>B</th><th>t</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix</th><th>iy</th><th>max.iu</th><th>min.iv</th><th>Zx</th><th>Zy</th></tr>`
    },
    'invertedangle': {
        url: 'https://macrobim.github.io/design/invertedangle.csv',
        thead: `<tr><th rowspan="2">호칭치수<br>(A x B)</th><th colspan="6">표준단면치수 (mm)</th><th rowspan="2">단면적<br>(cm²)</th><th rowspan="2">단위무게<br>(kg/m)</th><th colspan="2">중심위치 (cm)</th><th colspan="4">단면 2차 모멘트 (cm⁴)</th><th colspan="4">단면 2차 반경 (cm)</th><th rowspan="2">Tan α</th><th colspan="2">단면계수 (cm³)</th></tr><tr><th>A</th><th>B</th><th>t1</th><th>t2</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix</th><th>iy</th><th>max.iu</th><th>min.iv</th><th>Zx</th><th>Zy</th></tr>`
    }
};

// 드롭다운 변경 시 실행되는 데이터 로드 함수
async function loadSelectedSection() {
    // 선택된 값 가져오기
    const selector = document.getElementById('section-selector');
    const selectedType = selector.value;
    const config = sectionConfigs[selectedType];
    
    const thead = document.getElementById('data-table-head');
    const tbody = document.getElementById('data-table-body');
    
    // 테이블 헤더 교체
    thead.innerHTML = config.thead;
    tbody.innerHTML = `<tr><td colspan="30" class="text-center py-5">데이터를 불러오는 중입니다...</td></tr>`;

    try {
        const response = await fetch(config.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
        // 윈도우(\r\n)와 맥(\n) 줄바꿈 모두 완벽 대응
        const rows = csvText.trim().split(/\r?\n/); 
        tbody.innerHTML = ''; 

        const fragment = document.createDocumentFragment();

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols.length < 5) continue; // 빈 줄 무시
            
            // 마지막 컬럼이 'O' 또는 'X' (KS규격여부)인지 확인
            const lastCol = cols[cols.length - 1].trim();
            const hasKSFlag = (lastCol === 'O' || lastCol === 'X');
            const isStandard = (lastCol === 'O');
            
            // X일 경우 회색 배경 클래스 추가
            const rowClass = (hasKSFlag && !isStandard) ? 'table-secondary' : ''; 
            const name = (hasKSFlag && !isStandard) ? `${cols[0]} *` : cols[0];   

            const tr = document.createElement('tr');
            if (rowClass) tr.classList.add(rowClass);

            // 호칭 치수 삽입
            const tdName = document.createElement('td');
            tdName.textContent = name;
            tr.appendChild(tdName);
            
            // KS여부 열을 제외한 나머지 데이터 삽입 (동적 컬럼 개수 대응)
            const len = hasKSFlag ? cols.length - 1 : cols.length;
            for (let j = 1; j < len; j++) {
                const td = document.createElement('td');
                td.textContent = cols[j].trim();
                tr.appendChild(td);
            }
            fragment.appendChild(tr);
        }
        
        tbody.appendChild(fragment);

    } catch (error) {
        console.error('데이터 파싱 에러:', error);
        tbody.innerHTML = `<tr><td colspan="30" class="text-danger text-center py-5">데이터를 불러오지 못했습니다. 파일 주소를 확인해주세요.</td></tr>`;
    }
}
