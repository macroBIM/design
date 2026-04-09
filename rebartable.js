// bim_rebar.js v004

function rebar_click() {
    // 1. 메인 화면 초기화 (영문 적용)
    const mainWrap = document.getElementById('wrap_main');
    mainWrap.innerHTML = `
        <div class="container-fluid pt-3" style="height: 100%; overflow-y: auto; padding-bottom: 50px;">
            <h2 class="mb-4 fw-bold border-bottom pb-2">Rebar Specification Tables</h2>
            
            <div id="rebar-ks-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Loading KS D 3504 data...
            </div>
            
            <div id="rebar-astm-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Loading ASTM A615 data...
            </div>
            
            <div id="rebar-bs-container" class="mb-5">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Loading BS 4449 data...
            </div>
        </div>
    `;

    // 2. 좌측 사이드바 내용 지우기 (요청하신 좌측 리스트 삭제)
    const sideWrap = document.getElementById('wrap_side');
    if (sideWrap) {
        sideWrap.innerHTML = ''; 
    }

    // 3. 깃허브 절대 경로 설정
    const pathKS = 'https://macrobim.github.io/design/rebar_ks.csv';
    const pathASTM = 'https://macrobim.github.io/design/rebar_astm.csv';
    const pathBS = 'https://macrobim.github.io/design/rebar_bs.csv';

    // 4. 데이터 Fetch 및 렌더링
    fetchAndRenderCSV(pathKS, 'rebar-ks-container', '1. KS D 3504 (Korean Standard)');
    fetchAndRenderCSV(pathASTM, 'rebar-astm-container', '2. ASTM A615M (US Standard)');
    fetchAndRenderCSV(pathBS, 'rebar-bs-container', '3. BS 4449 (British Standard)');
}

// CSV 한글 헤더를 영문으로 자동 변환하기 위한 매핑 딕셔너리
const headerTranslations = {
    "호칭명": "Designation",
    "호칭지름(mm)": "Nominal Diameter (mm)",
    "공칭지름(mm)": "Nominal Diameter (mm)",
    "공칭단면적(mm2)": "Sectional Area (cm²)", // 이미지 단위가 cm2라면 단위를 바꾸셔도 됩니다.
    "단위중량(kg/m)": "Unit Weight (kg/m)",
    "Bar_Size(US)": "Bar Size (US)",
    "Metric_Size(#)": "Metric Size (#)"
};

// CSV를 가져오는 함수
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
                    <strong>Error:</strong> Failed to load ${title} data. Please check the CSV file path.
                </div>`;
            console.error('Error fetching CSV:', error);
        });
}

// 테이블 렌더링 함수 (디자인 적용)
function renderTable(csvText, containerId, title) {
    const rows = csvText.replace(/\r/g, '').trim().split('\n');
    if (rows.length === 0) return;

    // 제목 렌더링
    let html = `<h4 class="mb-3 fw-bold text-dark">${title}</h4>
                <div class="table-responsive bg-white shadow-sm mb-5">
                <table class="table table-hover table-bordered text-center align-middle mb-0" style="border: 1px solid #dee2e6;">`;

    // 헤더 처리 (참고 이미지와 유사한 다크 테마 적용)
    const headers = rows[0].split(',');
    html += '<thead style="background-color: #212529; color: #ffffff; border-bottom: 2px solid #000;"><tr>';
    headers.forEach(header => {
        let key = header.trim();
        // 딕셔너리에 매핑된 단어가 있으면 영문으로, 없으면 원래 텍스트 사용
        let translatedHeader = headerTranslations[key] || key;
        html += `<th style="padding: 15px 10px; font-weight: 600; font-size: 0.95rem;">${translatedHeader}</th>`;
    });
    html += '</tr></thead><tbody>';

    // 데이터 처리
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue; 
        
        const cols = rows[i].split(',');
        html += '<tr>';
        cols.forEach((col, index) => {
            if (index === 0) {
                // 첫 번째 열(이름)에만 굵은 글씨와 약간의 배경색 적용
                html += `<td style="font-weight: bold; background-color: #f8f9fa;">${col.trim()}</td>`;
            } else {
                html += `<td>${col.trim()}</td>`;
            }
        });
        html += '</tr>';
    }

    html += '</tbody></table></div>';
    
    document.getElementById(containerId).innerHTML = html;
}
