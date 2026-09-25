// Local preview: serves dist/ and mounts the same API handlers Vercel runs.
// `node server.mjs` then open http://localhost:4323
// Reads a .env file in the project root if present (never committed).
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const envFile = join(root, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Every api/*.js file becomes a route automatically, the same way Vercel
// discovers them — this list used to be hand-maintained and went stale
// every time a new endpoint was added (api/properties.js and
// api/inkbox-webhook.js both shipped without it, and only the deployed
// Vercel site could serve them until this was noticed locally).
const { readdirSync } = await import("node:fs");
const routes = {};
for (const f of readdirSync(join(root, "api")).filter((f) => f.endsWith(".js"))) {
  const mod = await import(`./api/${f}`);
  const path = `/api/${f.slice(0, -3)}`;
  routes[path] = mod;
  routes[`${path}/`] = mod;
}

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".pdf": "application/pdf" };
const dist = join(root, "dist");
const port = Number(process.env.PORT) || 4323;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const mod = routes[url.pathname];
  if (mod) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : body });
    const handler = mod[req.method] || mod.default;
    if (!handler) { res.writeHead(405).end(); return; }
    let response;
    try { response = await handler(request); }
    catch (err) { console.error(err); response = new Response(JSON.stringify({ error: "server_error", detail: String(err.message || err).slice(0, 300) }), { status: 500, headers: { "content-type": "application/json" } }); }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  let p = decodeURIComponent(url.pathname);
  let file = join(dist, p);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) { file = join(dist, "404.html"); res.statusCode = 404; }
  res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Property Sauce preview on http://localhost:${port}`));
