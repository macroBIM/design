# 테스트 → 운영 동기화 규칙

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
