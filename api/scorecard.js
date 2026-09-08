// The tenant scorecard. POST { session } with a verified session token from
// /api/verify. Returns the tenant's score, tier, breakdown and rewards.
import { findRow } from "../src/chat/directory.mjs";
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
  const row = await findRow(s.ref);
  if (!row) return json(404, { error: "not_found" });
  const card = scoreTenant(row);
  return json(200, {
    firstName: (row.name || "").split(/\s+/)[0] || "there",
    address: row.address || "",
    ...card,
  });
}
