// 메뉴 클릭 시 실행되는 메인 함수 v007
function steelsection_click() {
    // 1. 불필요한 사이드바를 '투명화'가 아니라 '공간째로 완전 삭제(숨김)' 처리
    const sideArea = document.getElementById('wrap_side');
    if(sideArea) {
        sideArea.innerHTML = ''; 
        sideArea.style.display = 'none'; 
    }

    // 2. 표 전용 CSS 디자인 동적 삽입 (드롭다운 커스텀 디자인 추가)
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
            
            /* 드롭다운 메뉴를 크고 확실하게 보이도록 디자인 개선 */
            .custom-select-box {
                appearance: none; 
                -webkit-appearance: none;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23333" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>');
                background-repeat: no-repeat;
                background-position: right 15px center;
                background-size: 16px 12px;
                padding: 12px 45px 12px 20px;
                border: 2px solid #ced4da;
                border-radius: 8px;
                font-size: 1.15rem;
                color: #333;
                background-color: #fdfdfd;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .custom-select-box:hover {
                border-color: #adb5bd;
                box-shadow: 0 6px 10px rgba(0,0,0,0.1);
            }
            .custom-select-box:focus {
                outline: none;
                border-color: #6c757d;
                box-shadow: 0 0 0 0.2rem rgba(108,117,125,.25);
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 메인 영역 HTML
    const mainArea = document.getElementById('wrap_main');
    mainArea.innerHTML = `
        <div class="position-relative d-flex align-items-center justify-content-center pt-0 pb-2 mb-2 border-bottom" style="height: 180px;">
            
            <div class="position-absolute d-flex align-items-center" style="left: 0; padding-left: 5px;">
                
                <select id="section-selector" class="custom-select-box font-weight-bold mr-4" onchange="loadSelectedSection()" style="width: auto;">
                    <option value="hsection" selected>H형강 (H-Section)</option>
                    <option value="channel">ㄷ형강 (Channel)</option>
                    <option value="equalangle">등변 ㄱ형강 (Equal Angle)</option>
                    <option value="unequalangle">부등변 ㄱ형강 (Unequal Angle)</option>
                    <option value="invertedangle">부등변 부등두께 ㄱ형강 (Inverted Angle)</option>
                </select>
                
                <div style="width: 210px; height: 170px; display: flex; align-items: center; justify-content: center; background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.08);">
                    <img id="section-image" src="" alt="단면도" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
            </div>

            <h1 class="h1 font-weight-bold mb-0">강구조 단면성능표</h1>
            
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

// 선택된 형강에 매칭되는 깃허브 이미지 파일명
const imageConfigs = {
    'hsection': 'Hsection.jpg',
    'channel': 'channel.png',
    'equalangle': 'angle.png',
    'unequalangle': 'angle.png',
    'invertedangle': 'invertedangle.png'
};

const GITHUB_BASE_URL = 'https://macrobim.github.io/design/';

// 드롭다운 변경 시 실행되는 데이터 로드 함수
async function loadSelectedSection() {
    const selector = document.getElementById('section-selector');
    const selectedType = selector.value;
    const config = sectionConfigs[selectedType];
    
    const imageElement = document.getElementById('section-image');
    if(imageElement && imageConfigs[selectedType]) {
        imageElement.src = GITHUB_BASE_URL + imageConfigs[selectedType];
    }
    
    const thead = document.getElementById('data-table-head');
    const tbody = document.getElementById('data-table-body');
    
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
            if (cols.length < 5) continue; 
            
            const lastCol = cols[cols.length - 1].trim();
            const hasKSFlag = (lastCol === 'O' || lastCol === 'X');
            
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.textContent = cols[0];
            tr.appendChild(tdName);
            
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
