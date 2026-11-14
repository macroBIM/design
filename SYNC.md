# 테스트 → 운영 동기화 규칙

## 상단 메뉴 화면 (2026-11-14 운영) — 먼저 읽을 것

운영 첫 화면(`www.macrobim.com/`, 서버의 `index.html`)은 **왼쪽 사이드바가 없다.** 스토어
(`/store/`)와 같은 모양의 상단 머리줄 + 흰/옅은 회색 화면이다.

| | 운영 `www.macrobim.com/` | 시험 `www.macrobim.com/dev/` | 시험 `index_claude.html` |
|---|---|---|---|
| 레이아웃 JS | main `layout_body.js` (상단 메뉴) | **dev 브랜치** `layout_body_test.js` (상단 메뉴) | main `layout_body_test.js` (**왼쪽 메뉴 그대로** — REBAR PARA 등) |
| 스타일 | main `layout_style.css` + **`layout_top.css`** | dev 브랜치 `layout_style.css` (새 화면용으로 다시 씀) | main `layout_style.css` |
| 머리줄 · 푸터 | `/css/site.css` | `/css/dev/site.css` | — |
| 나가는 길 | GitHub Pages (main) | 서버가 끌어감: `dev/_deploy.php` ← `deploy-dev.yml` | GitHub Pages (main) |

- **메뉴:** `HOME · PLATE3D · PIER · STORE`. 모두 대문자, 영어. STORE 는 `/store/` 로 가는 그냥 링크다.
  빔 계산(MacroBEAM) · 표 · 단면 도면 등은 메뉴에서 뺐다 — "도면 전문 사이트"로 보이게 하려는 사용자 결정.
  페이지 코드는 남아 있어서 메뉴에 한 줄 넣으면 다시 나온다.
- **메뉴 넣는 법:** `TOP NAV` 블록에 `'<a class="topnav-item" href="#" data-page="<페이지id>">LABEL</a>'` 한 줄.
  `data-page` 는 이미 있는 `page-view` 의 id(`page-<페이지id>`)와 짝이다. 눌렀을 때 그 페이지를 만드는
  `ensure...()` 는 `showPage` 에 이미 있다. 홈 카드에도 넣으려면 `.home-cards` 안에 `class="home-card"` 하나.
- **스타일 넣는 곳:** 운영은 **`layout_top.css`** (layout_style.css 는 index_claude 도 쓰므로 새 화면 규칙을 넣지 않는다).
  머리줄 · 푸터는 `css/site.css` 하나 — 값과 클래스 이름이 스토어 `store.css` 와 같다.
- **PIER 버튼 이름**(3D View · Download STL · Download DXF)은 `bim_pier_test.js` 가 아니라 레이아웃의
  `relabelPier` 가 바꾼다. 엔진 파일은 index_claude 와 같이 쓰므로 손대지 않았다.
- **푸터는 영어** (사업자 정보 포함, 대표자 영문 Park Youngjin — 사용자 확인). 약관 링크는 `/store/*.html`.

### dev → 운영 순서

1. design `dev` 브랜치에서 `layout_body_test.js` · `layout_style.css` 를 고친다 → 1분 안에 `/dev/` 에 나간다.
2. 운영으로 옮길 때는 **바뀐 부분만** `layout_body.js` 로, 스타일은 `layout_top.css` 로 (아래 원칙 그대로).
   dev 브랜치를 main 에 통째로 합치지 않는다 — dev 의 `layout_body_test.js` · `layout_style.css` 가
   main 으로 가면 index_claude 의 왼쪽 메뉴가 사라진다.
3. `node tools/check_sync_scope.js` · `node tools/check_menu_reset.js --prod` · `node tools/check_menu_reset.js`.
   마지막 것(index_claude 빌드)의 `Konva is not defined` 실패 1건은 원래 있던 것이다(검사가 unpkg 를 막아서).

### 서버 자동 배포 (스토어와 같은 방식)

GitHub Actions 가 서버의 `_deploy.php` 를 부르면 서버가 design 저장소(공개 — 토큰 없음)를 끌어간다.
키는 서버 `/config/store_deploy.php` 의 `key` = design 저장소 Secret `DEPLOY_KEY`.

| 서버 파일 | 무엇을 | 부르는 것 |
|---|---|---|
| `/www/dev/_deploy.php` | dev 브랜치의 `dev/*` + `layout_style.css` · `layout_body_test.js` → `/www/dev/` | `deploy-dev.yml` (dev 에 push) |
| `/www/css/_deploy.php` | `css/*` → main 은 `/www/css/`, dev 는 `/www/css/dev/` | `deploy-css.yml` (main · dev 에 push) |

`_deploy.php` 자신은 배포로 바뀌지 않는다 — 고치면 FTP 로 다시 올려야 한다.
막 push 한 직후 GitHub zipball 이 한 커밋 전 것을 줄 때가 있어, 워크플로가 이번 커밋이 받아질 때까지 다시 부른다.

> **창을 열면 `macroBIM/STATUS.md` 부터 읽는다.** 지금 무엇이 운영에 나가 있고
> 무엇이 테스트에만 있는지, 다른 창이 무엇을 잡고 있는지가 거기 있다. 이 문서는
> **어떻게** 옮기는지를 적고, 그 파일은 **지금 어디까지 갔는지**를 적는다.

