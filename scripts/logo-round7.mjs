// Round seven: the elegant register from Damian's references. Fine lines,
// wide-tracked capitals, serif monograms, plenty of air.
// `node scripts/logo-round7.mjs` writes SVGs to public/brand/round7/ and a sheet.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round7");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a", GOLD = "#b4924a";
const b64 = (f) => readFileSync(join(root, "assets/fonts", f)).toString("base64");
const fontFace = `
@font-face{font-family:"Cormorant";font-weight:400 700;font-style:normal;src:url(data:font/woff2;base64,${b64("cormorant-normal-latin.woff2")}) format("woff2")}
@font-face{font-family:"Cormorant";font-weight:400 700;font-style:italic;src:url(data:font/woff2;base64,${b64("cormorant-italic-latin.woff2")}) format("woff2")}
@font-face{font-family:"Pinyon";src:url(data:font/woff2;base64,${b64("pinyon-script-latin.woff2")}) format("woff2")}
@font-face{font-family:"Geist";font-weight:400 700;src:url(data:font/woff2;base64,${b64("geist-latin.woff2")}) format("woff2")}`;

const line = (c, w = 1.6) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const caps = (text, x, y, size, fill, track = 0.34, weight = 500, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Geist, Helvetica, Arial, sans-serif" font-weight="${weight}" font-size="${size}" letter-spacing="${(track * size).toFixed(2)}" fill="${fill}">${text}</text>`;
const serif = (text, x, y, size, fill, opts = {}) => `<text x="${x}" y="${y}" text-anchor="${opts.anchor || "middle"}" font-family="Cormorant, Georgia, serif" font-weight="${opts.weight || 500}" font-style="${opts.italic ? "italic" : "normal"}" font-size="${size}" letter-spacing="${opts.track ? (opts.track * size).toFixed(2) : 0}" fill="${fill}">${text}</text>`;
const script = (text, x, y, size, fill) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Pinyon, cursive" font-size="${size}" fill="${fill}">${text}</text>`;

// Every lockup is drawn in a 300 x 300 box on paper.
const lockups = {
  "1-skyline": {
    title: "Fine-line block, wide capitals",
    why: "A mansion block drawn in a single fine line, as in your first reference, with PROPERTY in wide capitals and Sauce in a light italic beneath. Institutional and quiet. The accent colour is used once.",
    svg: `
      <g ${line(ACCENT, 2)}>
        <path d="M78 176V120L104 108V176"/><path d="M104 176V96L150 84V176"/><path d="M150 176V110L178 122V176"/><path d="M178 176V132L206 140V176"/>
        <path d="M66 176H222"/>
        <path d="M86 130h10M86 146h10M118 108h14M118 126h14M118 144h14M158 130h10M158 148h10M186 148h10"/>
      </g>
      ${caps("PROPERTY", 150, 214, 22, INK, 0.36, 500)}
      ${serif("Sauce", 150, 246, 26, ACCENT, { italic: true, weight: 500 })}`,
  },
  "2-script": {
    title: "Roofline with a script name",
    why: "The gable from your second reference, drawn thin, with Property Sauce in a script and LETTINGS AND MANAGEMENT small beneath. Personal and premium; suits the private landlord side.",
    svg: `
      <path d="M92 214V126L150 76L208 126V214" ${line(INK, 1.8)}/>
      <path d="M92 214H128" ${line(INK, 1.8)}/>
      ${script("Property Sauce", 152, 176, 44, INK)}
      ${caps("LETTINGS AND MANAGEMENT", 176, 208, 8.5, INK, 0.3, 600)}`,
  },
  "3-monogram-square": {
    title: "PS monogram on a green square",
    why: "Your third reference, in our colours: a deep green square, a high-contrast serif PS, and the trade set vertically alongside. Reads as a firm, not a shop.",
    svg: `
      <rect x="70" y="62" width="150" height="150" fill="${INK}"/>
      ${serif("PS", 145, 158, 74, PAPER, { weight: 500, track: -0.02 })}
      <g transform="translate(236 212) rotate(-90)">${caps("LETTINGS  ·  BLOCKS  ·  ACQUISITION", 0, 0, 7.5, INK, 0.26, 600, "start")}</g>
      ${caps("PROPERTY SAUCE", 145, 246, 11, INK, 0.36, 600)}`,
  },
  "4-house-drop": {
    title: "Fine-line house with a drop",
    why: "The house-and-key structure from your fourth reference, with our drop hanging where the key was. The one place the sauce idea survives, and it is quiet about it.",
    svg: `
      <path d="M96 118L150 66L204 118" ${line(GOLD, 2)}/>
      <path d="M108 108V196H134M192 108V196H166" ${line(GOLD, 2)}/>
      <path d="M150 130C158 142 170 150 170 164A20 20 0 0 1 130 164C130 150 142 142 150 130Z" ${line(GOLD, 2)}/>
      <path d="M150 164V214M150 198h10M150 206h10" ${line(GOLD, 2)}/>
      ${caps("PROPERTY SAUCE", 150, 244, 15, INK, 0.3, 500)}`,
  },
  "5-roofs": {
    title: "Two rooflines, wide capitals",
    why: "Your fifth reference: two overlapping gables in a warm stone line, the name in wide capitals, a small descriptor beneath. The most corporate of the set and the easiest to reproduce anywhere.",
    svg: `
      <path d="M62 172L120 96L156 142" ${line(GOLD, 6)}/>
      <path d="M118 172L178 92L238 172" ${line(GOLD, 6)}/>
      ${caps("PROPERTY SAUCE", 150, 216, 22, INK, 0.14, 600)}
      ${caps("LETTINGS  ·  BLOCK MANAGEMENT  ·  ACQUISITION", 150, 240, 8, INK, 0.22, 500)}`,
  },
  "6-serif-monogram": {
    title: "Interlocking PS serif monogram",
    why: "Your sixth reference: a large high-contrast serif P and S overlapping, the full name in serif capitals beneath and the trade in small sans. Elegant, timeless, and it works embossed on a letterhead.",
    svg: `
      ${serif("P", 122, 168, 130, INK, { weight: 400 })}
      ${serif("S", 172, 190, 130, INK, { weight: 400 })}
      ${serif("PROPERTY SAUCE", 150, 232, 22, INK, { weight: 500, track: 0.12 })}
      ${caps("LETTINGS  ·  MANAGEMENT  ·  ACQUISITION", 150, 254, 7.5, INK, 0.26, 500)}`,
  },
};

for (const [name, l] of Object.entries(lockups)) {
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><style>${fontFace}</style><rect width="300" height="300" fill="${PAPER}"/>${l.svg}</svg>`);
}
const cards = Object.entries(lockups).map(([name, l]) => `
<div class="card">
  <div class="art"><svg viewBox="0 0 300 300" width="330" height="330"><rect width="300" height="300" fill="${PAPER}"/>${l.svg}</svg></div>
  <div class="text"><strong>${name.split("-")[0]}</strong><b>${l.title}</b><p>${l.why}</p></div>
</div>`).join("");
const html = `<!doctype html><meta charset="utf-8"><style>${fontFace}
body{margin:0;background:#e9ebe4;font-family:Geist,Helvetica,Arial,sans-serif;color:${INK};width:1600px}
h1{margin:40px 40px 8px;font-family:Cormorant,Georgia,serif;font-weight:500;font-size:40px}.sub{margin:0 40px 24px;color:#55655e;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:0 40px 40px}
.card{background:#fff;border:1px solid rgba(15,42,34,.12);border-radius:6px;overflow:hidden}
.art{display:grid;place-items:center;padding:16px;background:${PAPER}}
.text{padding:16px 22px 22px;border-top:1px solid rgba(15,42,34,.1)}
strong{display:inline-block;background:${INK};color:#fff;border-radius:4px;padding:2px 10px;margin-right:10px;font-size:16px}
b{font-size:18px}p{margin:8px 0 0;font-size:15px;line-height:1.45;color:#333}</style>
<h1>Round seven: the elegant register</h1><p class="sub">Fine lines, wide capitals, serif monograms, air. Six lockups in the style of your references, in our colours.</p><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-round7.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,1480", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(lockups).length, "lockups to", out);
