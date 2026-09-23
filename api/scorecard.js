// The tenant scorecard. POST { session } with a verified session token from
// /api/verify. Returns the tenant's score, tier, breakdown and rewards.
import { findRow } from "../src/chat/directory.mjs";
import { zohoConfigured, tenantById, jobsForTenant, propertyById } from "../src/chat/zoho.mjs";
import { tenantRowFromZoho } from "../src/chat/score.mjs";
import { verify } from "../src/chat/crypto.mjs";
import { scoreTenant } from "../src/chat/score.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`score:${ip}`, 30, 10 * 60 * 1000)) return json(429, { error: "rate_limited" });
  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  const s = verify(body.session);
  if (!s || s.t !== "session" || s.expired) return json(401, { error: "session_expired" });
  let row;
  if (zohoConfigured() && s.id) {
    const [t, jobs, property] = await Promise.all([tenantById(s.id), jobsForTenant(s.id).catch(() => []), s.pid ? propertyById(s.pid).catch(() => null) : null]);
    if (!t) return json(404, { error: "not_found" });
    row = tenantRowFromZoho(t, jobs, property);
  } else {
    row = await findRow(s.ref);
  }
  if (!row) return json(404, { error: "not_found" });
  const card = scoreTenant(row);
  // Every document on the tenant's own file and their property, newest first, with links that work only for this session.
  let documents = [];
  if (zohoConfigured() && s.id) {
    try {
      const { tenantFile } = await import("../src/chat/tenantfile.mjs");
      const file = await tenantFile({ id: s.id, pid: s.pid });
      documents = file.documents.map((d) => ({ type: d.type, title: d.title, date: d.date, url: d.url.startsWith("/api/file") ? `${d.url}&s=${encodeURIComponent(body.session)}` : d.url, drive: Boolean(d.drive) }));
    } catch (e) { console.error("tenant documents failed", e.message); }
  }
  return json(200, {
    firstName: (row.name || "").split(/\s+/)[0] || "there",
    address: row.address || "",
    ...card,
    jobs: (row.jobs || []).slice(0, 8),
    inspection: row.inspection || null,
    documents,
  });
}
