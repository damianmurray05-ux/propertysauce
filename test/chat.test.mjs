import { test } from "node:test";
import assert from "node:assert/strict";

process.env.CHAT_SECRET = "test-secret";
process.env.TENANT_DIRECTORY_JSON = JSON.stringify([
  { reference: "PS-1001", name: "Ada Example", email: "ada@example.com", phone: "+44 7700 900000", address: "Flat 1, 1 Example Street" },
]);
process.env.CHAT_DEV_ECHO_CODE = "1";

const { sign, verify, hashCode, otp, reference } = await import("../src/chat/crypto.mjs");
const { findTenant, maskEmail, maskPhone, normaliseRef } = await import("../src/chat/directory.mjs");
const { systemPrompt } = await import("../src/chat/prompt.mjs");
const verifyApi = await import("../api/verify.js");

test("tokens round-trip and reject tampering", () => {
  const t = sign({ a: 1, exp: Date.now() + 1000 });
  assert.equal(verify(t).a, 1);
  assert.equal(verify(t.slice(0, -2) + "zz"), null);
  assert.equal(verify(sign({ exp: Date.now() - 1 })).expired, true);
});

test("codes are six digits and hash deterministically", () => {
  assert.match(otp(), /^\d{6}$/);
  assert.equal(hashCode("PS-1", "123456"), hashCode("PS-1", "123456"));
  assert.notEqual(hashCode("PS-1", "123456"), hashCode("PS-1", "654321"));
  assert.match(reference(), /^PS-\d{6}-\d{3}$/);
});

test("directory lookup is forgiving about formatting", async () => {
  assert.equal(normaliseRef(" ps 1001 "), "PS1001");
  const t = await findTenant("ps-1001");
  assert.equal(t.firstName, "Ada");
  assert.equal(t.phone, "+447700900000");
  assert.equal(await findTenant("PS-9999"), null);
  assert.equal(maskEmail("ada@example.com"), "ad*@example.com");
  assert.equal(maskPhone("+447700900000"), "**********000");
});

test("verification flow: lookup, start, check", async () => {
  const post = (body) => verifyApi.POST(new Request("http://x/api/verify/", { method: "POST", body: JSON.stringify(body) }));
  let r = await post({ action: "lookup", reference: "PS-1001" });
  assert.equal(r.status, 200);
  const ch = await r.json();
  assert.equal(ch.email, "ad*@example.com");
  r = await post({ action: "start", reference: "PS-1001", channel: "email" });
  assert.equal(r.status, 200);
  const { token, devCode } = await r.json();
  assert.match(devCode, /^\d{6}$/);
  r = await post({ action: "check", token, code: "000000" });
  assert.equal(r.status, devCode === "000000" ? 200 : 400);
  r = await post({ action: "check", token, code: devCode });
  assert.equal(r.status, 200);
  const { session, tenant } = await r.json();
  assert.equal(tenant.firstName, "Ada");
  const s = verify(session);
  assert.equal(s.t, "session");
  assert.equal(s.address, "Flat 1, 1 Example Street");
  r = await post({ action: "lookup", reference: "PS-0000" });
  assert.equal(r.status, 404);
});

test("system prompt carries verified tenant details and the knowledge", () => {
  const p = systemPrompt({ mode: "repair", tenant: { name: "Ada Example", address: "Flat 1", reference: "PS-1001" } });
  assert.match(p, /verified tenant/);
  assert.match(p, /Flat 1/);
  assert.match(p, /0800 111 999/);
  assert.doesNotMatch(p, /[–—]/);
});

test("scorecard scoring is fair and bounded", async () => {
  const { scoreTenant } = await import("../src/chat/score.mjs");
  const perfect = scoreTenant({ rent_history_12m: "OOOOOOOOOOOO", arrears: "0", noise_reports_12m: "0", inspections_passed: "2", inspections_total: "2" });
  assert.equal(perfect.score, 100); assert.equal(perfect.tier, "Platinum"); assert.equal(perfect.streak, 12);
  const empty = scoreTenant({});
  assert.equal(empty.score, 100);
  const rough = scoreTenant({ rent_history_12m: "OOMLOOOOOOLO", arrears: "£1,200", noise_reports_12m: "2", inspections_passed: "0", inspections_total: "1" });
  assert.ok(rough.score < 70 && rough.score > 0, String(rough.score));
  assert.equal(rough.streak, 1);
  assert.ok(rough.tips.length >= 3);
});

