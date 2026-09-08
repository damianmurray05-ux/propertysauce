// Round five: a round mark, two interlocking drops like a yin and yang,
// P in one and S in the other. `node scripts/logo-round5.mjs`
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round5");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

// Geometry in a 64 box, circle centre (32,32) radius R. The two halves of a
// yin and yang are teardrops: each is an outer semicircle joined by two
// inner semicircles of half the radius.
const R = 27, C = 32;
const half = (r = R) => `M${C} ${C - r}A${r} ${r} 0 0 0 ${C} ${C + r}A${r / 2} ${r / 2} 0 0 0 ${C} ${C}A${r / 2} ${r / 2} 0 0 1 ${C} ${C - r}Z`;
const other = (r = R) => `M${C} ${C - r}A${r} ${r} 0 0 1 ${C} ${C + r}A${r / 2} ${r / 2} 0 0 0 ${C} ${C}A${r / 2} ${r / 2} 0 0 1 ${C} ${C - r}Z`;
const letter = (ch, x, y, fill, size = 13) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="800" font-size="${size}" fill="${fill}">${ch}</text>`;
const seam = (r, bg, w = 2.6) => `<path d="M${C} ${C - r}A${r / 2} ${r / 2} 0 0 0 ${C} ${C}A${r / 2} ${r / 2} 0 0 1 ${C} ${C + r}" fill="none" stroke="${bg}" stroke-width="${w}" stroke-linecap="round"/>`;
const tile = (bg) => `<rect width="64" height="64" rx="16" fill="${bg}"/>`;
const rot = (deg, inner) => `<g transform="rotate(${deg} ${C} ${C})">${inner}</g>`;

// Positions of the two "eyes" (where the dots sit in a yin and yang).
const eyeTop = [C, C - R / 2], eyeBot = [C, C + R / 2];

const marks = {
  "1-classic": {
    title: "Classic yin and yang, P and S as the dots",
    why: "Paper drop and paprika drop curled into a circle. The letters sit where the dots go, each in the other drop's colour, so the P and S tie the two halves together.",
    draw: (tileBg) => tile(tileBg) + `<path d="${half()}" fill="${PAPER}"/><path d="${other()}" fill="${ACCENT}"/>` + letter("P", eyeBot[0], eyeBot[1] + 4.6, ACCENT) + letter("S", eyeTop[0], eyeTop[1] + 4.6, PAPER),
  },
  "2-tilted": {
    title: "Tilted, so the drops read as drops",
    why: "The same construction turned forty-five degrees. The tails now point up and down like falling drops rather than a symbol from a menu.",
    draw: (tileBg) => tile(tileBg) + rot(-45, `<path d="${half()}" fill="${PAPER}"/><path d="${other()}" fill="${ACCENT}"/>`) + letter("P", 41.5, 46.5, ACCENT) + letter("S", 22.5, 24.5, PAPER),
  },
  "3-gap": {
    title: "Two drops with a seam between them",
    why: "A thin green seam separates the two drops, so they read as two shapes rather than one circle sliced in half. Cleaner at small sizes.",
    draw: (tileBg) => tile(tileBg) + rot(-45, `<path d="${half()}" fill="${PAPER}"/><path d="${other()}" fill="${ACCENT}"/>` + seam(R, tileBg)) + letter("P", 41.5, 46.5, ACCENT) + letter("S", 22.5, 24.5, PAPER),
  },
  "4-green-letters": {
    title: "Green letters on both drops",
    why: "Both letters in the tile green, so the mark is three colours in strict order: green, paper, paprika. Calmer, and it prints in two colours on paper.",
    draw: (tileBg) => tile(tileBg) + rot(-45, `<path d="${half()}" fill="${PAPER}"/><path d="${other()}" fill="${ACCENT}"/>`) + letter("P", 41.5, 46.5, INK) + letter("S", 22.5, 24.5, INK),
  },
  "5-ring": {
    title: "In a ring",
    why: "The two drops inside a thin paper ring, which gives the mark a seal-like edge for letterheads and board packs without adding fuss.",
    draw: (tileBg) => tile(tileBg) + `<circle cx="32" cy="32" r="29.5" fill="none" stroke="${PAPER}" stroke-width="1.6"/>` + rot(-45, `<path d="${half(23)}" fill="${PAPER}"/><path d="${other(23)}" fill="${ACCENT}"/>`) + letter("P", 40.2, 44.8, ACCENT, 11) + letter("S", 23.8, 26.8, PAPER, 11),
  },
  "6-paper-drops": {
    title: "Both drops paper, letters carry the colour",
    why: "Two paper drops with a green seam between them, P in green and S in paprika. The most restrained; the paprika is reduced to one letter.",
    draw: (tileBg) => tile(tileBg) + rot(-45, `<path d="${half()}" fill="${PAPER}"/><path d="${other()}" fill="${PAPER}"/>` + seam(R, tileBg, 3)) + letter("P", 41.5, 46.5, INK) + letter("S", 22.5, 24.5, ACCENT),
  },
};

const word = (fill, size) => `<text font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" letter-spacing="${-0.035 * size}" fill="${fill}">Property Sauce</text>`;
for (const [name, m] of Object.entries(marks)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>${fontFace}</style>${m.draw(INK)}</svg>`);
}
const onPaper = (m) => m.draw(INK).replace(tile(INK), `<circle cx="32" cy="32" r="30" fill="${INK}"/>`);
const cards = Object.entries(marks).map(([name, m]) => `
<div class="card">
  <div class="top">
    <svg viewBox="0 0 64 64" width="180" height="180">${m.draw(INK)}</svg>
    <div class="paperbox"><svg viewBox="0 0 64 64" width="150" height="150">${onPaper(m)}</svg></div>
    <div class="col">
      <div class="lock"><svg viewBox="0 0 64 64" width="48" height="48">${m.draw(INK)}</svg><svg width="300" height="50" viewBox="0 0 300 50"><g transform="translate(0 37)">${word(INK, 34)}</g></svg></div>
      <div class="tiny"><svg viewBox="0 0 64 64" width="32" height="32">${m.draw(INK)}</svg><svg viewBox="0 0 64 64" width="20" height="20">${m.draw(INK)}</svg><svg viewBox="0 0 64 64" width="16" height="16">${m.draw(INK)}</svg></div>
    </div>
  </div>
  <div class="text"><strong>${name.split("-")[0]}</strong><b>${m.title}</b><p>${m.why}</p></div>
</div>`).join("");
const html = `<!doctype html><meta charset="utf-8"><style>${fontFace}
body{margin:0;background:${PAPER};font-family:"Schibsted Grotesk",Helvetica,Arial,sans-serif;color:${INK};width:1600px}
h1{margin:40px 40px 8px;font-size:34px;letter-spacing:-1px}.sub{margin:0 40px 24px;font-family:Helvetica,Arial;color:#55655e;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;padding:0 40px 40px}
.card{background:#fff;border:1px solid rgba(15,42,34,.12);border-radius:18px;overflow:hidden}
.top{display:flex;align-items:center;gap:20px;padding:24px}.top>svg{flex:none;border-radius:40px}
.paperbox{background:${PAPER};border-radius:40px;width:180px;height:180px;display:grid;place-items:center;flex:none}
.col{display:grid;gap:14px;min-width:0}.lock{display:flex;align-items:center;gap:12px}.tiny{display:flex;gap:12px;align-items:center}
.text{padding:16px 24px 22px;border-top:1px solid rgba(15,42,34,.1);font-family:Helvetica,Arial}
strong{display:inline-block;background:${ACCENT};color:#fff;border-radius:6px;padding:2px 10px;margin-right:10px;font-family:"Schibsted Grotesk";font-size:18px}
b{font-family:"Schibsted Grotesk";font-size:20px}p{margin:8px 0 0;font-size:15.5px;line-height:1.45;color:#333}</style>
<h1>Round five: two drops, P and S</h1><p class="sub">On the green tile, as a round badge on paper, beside the wordmark, and at 32, 20 and 16 pixels.</p><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-round5.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1250", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
