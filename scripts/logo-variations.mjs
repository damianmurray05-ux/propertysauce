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

const marks = {
  "00-current": {
    title: "Current: drop with a door",
    svg: tile + drop(PAPER) + `<rect x="27.25" y="36" width="9.5" height="13" rx="2.2" fill="${ACCENT}"/>`,
  },
  "01-window": {
    title: "Drop with a four-pane window",
    svg: tile + drop(PAPER) + `<rect x="25" y="33" width="14" height="14" rx="2" fill="${ACCENT}"/><path d="M32 33v14M25 40h14" stroke="${PAPER}" stroke-width="2"/>`,
  },
  "02-house": {
    title: "Drop as a house: door and window",
    svg: tile + drop(PAPER) + `<rect x="29" y="38" width="7" height="11" rx="1.5" fill="${ACCENT}"/><rect x="24" y="29" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="35" y="29" width="6" height="6" rx="1.2" fill="${INK}"/>`,
  },
  "03-outline": {
    title: "Outline drop, paprika door",
    svg: tile + `<path d="M32 11C38 21 48 29 48 40.5A16 16 0 0 1 16 40.5C16 29 26 21 32 11Z" fill="none" stroke="${PAPER}" stroke-width="3.5" stroke-linejoin="round"/><rect x="27.5" y="37" width="9" height="12" rx="2" fill="${ACCENT}"/>`,
  },
  "04-pair": {
    title: "Two drops: a portfolio, not a property",
    svg: tile + `<path d="M24 12C29 20 37 26 37 35.5A13 13 0 0 1 11 35.5C11 26 19 20 24 12Z" fill="${PAPER}" opacity="0.55"/><path d="M40 18C45 26 53 32 53 41.5A13 13 0 0 1 27 41.5C27 32 35 26 40 18Z" fill="${PAPER}"/><rect x="36.5" y="38" width="7" height="10" rx="1.8" fill="${ACCENT}"/>`,
  },
  "05-roof": {
    title: "Paprika roofline over a drop",
    svg: tile + `<path d="M14 26L32 10L50 26" fill="none" stroke="${ACCENT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 22C37 30 46 35 46 43A14 14 0 0 1 18 43C18 35 27 30 32 22Z" fill="${PAPER}"/>`,
  },
  "06-paprika": {
    title: "Paprika drop on paper, no tile",
    svg: `<rect width="64" height="64" rx="16" fill="${PAPER}"/><path d="M32 8C39 19.5 51 28.5 51 42A19 19 0 0 1 13 42C13 28.5 25 19.5 32 8Z" fill="${ACCENT}"/><rect x="27" y="37" width="10" height="13.5" rx="2.2" fill="${INK}"/>`,
  },
  "07-windows": {
    title: "Block of flats: nine windows, one lit",
    svg: tile + [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${15 + c * 13}" y="${15 + r * 13}" width="8" height="8" rx="1.6" fill="${r === 1 && c === 1 ? ACCENT : PAPER}"/>`)).join(""),
  },
  "08-seal": {
    title: "Drop in a ring: a seal for institutional work",
    svg: tile + `<circle cx="32" cy="32" r="23" fill="none" stroke="${PAPER}" stroke-width="2.5"/><path d="M32 16C36.5 23.5 44 29 44 37.5A12 12 0 0 1 20 37.5C20 29 27.5 23.5 32 16Z" fill="${PAPER}"/><rect x="28.5" y="34" width="7" height="9.5" rx="1.6" fill="${ACCENT}"/>`,
  },
  "09-monogram": {
    title: "P monogram with a drop counter",
    svg: tile + `<path d="M19 52V12H36A12 12 0 0 1 36 36H27V52Z" fill="${PAPER}"/><path d="M33 17.5C36 21.5 40 24.5 40 29A6.5 6.5 0 0 1 27 29C27 24.5 31 21.5 33 17.5Z" fill="${INK}"/><rect x="31" y="27" width="4" height="5" rx="1" fill="${ACCENT}"/>`,
  },
  "10-building": {
    title: "Three-storey building with a drop for a door",
    svg: tile + `<rect x="16" y="14" width="32" height="40" rx="3" fill="${PAPER}"/><rect x="21" y="19" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="29" y="19" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="37" y="19" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="21" y="29" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="29" y="29" width="6" height="6" rx="1.2" fill="${INK}"/><rect x="37" y="29" width="6" height="6" rx="1.2" fill="${INK}"/><path d="M32 38C35 42 38 45 38 49A6 6 0 0 1 26 49C26 45 29 42 32 38Z" fill="${ACCENT}"/>`,
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
<h1>Property Sauce mark: current and ten alternatives</h1><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-variations.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1560", `--screenshot=${join(out, "contact-sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