`layout_body_test.js` 를 `layout_body.js` 위에 **덮지 않는다.**

두 파일은 실수로 벌어진 게 아니라 **일부러 다르다.** 운영은 검증이 끝난
것만 담는 곳이고, 테스트는 아직 손보는 중인 것을 담는 곳이다. 덮으면
확인 안 된 것들이 한꺼번에 방문자 앞으로 나간다.

동기화란 **이번에 만든 변경만 옮기는 것**이다. 파일 전체가 아니라.

## 운영에 없는 것 — 옮기지 않는다

| | 왜 |
|---|---|
| **Dashboard** (`dashboard`) | 방문자 수 통계. 운영 랜딩은 Home 이다 |
| **PSCBOX** (`draw-pscbox`) | 아직 손보는 중 |
| **Crossbeam** (`quick-crossbeam`) | 판형교의 거더 사이 — 가로보·수직브레이싱·슬래브·방호벽. 폼과 그림(`quick_crossbeam_test.js`)은 있고, PLATE3D 로 모델을 보내는 것과 워크북 내보내기가 아직 없다 |
| **TAPER** (변단면) | 메뉴가 아니라 **엔진 키워드**다. `plate_builder_test.js` 에만 있다 — 운영 엔진은 `TAPER` 행을 모른다. 이게 딸고 오는 것: 엔진 문법 · 부재표 두 줄(끝단면 줄) · 가이드 §6.6 · `tools/check_taper.js`. **운영으로 갈 때 넷이 같이 간다** |

**MacroPLATE3D → Simple connector 는 2026-09-02 에 런칭했다.** 여기 있던
줄이다. 옮길 때 메뉴만 옮기려다 안 되는 것을 알았다 — 운영에는 그 페이지의
스크립트(`quick_simpleconn.js`)가 아예 없었고, 운영 엔진은 폼이 내보내는
`NOTCH ... BY` 를 모르고 있었다. **메뉴 한 줄이 딸고 오는 것이 엔진까지다.**

`tools/check_sync_scope.js` 가 이 셋이 `layout_body.js` 에 들어갔는지 본다.
들어갔으면 실패한다 — 잊어버릴 수 있는 규칙은 검사가 지킨다.

## 스타일도 갈라져 있다

도면 카드(`.hs-*`)가 두 빌드에서 다르게 생겼다. **막지는 않되 매번 보이게**
해 둔다 — 언젠가 옮길 결정을 할 수도 있고, 그건 사람이 할 결정이지 스크립트가
할 결정이 아니다.

- `.hs-ttl` — 테스트: 15px 진한 제목 + 파란 막대. 운영: 11px 대문자 흐린 글씨
- `.hs-hd` — 안쪽 여백 `11px 16px` / `9px 14px`
- `.hs-btn`·`.hs-vbtn` — 테스트에만 누를 때 눌리는 효과
- `.hs-grid` — 테스트에만 `align-items:stretch`
- Lifting lug 뷰 버튼 — 운영은 Back·Left·Center, 테스트는 Side 하나

## 엔진 쪽 `?v=`

PLATE3D 는 **두 군데를 같이** 올린다.

- `macroBIM/plate3d/embed.html` 의 `plate_builder.js?v=`
- `design/layout_body.js` 의 `embed.html?v=`

한쪽만 올리면 브라우저가 캐시에서 옛 `embed.html` 을 꺼내고, 그게 옛 엔진을
부른다. 엔진을 올려도 화면에는 안 나온다. 한 번 밟은 구멍이다.

테스트 쪽(`embed_test.html`, `layout_body_test.js`)은 `Date.now()` 를 쓰므로
손댈 것이 없다 — 테스트는 늘 최신을 봐야 고쳤는지 아닌지를 알 수 있다.

**세 번째 핀은 저 쌍에 딸린 것이 아니다.** `layout_body.js` 의
`quick_simpleconn.js?v=` 는 그 파일 하나만 가리킨다. 폼만 고쳤으면 이것만
올리고 위의 둘은 그대로 둔다 — 셋이 서로 다른 숫자인 것은 잊어버린 게 아니라
**바뀐 파일만 번호가 올라간** 것이다. 안 바뀐 파일의 번호를 같이 올리면
번호가 "무엇이 바뀌었나" 를 더 이상 말해주지 않는다.

| 고친 것 | 올릴 핀 |
|---|---|
| 엔진 (`plate_builder.js`) | `embed.html` 의 것 **과** `layout_body.js` 의 `embed.html?v=` — 반드시 둘 다 |
| 폼 (`quick_simpleconn.js`) | `layout_body.js` 의 `quick_simpleconn.js?v=` 하나 |

## 동기화 순서

```bash
cd design  && node tools/check_menu_reset.js          # 테스트 빌드
# ...변경을 layout_body.js 로 옮긴다 (파일을 덮지 말고)
cd design  && node tools/check_sync_scope.js          # 운영에 안 갈 것이 갔나
cd design  && node tools/check_menu_reset.js --prod   # 운영 빌드
cd plate3d && node tools/lock_format.js               # 손님에게 나가는 포맷
```
