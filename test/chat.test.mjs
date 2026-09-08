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
