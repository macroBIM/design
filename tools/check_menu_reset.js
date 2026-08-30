/* Clicking the menu item you are already on starts that page over.

       node tools/check_menu_reset.js

   That sentence is a promise about twenty-six menu items, and it is kept by
   three different mechanisms depending on how the page is built - so reading
   the code cannot tell you it holds. This clicks every item twice in a real
   browser and checks what happened.

   Three kinds of page, and they cannot be checked the same way:

     · built into a mount-<id> element (PLATE3D, the drawing pages, QnA...)
       - the whole mount has to be new after the second click
     · a builder writing into a frame that stays put (the rebar tables, the
       steel table) - what has to happen is that the BUILDER RAN AGAIN, so
       those are counted rather than looked at
     · static markup that builds nothing at runtime (Home, Bend Radius)
       - there is nothing to reset, and saying so is the honest result

   Marking nodes alone cannot tell the second kind from a page that did
   nothing at all: most of a rebar page is its frame, and the frame is meant
   to survive.

   The page fetches its modules from macrobim.github.io. Those are served
   here from the two checkouts side by side, so this tests the working tree
   rather than what is deployed. Anything else - fonts, CDN icons, three.js -
   is refused, which makes some modules complain; those complaints are listed
   below by name, and an unrecognised one fails the run. */
const fs = require('fs');
const path = require('path');

const DESIGN = path.resolve(__dirname, '..');
const MACROBIM = path.resolve(DESIGN, '..', 'macroBIM');
let chromium;
try {
  chromium = require(path.join(MACROBIM, 'plate3d/tools/node_modules/playwright-core')).chromium;
} catch (e) {
  console.error('playwright-core not found. It lives in macroBIM/plate3d/tools/node_modules,\n' +
                'so this expects the two repositories checked out side by side:\n' +
                '  ' + DESIGN + '\n  ' + MACROBIM);
  process.exit(2);
}

const ROOT = { '/design': DESIGN, '/macroBIM': MACROBIM };
const TYPE = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html',
               '.json': 'application/json', '.csv': 'text/csv', '.svg': 'image/svg+xml',
               '.png': 'image/png', '.jpg': 'image/jpeg' };

/* Complaints caused by this harness refusing the outside world, not by the
   page. Each is a module reaching for something only the live page loads.
   Anything not on this list is a real error and fails the run. */
const HARNESS_NOISE = [
  'THREE is not defined',               // three.js comes from a CDN, refused here
  'scvs_hsec is not defined',           // helpers in scripts the live page loads
  'scvs_channel is not defined',
  'getParams_ibeam is not defined',
  'getParams_box1cell is not defined'
];

const HOST = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
  '<title>menu reset</title><link rel="stylesheet" href="/design/layout_style.css"></head>' +
  '<body style="margin:0;display:flex;flex-direction:column;height:100vh">' +
  '<div id="app-root"></div>' +
  '<script src="/design/rebartable_claude.js"></script>' +
  '<script src="/design/steelsection_claude.js"></script>' +
  '<script src="/design/mod_concrete.js"></script>' +
  '<script src="/design/mod_rebar.js"></script>' +
  '<script src="/design/mod_rebar_leng.js"></script>' +
  '<script src="/design/layout_body_test.js"></script>' +
  '<script>window.addEventListener("DOMContentLoaded",function(){' +
  'initLayout({visits:1,totalVisits:2});});</script></body></html>';

let bad = 0, checks = 0;
const ok = (c, what, d) => {
  checks++;
  if (c) { console.log('  ok    ' + what); return; }
  bad++;
  console.log('  FAIL  ' + what + (d ? '  [' + d + ']' : ''));
};
const local = p => {
  for (const k of Object.keys(ROOT)) if (p.startsWith(k + '/')) return ROOT[k] + p.slice(k.length);
  return null;
};

