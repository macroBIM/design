// H Section 메뉴 클릭 시 실행되는 함수
function steelsection_click() {
    // 1. 사이드바 영역(#wrap_side) 설정 (필요 시 수정)
    const sideArea = document.getElementById('wrap_side');
    if(sideArea) {
        sideArea.innerHTML = `
            <li class="nav-item">
                <a class="nav-link active" href="#">H형강 단면성능표</a>
            </li>
        `;
    }

    // 2. 메인 영역(#wrap_main) 설정
    const mainArea = document.getElementById('wrap_main');
    
    // 3. 표 전용 CSS 디자인 동적 삽입 (기존 CSS와 충돌 방지)
    if (!document.getElementById('hsection-table-style')) {
        const style = document.createElement('style');
        style.id = 'hsection-table-style';
        style.innerHTML = `
            .hsection-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; margin-top: 20px;}
            .hsection-scroll { max-height: 75vh; overflow-y: auto; }
            .hsection-table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 1000px; }
            .hsection-table thead th { background-color: #212529 !important; color: white; font-size: 12px; text-align: center; vertical-align: middle; border-bottom: 1px solid #444; border-right: 1px solid #444; }
            .hsection-table thead tr:nth-child(1) th { position: sticky; top: 0; height: 46px; z-index: 102; }
            .hsection-table thead tr:nth-child(2) th { position: sticky; top: 45px; height: 36px; z-index: 101; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.4); }
            #data-table-body td { font-size: 12px; text-align: center; white-space: nowrap; border-bottom: 1px solid #dee2e6; border-right: 1px solid #dee2e6; }
            .table-secondary { background-color: #e9ecef !important; }
        `;
        document.head.appendChild(style);
    }

    // 4. HTML 표 껍데기 삽입
    mainArea.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">H형강 표준 규격 및 단면성능표</h1>
        </div>
        <p class="text-muted small">* 표시는 KS(JIS)에 없는 규격입니다.</p>

        <div class="hsection-card mb-4">
            <div class="hsection-scroll">
                <table class="table table-sm table-hover mb-0 hsection-table">
                    <thead>
                        <tr>
                            <th rowspan="2">호칭치수<br>(H x B)</th>
                            <th rowspan="2">단위무게<br>(kg/m)</th>
                            <th colspan="5">표준단면치수 (mm)</th>
                            <th>단면적</th>
                            <th colspan="2">단면 2차 모멘트</th>
                            <th colspan="2">단면 2차 반경</th>
                            <th colspan="2">단면계수</th>
                            <th colspan="2">소성단면계수</th>
                            <th>뒤틀림상수</th>
                            <th>비틀림상수</th>
                        </tr>
                        <tr>
                            <th>H</th><th>B</th><th>t1</th><th>t2</th><th>r</th>
                            <th>(cm²)</th><th>Ix</th><th>Iy</th><th>ix</th><th>iy</th><th>Sx</th><th>Sy</th><th>Zx</th><th>Zy</th>
                            <th>Cw</th><th>J</th>
                        </tr>
                    </thead>
                    <tbody id="data-table-body">
                        <tr><td colspan="18" class="text-center py-5">CSV 데이터를 불러오는 중입니다...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 5. 표 껍데기가 그려진 후 CSV 데이터 호출 함수 실행
    fetchHSectionCSV();
}

// CSV 데이터 호출 및 표 렌더링 함수
async function fetchHSectionCSV() {
    const GITHUB_CSV_URL = 'https://macrobim.github.io/design/hsection.csv'; // 깃허브 Pages CSV 주소

    try {
        const response = await fetch(GITHUB_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        const tbody = document.getElementById('data-table-body');
        tbody.innerHTML = ''; 

        const fragment = document.createDocumentFragment();

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols.length < 19) continue; 
            
            const isStandard = cols[18].trim() === 'O';
            const rowClass = isStandard ? '' : 'table-secondary'; 
            const name = isStandard ? cols[0] : `${cols[0]} *`;   

            const tr = document.createElement('tr');
            if (rowClass) tr.classList.add(rowClass);

            const tdName = document.createElement('td');
            tdName.textContent = name;
            tr.appendChild(tdName);
            
            for (let j = 1; j <= 17; j++) {
                const td = document.createElement('td');
                td.textContent = cols[j].trim();
                tr.appendChild(td);
            }
            fragment.appendChild(tr);
        }
        
        tbody.appendChild(fragment);

    } catch (error) {
        console.error('데이터 파싱 에러:', error);
        const tbody = document.getElementById('data-table-body');
        if(tbody) {
            tbody.innerHTML = `<tr><td colspan="18" class="text-danger text-center py-5">데이터를 불러오지 못했습니다. 주소(${GITHUB_CSV_URL})를 확인해주세요.</td></tr>`;
        }
    }
}
