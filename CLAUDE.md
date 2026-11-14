# design 저장소

**일하는 방법은 `macroBIM/CLAUDE.md` 에 있다.** 저장소가 둘이라 파일도 둘이지만
규칙은 한 벌이다 — 여기는 이 저장소만의 것을 적는다.

**시작할 때 `macroBIM/STATUS.md` 를 읽고, 올릴 때 거기 「기록」에 한 줄 넣는다.**
두 저장소를 통틀어 지금 어디까지 갔는지가 그 한 장에 있다.

## 운영 화면은 상단 메뉴다 (2026-11-14~)

운영 첫 화면은 왼쪽 사이드바가 없고 스토어와 같은 상단 머리줄이다. 시험은 `www.macrobim.com/dev/`
(**dev 브랜치**에 push 하면 1분 안에 나간다). 메뉴를 넣거나 화면을 고치기 전에
[`SYNC.md`](SYNC.md) 맨 위 「상단 메뉴 화면」을 읽는다 — 어느 파일이 어느 화면에 나가는지 표가 있다.
**dev 브랜치를 main 에 통째로 합치지 않는다** (index_claude 의 왼쪽 메뉴가 사라진다).

## 이 저장소만의 함정 — 둘 다 실제로 밟았다

**`layout_body_test.js` 를 `layout_body.js` 위에 덮지 않는다.** 두 파일은
실수로 벌어진 게 아니라 일부러 다르다 — 테스트에는 운영이 빼 놓은 페이지가
들어 있다. 옮길 것은 **바뀐 그 함수 하나**다.

**PLATE3D 엔진을 올릴 때 `?v=` 는 두 군데다.** `macroBIM/plate3d/embed.html` 의
`plate_builder.js?v=` 와 여기 `layout_body.js` 의 `embed.html?v=`. 한쪽만
올리면 브라우저가 캐시에서 옛 `embed.html` 을 꺼내고 그게 옛 엔진을 부른다.
`quick_simpleconn.js?v=` 는 저 쌍에 딸린 것이 아니다 — 그 파일이 바뀌었을 때만.

```bash
node tools/check_sync_scope.js    # 운영에 안 갈 것이 갔나
```

자세한 것은 [`SYNC.md`](SYNC.md).
