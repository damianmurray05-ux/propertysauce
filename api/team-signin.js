// POST { name, code } -> { token } for the office shift clock. Name + a
// personal code, not email/password — same pattern as Luxe Stay's team
// sign-in, chosen for the same reason: this is a shared tablet or phone in
// an office doorway, not a device anybody wants to type a password into.
import { findStaff, staffSlug, staffConfigured } from "../src/chat/staff.mjs";
import { sign } from "../src/chat/crypto.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`teamsignin:${ip}`, 20, 10 * 60 * 1000)) return json(429, { error: "rate_limited" });
  if (!staffConfigured()) return json(503, { error: "not_configured" });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }

  const staff = findStaff(body.name, body.code);
  if (!staff) return json(401, { error: "Name or code not recognised." });

  const token = sign({ t: "staff", name: staff.name, slug: staffSlug(staff.name), remote: staff.remote, exp: Date.now() + 14 * 24 * 60 * 60 * 1000 });
  return json(200, { token, staff: { name: staff.name, remote: staff.remote } });
}
