# 이 저장소에서 일하는 방법

**여러 대화창이 동시에 고친다.** 창끼리는 서로를 못 본다 — 보이는 것은
`main` 에 올라간 것뿐이다.

## 무조건 먼저

**`macroBIM/STATUS.md` 를 읽고 시작한다.** 두 저장소를 통틀어 지금 무엇이
운영에 나가 있고 무엇이 테스트에만 있는지가 거기 한 장에 있다.

```bash
git pull --rebase origin main
```

## 무언가를 올릴 때마다

**`macroBIM/STATUS.md` 의 「기록」에 한 줄 넣는다 — 변경과 같은 커밋에.**
`?v=` 를 올렸거나 운영에 나가는 것이 달라졌으면 「지금 운영에 나가 있는 것」
표도 같이 고친다.

## 이 저장소만의 함정

**`layout_body_test.js` 를 `layout_body.js` 위에 덮지 않는다.** 두 파일은
실수로 벌어진 게 아니라 일부러 다르다 — 테스트에는 운영이 빼 놓은 페이지가
들어 있다. 옮길 것은 **바뀐 그 함수 하나**다.

**PLATE3D 엔진을 올릴 때 `?v=` 는 두 군데다.** `macroBIM/plate3d/embed.html` 의
`plate_builder.js?v=` 와 여기 `layout_body.js` 의 `embed.html?v=`. 한쪽만
올리면 브라우저가 캐시에서 옛 `embed.html` 을 꺼내고 그게 옛 엔진을 부른다.

```bash
node tools/check_sync_scope.js    # 운영에 안 갈 것이 갔나
```

자세한 것은 [`SYNC.md`](SYNC.md).

## 커밋 안 한 것은 없는 것이다

한 덩어리가 끝날 때마다 올린다. `main` 하나로 간다. `--force` 는 쓰지 않는다.
