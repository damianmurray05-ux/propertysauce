// Round eight: the interlocking serif PS monogram (the "Merry Creative" idea),
// worked six ways. `node scripts/logo-round8.mjs`
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round8");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a", GOLD = "#b4924a", CREAM = "#f6f3ea";
const b64 = (f) => readFileSync(join(root, "assets/fonts", f)).toString("base64");
const fontFace = `
@font-face{font-family:"Cormorant";font-weight:400 700;font-style:normal;src:url(data:font/woff2;base64,${b64("cormorant-normal-latin.woff2")}) format("woff2")}
@font-face{font-family:"Cormorant";font-weight:400 700;font-style:italic;src:url(data:font/woff2;base64,${b64("cormorant-italic-latin.woff2")}) format("woff2")}
@font-face{font-family:"Geist";font-weight:400 700;src:url(data:font/woff2;base64,${b64("geist-latin.woff2")}) format("woff2")}`;

const caps = (text, x, y, size, fill, track = 0.3, weight = 500) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Geist, Helvetica, Arial, sans-serif" font-weight="${weight}" font-size="${size}" letter-spacing="${(track * size).toFixed(2)}" fill="${fill}">${text}</text>`;
const serif = (text, x, y, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || "middle"}" font-family="Cormorant, Georgia, serif" font-weight="${o.weight || 400}" font-style="${o.italic ? "italic" : "normal"}" font-size="${size}" letter-spacing="${o.track ? (o.track * size).toFixed(2) : 0}" fill="${fill}">${text}</text>`;

// The monogram: a large P, with the S set lower and to the right so its top
// curl tucks under the bowl of the P, as in the reference.
const mono = (pFill, sFill, x = 150, y = 150, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${serif("P", -30, 8, 132, pFill)}${serif("S", 22, 36, 132, sFill)}</g>`;

const lockups = {
  "1-reference": {
    title: "As the reference: P over S, name in serif capitals",
    why: "The closest to Merry Creative. Deep green on paper, PROPERTY SAUCE in spaced serif capitals, the three trades in tiny sans beneath.",
    bg: PAPER,
    svg: mono(INK, INK, 150, 140) + serif("PROPERTY SAUCE", 150, 236, 23, INK, { weight: 500, track: 0.14 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 258, 7.2, INK, 0.24),
  },
  "2-paprika-s": {
    title: "The S in paprika",
    why: "Same lockup, with the S carrying the accent colour. The sauce is a single warm letter, nothing more.",
    bg: PAPER,
    svg: mono(INK, ACCENT, 150, 140) + serif("PROPERTY SAUCE", 150, 236, 23, INK, { weight: 500, track: 0.14 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 258, 7.2, INK, 0.24),
  },
  "3-cream": {
    title: "On cream, ink only",
    why: "The reference's palette exactly: near-black on cream, one colour. For anyone who finds the green too much, this is the most timeless.",
    bg: CREAM,
    svg: mono("#161616", "#161616", 150, 140) + serif("PROPERTY SAUCE", 150, 236, 23, "#161616", { weight: 500, track: 0.14 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 258, 7.2, "#161616", 0.24),
  },
  "4-reversed": {
    title: "Reversed on deep green",
    why: "Paper letters on the green, for the website header, signage and the dark side of stationery.",
    bg: INK,
    svg: mono(PAPER, PAPER, 150, 140) + serif("PROPERTY SAUCE", 150, 236, 23, PAPER, { weight: 500, track: 0.14 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 258, 7.2, PAPER, 0.24),
  },
  "5-gold": {
    title: "Gold monogram, green name",
    why: "The monogram in a warm stone gold like your references, the name in green. Softer, more boutique.",
    bg: PAPER,
    svg: mono(GOLD, GOLD, 150, 140) + serif("PROPERTY SAUCE", 150, 236, 23, INK, { weight: 500, track: 0.14 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 258, 7.2, INK, 0.24),
  },
  "6-horizontal": {
    title: "Horizontal lockup for the website header",
    why: "The monogram small on the left, the name beside it in serif capitals with the trades beneath. This is how it sits in a navigation bar and an email signature.",
    bg: PAPER,
    svg: mono(INK, INK, 62, 150, 0.42) + `<path d="M108 128V176" stroke="${INK}" stroke-width="0.8"/>` + serif("PROPERTY SAUCE", 194, 148, 19, INK, { weight: 500, track: 0.1 }) + caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 194, 166, 5.6, INK, 0.2),
  },
};

for (const [name, l] of Object.entries(lockups)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><style>${fontFace}</style><rect width="300" height="300" fill="${l.bg}"/>${l.svg}</svg>`);
}
const small = mono(INK, INK, 32, 34, 0.2);
const cards = Object.entries(lockups).map(([name, l]) => `
<div class="card">
  <div class="art" style="background:${l.bg}"><svg viewBox="0 0 300 300" width="330" height="330"><rect width="300" height="300" fill="${l.bg}"/>${l.svg}</svg></div>
  <div class="text"><strong>${name.split("-")[0]}</strong><b>${l.title}</b><p>${l.why}</p></div>
</div>`).join("");
const html = `<!doctype html><meta charset="utf-8"><style>${fontFace}
body{margin:0;background:#e9ebe4;font-family:Geist,Helvetica,Arial,sans-serif;color:${INK};width:1600px}
h1{margin:40px 40px 8px;font-family:Cormorant,Georgia,serif;font-weight:500;font-size:40px}.sub{margin:0 40px 24px;color:#55655e;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:0 40px 24px}
.card{background:#fff;border:1px solid rgba(15,42,34,.12);border-radius:6px;overflow:hidden}
.art{display:grid;place-items:center;padding:16px}
.text{padding:16px 22px 22px;border-top:1px solid rgba(15,42,34,.1)}
strong{display:inline-block;background:${INK};color:#fff;border-radius:4px;padding:2px 10px;margin-right:10px;font-size:16px}
b{font-size:18px}p{margin:8px 0 0;font-size:15px;line-height:1.45;color:#333}
.tiny{display:flex;gap:28px;align-items:center;padding:0 40px 40px;color:#55655e;font-size:15px}
.tiny svg{background:${PAPER};border-radius:6px}</style>
<h1>Round eight: the PS monogram</h1><p class="sub">The interlocking serif monogram you liked, in six treatments.</p><div class="grid">${cards}</div>
<div class="tiny">Small sizes, favicon and avatar:
<svg viewBox="0 0 64 64" width="64" height="64">${small}</svg><svg viewBox="0 0 64 64" width="32" height="32">${small}</svg><svg viewBox="0 0 64 64" width="20" height="20">${small}</svg>
<svg viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="12" fill="${INK}"/>${mono(PAPER, PAPER, 32, 34, 0.2)}</svg><svg viewBox="0 0 64 64" width="32" height="32"><rect width="64" height="64" rx="12" fill="${INK}"/>${mono(PAPER, PAPER, 32, 34, 0.2)}</svg></div>`;
const p = join(tmpdir(), "ps-round8.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1560", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(lockups).length, "lockups to", out);