test("landlord portfolio scoring, certificates and sign-in", async () => {
  process.env.LANDLORD_DIRECTORY_JSON = JSON.stringify([{ landlord_ref: "PSL-1001", name: "Bea Owner", email: "bea@example.com", phone: "" }]);
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const later = new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10);
  process.env.PROPERTY_DIRECTORY_JSON = JSON.stringify([
    { property_ref: "PSP-1", landlord_ref: "PSL-1001", address: "Flat 1, Example St", rent_pcm: "1000", rent_history_12m: "OOOOOOOOOOOO", rent_due_12m: "12000", rent_collected_12m: "12000", arrears: "0", landlord_payments_12m: "12", landlord_paid_on_time_12m: "12", gas_expiry: later, eicr_expiry: later, epc_expiry: later, epc_rating: "C", deposit_protected: "yes" },
    { property_ref: "PSP-2", landlord_ref: "PSL-1001", address: "Flat 2, Example St", rent_pcm: "1000", rent_history_12m: "OOMMLLPOOOOO", rent_due_12m: "12000", rent_collected_12m: "9500", arrears: "2500", landlord_payments_12m: "10", landlord_paid_on_time_12m: "9", gas_expiry: "2024-01-01", eicr_expiry: soon, epc_expiry: "", deposit_protected: "no" },
    { property_ref: "PSP-9", landlord_ref: "PSL-9999", address: "Someone else's", rent_pcm: "1", rent_history_12m: "", rent_due_12m: "", rent_collected_12m: "" },
  ]);
  process.env.DOCUMENT_DIRECTORY_JSON = JSON.stringify([{ property_ref: "PSP-1", type: "gas", title: "Gas cert", date: "2026-01-01", url: "https://example.com/a" }]);
  const { scorePortfolio, propertiesFor } = await import("../src/chat/landlords.mjs");
  const props = await propertiesFor("psl 1001");
  assert.equal(props.length, 2);
  const pf = scorePortfolio(props);
  assert.equal(pf.properties[0].score, 100); assert.equal(pf.properties[0].rag, "green"); assert.equal(pf.properties[0].documents.length, 1);
  const bad = pf.properties[1];
  assert.ok(bad.score < 65, String(bad.score)); assert.equal(bad.rag, "red");
  assert.ok(bad.certificates.some((c) => c.label === "Gas safety" && c.status === "expired"));
  assert.ok(bad.certificates.some((c) => c.label === "Electrical (EICR)" && c.status === "due"));
  assert.ok(bad.alerts.length >= 3);
  const api = await import("../api/landlord.js");
  const post = (b) => api.POST(new Request("http://x/api/landlord/", { method: "POST", body: JSON.stringify(b) }));
  let r = await post({ action: "start", reference: "PSL-1001", channel: "email" });
  const { token, devCode } = await r.json();
  r = await post({ action: "check", token, code: devCode }); assert.equal(r.status, 200);
  const { session } = await r.json();
  r = await post({ action: "portfolio", session }); assert.equal(r.status, 200);
  const d = await r.json(); assert.equal(d.firstName, "Bea"); assert.equal(d.totals.properties, 2);
});

test("Zoho mapping: property, job and tenant scorecard row", async () => {
  const { mapProperty, mapJob, mapRecord } = await import("../src/chat/zoho.mjs");
  const { tenantRowFromZoho, scoreTenant } = await import("../src/chat/score.mjs");
  const p = mapProperty({ id: "1", Account_Name: "Flat 3, Catterick House, S65 1LD", Last_Name: "Beaucatt Homes LTD", Vendor_Email: "Info@PropertySauce.co", Vendor_Phone: "0208 988 8434", Status: "Rented", Occupied: "Occupied", Monthly_Rent: 620, Gas_Safety_Applicable: "No Gas Supply - N/A", NICEIC_Certificate: "2030-03-26", EPC_Expiry: "2028-07-16", EPC_Rating: "D", Landlords_Property_License: "2025-04-30", Landlord_License_Exempt: "Requires Licensing", Existing_Tenant: { id: "9", name: "Flat 3 - Someone" } });
  assert.equal(p.landlord.email, "info@propertysauce.co");
  assert.equal(p.landlord.phone, "+442089888434");
  assert.equal(p.gasApplicable, false);
  assert.equal(p.licenceRequired, true);
  assert.equal(p.tenantId, "9");
  const j = mapJob({ id: "5", Name: "Boiler", Maintenance_Ticket_Number: "MT-12", Job_Status: "Contractor Instructed", Created_Time: "2026-08-01T10:00:00+01:00", Landlord: { id: "1" }, Tenant: { id: "9" }, Invoiced_Amount: 120 });
  assert.equal(j.ticket, "MT-12"); assert.equal(j.closed, false); assert.equal(j.created, "2026-08-01");
  const t = mapRecord({ id: "9", Last_Name: "Flat 3 - Ada Example", Status: "Arrears", Rent_Payment_Reference: "PS1001", Tenant_1_Phone: "07700 900000", Email: "ada@example.com", Account_Name: { id: "1", name: "Flat 3, Catterick House" }, Rent: 620, Tenants_Missed_Payment_Date: new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10), Days_Since_Missed_Payment: 45 });
  assert.equal(t.current, true); assert.equal(t.propertyId, "1");
  const row = tenantRowFromZoho(t, [j]);
  assert.match(row.rent_history_12m, /M/);
  assert.ok(row.arrears > 0);
  const card = scoreTenant(row);
  assert.ok(card.score < 100 && card.score > 0, String(card.score));
});

