// The landlord portal's data: three sheets, each published as CSV (or JSON).
//   LANDLORD_DIRECTORY_URL   landlord_ref, name, email, phone, notes
//   PROPERTY_DIRECTORY_URL   property_ref, landlord_ref, address, tenant_ref, rent_pcm,
//                            rent_history_12m, rent_due_12m, rent_collected_12m, arrears,
//                            landlord_payments_12m, landlord_paid_on_time_12m,
//                            gas_expiry, eicr_expiry, epc_expiry, epc_rating,
//                            licence_expiry, deposit_protected, notes
//   DOCUMENT_DIRECTORY_URL   property_ref, type, title, date, url, amount, notes
// Each also accepts a *_JSON environment variable with the rows inline (tests).
// rent_history_12m: twelve characters, oldest first. O on time, L late,
// P part payment, M missed, - not due. Dates are YYYY-MM-DD.
import { parseCsv, normaliseRef } from "./directory.mjs";

const cache = new Map();
const TTL = 5 * 60 * 1000;
async function rows(kind) {
  const key = kind.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  let out = [];
  if (process.env[`${key}_DIRECTORY_JSON`]) out = JSON.parse(process.env[`${key}_DIRECTORY_JSON`]);
  else if (process.env[`${key}_DIRECTORY_URL`]) {
    const r = await fetch(process.env[`${key}_DIRECTORY_URL`], { headers: { "cache-control": "no-cache" } });
    if (!r.ok) throw new Error(`${kind} fetch failed: ${r.status}`);
    const text = await r.text();
    out = text.trim().startsWith("[") ? JSON.parse(text) : parseCsv(text);
  }
  cache.set(key, { at: Date.now(), rows: out });
  return out;
}

export const landlordsConfigured = () => Boolean(process.env.LANDLORD_DIRECTORY_JSON || process.env.LANDLORD_DIRECTORY_URL);

export async function findLandlord(ref) {
  const want = normaliseRef(ref);
  if (!want) return null;
  const row = (await rows("landlord")).find((r) => normaliseRef(r.landlord_ref) === want);
  if (!row) return null;
  return { reference: String(row.landlord_ref).trim(), name: row.name || "", firstName: (row.name || "").split(/\s+/)[0] || "there", email: (row.email || "").trim(), phone: (row.phone || "").replace(/[\s()-]/g, "") };
}

export async function propertiesFor(landlordRef) {
  const want = normaliseRef(landlordRef);
  const props = (await rows("property")).filter((r) => normaliseRef(r.landlord_ref) === want);
  const docs = await rows("document");
  return props.map((p) => ({ ...p, documents: docs.filter((d) => normaliseRef(d.property_ref) === normaliseRef(p.property_ref)) }));
}

// ---------- scoring ----------
const num = (v) => { const x = Number(String(v ?? "").replace(/[£,\s]/g, "")); return Number.isFinite(x) ? x : null; };
const days = (d) => { if (!d) return null; const t = Date.parse(d); return Number.isFinite(t) ? Math.round((t - Date.now()) / 86400000) : null; };
const yes = (v) => /^(y|yes|true|1)$/i.test(String(v || "").trim());

export function certificate(label, expiry, opts = {}) {
  const left = days(expiry);
  let status, note;
  if (opts.notRequired) { status = "na"; note = "Not required"; }
  else if (left === null) { status = "missing"; note = "No certificate on file"; }
  else if (left < 0) { status = "expired"; note = `Expired ${-left} day${left === -1 ? "" : "s"} ago`; }
  else if (left <= 60) { status = "due"; note = `Expires in ${left} day${left === 1 ? "" : "s"}`; }
  else { status = "ok"; note = `Valid until ${expiry}`; }
  return { label, expiry: expiry || "", status, note, extra: opts.extra || "" };
}

