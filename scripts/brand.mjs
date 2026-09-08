// Generates the brand package from the chosen mark: the interlocking serif PS
// monogram with a gold hairline, PROPERTY SAUCE in spaced serif capitals, and
// the descriptor PORTFOLIOS · BLOCK MANAGEMENT · ACQUISITIONS.
// Fonts are embedded so the SVGs render anywhere. PNGs and the social image
// are rendered with headless Chrome. `node scripts/brand.mjs`
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand");
mkdirSync(out, { recursive: true });

const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a", GOLD = "#b4924a";
const b64 = (f) => readFileSync(join(root, "assets/fonts", f)).toString("base64");
const fontFace = `@font-face{font-family:"Cormorant";font-weight:400 700;font-style:normal;src:url(data:font/woff2;base64,${b64("cormorant-normal-latin.woff2")}) format("woff2")}@font-face{font-family:"Geist";font-weight:400 700;src:url(data:font/woff2;base64,${b64("geist-latin.woff2")}) format("woff2")}`;

const serif = (text, x, y, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || "middle"}" font-family="Cormorant, Georgia, serif" font-weight="${o.weight || 400}" font-size="${size}" letter-spacing="${o.track ? (o.track * size).toFixed(2) : 0}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.strokeWidth}" stroke-linejoin="round"` : ""}>${text}</text>`;
const caps = (text, x, y, size, fill, track = 0.26, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Geist, Helvetica, Arial, sans-serif" font-weight="500" font-size="${size}" letter-spacing="${(track * size).toFixed(2)}" fill="${fill}">${text}</text>`;
const DESCRIPTOR = "PORTFOLIOS  ·  BLOCK MANAGEMENT  ·  ACQUISITIONS";

// The monogram: a gold hairline just outside both letters (a stroked copy
// behind, the filled letter on top). Drawn around (0,0) where the P is 132px
// tall; callers translate and scale. `w` is the hairline width in local units.
const monogram = (p, s, x, y, sc, w = 2.2) => `<g transform="translate(${x} ${y}) scale(${sc})">${serif("P", -30, 8, 132, GOLD, { stroke: GOLD, strokeWidth: w })}${serif("S", 22, 36, 132, GOLD, { stroke: GOLD, strokeWidth: w })}${serif("P", -30, 8, 132, p)}${serif("S", 22, 36, 132, s)}</g>`;

const svg = (w, h, inner, bg = "none") => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${fontFace}</style>${bg !== "none" ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${inner}</svg>`;

// Stacked lockup, 300 x 300: monogram, name, descriptor.
const stacked = (p, s, text, bg = "none") => svg(300, 300, monogram(p, s, 150, 140, 1) + serif("PROPERTY SAUCE", 150, 236, 23, text, { weight: 500, track: 0.14 }) + caps(DESCRIPTOR, 150, 258, 7.2, text), bg);
// Horizontal lockup, 560 x 140.
const horizontal = (p, s, text, bg = "none") => svg(560, 140, monogram(p, s, 70, 76, 0.5, 3) + `<path d="M130 40V100" stroke="${GOLD}" stroke-width="1"/>` + serif("PROPERTY SAUCE", 165, 72, 30, text, { weight: 500, track: 0.12, anchor: "start" }) + caps(DESCRIPTOR, 165, 96, 8.8, text, 0.22, "start"), bg);
// Mark alone on a rounded tile, 64 x 64 (favicon, avatars).
const tile = (bg, letter, r = 14) => svg(64, 64, `<rect width="64" height="64" rx="${r}" fill="${bg}"/>` + monogram(letter, letter, 32, 34, 0.2, 5), "none");

const files = {
  "logo-primary.svg": stacked(INK, INK, INK),
  "logo-primary-on-paper.svg": stacked(INK, INK, INK, PAPER),
  "logo-primary-reversed.svg": stacked(PAPER, PAPER, PAPER),
  "logo-primary-on-green.svg": stacked(PAPER, PAPER, PAPER, INK),
  "logo-accent.svg": stacked(INK, ACCENT, INK),
  "logo-accent-on-paper.svg": stacked(INK, ACCENT, INK, PAPER),
  "logo-horizontal.svg": horizontal(INK, INK, INK),
  "logo-horizontal-reversed.svg": horizontal(PAPER, PAPER, PAPER),
  "logo-horizontal-on-green.svg": horizontal(PAPER, PAPER, PAPER, INK),
  "monogram.svg": svg(64, 64, monogram(INK, INK, 32, 34, 0.2, 5)),
  "monogram-reversed.svg": svg(64, 64, monogram(PAPER, PAPER, 32, 34, 0.2, 5)),
  "mark.svg": tile(INK, PAPER),
  "mark-paper.svg": tile(PAPER, INK),
  "mark-mono.svg": svg(64, 64, `<rect width="64" height="64" rx="14" fill="${INK}"/><g transform="translate(32 34) scale(0.2)">${serif("P", -30, 8, 132, PAPER)}${serif("S", 22, 36, 132, PAPER)}</g>`),
};
for (const [name, body] of Object.entries(files)) writeFileSync(join(out, name), body);
// The favicon cannot carry a 60KB font, so it falls back to the system serif.
writeFileSync(join(root, "public", "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${INK}"/>${monogram(PAPER, PAPER, 32, 34, 0.2, 5).replace(/Cormorant, /g, "")}</svg>`);

// Social image (1200 x 630).
const og = `<!doctype html><meta charset="utf-8"><style>${fontFace}
html,body{margin:0;width:1200px;height:630px;background:${INK};color:${PAPER};overflow:hidden;font-family:Geist,Helvetica,Arial,sans-serif}
.wrap{height:630px;display:grid;grid-template-columns:400px 1fr;align-items:center;padding:0 80px;box-sizing:border-box;gap:48px}
h1{margin:0 0 18px;font-family:Cormorant,Georgia,serif;font-weight:500;font-size:58px;line-height:1.05}
p{margin:0;font-size:22px;line-height:1.4;color:rgba(243,245,240,.72);max-width:560px}
.rule{width:56px;height:1px;background:${GOLD};margin-bottom:22px}
</style><div class="wrap"><svg viewBox="0 0 300 300" width="400" height="400">${monogram(PAPER, PAPER, 150, 150, 1)}${serif("PROPERTY SAUCE", 150, 246, 23, PAPER, { weight: 500, track: 0.14 })}${caps(DESCRIPTOR, 150, 268, 7.2, PAPER)}</svg>
<div><div class="rule"></div><h1>Portfolios, block management and acquisitions across England.</h1><p>For landlords, corporate and institutional owners, freeholders, and anyone selling a block of flats.</p></div></div>`;
const ogPath = join(tmpdir(), "ps-og.html");
writeFileSync(ogPath, og);

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function shot(src, dest, w, h, transparent = true) {
  const args = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox", `--window-size=${w},${h}`, `--screenshot=${dest}`, "--force-device-scale-factor=1"];
  if (transparent) args.push("--default-background-color=00000000");
  execFileSync(chrome, [...args, src], { stdio: "ignore" });
}
if (existsSync(chrome)) {
  const big = (name, w, h, scale) => {
    const p = join(tmpdir(), `ps-${name}`);
    writeFileSync(p, files[name].replace(`width="${w}" height="${h}"`, `width="${w * scale}" height="${h * scale}"`));
    shot("file://" + p, join(out, name.replace(".svg", ".png")), w * scale, h * scale, !name.includes("-on-"));
  };
  for (const n of ["logo-primary.svg", "logo-primary-on-paper.svg", "logo-primary-reversed.svg", "logo-primary-on-green.svg", "logo-accent.svg", "logo-accent-on-paper.svg"]) big(n, 300, 300, 4);
  for (const n of ["logo-horizontal.svg", "logo-horizontal-reversed.svg", "logo-horizontal-on-green.svg"]) big(n, 560, 140, 3);
  for (const n of ["mark.svg", "mark-paper.svg"]) big(n, 64, 64, 16);
  shot("file://" + ogPath, join(root, "assets", "og.png"), 1200, 630, false);
  const at = join(tmpdir(), "ps-touch.svg");
  writeFileSync(at, files["mark.svg"].replace('width="64" height="64"', 'width="180" height="180"'));
  shot("file://" + at, join(root, "public", "apple-touch-icon.png"), 180, 180);
  const fv = join(tmpdir(), "ps-fav.svg");
  writeFileSync(fv, files["mark.svg"].replace('width="64" height="64"', 'width="32" height="32"'));
  shot("file://" + fv, join(root, "public", "favicon-32.png"), 32, 32);
  copyFileSync(join(root, "public", "favicon-32.png"), join(root, "public", "favicon.ico"));
  const m512 = join(tmpdir(), "ps-512.svg");
  writeFileSync(m512, files["mark.svg"].replace('width="64" height="64"', 'width="512" height="512"'));
  shot("file://" + m512, join(out, "mark-512.png"), 512, 512);
  console.log("Brand package written to public/brand and assets/og.png");
} else {
  console.warn("Chrome not found: SVGs written, PNG renders skipped");
}
