// Damian's personal "DM" mark in the Property Sauce house style (same ink, gold and paper as mark.svg).
// Writes public/brand/dm-mark.svg and renders dm-mark-512.png with headless Chrome.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
const root = new URL("..", import.meta.url).pathname;
const src = readFileSync(join(root, "public/brand/mark.svg"), "utf8");
// Two letters, slightly wider apart than P S because D and M are broader glyphs.
let svg = src.replace(/<g transform="translate\(32 34\) scale\(0\.2\)">[\s\S]*?<\/g>/, (g) =>
  g.replace(/x="-40"/g, 'x="-44"').replace(/x="40"/g, 'x="44"').replace(/>P</g, ">D<").replace(/>S</g, ">M<").replace(/font-size="132"/g, 'font-size="124"'));
writeFileSync(join(root, "public/brand/dm-mark.svg"), svg);
const big = join(tmpdir(), "dm-512.svg");
writeFileSync(big, svg.replace('width="64" height="64"', 'width="512" height="512"'));
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dest = join(root, "public/brand/dm-mark-512.png");
try { execFileSync(chrome, ["--user-data-dir=" + join(tmpdir(), "ps-brand-profile"), "--no-first-run", "--disable-extensions", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox", "--window-size=512,512", `--screenshot=${dest}`, "--force-device-scale-factor=1", "--default-background-color=00000000", "file://" + big], { stdio: "ignore", timeout: 25000, killSignal: "SIGKILL" }); } catch (e) { if (!existsSync(dest)) throw e; }
console.log("wrote", dest);
