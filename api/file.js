// Streams a document from Zoho CRM to a signed-in landlord.
// GET /api/file?m=Accounts&r=<record id>&a=<attachment id>&s=<landlord session>
// The record must be one of the landlord's own properties.
import { verify } from "../src/chat/crypto.mjs";
import { zohoConfigured, propertiesByLandlordEmail, fetchAttachment } from "../src/chat/zoho.mjs";
import { limit } from "../src/chat/ratelimit.mjs";

const text = (status, body) => new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!limit(`file:${ip}`, 120, 10 * 60 * 1000)) return text(429, "Too many requests");
  if (!zohoConfigured()) return text(404, "Not available");
  const u = new URL(request.url);
  const s = verify(u.searchParams.get("s"));
  if (!s || s.t !== "landlord" || s.expired) return text(401, "Your sign-in has expired. Go back to the portal and sign in again.");
  const module = u.searchParams.get("m"), record = u.searchParams.get("r"), attachment = u.searchParams.get("a");
  if (!/^(Accounts|Maintenance)$/.test(module || "") || !/^\d+$/.test(record || "") || !/^\d+$/.test(attachment || "")) return text(400, "Bad request");
  const props = await propertiesByLandlordEmail(s.ref);
  if (!props.some((p) => p.id === record)) return text(403, "That document is not on one of your properties.");
  const upstream = await fetchAttachment(module, record, attachment);
  if (!upstream.ok) return text(502, "The document could not be fetched from the file store.");
  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-disposition"]) { const v = upstream.headers.get(h); if (v) headers.set(h, v); }
  headers.set("cache-control", "private, no-store");
  return new Response(upstream.body, { status: 200, headers });
}
