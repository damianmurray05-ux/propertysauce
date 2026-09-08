// Round six: a refresh of the original Property Sauce logo (line-drawn house,
// chimney, sauce splat). Keep the idea people recognise, lose the fuss.
// `node scripts/logo-round6.mjs`
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round6");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

const tile = (bg) => `<rect width="64" height="64" rx="16" fill="${bg}"/>`;
const stroke = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
// A sauce splat: a blob with soft lobes and two flung drops, sitting above the chimney at (x, y).
const splat = (x, y, s, fill) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="M0 -3.2C1.6 -3.2 2.6 -2 3.6 -1.4C5 -0.8 5.4 1 4.2 1.9C3.2 2.7 3.4 4.3 2 4.4C0.8 4.5 0.4 3.1 -0.6 3.2C-2 3.4 -2.8 4.6 -3.8 3.6C-4.8 2.6 -3.4 1.4 -4 0.2C-4.6 -1 -6 -1.6 -5.2 -2.8C-4.4 -4 -2.8 -3 -1.6 -3.6C-1 -3.9 -0.6 -3.2 0 -3.2Z"/><circle cx="5.6" cy="-4.2" r="1.1"/><circle cx="-6.2" cy="0.8" r="0.8"/><circle cx="0.6" cy="7" r="0.9"/></g>`;
const drop = (x, top, r, fill) => { const h = r * 2.25, cy = top + h - r; return `<path d="M${x} ${top}C${x + r * 0.42} ${top + h * 0.3} ${x + r} ${top + h * 0.5} ${x + r} ${cy}A${r} ${r} 0 0 1 ${x - r} ${cy}C${x - r} ${top + h * 0.5} ${x - r * 0.42} ${top + h * 0.3} ${x} ${top}Z" fill="${fill}"/>`; };

// The house, drawn once: eaves at y 30, walls to y 52, chimney on the right slope.
const houseLine = (c, w) => `<path d="M14 31L32 15L50 31" ${stroke(c, w)}/><path d="M19 29V52H45V29" ${stroke(c, w)}/><path d="M41 15V24" ${stroke(c, w)}/><path d="M38 15H41" ${stroke(c, w)}/>`;
const houseSolid = (c) => `<path d="M11 31L32 12L38 17.5V11H44V23L53 31H47V52H17V31Z" fill="${c}"/>`;

const marks = {
  "1-line": {
    title: "The original, redrawn",
    why: "Same idea: house, chimney, sauce from the chimney. The line is now one even weight with rounded ends, the lettering comes off the walls, and the splat is the only paprika. Recognisable to anyone who knew the old one.",
    draw: (fg, bg) => tile(bg) + houseLine(fg, 3.5) + `<rect x="27.5" y="36" width="9" height="9" rx="1" ${stroke(fg, 2.5)}/><path d="M32 36v9M27.5 40.5h9" stroke="${fg}" stroke-width="2"/>` + splat(41, 7.5, 1.05, ACCENT),
  },
  "2-solid": {
    title: "Solid house, paprika splat",
    why: "The house as a single filled shape with the window knocked out, so it holds up at favicon size and on a van. Bolder than the original, same story.",
    draw: (fg, bg) => tile(bg) + houseSolid(fg) + `<rect x="27" y="35" width="10" height="10" rx="1.2" fill="${bg}"/>` + splat(41, 6.5, 1.05, ACCENT),
  },
  "3-roof": {
    title: "Just the roofline and chimney",
    why: "Reduced to the two things that made the old mark yours: the roof and the chimney with sauce coming out. The most modern of the set, and it works as a tiny icon.",
    draw: (fg, bg) => tile(bg) + `<path d="M12 40L32 20L52 40" ${stroke(fg, 5)}/><path d="M41 21V13H46V26" ${stroke(fg, 4)}/><path d="M18 46V52H46V46" ${stroke(fg, 4)}/>` + splat(43.5, 6, 1.0, ACCENT),
  },
  "4-drop": {
    title: "House with a drop from the chimney",
    why: "The splat becomes a single clean drop rising from the chimney, joining the old house to the drop idea you liked. Quieter and more premium than the splat.",
    draw: (fg, bg) => tile(bg) + houseLine(fg, 3.5) + `<rect x="27.5" y="36" width="9" height="9" rx="1" ${stroke(fg, 2.5)}/><path d="M32 36v9M27.5 40.5h9" stroke="${fg}" stroke-width="2"/>` + drop(40.5, 3.5, 3.6, ACCENT),
  },
  "5-door": {
    title: "Solid house, paprika door, splat above",
    why: "Two touches of paprika: the sauce and the front door. Warmer, and the door gives the eye a second place to land.",
    draw: (fg, bg) => tile(bg) + houseSolid(fg) + `<rect x="28.5" y="38" width="7" height="14" rx="1.2" fill="${ACCENT}"/>` + splat(41, 6.5, 1.05, ACCENT),
  },
  "6-badge": {
    title: "In a round badge",
    why: "The line house inside a circle, for stationery and social avatars. Feels like a firm that has been around a while, which you have.",
    draw: (fg, bg) => tile(bg) + `<circle cx="32" cy="33" r="27" ${stroke(fg, 2)}/>` + `<g transform="translate(32 34) scale(0.78) translate(-32 -33)">${houseLine(fg, 4)}<rect x="27.5" y="36" width="9" height="9" rx="1" ${stroke(fg, 3)}/><path d="M32 36v9M27.5 40.5h9" stroke="${fg}" stroke-width="2.5"/>${splat(41, 6.5, 1.1, ACCENT)}</g>`,
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
<h1>Round six: the original logo, refreshed</h1><p class="sub">House, chimney, sauce. Each shown on green, on paper, beside the wordmark, and at 32, 20 and 16 pixels.</p><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-round6.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1250", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