export function scoreProperty(p) {
  const history = String(p.rent_history_12m || "").toUpperCase().replace(/[^OLPM-]/g, "").slice(-12);
  const due = [...history].filter((c) => c !== "-").length;
  const onTime = [...history].filter((c) => c === "O").length;
  const late = [...history].filter((c) => c === "L").length;
  const part = [...history].filter((c) => c === "P").length;
  const missed = [...history].filter((c) => c === "M").length;
  const rentDue = num(p.rent_due_12m), collected = num(p.rent_collected_12m), arrears = num(p.arrears) || 0;
  const payments = num(p.landlord_payments_12m), paidOnTime = num(p.landlord_paid_on_time_12m);

  const parts = [];
  // Rent collected: 35
  const collectedPct = rentDue ? Math.min(1, (collected || 0) / rentDue) : null;
  parts.push({ key: "collected", label: "Rent collected", score: collectedPct === null ? 35 : Math.round(35 * collectedPct), max: 35, detail: rentDue ? `£${(collected || 0).toLocaleString("en-GB")} of £${rentDue.toLocaleString("en-GB")} due in the last 12 months` : "No rent due recorded" });
  // On time: 20
  const onTimeScore = due ? Math.round(20 * ((onTime + late * 0.5 + part * 0.5) / due)) : 20;
  parts.push({ key: "ontime", label: "Paid on time by the tenant", score: onTimeScore, max: 20, detail: due ? `${onTime} of ${due} on time${late ? `, ${late} late` : ""}${part ? `, ${part} part paid` : ""}${missed ? `, ${missed} missed` : ""}` : "No payments due yet" });
  // Paid to landlord on time: 15
  const ltScore = payments ? Math.round(15 * Math.min(1, (paidOnTime || 0) / payments)) : 15;
  parts.push({ key: "paidout", label: "Paid to you on time", score: ltScore, max: 15, detail: payments ? `${paidOnTime || 0} of ${payments} statements paid within five working days` : "No statements yet" });
  // Compliance: 30
  const gas = certificate("Gas safety", p.gas_expiry, { notRequired: /^(none|no gas|n\/a)$/i.test(String(p.gas_expiry || "")) });
  const eicr = certificate("Electrical (EICR)", p.eicr_expiry);
  const epc = certificate("EPC", p.epc_expiry, { extra: p.epc_rating ? `Rating ${String(p.epc_rating).toUpperCase()}` : "" });
  const licence = certificate("Licence", p.licence_expiry, { notRequired: !p.licence_expiry || /^(none|n\/a|not required)$/i.test(String(p.licence_expiry)) });
  const deposit = { label: "Deposit protected", status: p.deposit_protected === undefined || p.deposit_protected === "" ? "missing" : yes(p.deposit_protected) ? "ok" : "expired", note: yes(p.deposit_protected) ? "Protected and prescribed information served" : p.deposit_protected ? "Not protected" : "No record", expiry: "", extra: "" };
  const certScore = (c, w) => (c.status === "ok" || c.status === "na" ? w : c.status === "due" ? w * 0.7 : 0);
  const compliance = Math.round(certScore(gas, 10) + certScore(eicr, 10) + certScore(epc, 5) + certScore(deposit, 5));
  const certs = [gas, eicr, epc, deposit, ...(licence.status === "na" ? [] : [licence])];
  const problems = certs.filter((c) => c.status === "expired" || c.status === "missing").length;
  parts.push({ key: "compliance", label: "Certificates and compliance", score: compliance, max: 30, detail: problems ? `${problems} item${problems === 1 ? "" : "s"} need${problems === 1 ? "s" : ""} attention` : "Everything in date" });

  const score = Math.max(0, Math.min(100, parts.reduce((a, x) => a + x.score, 0)));
  const rag = score >= 85 ? "green" : score >= 65 ? "amber" : "red";
  const alerts = [];
  for (const c of certs) if (c.status === "expired" || c.status === "missing") alerts.push(`${c.label}: ${c.note.toLowerCase()}`);
  for (const c of certs) if (c.status === "due") alerts.push(`${c.label}: ${c.note.toLowerCase()}, renewal being arranged`);
  if (arrears > 0) alerts.push(`Arrears of £${arrears.toLocaleString("en-GB")}`);
  if (missed) alerts.push(`${missed} missed payment${missed === 1 ? "" : "s"} in the last year`);

  return {
    property_ref: p.property_ref, address: p.address || "", tenant_ref: p.tenant_ref || "", rentPcm: num(p.rent_pcm) || 0,
    score, rag, parts, history, arrears, rentDue: rentDue || 0, collected: collected || 0, certificates: certs, alerts, notes: p.notes || "",
    documents: (p.documents || []).map((d) => ({ type: String(d.type || "other").toLowerCase(), title: d.title || d.type || "Document", date: d.date || "", url: d.url || "", amount: num(d.amount) })).sort((a, b) => (b.date || "").localeCompare(a.date || "")),
  };
}

export function scorePortfolio(props) {
  const scored = props.map(scoreProperty);
  const totalRent = scored.reduce((a, p) => a + (p.rentPcm || 1), 0);
  const overall = scored.length ? Math.round(scored.reduce((a, p) => a + p.score * (p.rentPcm || 1), 0) / totalRent) : 0;
  return {
    overall, rag: overall >= 85 ? "green" : overall >= 65 ? "amber" : "red",
    properties: scored,
    totals: {
      properties: scored.length,
      rentPcm: scored.reduce((a, p) => a + p.rentPcm, 0),
      due: scored.reduce((a, p) => a + p.rentDue, 0),
      collected: scored.reduce((a, p) => a + p.collected, 0),
      arrears: scored.reduce((a, p) => a + p.arrears, 0),
      alerts: scored.reduce((a, p) => a + p.alerts.length, 0),
    },
  };
}
