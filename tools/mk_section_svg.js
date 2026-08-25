/* The seven section drawings for the Steel Section Tables page.

   One script, one set of primitives, seven files — because the alternative is
   the same style pasted into seven SVGs, and the first one edited becomes the
   odd one out. Re-run it and they all move together:

       node tools/mk_section_svg.js

   Each drawing carries exactly the letters its CSV's headings use, and no
   others. hsection is H/B/t1/t2/r, channel adds r1/r2, the angles are
   A/B/t/r1/r2, and the two hollow sections are A/B/t/r and D/t. A drawing
   that labels something the table does not list is a drawing telling you
   about a different standard.

   Geometry is real, not suggestive: fillets are arcs of the radius named,
   the web of an H is t1 and its flange t2, and a formed tube keeps its wall
   round the bend so its inner radius is r - t. */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..');

const INK = '#0f172a', DIM = '#64748b', FILL = '#cbd5e1';
const W = 260, H = 220;

function svg(body, caption) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" ' +
         'width="' + W + '" height="' + H + '">\n' +
         /* auto-start-reverse so the head at the start of a dimension line
            points OUT of it. With plain auto both ends point the same way and
            the dimension reads as an arrow to somewhere rather than a measure
            between two places. */
         '  <defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" ' +
         'orient="auto-start-reverse"><path d="M0,0 L7,3.5 L0,7 z" fill="' + DIM + '"/></marker></defs>\n' +
         body +
         '  <text x="' + (W / 2) + '" y="' + (H - 8) + '" font-family="Arial" font-size="10.5" ' +
         'fill="' + DIM + '" text-anchor="middle">' + caption + '</text>\n' +
         '</svg>\n';
}
const shape = d =>
  '  <path d="' + d + '" fill="' + FILL + '" fill-rule="evenodd" opacity=".55"/>\n' +
  '  <path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="1.6" ' +
  'stroke-linejoin="round" fill-rule="evenodd"/>\n';
const line = (x1, y1, x2, y2, o) =>
  '  <line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' +
  ((o && o.c) || DIM) + '" stroke-width="' + ((o && o.w) || 1) + '"' +
  ((o && o.m) ? ' marker-start="url(#a)" marker-end="url(#a)"' : '') + '/>\n';
const text = (x, y, t, o) =>
  '  <text x="' + x + '" y="' + y + '" font-family="Arial" font-size="' + ((o && o.s) || 12) +
  '" font-weight="700" fill="' + ((o && o.c) || INK) + '" text-anchor="' +
  ((o && o.a) || 'middle') + '">' + t + '</text>\n';
// a dimension across, with its number sitting on a white break in the line
const dimH = (x1, x2, y, t) =>
  line(x1, y, x2, y, { m: 1 }) +
  '  <rect x="' + ((x1 + x2) / 2 - 11) + '" y="' + (y - 8) + '" width="22" height="16" fill="#f8fafc"/>\n' +
  text((x1 + x2) / 2, y + 4, t);
const dimV = (y1, y2, x, t) =>
  line(x, y1, x, y2, { m: 1 }) +
  '  <rect x="' + (x - 11) + '" y="' + ((y1 + y2) / 2 - 8) + '" width="22" height="16" fill="#f8fafc"/>\n' +
  text(x, (y1 + y2) / 2 + 4, t);
// a leader: a short line out to a label, for thicknesses and fillets
const lead = (x1, y1, x2, y2, t, a) =>
  line(x1, y1, x2, y2) + text(x2 + (a === 'end' ? -3 : 3), y2 + 3, t, { a: a || 'start' });

const F = {};

/* ---- H-section: H deep, B wide, web t1, flange t2, fillet r ---- */
(function () {
  const xl = 62, xr = 198, yt = 38, yb = 172, tf = 15, tw = 13, r = 12;
  const cx = (xl + xr) / 2, wl = cx - tw / 2, wr = cx + tw / 2;
  const ti = yt + tf, bi = yb - tf;
  const d = 'M' + xl + ',' + yt + ' H' + xr + ' V' + ti +
    ' H' + (wr + r) + ' A' + r + ',' + r + ' 0 0 0 ' + wr + ',' + (ti + r) +
    ' V' + (bi - r) + ' A' + r + ',' + r + ' 0 0 0 ' + (wr + r) + ',' + bi +
    ' H' + xr + ' V' + yb + ' H' + xl + ' V' + bi +
    ' H' + (wl - r) + ' A' + r + ',' + r + ' 0 0 0 ' + wl + ',' + (bi - r) +
    ' V' + (ti + r) + ' A' + r + ',' + r + ' 0 0 0 ' + (wl - r) + ',' + ti +
    ' H' + xl + ' Z';
  F['Hsection.svg'] = svg(
    shape(d) + dimH(xl, xr, yb + 22, 'B') + dimV(yt, yb, xl - 20, 'H') +
    lead(cx, (ti + bi) / 2, 226, 108, 't1') +
    lead((xl + wl) / 2, yt + tf / 2, 40, 20, 't2', 'end') +
    lead(wr + r * 0.3, ti + r * 0.3, 214, 52, 'r'),
    'H-Section · H × B, web t1, flange t2, fillet r');
})();

