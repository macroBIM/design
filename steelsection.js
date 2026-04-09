// Main function executed on menu click  v009
function steelsection_click() {
    // 1. Hide the unnecessary sidebar completely
    const sideArea = document.getElementById('wrap_side');
    if(sideArea) {
        sideArea.innerHTML = ''; 
        sideArea.style.display = 'none'; 
    }

    // 2. Dynamic injection of CSS for the steel table
    if (!document.getElementById('steel-table-style')) {
        const style = document.createElement('style');
        style.id = 'steel-table-style';
        style.innerHTML = `
            .steel-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; margin-top: 10px;}
            .steel-scroll { max-height: 75vh; overflow-y: auto; }
            .steel-table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 1000px; }
            
            /* 수정된 부분 1: background-clip 추가로 스크롤 시 테두리 깜빡임 방지 */
            .steel-table thead th { background-color: #212529 !important; color: white; font-size: 12px; text-align: center; vertical-align: middle; border-bottom: 1px solid #444; border-right: 1px solid #444; background-clip: padding-box; }
            
            /* 수정된 부분 2: height와 top의 픽셀을 오차 없이 일치시킴 */
            .steel-table thead tr:nth-child(1) th { position: sticky; top: 0; height: 46px; z-index: 102; border-top: 1px solid #444;}
            .steel-table thead tr:nth-child(2) th { position: sticky; top: 46px; height: 36px; z-index: 101; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.4); }
            
            .steel-table tbody td { font-size: 12px; text-align: center; white-space: nowrap; border-bottom: 1px solid #dee2e6; border-right: 1px solid #dee2e6; }
            .steel-table tbody td:first-child { border-left: 1px solid #dee2e6; font-weight: bold; }
            .table-secondary { background-color: #e9ecef !important; color: #555;}
            
            /* Enhanced Custom Dropdown Styling */
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

    // 3. Main Area HTML Setup
    const mainArea = document.getElementById('wrap_main');
    mainArea.innerHTML = `
        <div class="position-relative d-flex align-items-center justify-content-center pt-0 pb-2 mb-2 border-bottom" style="height: 180px;">
            
            <div class="position-absolute d-flex align-items-center" style="left: 0; padding-left: 5px;">
                
                <select id="section-selector" class="custom-select-box font-weight-bold mr-4" onchange="loadSelectedSection()" style="width: auto;">
                    <option value="hsection" selected>H-Section</option>
                    <option value="channel">Channel</option>
                    <option value="equalangle">Equal Angle</option>
                    <option value="unequalangle">Unequal Angle</option>
                    <option value="invertedangle">Inverted Angle</option>
                </select>
                
                <div style="width: 210px; height: 170px; display: flex; align-items: center; justify-content: center; background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.08);">
                    <img id="section-image" src="" alt="Section Profile" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
            </div>

            <h1 class="h1 font-weight-bold mb-0">Section Properties</h1>
            
        </div>

        <div class="steel-card mb-4">
            <div class="steel-scroll">
                <table class="table table-sm table-hover mb-0 steel-table">
                    <thead id="data-table-head"></thead>
                    <tbody id="data-table-body">
                        <tr><td class="text-center py-5">Loading data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 4. Initial Load (H-Section default)
    loadSelectedSection();
}

// Configuration for each section type (URLs and translated Headers with fixed units)
const sectionConfigs = {
    'hsection': {
        url: 'https://macrobim.github.io/design/hsection.csv',
        thead: `<tr><th rowspan="2">Designation<br>(H x B)</th><th rowspan="2">Unit Weight<br>(kg/m)</th><th colspan="5">Standard Sectional Dimension (mm)</th><th rowspan="2">Sectional Area<br>(cm²)</th><th colspan="2">Moment of Inertia<br>(cm⁴)</th><th colspan="2">Radius of Gyration<br>(cm)</th><th colspan="2">Modulus of Section<br>(cm³)</th><th colspan="2">Plastic Modulus<br>(cm³)</th><th rowspan="2">Warping Constant<br>Cw</th><th rowspan="2">Torsional Constant<br>J</th></tr><tr><th>H</th><th>B</th><th>t1</th><th>t2</th><th>r</th><th>Ix</th><th>Iy</th><th>ix</th><th>iy</th><th>Sx</th><th>Sy</th><th>Zx</th><th>Zy</th></tr>`
    },
    'channel': {
        url: 'https://macrobim.github.io/design/channel.csv',
        thead: `<tr><th rowspan="2">Designation<br>(H x B)</th><th colspan="6">Standard Sectional Dimension (mm)</th><th rowspan="2">Sectional Area<br>(cm²)</th><th rowspan="2">Unit Weight<br>(kg/m)</th><th colspan="2">Center of Gravity (cm)</th><th colspan="2">Moment of Inertia (cm⁴)</th><th colspan="2">Radius of Gyration (cm)</th><th colspan="2">Modulus of Section (cm³)</th></tr><tr><th>H</th><th>B</th><th>t1</th><th>t2</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>ix</th><th>iy</th><th>Zx</th><th>Zy</th></tr>`
    },
    'equalangle': {
        url: 'https://macrobim.github.io/design/equalangle.csv',
        thead: `<tr><th rowspan="2">Designation<br>(A x B)</th><th colspan="5">Standard Sectional Dimension (mm)</th><th rowspan="2">Sectional Area<br>(cm²)</th><th rowspan="2">Unit Weight<br>(kg/m)</th><th rowspan="2">Center of Gravity<br>Cx, Cy (cm)</th><th colspan="3">Moment of Inertia (cm⁴)</th><th colspan="3">Radius of Gyration (cm)</th><th rowspan="2">Modulus of Section<br>Zx, Zy (cm³)</th></tr><tr><th>A</th><th>B</th><th>t</th><th>r1</th><th>r2</th><th>Ix, Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix, iy</th><th>max.iu</th><th>min.iv</th></tr>`
    },
    'unequalangle': {
        url: 'https://macrobim.github.io/design/unequalangle.csv',
        thead: `<tr><th rowspan="2">Designation<br>(A x B)</th><th colspan="5">Standard Sectional Dimension (mm)</th><th rowspan="2">Sectional Area<br>(cm²)</th><th rowspan="2">Unit Weight<br>(kg/m)</th><th colspan="2">Center of Gravity (cm)</th><th colspan="4">Moment of Inertia (cm⁴)</th><th colspan="4">Radius of Gyration (cm)</th><th rowspan="2">Tan α</th><th colspan="2">Modulus of Section (cm³)</th></tr><tr><th>A</th><th>B</th><th>t</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix</th><th>iy</th><th>max.iu</th><th>min.iv</th><th>Zx</th><th>Zy</th></tr>`
    },
    'invertedangle': {
        url: 'https://macrobim.github.io/design/invertedangle.csv',
        thead: `<tr><th rowspan="2">Designation<br>(A x B)</th><th colspan="6">Standard Sectional Dimension (mm)</th><th rowspan="2">Sectional Area<br>(cm²)</th><th rowspan="2">Unit Weight<br>(kg/m)</th><th colspan="2">Center of Gravity (cm)</th><th colspan="4">Moment of Inertia (cm⁴)</th><th colspan="4">Radius of Gyration (cm)</th><th rowspan="2">Tan α</th><th colspan="2">Modulus of Section (cm³)</th></tr><tr><th>A</th><th>B</th><th>t1</th><th>t2</th><th>r1</th><th>r2</th><th>Cx</th><th>Cy</th><th>Ix</th><th>Iy</th><th>max.Iu</th><th>min.Iv</th><th>ix</th><th>iy</th><th>max.iu</th><th>min.iv</th><th>Zx</th><th>Zy</th></tr>`
    }
};

// Image mappings for GitHub
const imageConfigs = {
    'hsection': 'Hsection.jpg',
    'channel': 'channel.png',
    'equalangle': 'angle.png',
    'unequalangle': 'angle.png',
    'invertedangle': 'invertedangle.png'
};

const GITHUB_BASE_URL = 'https://macrobim.github.io/design/';

// Function to fetch and render data when dropdown changes
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
    tbody.innerHTML = `<tr><td colspan="30" class="text-center py-5">Loading data...</td></tr>`;

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
        console.error('Data parsing error:', error);
        tbody.innerHTML = `<tr><td colspan="30" class="text-danger text-center py-5">Failed to load data. Please check the file URL.</td></tr>`;
    }
}
