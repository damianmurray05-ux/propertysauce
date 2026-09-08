// Ten alternative marks for review. `node scripts/logo-variations.mjs` writes
// SVGs to public/brand/variations/ and a contact sheet PNG for comparison.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "variations");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

const tile = `<rect width="64" height="64" rx="16" fill="${INK}"/>`;
const drop = (fill, extra = "") => `<path d="M32 9.5C38.5 20 49.5 28.5 49.5 41A17.5 17.5 0 0 1 14.5 41C14.5 28.5 25.5 20 32 9.5Z" fill="${fill}" ${extra}/>`;

const sq = (x, y, w, fill, r = 2.4) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" fill="${fill}"/>`;
const marks = {
  "11-four": {
    title: "Four windows, all paprika",
    svg: tile + sq(15, 15, 15, ACCENT, 3) + sq(34, 15, 15, ACCENT, 3) + sq(15, 34, 15, ACCENT, 3) + sq(34, 34, 15, ACCENT, 3),
  },
  "12-four-one": {
    title: "Four windows, one lit",
    svg: tile + sq(15, 15, 15, PAPER, 3) + sq(34, 15, 15, ACCENT, 3) + sq(15, 34, 15, PAPER, 3) + sq(34, 34, 15, PAPER, 3),
  },
  "13-frame": {
    title: "Window frame with a paprika pane",
    svg: tile + `<rect x="14" y="14" width="36" height="36" rx="6" fill="none" stroke="${PAPER}" stroke-width="4"/><path d="M32 14v36M14 32h36" stroke="${PAPER}" stroke-width="4"/>` + sq(35, 17, 12, ACCENT, 2),
  },
  "14-arch": {
    title: "Arched doorway",
    svg: tile + `<path d="M17 52V30A15 15 0 0 1 47 30V52Z" fill="${PAPER}"/><path d="M25 52V34A7 7 0 0 1 39 34V52Z" fill="${ACCENT}"/>`,
  },
  "15-facade": {
    title: "Facade: six windows and a door",
    svg: tile + sq(15, 13, 9, PAPER, 1.8) + sq(27.5, 13, 9, PAPER, 1.8) + sq(40, 13, 9, PAPER, 1.8) + sq(15, 26, 9, PAPER, 1.8) + sq(27.5, 26, 9, PAPER, 1.8) + sq(40, 26, 9, PAPER, 1.8) + `<rect x="26" y="39" width="12" height="15" rx="2.2" fill="${ACCENT}"/>`,
  },
  "16-skyline": {
    title: "Three blocks, stepped",
    svg: tile + `<rect x="12" y="30" width="12" height="24" rx="2" fill="${PAPER}"/><rect x="26" y="16" width="12" height="38" rx="2" fill="${PAPER}"/><rect x="40" y="24" width="12" height="30" rx="2" fill="${PAPER}"/>` + sq(29.5, 20, 5, ACCENT, 1) + sq(29.5, 28, 5, INK, 1) + sq(29.5, 36, 5, INK, 1),
  },
  "17-floors": {
    title: "Floors: three bars, paprika roof",
    svg: tile + `<rect x="14" y="14" width="36" height="9" rx="3" fill="${ACCENT}"/><rect x="14" y="27.5" width="36" height="9" rx="3" fill="${PAPER}"/><rect x="14" y="41" width="36" height="9" rx="3" fill="${PAPER}"/>`,
  },
  "18-iso": {
    title: "Isometric block",
    svg: tile + `<path d="M32 12L50 22V42L32 52L14 42V22Z" fill="${PAPER}"/><path d="M32 32L50 22V42L32 52Z" fill="${ACCENT}"/><path d="M32 32L14 22V42L32 52Z" fill="${INK}" opacity="0.35"/>`,
  },
  "19-monogram": {
    title: "PS monogram",
    svg: tile + `<text x="32" y="45" text-anchor="middle" font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="800" font-size="36" letter-spacing="-2.5" fill="${PAPER}">P<tspan fill="${ACCENT}">S</tspan></text>`,
  },
  "20-chevrons": {
    title: "Stacked rooflines",
    svg: tile + `<path d="M16 26L32 14L48 26" fill="none" stroke="${ACCENT}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 39L32 27L48 39" fill="none" stroke="${PAPER}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 52L32 40L48 52" fill="none" stroke="${PAPER}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
};

for (const [name, m] of Object.entries(marks)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${m.svg}</svg>`);
}

const cards = Object.entries(marks).map(([name, m]) => `
<div class="card">
  <div class="big"><svg viewBox="0 0 64 64" width="200" height="200">${m.svg}</svg></div>
  <div class="row"><svg viewBox="0 0 64 64" width="44" height="44">${m.svg}</svg><span class="word">Property Sauce</span></div>
  <div class="small"><svg viewBox="0 0 64 64" width="24" height="24">${m.svg}</svg><svg viewBox="0 0 64 64" width="16" height="16">${m.svg}</svg></div>
  <p><strong>${name.replace(/^0*/, "").replace(/^-/, "0-")}</strong> ${m.title}</p>
</div>`).join("");

const html = `<!doctype html><meta charset="utf-8"><style>${fontFace}
body{margin:0;background:${PAPER};font-family:"Schibsted Grotesk",Helvetica,Arial,sans-serif;color:${INK};width:1600px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:40px}
.card{background:#fff;border:1px solid rgba(15,42,34,.12);border-radius:18px;padding:24px;display:grid;gap:14px;justify-items:start}
.big svg{display:block}.row{display:flex;align-items:center;gap:12px}.word{font-weight:700;font-size:26px;letter-spacing:-1px}
.small{display:flex;gap:10px;align-items:center}p{margin:0;font-size:17px;line-height:1.35;font-family:Helvetica,Arial,sans-serif}strong{display:inline-block;background:${ACCENT};color:#fff;border-radius:6px;padding:2px 8px;margin-right:6px;font-family:"Schibsted Grotesk"}
h1{margin:40px 40px 0;font-size:34px;letter-spacing:-1px}</style>
<h1>Property Sauce mark: ten directions without the drop</h1><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-variations.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1500", `--screenshot=${join(out, "contact-sheet-2.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
