// Round four: the arched doorway (Damian's pick) with the drop worked in.
// `node scripts/logo-round4.mjs` writes SVGs to public/brand/round4/ and a sheet.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round4");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

// All drawn in a 64 box on a rounded tile. `fg` is the arch colour, `bg` the tile.
const tile = (bg) => `<rect width="64" height="64" rx="16" fill="${bg}"/>`;
const dropPath = (cx, top, r) => { const h = r * 2.25; const cy = top + h - r; return `M${cx} ${top}C${cx + r * 0.42} ${top + h * 0.3} ${cx + r} ${top + h * 0.5} ${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx - r} ${cy}C${cx - r} ${top + h * 0.5} ${cx - r * 0.42} ${top + h * 0.3} ${cx} ${top}Z`; };

const marks = {
  "1-door": {
    title: "Arch with a drop for a door",
    why: "The doorway from round two, with the drop standing in the opening as the door. The drop is small, so the arch leads.",
    draw: (fg, bg) => tile(bg) + `<path d="M15 54V30A17 17 0 0 1 49 30V54Z" fill="${fg}"/><path d="${dropPath(32, 27, 6.5)}" fill="${ACCENT}"/>`,
  },
  "2-keystone": {
    title: "Arch with a drop as the keystone",
    why: "A line-drawn arch on a plinth, the drop set into the crown where the keystone goes: the piece that holds it all up. The most refined of the set.",
    draw: (fg, bg) => tile(bg) + `<path d="M13 52V33A19 19 0 0 1 51 33V52" fill="none" stroke="${fg}" stroke-width="4" stroke-linecap="round"/><path d="M9 52H55" stroke="${fg}" stroke-width="4" stroke-linecap="round"/><path d="M20 52V34A12 12 0 0 1 44 34V52" fill="none" stroke="${fg}" stroke-width="2.5"/><path d="${dropPath(32, 7, 5)}" fill="${ACCENT}"/>`,
  },
  "3-cutout": {
    title: "Drop cut out of the arch",
    why: "A solid arch with the drop cut clean out of it, so the tile colour shows through. Bold at any size and works embossed or in one colour.",
    draw: (fg, bg) => tile(bg) + `<path d="M15 54V30A17 17 0 0 1 49 30V54Z ${dropPath(32, 20, 8.5)}" fill="${fg}" fill-rule="evenodd"/><rect x="29" y="38" width="6" height="8.5" rx="1.4" fill="${ACCENT}"/>`,
  },
  "4-fanlight": {
    title: "Fanlight arch with the drop beneath",
    why: "The Georgian fanlight from the sash idea, radiating lines in the arch, with a paprika drop hanging in the doorway. The most London.",
    draw: (fg, bg) => tile(bg) + `<path d="M14 54V32A18 18 0 0 1 50 32V54" fill="none" stroke="${fg}" stroke-width="3.5" stroke-linecap="round"/><path d="M32 14V32M20.5 20L32 32M43.5 20L32 32M14.5 32H49.5" stroke="${fg}" stroke-width="2.2" stroke-linecap="round"/><path d="M10 54H54" stroke="${fg}" stroke-width="3.5" stroke-linecap="round"/><path d="${dropPath(32, 35, 6)}" fill="${ACCENT}"/>`,
  },
  "5-double": {
    title: "Twin arches, one drop",
    why: "A pair of arches as in a mansion block entrance, the drop in one of them. Says block, not house.",
    draw: (fg, bg) => tile(bg) + `<path d="M9 54V33A11 11 0 0 1 31 33V54Z" fill="${fg}"/><path d="M33 54V33A11 11 0 0 1 55 33V54Z" fill="${fg}"/><path d="M6 54H58" stroke="${fg}" stroke-width="3" stroke-linecap="round"/><path d="${dropPath(44, 31, 5)}" fill="${ACCENT}"/>`,
  },
  "6-paprika-arch": {
    title: "Paprika arch, paper drop",
    why: "Colours swapped: the arch carries the paprika and the drop is the pale shape inside it. Warmer, and the mark reads at a glance in the browser tab.",
    draw: (fg, bg) => tile(bg) + `<path d="M15 54V30A17 17 0 0 1 49 30V54Z" fill="${ACCENT}"/><path d="${dropPath(32, 24, 7)}" fill="${fg}"/><rect x="29.5" y="39" width="5" height="7" rx="1.2" fill="${ACCENT}"/>`,
  },
};

const word = (fill, size) => `<text font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" letter-spacing="${-0.035 * size}" fill="${fill}">Property Sauce</text>`;
for (const [name, m] of Object.entries(marks)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${m.draw(PAPER, INK)}</svg>`);
  writeFileSync(join(out, `${name}-paper.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${m.draw(INK, PAPER)}</svg>`);
}
const cards = Object.entries(marks).map(([name, m]) => `
<div class="card">
  <div class="top">
    <svg viewBox="0 0 64 64" width="180" height="180">${m.draw(PAPER, INK)}</svg>
    <svg viewBox="0 0 64 64" width="180" height="180">${m.draw(INK, PAPER)}</svg>
    <div class="col">
      <div class="lock"><svg viewBox="0 0 64 64" width="48" height="48">${m.draw(PAPER, INK)}</svg><svg width="300" height="50" viewBox="0 0 300 50"><g transform="translate(0 37)">${word(INK, 34)}</g></svg></div>
      <div class="tiny"><svg viewBox="0 0 64 64" width="32" height="32">${m.draw(PAPER, INK)}</svg><svg viewBox="0 0 64 64" width="20" height="20">${m.draw(PAPER, INK)}</svg><svg viewBox="0 0 64 64" width="16" height="16">${m.draw(PAPER, INK)}</svg></div>
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
.col{display:grid;gap:14px;min-width:0}.lock{display:flex;align-items:center;gap:12px}.tiny{display:flex;gap:12px;align-items:center}
.text{padding:16px 24px 22px;border-top:1px solid rgba(15,42,34,.1);font-family:Helvetica,Arial}
strong{display:inline-block;background:${ACCENT};color:#fff;border-radius:6px;padding:2px 10px;margin-right:10px;font-family:"Schibsted Grotesk";font-size:18px}
b{font-family:"Schibsted Grotesk";font-size:20px}p{margin:8px 0 0;font-size:15.5px;line-height:1.45;color:#333}</style>
<h1>Round four: the arch, with the drop</h1><p class="sub">Each shown on green, on paper, beside the wordmark, and at 32, 20 and 16 pixels.</p><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-round4.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1250", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
