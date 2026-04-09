// 메뉴 클릭 시 실행되는 메인 함수  v003
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

    // 3. 메인 영역 HTML (드롭다운 메뉴 + 단면도 이미지 포함)
    const mainArea = document.getElementById('wrap_main');
    mainArea.innerHTML = `
        <div class="d-flex align-items-center pt-3 pb-2 mb-3 border-bottom hsection-header-container" style="min-height: 100px;">
            
            <div class="mr-3">
                <select id="section-selector" class="form-control font-weight-bold shadow-sm" onchange="loadSelectedSection()" style="cursor: pointer; width: auto; font-size: 1.1rem;">
                    <option value="hsection" selected>H형강 (H-Section)</option>
                    <option value="channel">ㄷ형강 (Channel)</option>
                    <option value="equalangle">등변 ㄱ형강 (Equal Angle)</option>
                    <option value="unequalangle">부등변 ㄱ형강 (Unequal Angle)</option>
                    <option value="invertedangle">부등변 부등두께 ㄱ형강 (Inverted Angle)</option>
                </select>
            </div>

            <div class="flex-grow-1 text-center">
                <h1 class="h2 font-weight-bold mb-0">강구조 단면성능표</h1>
            </div>

            <div style="height: 100px; width: 100px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                <img id="section-image" src="" alt="단면도" style="height: 100%; width: 100%; object-fit: contain;">
            </div>
            
        </div>
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

// 선택된 형강에 매칭되는 깃허브 이미지 파일명 (대소문자 주의)
const imageConfigs = {
    'hsection': 'Hsection.jpg',
    'channel': 'channel.png',
    'equalangle': 'angle.png',
    'unequalangle': 'angle.png',
    'invertedangle': 'invertedangle.png'
};

// 깃허브 Pages 기본 주소
const GITHUB_BASE_URL = 'https://macrobim.github.io/design/';

// 드롭다운 변경 시 실행되는 데이터 로드 함수
async function loadSelectedSection() {
    // 1. 선택된 값 가져오기
    const selector = document.getElementById('section-selector');
    const selectedType = selector.value;
    const config = sectionConfigs[selectedType];
    
    // 2. 단면도 이미지 변경
    const imageElement = document.getElementById('section-image');
    if(imageElement && imageConfigs[selectedType]) {
        // 이미지 주소 = 기본주소 + 파일명
        imageElement.src = GITHUB_BASE_URL + imageConfigs[selectedType];
    }
    
    // 3. 테이블 세팅
    const thead = document.getElementById('data-table-head');
    const tbody = document.getElementById('data-table-body');
    
    // 테이블 헤더 교체
    thead.innerHTML = config.thead;
    tbody.innerHTML = `<tr><td colspan="30" class="text-center py-5">데이터를 불러오는 중입니다...</td></tr>`;

    try {
        const response = await fetch(config.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
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
            
            // 파란색 글자와 그 엔터티 삭제: 
            // 1. table-secondary 클래스 제거 (이미지에서 파란색으로 보이는 디자인)
            const rowClass = ''; // ''; // (hasKSFlag && !isStandard) ? 'table-secondary' : ''; 
            // 2. "*" 추가 제거
            const name = cols[0]; // cols[0]; // (hasKSFlag && !isStandard) ? `${cols[0]} *` : cols[0];   

            const tr = document.createElement('tr');
            if (rowClass) tr.classList.add(rowClass);

            // 호칭 치수 삽입
            const tdName = document.createElement('td');
            tdName.textContent = name;
            tr.appendChild(tdName);
            
            // KS여부 열을 제외한 나머지 데이터 삽입
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
