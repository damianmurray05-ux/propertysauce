// Generates the brand package: logo SVGs (with the display font embedded so
// they render anywhere), favicon, then PNG renders and the social image via
// headless Chrome. `node scripts/brand.mjs`
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand");
mkdirSync(out, { recursive: true });

const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

// The mark: a drop that reads as a roofline, with a paprika door.
const markPaths = (tile, drop, door, x = 0, y = 0, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect width="64" height="64" rx="16" fill="${tile}"/><path d="M32 9.5C38.5 20 49.5 28.5 49.5 41A17.5 17.5 0 0 1 14.5 41C14.5 28.5 25.5 20 32 9.5Z" fill="${drop}"/><rect x="27.25" y="36" width="9.5" height="13" rx="2.2" fill="${door}"/></g>`;

const svg = (w, h, inner, bg = "none") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>${fontFace}</style>${bg !== "none" ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${inner}</svg>`;

const word = (x, y, size, fill) =>
  `<text x="${x}" y="${y}" font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" letter-spacing="${-0.035 * size}" fill="${fill}">Property Sauce</text>`;

const files = {};
// Primary: mark + wordmark, horizontal. 640 x 160.
files["logo-primary.svg"] = svg(760, 160, markPaths(INK, PAPER, ACCENT, 24, 24, 1.75) + word(150, 106, 74, INK));
files["logo-primary-reversed.svg"] = svg(760, 160, markPaths(PAPER, INK, ACCENT, 24, 24, 1.75) + word(150, 106, 74, PAPER));
files["logo-primary-on-green.svg"] = svg(760, 160, markPaths(PAPER, INK, ACCENT, 24, 24, 1.75) + word(150, 106, 74, PAPER), INK);
// Stacked: mark above wordmark. 480 x 360.
files["logo-stacked.svg"] = svg(480, 360, markPaths(INK, PAPER, ACCENT, 168, 40, 2.25) + `<text x="240" y="300" text-anchor="middle" font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="62" letter-spacing="-2.2" fill="${INK}">Property Sauce</text>`);
files["logo-stacked-reversed.svg"] = svg(480, 360, markPaths(PAPER, INK, ACCENT, 168, 40, 2.25) + `<text x="240" y="300" text-anchor="middle" font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="62" letter-spacing="-2.2" fill="${PAPER}">Property Sauce</text>`);
// Mark alone.
files["mark.svg"] = svg(64, 64, markPaths(INK, PAPER, ACCENT));
files["mark-reversed.svg"] = svg(64, 64, markPaths(PAPER, INK, ACCENT));
files["mark-mono.svg"] = svg(64, 64, markPaths(INK, PAPER, INK));
// Wordmark alone.
files["wordmark.svg"] = svg(520, 110, word(6, 82, 74, INK));
files["wordmark-reversed.svg"] = svg(520, 110, word(6, 82, 74, PAPER));

for (const [name, body] of Object.entries(files)) writeFileSync(join(out, name), body);
// Favicon: the mark without the font payload.
writeFileSync(join(root, "public", "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${markPaths(INK, PAPER, ACCENT)}</svg>`);

// Social image (1200 x 630).
const og = `<!doctype html><meta charset="utf-8"><style>${fontFace}
html,body{margin:0;width:1200px;height:630px;background:${INK};font-family:"Schibsted Grotesk",Helvetica,Arial,sans-serif;color:${PAPER};overflow:hidden}
.wrap{position:relative;height:630px;padding:64px 72px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:22px;font-weight:700;font-size:40px;letter-spacing:-1.4px}
h1{margin:0;font-weight:700;font-size:78px;line-height:0.98;letter-spacing:-3.2px;max-width:900px}
p{margin:0;font-size:28px;line-height:1.35;color:rgba(243,245,240,.72);max-width:820px;font-family:Helvetica,Arial,sans-serif}
.glow{position:absolute;right:-180px;top:-200px;width:620px;height:620px;border-radius:50%;background:radial-gradient(closest-side,rgba(242,163,133,.22),transparent)}
</style><div class="wrap"><div class="glow"></div>
<div class="top"><svg width="64" height="64" viewBox="0 0 64 64">${markPaths(PAPER, INK, ACCENT)}</svg>Property Sauce</div>
<div><h1>Lettings, block management and property acquisition across England.</h1></div>
<p>For landlords, corporate and institutional owners, and anyone selling a block of flats.</p></div>`;
const ogPath = join(tmpdir(), "ps-og.html");
writeFileSync(ogPath, og);

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function shot(src, dest, w, h, transparent = true) {
  const args = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox", `--window-size=${w},${h}`, `--screenshot=${dest}`, "--force-device-scale-factor=1"];
  if (transparent) args.push("--default-background-color=00000000");
  execFileSync(chrome, [...args, src], { stdio: "ignore" });
}
if (existsSync(chrome)) {
  const renders = [
    ["logo-primary.svg", "logo-primary.png", 760, 160],
    ["logo-primary-reversed.svg", "logo-primary-reversed.png", 760, 160],
    ["logo-primary-on-green.svg", "logo-primary-on-green.png", 760, 160],
    ["logo-stacked.svg", "logo-stacked.png", 480, 360],
    ["logo-stacked-reversed.svg", "logo-stacked-reversed.png", 480, 360],
  ];
  for (const [s, d, w, h] of renders) shot("file://" + join(out, s), join(out, d), w, h);
  // Mark at 512 and 1024 for app icons and avatars: render a scaled copy.
  for (const size of [512, 1024]) {
    const p = join(tmpdir(), `ps-mark-${size}.svg`);
    writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${markPaths(INK, PAPER, ACCENT)}</svg>`);
    shot("file://" + p, join(out, `mark-${size}.png`), size, size);
  }
  const av = join(tmpdir(), "ps-avatar.svg");
  writeFileSync(av, `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64">${markPaths(PAPER, INK, ACCENT)}</svg>`);
  shot("file://" + av, join(out, "mark-reversed-1024.png"), 1024, 1024);
  shot("file://" + ogPath, join(root, "assets", "og.png"), 1200, 630, false);
  // Apple touch icon and a 32px ICO stand-in (PNG in .ico container is accepted by browsers).
  const at = join(tmpdir(), "ps-touch.svg");
  writeFileSync(at, `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">${markPaths(INK, PAPER, ACCENT)}</svg>`);
  shot("file://" + at, join(root, "public", "apple-touch-icon.png"), 180, 180);
  const fv = join(tmpdir(), "ps-fav.svg");
  writeFileSync(fv, `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64">${markPaths(INK, PAPER, ACCENT)}</svg>`);
  shot("file://" + fv, join(root, "public", "favicon-32.png"), 32, 32);
  copyFileSync(join(root, "public", "favicon-32.png"), join(root, "public", "favicon.ico"));
  console.log("Brand package written to public/brand and assets/og.png");
} else {
  console.warn("Chrome not found: SVGs written, PNG renders skipped");
}
