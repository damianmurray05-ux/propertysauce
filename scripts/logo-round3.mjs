// Round three: drawn marques with architectural detail, shown as full lockups.
// `node scripts/logo-round3.mjs` writes SVGs to public/brand/round3/ and a sheet.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "brand", "round3");
mkdirSync(out, { recursive: true });
const INK = "#0f2a22", PAPER = "#f4f5f1", ACCENT = "#c8502a";
const font = readFileSync(join(root, "assets/fonts/schibsted-grotesk-latin.woff2")).toString("base64");
const fontFace = `@font-face{font-family:"Schibsted Grotesk";font-weight:400 900;src:url(data:font/woff2;base64,${font}) format("woff2")}`;

// Each mark is drawn in a 100 x 100 box, line weight 3, for a light or dark ground.
const line = (ink) => `fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;

const marks = {
  "A-terrace": {
    title: "The terrace",
    why: "Three Victorian gables with sash windows, the middle door in paprika. It says lettings, blocks and the streets in your photography, and the middle house alone becomes the favicon.",
    draw: (ink, acc) => `
      <path d="M8 92V46L26 28L44 46V92" ${line(ink)}/>
      <path d="M32 92V40L50 22L68 40V92" ${line(ink)}/>
      <path d="M56 92V46L74 28L92 46V92" ${line(ink)}/>
      <path d="M4 92H96" ${line(ink)}/>
      <rect x="18" y="52" width="10" height="13" rx="1" ${line(ink)}/><path d="M23 52v13M18 58.5h10" stroke="${ink}" stroke-width="2"/>
      <rect x="72" y="52" width="10" height="13" rx="1" ${line(ink)}/><path d="M77 52v13M72 58.5h10" stroke="${ink}" stroke-width="2"/>
      <rect x="43" y="46" width="14" height="14" rx="1" ${line(ink)}/><path d="M50 46v14M43 53h14" stroke="${ink}" stroke-width="2"/>
      <path d="M42 92V74A8 8 0 0 1 58 74V92Z" fill="${acc}"/>
      <path d="M13 74h10M77 74h10" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
  },
  "B-monogram": {
    title: "The P elevation",
    why: "A capital P whose stem is a building elevation with rows of windows and whose bowl is an arched entrance. A monogram that is unmistakably property, and it works as a single letter on a tie or a key fob.",
    draw: (ink, acc) => `
      <path d="M22 92V10H58A24 24 0 0 1 58 58H40" ${line(ink)} stroke-width="5"/>
      <path d="M40 58V92" ${line(ink)} stroke-width="5"/>
      <rect x="28" y="18" width="6" height="7" rx="0.8" fill="${ink}"/><rect x="28" y="30" width="6" height="7" rx="0.8" fill="${ink}"/><rect x="28" y="42" width="6" height="7" rx="0.8" fill="${ink}"/>
      <rect x="28" y="64" width="6" height="7" rx="0.8" fill="${ink}"/><rect x="28" y="76" width="6" height="7" rx="0.8" fill="${ink}"/>
      <path d="M50 46V34A8 8 0 0 1 66 34V46Z" fill="${acc}"/>
      <path d="M14 92H50" ${line(ink)} stroke-width="5"/>`,
  },
  "C-keystone": {
    title: "The keystone",
    why: "An arch of voussoirs with the keystone in paprika: the piece that holds the whole structure up. Institutional, quiet, and a straight metaphor for what a good operator does for a block.",
    draw: (ink, acc) => `
      <path d="M12 82V54A38 38 0 0 1 88 54V82" ${line(ink)} stroke-width="4"/>
      <path d="M26 82V56A24 24 0 0 1 74 56V82" ${line(ink)} stroke-width="4"/>
      <path d="M12 62L26 64M15.5 45L29 51M24 33L34 42M36 25L42 37M64 25L58 37M76 33L66 42M84.5 45L71 51M88 62L74 64" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <path d="M43 18L46 33L54 33L57 18Z" fill="${acc}"/>
      <path d="M6 82H94M6 90H94" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`,
  },
  "D-sash": {
    title: "The sash window",
    why: "A six-over-six Georgian sash under a fanlight, one pane lit. The most London image there is, and it reads as care and detail rather than as a housebuilder logo.",
    draw: (ink, acc) => `
      <path d="M14 42A36 36 0 0 1 86 42" ${line(ink)} stroke-width="4"/>
      <path d="M50 8V42M28 15L40 42M72 15L60 42M18 30L30 42M82 30L70 42" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="14" y="42" width="72" height="50" rx="2" ${line(ink)} stroke-width="4"/>
      <path d="M38 42V92M62 42V92M14 59H86M14 75H86" stroke="${ink}" stroke-width="3"/>
      <rect x="40" y="61" width="20" height="12" fill="${acc}"/>`,
  },
  "E-mansion": {
    title: "The mansion block seal",
    why: "A mansion block elevation, chimneys and bays included, inside a ring with the name. Formal enough for a fund's board pack, distinctive enough to own, and it echoes Albert Hall Mansions on the home page.",
    draw: (ink, acc) => `
      <circle cx="50" cy="50" r="46" ${line(ink)} stroke-width="2.5"/>
      <path d="M20 74V44L26 38L32 44V74M32 74V40L50 24L68 40V74M68 74V44L74 38L80 44V74M16 74H84" ${line(ink)} stroke-width="2.5"/>
      <path d="M26 30V38M74 30V38M44 30V29M56 30V29" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M42 33H58" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="23" y="50" width="6" height="8" fill="${ink}"/><rect x="71" y="50" width="6" height="8" fill="${ink}"/>
      <rect x="38" y="44" width="6" height="8" fill="${ink}"/><rect x="47" y="44" width="6" height="8" fill="${ink}"/><rect x="56" y="44" width="6" height="8" fill="${ink}"/>
      <rect x="38" y="57" width="6" height="8" fill="${ink}"/><rect x="56" y="57" width="6" height="8" fill="${ink}"/>
      <path d="M45 74V62A5 5 0 0 1 55 62V74Z" fill="${acc}"/>`,
  },
  "F-courtyard": {
    title: "The courtyard block",
    why: "A block of flats seen from above: four ranges around a paprika courtyard, with the entrance cut into the front range. Abstract enough to be modern, and it is literally the asset you buy and manage.",
    draw: (ink, acc) => `
      <path d="M14 14H86V86H14Z" ${line(ink)} stroke-width="5"/>
      <rect x="30" y="30" width="40" height="40" fill="${acc}"/>
      <path d="M44 86V92M56 86V92" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 92H56" stroke="${PAPER}" stroke-width="0"/>
      <rect x="44" y="82" width="12" height="9" fill="${PAPER}"/>
      <path d="M21 21H29M35 21H43M49 21H57M63 21H71M77 21H79" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
      <path d="M21 79H29M35 79H43M63 79H71M77 79H79" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
  },
};

const wordmark = (fill, size = 52) => `<text font-family="Schibsted Grotesk, Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" letter-spacing="${-0.035 * size}" fill="${fill}">Property Sauce</text>`;

for (const [name, m] of Object.entries(marks)) {
  writeFileSync(join(out, `${name}-green.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${m.draw(INK, ACCENT)}</svg>`);
  writeFileSync(join(out, `${name}-paper.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${m.draw(PAPER, ACCENT)}</svg>`);
}

const cards = Object.entries(marks).map(([name, m]) => `
<div class="card">
  <div class="light"><svg viewBox="0 0 100 100" width="170" height="170">${m.draw(INK, ACCENT)}</svg><div class="lock"><svg viewBox="0 0 100 100" width="56" height="56">${m.draw(INK, ACCENT)}</svg><svg width="330" height="60" viewBox="0 0 330 60"><g transform="translate(0 44)">${wordmark(INK, 40)}</g></svg></div></div>
  <div class="darkp"><svg viewBox="0 0 100 100" width="120" height="120">${m.draw(PAPER, ACCENT)}</svg><div class="tiny"><svg viewBox="0 0 100 100" width="32" height="32">${m.draw(PAPER, ACCENT)}</svg><svg viewBox="0 0 100 100" width="20" height="20">${m.draw(PAPER, ACCENT)}</svg></div></div>
  <div class="text"><strong>${name.split("-")[0]}</strong><b>${m.title}</b><p>${m.why}</p></div>
</div>`).join("");

const html = `<!doctype html><meta charset="utf-8"><style>${fontFace}
body{margin:0;background:${PAPER};font-family:"Schibsted Grotesk",Helvetica,Arial,sans-serif;color:${INK};width:1600px}
h1{margin:40px 40px 8px;font-size:34px;letter-spacing:-1px}.sub{margin:0 40px 24px;font-family:Helvetica,Arial;color:#55655e;font-size:17px}
.grid{display:grid;grid-template-columns:1fr;gap:24px;padding:0 40px 40px}
.card{background:#fff;border:1px solid rgba(15,42,34,.12);border-radius:18px;overflow:hidden;display:grid;grid-template-columns:1fr 200px;grid-template-rows:auto auto}
.light{padding:28px;display:flex;align-items:center;gap:28px}.lock{display:flex;align-items:center;gap:14px}
.darkp{background:${INK};display:grid;place-items:center;padding:20px;gap:12px}.tiny{display:flex;gap:10px;align-items:center}
.text{grid-column:1/-1;padding:18px 28px 24px;border-top:1px solid rgba(15,42,34,.1);font-family:Helvetica,Arial}
strong{display:inline-block;background:${ACCENT};color:#fff;border-radius:6px;padding:2px 10px;margin-right:10px;font-family:"Schibsted Grotesk";font-size:18px}
b{font-family:"Schibsted Grotesk";font-size:20px}p{margin:8px 0 0;font-size:16px;line-height:1.45;color:#333}</style>
<h1>Property Sauce marque, round three</h1><p class="sub">Drawn marks with architectural detail. Each shown on paper with the wordmark, reversed on green, and at 32 and 20 pixels.</p><div class="grid">${cards}</div>`;
const p = join(tmpdir(), "ps-round3.html");
writeFileSync(p, html);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1600,2500", `--screenshot=${join(out, "sheet.png")}`, "file://" + p], { stdio: "ignore" });
console.log("Wrote", Object.keys(marks).length, "marks to", out);