/* Pages with no mount of their own, and the function that rebuilds them. */
const BUILDER = { rebar: 'loadRebarTables', strength: 'loadStrengthTables',
                  steel: 'selectSection', dashboard: 'loadVisitChart' };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
           '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });

  await page.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.hostname === 'menu.test' && u.pathname === '/host.html')
      return route.fulfill({ contentType: 'text/html', body: HOST });
    if (u.hostname !== 'menu.test' && u.hostname !== 'macrobim.github.io')
      return route.abort();
    const f = local(u.pathname);
    if (f && fs.existsSync(f) && fs.statSync(f).isFile())
      return route.fulfill({ contentType: TYPE[path.extname(f)] || 'text/plain',
                             body: fs.readFileSync(f) });
    route.fulfill({ status: 404, body: 'not served by the harness' });
  });

  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  await page.goto('https://menu.test/host.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.evaluate(names => {
    window.__calls = {};
    names.forEach(n => {
      const f = window[n];
      if (typeof f !== 'function') { window.__calls[n] = -1; return; }
      window.__calls[n] = 0;
      window[n] = function () { window.__calls[n]++; return f.apply(this, arguments); };
    });
  }, Object.keys(BUILDER).map(k => BUILDER[k]));

  const items = await page.evaluate(() =>
    Array.prototype.map.call(
      document.querySelectorAll('.nav-item[data-page], .nav-sub a[data-page]'),
      a => a.getAttribute('data-page')));
  ok(items.length > 20, 'the menu is built', items.length + ' items');
  console.log('');

  for (const id of items) {
    const click = () => page.evaluate(id => {
      const a = document.querySelector('.nav-item[data-page="' + id + '"]') ||
                document.querySelector('.nav-sub a[data-page="' + id + '"]');
      a.click();
    }, id);
    await click();
    await page.waitForTimeout(700);
    /* Mark what the page built. A rebuild throws the marked nodes away, so
       anything still carrying the mark was never rebuilt. */
    const before = await page.evaluate(a => {
      const p = document.getElementById('page-' + a.id);
      const m = document.getElementById('mount-' + a.id);
      if (m) m.querySelectorAll('*').forEach(k => k.setAttribute('data-stale', '1'));
      return { active: !!p && p.classList.contains('active'), mount: !!m,
               kids: m ? m.querySelectorAll('*').length : 0,
               calls: a.b ? window.__calls[a.b] : null };
    }, { id: id, b: BUILDER[id] || null });
    ok(before.active, id + ': the menu item opens its page');

    await click();                                    // the same item, again
    await page.waitForTimeout(900);
    const after = await page.evaluate(a => {
      const p = document.getElementById('page-' + a.id);
      const m = document.getElementById('mount-' + a.id);
      return { active: p.classList.contains('active'),
               stale: m ? m.querySelectorAll('[data-stale]').length : 0,
               calls: a.b ? window.__calls[a.b] : null };
    }, { id: id, b: BUILDER[id] || null });
    ok(after.active, id + ': it is still the page being shown');

    if (before.mount) {
      if (!before.kids) console.log('  --    ' + id + ': its mount built nothing to reset');
      else ok(after.stale === 0, id + ': re-click emptied and rebuilt its mount',
              after.stale + ' of ' + before.kids + ' nodes survived');
    } else if (BUILDER[id]) {
      ok(after.calls > before.calls, id + ': re-click ran ' + BUILDER[id] + ' again',
         before.calls < 0 ? BUILDER[id] + ' is not reachable to count'
                          : BUILDER[id] + ' went ' + before.calls + ' → ' + after.calls);
    } else {
      console.log('  --    ' + id + ': static markup, nothing built at runtime');
    }
  }

  const real = errs.filter(e => !HARNESS_NOISE.some(n => e.indexOf(n) >= 0));
  ok(real.length === 0, 'no page errors beyond what this harness causes',
     real.join(' | ').slice(0, 300));
  const noise = {};
  errs.forEach(e => {
    const n = HARNESS_NOISE.filter(x => e.indexOf(x) >= 0)[0];
    if (n) noise[n] = (noise[n] || 0) + 1;
  });
  const seen = Object.keys(noise);
  if (seen.length) console.log('\n  harness noise (expected): ' +
    seen.map(n => n + ' ×' + noise[n]).join(', '));

  console.log('\n' + checks + ' checks · ' + (bad ? bad + ' FAILED' : 'all pass'));
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