/* ---- Channel: web on the left, flanges to the right ---- */
(function () {
  const xl = 74, xr = 190, yt = 38, yb = 172, tf = 14, tw = 13, r1 = 11, r2 = 7;
  const ti = yt + tf, bi = yb - tf, wi = xl + tw;
  const d = 'M' + xl + ',' + yt + ' H' + (xr - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + xr + ',' + (yt + r2) +
    ' V' + (ti - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + (xr - r2) + ',' + ti +
    ' H' + (wi + r1) + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + wi + ',' + (ti + r1) +
    ' V' + (bi - r1) + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + (wi + r1) + ',' + bi +
    ' H' + (xr - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + xr + ',' + (bi + r2) +
    ' V' + (yb - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + (xr - r2) + ',' + yb +
    ' H' + xl + ' Z';
  F['channel.svg'] = svg(
    shape(d) + dimH(xl, xr, yb + 22, 'B') + dimV(yt, yb, xl - 20, 'H') +
    lead(xl + tw / 2, 105, 42, 118, 't1', 'end') +
    lead((wi + xr) / 2, yt + tf / 2, 214, 20, 't2') +
    lead(wi + r1 * 0.3, ti + r1 * 0.3, 224, 66, 'r1') +
    lead(xr - r2 * 0.3, yt + r2 * 0.3, 232, 38, 'r2'),
    'Channel · H × B, web t1, flange t2, fillets r1 / r2');
})();

/* ---- the angles. A is the vertical leg, B the horizontal one ---- */
function angle(file, A, B, t1, t2, r1, r2, cap, letters) {
  const xl = 78, yb = 172;
  const xr = xl + B, yt = yb - A;
  const d = 'M' + xl + ',' + yt + ' H' + (xl + t1 - r2) +
    ' A' + r2 + ',' + r2 + ' 0 0 1 ' + (xl + t1) + ',' + (yt + r2) +
    ' V' + (yb - t2 - r1) + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + (xl + t1 + r1) + ',' + (yb - t2) +
    ' H' + (xr - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + xr + ',' + (yb - t2 + r2) +
    ' V' + (yb - r2) + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + (xr - r2) + ',' + yb +
    ' H' + xl + ' Z';
  F[file] = svg(
    shape(d) + dimH(xl, xr, yb + 22, 'B') + dimV(yt, yb, xl - 20, 'A') +
    lead(xl + t1 / 2, yt + 26, 40, 52, letters[0], 'end') +
    lead(xl + B * 0.72, yb - t2 / 2, 222, 158, letters[1]) +
    lead(xl + t1 + r1 * 0.3, yb - t2 - r1 * 0.3, 210, 120, 'r1') +
    lead(xl + t1 - r2 * 0.4, yt + r2 * 0.4, 150, 40, 'r2'),
    cap);
}
angle('equalangle.svg', 118, 118, 15, 15, 12, 7,
      'Equal Angle · A × B, thickness t, fillets r1 / r2', ['t', 't']);
angle('unequalangle.svg', 128, 96, 14, 14, 11, 6,
      'Unequal Angle · A × B, thickness t, fillets r1 / r2', ['t', 't']);
angle('invertedangle.svg', 124, 104, 17, 12, 11, 6,
      'Inverted Angle · A × B, t1 / t2, fillets r1 / r2', ['t1', 't2']);

/* ---- Square tube: A × B, wall t, r the OUTER corner ---- */
(function () {
  const xl = 62, xr = 198, yt = 48, yb = 172, t = 14, r = 16;
  const ri = Math.max(0, r - t);
  const rr = (x0, y0, x1, y1, rad) =>
    'M' + (x0 + rad) + ',' + y0 + ' H' + (x1 - rad) + ' A' + rad + ',' + rad + ' 0 0 1 ' + x1 + ',' + (y0 + rad) +
    ' V' + (y1 - rad) + ' A' + rad + ',' + rad + ' 0 0 1 ' + (x1 - rad) + ',' + y1 +
    ' H' + (x0 + rad) + ' A' + rad + ',' + rad + ' 0 0 1 ' + x0 + ',' + (y1 - rad) +
    ' V' + (y0 + rad) + ' A' + rad + ',' + rad + ' 0 0 1 ' + (x0 + rad) + ',' + y0 + ' Z';
  const d = rr(xl, yt, xr, yb, r) + ' ' + rr(xl + t, yt + t, xr - t, yb - t, ri);
  F['squaretube.svg'] = svg(
    shape(d) + dimH(xl, xr, yb + 22, 'A') + dimV(yt, yb, xl - 20, 'B') +
    lead((xl + xr) / 2, yt + t / 2, 214, 30, 't') +
    lead(xl + r * 0.3, yt + r * 0.3, 40, 30, 'r', 'end'),
    'Square Tube · A × B, wall t, outer corner r');
})();

/* ---- Pipe: outside diameter D, wall t ---- */
(function () {
  const cx = 130, cy = 105, R = 66, t = 13;
  const ring = (r) => 'M' + (cx - r) + ',' + cy + ' a' + r + ',' + r + ' 0 1 0 ' + (2 * r) + ',0' +
                      ' a' + r + ',' + r + ' 0 1 0 ' + (-2 * r) + ',0';
  F['pipe.svg'] = svg(
    shape(ring(R) + ' ' + ring(R - t)) +
    dimH(cx - R, cx + R, cy, 'D') +
    lead(cx, cy - R + t / 2, 206, 30, 't'),
    'Pipe · outside diameter D, wall t');
})();

Object.keys(F).forEach(function (f) {
  fs.writeFileSync(path.join(OUT, f), F[f]);
  console.log('  ' + f + '  ' + F[f].length + ' bytes');
});
console.log(Object.keys(F).length + ' drawings');
