/* 운영 레이아웃에 테스트 전용 페이지가 새어 들어갔는지 본다.

       node tools/check_sync_scope.js

   layout_body_test.js 를 layout_body.js 위에 덮으면 끝나는 일처럼 보이고,
   그래서 한 번 물어본 적이 있다. 두 파일은 일부러 다르다 — 운영은 검증이
   끝난 것만 담는다. 규칙을 SYNC.md 에 적어 두었지만, 문서는 읽어야 지켜지고
   이 검사는 읽지 않아도 지켜진다.

   페이지만 막는다. 스타일 차이는 세어서 보여 주기만 한다 — 언젠가 옮길
   결정을 할 수도 있고, 그건 사람이 할 결정이다. */
const fs = require('fs');
const path = require('path');

const D = path.resolve(__dirname, '..');
const PROD = fs.readFileSync(path.join(D, 'layout_body.js'), 'utf-8');
const TEST = fs.readFileSync(path.join(D, 'layout_body_test.js'), 'utf-8');

/* 운영에 없어야 하는 페이지. 늘리려면 SYNC.md 의 표도 같이 고친다. */
const TEST_ONLY = [
  { id: 'dashboard',        what: 'Dashboard — 방문자 통계, 운영 랜딩은 Home' },
  { id: 'draw-pscbox',      what: 'PSCBOX — 손보는 중' }
  /* quick-simpleconn 은 2026-09-02 에 런칭했다. 「손보는 중」이라 막고 있었고,
     다 만들었으니 막을 이유가 없어졌다. 막는 목록에서 빠졌다는 것은 이제
     운영에 있어야 한다는 뜻이지, 있든 없든 상관없다는 뜻이 아니다. */
];
/* 갈라진 채로 두는 스타일. 막지 않고 세기만 한다. */
const DRIFT = [
  { key: '.hs-ttl{',                  what: '도면 카드 제목' },
  { key: '.hs-hd{',                   what: '도면 카드 머리 여백' },
  { key: '.hs-btn:active',            what: '버튼 눌림 효과' },
  { key: "hs-grid\" style=\"align-items:stretch", what: '카드 높이 맞춤' },
  { key: 'data-sview=',               what: 'Lifting lug 뷰 버튼' }
];

const has = (s, id) =>
  s.indexOf('data-page="' + id + '"') >= 0 || s.indexOf("id=\"page-" + id + '"') >= 0;

let bad = 0;
console.log('layout_body.js — 테스트 전용 페이지가 들어갔나\n');
TEST_ONLY.forEach(p => {
  const inProd = has(PROD, p.id), inTest = has(TEST, p.id);
  if (!inTest)
    console.log('  --    ' + p.id.padEnd(18) + '테스트에도 없다. SYNC.md 를 고칠 때가 됐는지 본다');
  if (inProd) {
    bad++;
    console.log('  FAIL  ' + p.id.padEnd(18) + '운영에 있다 — ' + p.what);
  } else {
    console.log('  ok    ' + p.id.padEnd(18) + '운영에 없다');
  }
});

/* 그 낱말이 몇 번 나오나가 아니라 그 줄이 무엇이라고 적혀 있나를 본다.
   .hs-ttl 은 양쪽에 다 있고, 다른 것은 그 안의 값이다. */
const linesWith = (s, key) =>
  s.split('\n').filter(l => l.indexOf(key) >= 0).map(l => l.trim()).sort().join('\n');
console.log('\n갈라진 채로 두는 것 (막지 않음)');
DRIFT.forEach(d => {
  const same = linesWith(PROD, d.key) === linesWith(TEST, d.key);
  console.log('  ' + (same ? '같음  ' : '다름  ') + d.what);
});

if (bad) {
  console.log('\n' + bad + '건. layout_body.js 를 layout_body_test.js 로 덮은 게 아닌지 본다.');
  console.log('동기화는 이번에 만든 변경만 옮기는 것이다 — SYNC.md 참고.');
} else {
  console.log('\n운영 범위 이상 없음');
}
process.exit(bad ? 1 : 0);