test("a Books customer is only matched by property address, never by name alone", async () => {
  const { matchesCustomer } = await import("../src/chat/tenantfile.mjs");
  const t = { name: "Damian Murray", address: "Flat 3, Catterick House, Cottenham Road, S65 1LD" };
  assert.equal(matchesCustomer(t, "4 High Street - Damian Murray SA"), false);
  assert.equal(matchesCustomer(t, "Damian Murray"), false);
  assert.equal(matchesCustomer(t, "Flat 03 Catterick House - Damian Murray"), true);
  assert.equal(matchesCustomer({ name: "A B", address: "4 High Street, Hawksmead, CB1 1AA" }, "4 High Street - Damian Murray SA"), true);
  assert.equal(matchesCustomer({ name: "K Murray", address: "Flat 9, Lancaster House, Lord Street, FY1 1AA" }, "Flat 09 Lancaster House - Keith Maxwell Murray"), true);
  assert.equal(matchesCustomer({ name: "K Murray", address: "Flat 9, Lancaster House, Lord Street, FY1 1AA" }, "Flat 05 Lancaster House - James Patrick Murray"), false);
});

test("Inkbox webhook signatures verify, reject tampering, and reject replay", async () => {
  const { verifyWebhook, normaliseSigningKey } = await import("../src/chat/inkbox.mjs");
  const { createHmac } = await import("node:crypto");
  const key = "whsec_testkey123";
  const requestId = "req_abc";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify({ event_type: "text.received", data: { text_message: { text: "hi" } } });
  const mac = createHmac("sha256", normaliseSigningKey(key)).update(`${requestId}.${timestamp}.${rawBody}`).digest("hex");
  const signature = `sha256=${mac}`;

  assert.equal(verifyWebhook({ signingKey: key, requestId, timestamp, signature, rawBody }), true);
  // The whsec_ prefix is a label, not part of the key: the unprefixed form verifies identically.
  assert.equal(verifyWebhook({ signingKey: "testkey123", requestId, timestamp, signature, rawBody }), true);
  // Tampering with the body invalidates the signature.
  assert.equal(verifyWebhook({ signingKey: key, requestId, timestamp, signature, rawBody: rawBody + "x" }), false);
  // A wrong key invalidates the signature.
  assert.equal(verifyWebhook({ signingKey: "wrong", requestId, timestamp, signature, rawBody }), false);
  // A stale timestamp (replay) is rejected even with a correct signature for that timestamp.
  const oldTimestamp = String(Math.floor(Date.now() / 1000) - 3600);
  const oldMac = createHmac("sha256", normaliseSigningKey(key)).update(`${requestId}.${oldTimestamp}.${rawBody}`).digest("hex");
  assert.equal(verifyWebhook({ signingKey: key, requestId, timestamp: oldTimestamp, signature: `sha256=${oldMac}`, rawBody }), false);
  // No signing key configured: never trust an unsigned delivery.
  assert.equal(verifyWebhook({ signingKey: "", requestId, timestamp, signature, rawBody }), false);
  // Malformed signature header does not throw.
  assert.equal(verifyWebhook({ signingKey: key, requestId, timestamp, signature: "not-a-signature", rawBody }), false);
});

