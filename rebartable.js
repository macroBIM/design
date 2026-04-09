// rebartable.js v001

function rebar_click() {
    // 1. 메인 화면 초기화 및 스크롤 가능한 컨테이너 생성
    const mainWrap = document.getElementById('wrap_main');
    mainWrap.innerHTML = `
        <div class="container-fluid pt-3" style="height: 100%; overflow-y: auto; padding-bottom: 50px;">
            <h2 class="mb-4 fw-bold border-bottom pb-2">국가별 철근 규격 제원표</h2>
            
            <div id="rebar-ks-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> KS D 3504 데이터 불러오는 중...
            </div>
            
            <div id="rebar-astm-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> ASTM A615 데이터 불러오는 중...
            </div>
            
            <div id="rebar-bs-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> BS 4449 데이터 불러오는 중...
            </div>
        </div>
    `;

    // 2. 왼쪽 사이드바 메뉴 업데이트 (선택 사항: 각 표로 이동하는 앵커 링크)
    const sideWrap = document.getElementById('wrap_side');
    if (sideWrap) {
        sideWrap.innerHTML = `
            <li class="nav-item"><a class="nav-link text-dark" href="#rebar-ks-container">1. KS D 3504 (한국)</a></li>
            <li class="nav-item"><a class="nav-link text-dark" href="#rebar-astm-container">2. ASTM A615 (미국)</a></li>
            <li class="nav-item"><a class="nav-link text-dark" href="#rebar-bs-container">3. BS 4449 (영국)</a></li>
        `;
    }

    // 3. CSV 파일 경로 설정 (GitHub Pages의 루트 경로에 파일이 있다고 가정)
    // 기존 상대 경로를 깃허브 Pages의 절대 경로로 수정
    const pathKS = 'https://macrobim.github.io/macroBIM/rebar_ks.csv';
    const pathASTM = 'https://macrobim.github.io/macroBIM/rebar_astm.csv';
    const pathBS = 'https://macrobim.github.io/macroBIM/rebar_bs.csv';

    // 4. 데이터 Fetch 및 렌더링 실행
    fetchAndRenderCSV(pathKS, 'rebar-ks-container', '1. KS D 3504 (한국 표준 - 이형 봉강)');
    fetchAndRenderCSV(pathASTM, 'rebar-astm-container', '2. ASTM A615 (미국 표준 - Carbon-Steel Bars)');
    fetchAndRenderCSV(pathBS, 'rebar-bs-container', '3. BS 4449 (영국/유럽 표준)');

}

// CSV를 가져와서 HTML 테이블로 만들어주는 공통 함수
function fetchAndRenderCSV(url, containerId, title) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(csvText => {
            renderTable(csvText, containerId, title);
        })
        .catch(error => {
            document.getElementById(containerId).innerHTML = `
                <div class="alert alert-danger">
                    <strong>오류 발생:</strong> ${title} 데이터를 불러오는데 실패했습니다. CSV 파일 경로(${url})를 확인해주세요.
                </div>`;
            console.error('Error fetching CSV:', error);
        });
}

// CSV 텍스트를 Bootstrap Table로 변환하는 함수
function renderTable(csvText, containerId, title) {
    // 줄바꿈 기준으로 행 분리 (Mac/Win 호환을 위해 \r 제거)
    const rows = csvText.replace(/\r/g, '').trim().split('\n');
    if (rows.length === 0) return;

    let html = `<h4>${title}</h4>
                <div class="table-responsive bg-white shadow-sm rounded">
                <table class="table table-hover table-bordered text-center align-middle mb-0">`;

    // 헤더 처리 (첫 번째 줄)
    const headers = rows[0].split(',');
    html += '<thead class="table-light"><tr>';
    headers.forEach(header => {
        html += `<th>${header.trim()}</th>`;
    });
    html += '</tr></thead><tbody>';

    // 데이터 처리 (두 번째 줄부터)
    for (let i = 1; i < rows.length; i++) {
        // 빈 줄 패스
        if (rows[i].trim() === '') continue; 
        
        const cols = rows[i].split(',');
        html += '<tr>';
        cols.forEach((col, index) => {
            if (index === 0) { // 호칭명은 굵게 표시
                html += `<td><strong>${col.trim()}</strong></td>`;
            } else {
                html += `<td>${col.trim()}</td>`;
            }
        });
        html += '</tr>';
    }

    html += '</tbody></table></div>';
    
    // 생성된 HTML을 지정된 컨테이너에 삽입
    document.getElementById(containerId).innerHTML = html;
}
