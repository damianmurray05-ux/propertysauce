// Build gate: every internal link and anchor resolves, every image has alt
// text, every page has a title and description of sensible length, no em or
// en dashes leak into copy, and no bracketed placeholder reaches structured
// data. Exit 1 on any failure so a broken deploy never ships.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && pages.push(p);
  }
})(dist);

let problems = 0;
const fail = (msg) => { problems++; console.error("  x " + msg); };

for (const f of pages) {
  const html = readFileSync(f, "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  if (title.length < 5) fail(`${f}: missing title`);
  if (title.length > 70) console.warn(`  ! ${f}: title is ${title.length} chars (aim for under 60): ${title}`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  if (desc.length < 50) fail(`${f}: description too short (${desc.length})`);
  if (desc.length > 165) console.warn(`  ! ${f}: description is ${desc.length} chars (aim for under 160)`);
  if (!/<h1[\s>]/.test(html)) fail(`${f}: no h1`);
  if ((html.match(/<h1[\s>]/g) || []).length > 1) fail(`${f}: more than one h1`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) fail(`${f}: img without alt`);
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  if (/[–—]/.test(body)) fail(`${f}: contains an em or en dash`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(`${f}: invalid JSON-LD`); }
    if (/\[[^\]]*to be confirmed[^\]]*\]/i.test(m[1])) fail(`${f}: placeholder inside JSON-LD`);
  }
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    for (let u of m[1].split(",").map((s) => s.trim().split(" ")[0])) {
      if (!u.startsWith("/") || u.startsWith("//")) continue;
      const [path, hash] = u.split("#");
      if (path) {
        if (path.startsWith("/api/")) continue;
        const target = path.endsWith("/") ? join(dist, path, "index.html") : join(dist, path);
        if (!existsSync(target)) fail(`${f}: broken link ${u}`);
      } else if (hash && !ids.has(hash)) fail(`${f}: missing anchor #${hash}`);
    }
  }
}

for (const must of ["sitemap.xml", "robots.txt", "favicon.svg", "assets/og.png", "brand/logo-primary.svg"]) {
  if (!existsSync(join(dist, must))) fail(`missing ${must}`);
}

console.log(`${pages.length} pages audited, ${problems} problem${problems === 1 ? "" : "s"}`);
process.exit(problems ? 1 : 0);
