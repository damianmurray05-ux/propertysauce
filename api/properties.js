// GET /api/properties/  Public: every property currently marked "To Let" in
// Zoho, live, with a rent set. No landlord name, no financial fields beyond
// the advertised rent, no tenant details — this is what a stranger browsing
// the website may see. Cached briefly so a burst of visits does not hammer
// Zoho on every request.
import { zohoConfigured, toLetProperties } from "../src/chat/zoho.mjs";

const json = (status, body, cache) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": cache || "no-store" } });

let cache = { at: 0, data: null };
const TTL = 5 * 60 * 1000;

export async function GET() {
  if (!zohoConfigured()) return json(200, { properties: [] });
  if (cache.data && Date.now() - cache.at < TTL) return json(200, { properties: cache.data }, "public, max-age=120");
  try {
    const properties = await toLetProperties();
    cache = { at: Date.now(), data: properties };
    return json(200, { properties }, "public, max-age=120");
  } catch (e) {
    console.error("properties list failed", e.message);
    // A stale list is better than none if Zoho is briefly unavailable.
    if (cache.data) return json(200, { properties: cache.data }, "public, max-age=60");
    return json(200, { properties: [] });
  }
}