test("Inkbox webhook endpoint accepts a correctly signed delivery and rejects a bad one", async () => {
  process.env.INKBOX_WEBHOOK_SECRET = "test-inkbox-secret";
  const { createHmac } = await import("node:crypto");
  const inkboxWebhook = await import("../api/inkbox-webhook.js");

  const requestId = "req_1";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify({ event_type: "text.received", data: { text_message: { text: "hi", remote_phone_number: "+447700900000", local_phone_number: "+447457410735" } } });
  const mac = createHmac("sha256", "test-inkbox-secret").update(`${requestId}.${timestamp}.${rawBody}`).digest("hex");

  const good = new Request("https://propertysauce.co/api/inkbox-webhook/", {
    method: "POST",
    headers: { "x-inkbox-request-id": requestId, "x-inkbox-timestamp": timestamp, "x-inkbox-signature": `sha256=${mac}` },
    body: rawBody,
  });
  const r1 = await inkboxWebhook.POST(good);
  assert.equal(r1.status, 200);

  const bad = new Request("https://propertysauce.co/api/inkbox-webhook/", {
    method: "POST",
    headers: { "x-inkbox-request-id": requestId, "x-inkbox-timestamp": timestamp, "x-inkbox-signature": "sha256=wrong" },
    body: rawBody,
  });
  const r2 = await inkboxWebhook.POST(bad);
  assert.equal(r2.status, 401);
});

test("Inkbox webhook forwards a finished call to the team inbox", async () => {
  process.env.INKBOX_WEBHOOK_SECRET = "test-inkbox-secret";
  process.env.RESEND_API_KEY = "test-resend-key";
  const { createHmac } = await import("node:crypto");
  const inkboxWebhook = await import("../api/inkbox-webhook.js");

  const requestId = "req_call_1";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify({
    event_type: "call.ended",
    data: {
      call: { remote_phone_number: "+447700900123", duration_seconds: 42 },
      post_call_action_items: [{ action: "Take a message", details: "Landlord asking about selling a block" }],
      transcript_url: "https://inkbox.ai/transcripts/abc",
    },
  });
  const mac = createHmac("sha256", "test-inkbox-secret").update(`${requestId}.${timestamp}.${rawBody}`).digest("hex");

  const req = new Request("https://propertysauce.co/api/inkbox-webhook/", {
    method: "POST",
    headers: { "x-inkbox-request-id": requestId, "x-inkbox-timestamp": timestamp, "x-inkbox-signature": `sha256=${mac}` },
    body: rawBody,
  });
  const originalFetch = global.fetch;
  let capturedBody = null;
  global.fetch = async (url, init) => { if (String(url).includes("resend")) { capturedBody = JSON.parse(init.body); return { ok: true, json: async () => ({}) }; } return originalFetch(url, init); };
  try {
    const res = await inkboxWebhook.POST(req);
    assert.equal(res.status, 200);
    assert.ok(capturedBody, "expected an email to be sent for a call with action items");
    assert.match(capturedBody.subject, /\+447700900123/);
    assert.match(capturedBody.text, /Take a message/);
    assert.match(capturedBody.text, /Landlord asking about selling a block/);
  } finally {
    global.fetch = originalFetch;
    delete process.env.RESEND_API_KEY;
  }
});

test("a mobile-number sign-in only searches Tenant_1_Phone, never Mobile or plain Phone", async () => {
  process.env.ZOHO_CLIENT_ID = "test-id";
  process.env.ZOHO_CLIENT_SECRET = "test-secret";
  process.env.ZOHO_REFRESH_TOKEN = "test-refresh";
  const { findTenantInZoho } = await import("../src/chat/zoho.mjs");
  const originalFetch = global.fetch;
  const searchUrls = [];
  global.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes("/oauth/v2/token")) return { ok: true, status: 200, json: async () => ({ access_token: "tok", expires_in: 3600 }) };
    if (u.includes("/Contacts/search")) { searchUrls.push(u); return { ok: true, status: 200, text: async () => JSON.stringify({ data: [] }) }; }
    return originalFetch(url, init);
  };
  try {
    await findTenantInZoho("07956595959");
    assert.ok(searchUrls.length > 0, "expected at least one search call");
    for (const u of searchUrls) {
      const criteria = decodeURIComponent(u.split("criteria=")[1].split("&")[0]);
      assert.ok(!/(?<!Tenant_1_)Phone:equals/.test(criteria) || /Tenant_1_Phone:equals/.test(criteria), criteria);
      assert.ok(!criteria.includes("Mobile:"), `criteria must not search the unsearchable Mobile field: ${criteria}`);
      assert.ok(!criteria.includes("(Phone:"), `criteria must not search the unsearchable plain Phone field: ${criteria}`);
    }
  } finally {
    global.fetch = originalFetch;
    delete process.env.ZOHO_CLIENT_ID; delete process.env.ZOHO_CLIENT_SECRET; delete process.env.ZOHO_REFRESH_TOKEN;
  }
});
