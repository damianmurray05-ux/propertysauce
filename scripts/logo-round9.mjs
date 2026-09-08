// Round eight: the interlocking serif PS monogram (the "Merry Creative" idea),
// worked six ways. `node scripts/logo-round8.mjs`
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round9");
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

// Gold treatments. halo: a hairline of gold just outside the letter edge.
// shade: the letter repeated in gold, offset down and right, sitting behind.
const monoHalo = (x, y, sc, w = 2.2) => `<g transform="translate(${x} ${y}) scale(${sc})"><g fill="${GOLD}" stroke="${GOLD}" stroke-width="${w}" stroke-linejoin="round">${serif("P", -30, 8, 132, GOLD)}${serif("S", 22, 36, 132, GOLD)}</g>${serif("P", -30, 8, 132, INK)}${serif("S", 22, 36, 132, INK)}</g>`;
const monoShade = (x, y, sc, dx = 2.2, dy = 2.2) => `<g transform="translate(${x} ${y}) scale(${sc})"><g transform="translate(${dx} ${dy})">${serif("P", -30, 8, 132, GOLD)}${serif("S", 22, 36, 132, GOLD)}</g>${serif("P", -30, 8, 132, INK)}${serif("S", 22, 36, 132, INK)}</g>`;
const monoHaloS = (x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})">${serif("P", -30, 8, 132, INK)}<g stroke="${GOLD}" stroke-width="2.2" stroke-linejoin="round">${serif("S", 22, 36, 132, GOLD)}</g>${serif("S", 22, 36, 132, INK)}</g>`;
const monoInline = (x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})">${serif("P", -30, 8, 132, INK)}${serif("S", 22, 36, 132, INK)}<g fill="none" stroke="${GOLD}" stroke-width="0.9">${serif("P", -30, 8, 132, "none")}${serif("S", 22, 36, 132, "none")}</g></g>`;
const name = (y = 236, fill = INK) => serif("PROPERTY SAUCE", 150, y, 23, fill, { weight: 500, track: 0.14 });
const trade = (t, y = 258, fill = INK) => caps(t, 150, y, 7.2, fill, 0.26);

const lockups = {
  "1-halo-investment": {
    title: "Gold hairline around both letters",
    why: "A thin gold edge just outside the green, all the way round. Descriptor: INVESTMENT · MANAGEMENT · ACQUISITIONS. Investment covers letting for a return and buying, and it is the word institutions use.",
    bg: PAPER,
    svg: monoHalo(150, 140, 1) + name() + trade("INVESTMENT  ·  MANAGEMENT  ·  ACQUISITIONS"),
  },
  "2-shade-residential": {
    title: "Gold shading, down and to the right",
    why: "The letters repeated in gold and set a fraction behind, so one side of each stroke carries a gold edge like light on a raised letter. Descriptor: RESIDENTIAL · MANAGEMENT · ACQUISITIONS.",
    bg: PAPER,
    svg: monoShade(150, 140, 1) + name() + trade("RESIDENTIAL  ·  MANAGEMENT  ·  ACQUISITIONS"),
  },
  "3-halo-s-portfolios": {
    title: "Gold hairline on the S only",
    why: "The P stays plain and the S gets the gold edge, so the two letters read as a pair rather than a block. Descriptor: PORTFOLIOS · MANAGEMENT · ACQUISITIONS.",
    bg: PAPER,
    svg: monoHaloS(150, 140, 1) + name() + trade("PORTFOLIOS  ·  MANAGEMENT  ·  ACQUISITIONS"),
  },
  "4-inline-estates": {
    title: "Gold inline inside the letter edge",
    why: "The gold sits just inside the edge of each letter instead of outside, which reads as an engraved line. Descriptor: ESTATES · MANAGEMENT · ACQUISITIONS.",
    bg: PAPER,
    svg: monoInline(150, 140, 1) + name() + trade("ESTATES  ·  MANAGEMENT  ·  ACQUISITIONS"),
  },
  "5-shade-reversed": {
    title: "Gold shading, reversed on green",
    why: "Treatment 2 on the deep green, for the website header and signage. Descriptor: INVESTMENT · MANAGEMENT · ACQUISITIONS.",
    bg: INK,
    svg: `<g transform="translate(150 140)"><g transform="translate(2.2 2.2)">${serif("P", -30, 8, 132, GOLD)}${serif("S", 22, 36, 132, GOLD)}</g>${serif("P", -30, 8, 132, PAPER)}${serif("S", 22, 36, 132, PAPER)}</g>` + name(236, PAPER) + trade("INVESTMENT  ·  MANAGEMENT  ·  ACQUISITIONS", 258, PAPER),
  },
  "6-horizontal-halo": {
    title: "Horizontal, gold hairline",
    why: "Treatment 1 laid out for the navigation bar and email signatures, with a fine rule between the monogram and the name. Descriptor: INVESTMENT · MANAGEMENT · ACQUISITIONS.",
    bg: PAPER,
    svg: monoHalo(62, 150, 0.42, 3) + `<path d="M108 128V176" stroke="${GOLD}" stroke-width="0.8"/>` + serif("PROPERTY SAUCE", 194, 148, 19, INK, { weight: 500, track: 0.1 }) + caps("INVESTMENT  ·  MANAGEMENT  ·  ACQUISITIONS", 194, 166, 5.6, INK, 0.2),
  },
};

for (const [name, l] of Object.entries(lockups)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><style>${fontFace}</style><rect width="300" height="300" fill="${l.bg}"/>${l.svg}</svg>`);
}
const small = monoHalo(32, 34, 0.2, 5);
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
<h1>Round nine: gold detail and the descriptor</h1><p class="sub">Four gold treatments on the monogram, and four candidate words in place of Lettings.</p><div class="grid">${cards}</div>
<div class="tiny">Small sizes, favicon and avatar:
<svg viewBox="0 0 64 64" width="64" height="64">${small}</svg><svg viewBox="0 0 64 64" width="32" height="32">${small}</svg><svg viewBox="0 0 64 64" width="20" height="20">${small}</svg>
<svg viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="12" fill="${INK}"/>${mono(PAPER, PAPER, 32, 34, 0.2)}</svg><svg viewBox="0 0 64 64" width="32" height="32"><rect width="64" height="64" rx="12" fill="${INK}"/>${mono(PAPER, PAPER, 32, 34, 0.2)}</svg></div>`;
const p = join(tmpdir(), "ps-round8.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1560", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(lockups).length, "lockups to", out);
