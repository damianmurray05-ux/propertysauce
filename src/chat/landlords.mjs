// The landlord portal's data. Zoho CRM when it is configured (see zoho.mjs):
// the landlord is identified by the email address on their property records,
// certificates and rent come from the property, repairs from Maintenance and
// documents from the property's attachments. Otherwise three published sheets
// (LANDLORD_/PROPERTY_/DOCUMENT_DIRECTORY_URL, templates in docs/) as a fallback.
import { parseCsv, normaliseRef } from "./directory.mjs";
import { zohoConfigured, findLandlordByEmail, propertiesByLandlordEmail, jobsForProperty, listAttachments, tenantById, normaliseEmail } from "./zoho.mjs";

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

export const landlordsConfigured = () => zohoConfigured() || Boolean(process.env.LANDLORD_DIRECTORY_JSON || process.env.LANDLORD_DIRECTORY_URL);

/* Sign-in lookup: an email address (Zoho) or a landlord reference (sheets). */
export async function findLandlord(idOrEmail) {
  if (zohoConfigured()) return findLandlordByEmail(idOrEmail);
  const want = normaliseRef(idOrEmail);
  if (!want) return null;
  const row = (await rows("landlord")).find((r) => normaliseRef(r.landlord_ref) === want || normaliseEmail(r.email) === normaliseEmail(idOrEmail));
  if (!row) return null;
  return { reference: String(row.landlord_ref).trim(), name: row.name || "", firstName: (row.name || "").split(/\s+/)[0] || "there", email: (row.email || "").trim(), phone: (row.phone || "").replace(/[\s()-]/g, "") };
}

/* Everything the dashboard needs, already normalised for scoreProperty. */
export async function propertiesFor(landlordRef) {
  if (zohoConfigured()) {
    const props = await propertiesByLandlordEmail(landlordRef);
    return Promise.all(props.map(async (p) => {
      const [jobs, attachments, tenant] = await Promise.all([
        jobsForProperty(p.id).catch(() => []),
        listAttachments("Accounts", p.id).catch(() => []),
        p.tenantId ? tenantById(p.tenantId).catch(() => null) : null,
      ]);
      return fromZoho(p, tenant, jobs, attachments);
    }));
  }
  const want = normaliseRef(landlordRef);
  const props = (await rows("property")).filter((r) => normaliseRef(r.landlord_ref) === want);
  const docs = await rows("document");
  return props.map((p) => ({ ...p, documents: docs.filter((d) => normaliseRef(d.property_ref) === normaliseRef(p.property_ref)) }));
}

/* Map a Zoho property (plus its tenant, jobs and attachments) onto the sheet
   shape so one scorer serves both sources. Rent history month by month is not
   held in the CRM, so the rent parts are read from the tenancy's status and
   missed-payment date instead. */
function fromZoho(p, tenant, jobs, attachments) {
  const t = tenant ? tenant.raw : {};
  const status = tenant ? tenant.status : "";
  const missedDays = Number(t.Days_Since_Missed_Payment) || 0;
  const missedDate = t.Tenants_Missed_Payment_Date || "";
  // Twelve-month history inferred: every month on time unless a missed payment is recorded.
  let history = "";
  if (tenant && CURRENT.has(status)) {
    history = "OOOOOOOOOOOO";
    if (missedDate) {
      const monthsAgo = Math.floor((Date.now() - Date.parse(missedDate)) / (30.44 * 86400000));
      if (monthsAgo >= 0 && monthsAgo < 12) history = history.slice(0, 11 - monthsAgo) + "M" + history.slice(12 - monthsAgo);
    }
    if (status === "Arrears" && !missedDate) history = history.slice(0, 11) + "L";
  }
  const rent = p.rentPcm || Number(t.Rent) || 0;
  const arrears = status === "Arrears" || status === "Possession Proceedings" || status === "Court" ? (missedDays ? Math.round((missedDays / 30) * rent) : rent) : 0;
  const invoices = jobs.filter((j) => j.invoiced).map((j) => ({ type: "invoice", title: `${j.ticket ? `Ticket ${j.ticket}: ` : ""}${j.title}`, date: j.paid || j.updated, url: "", amount: j.invoiced, job: j }));
  const documents = attachments.map((a) => ({ type: classify(a.name), title: a.name, date: a.date, url: `/api/file?m=${a.module}&r=${a.record}&a=${a.id}`, amount: null })).concat(invoices);
  return {
    property_ref: p.reference || p.id, address: p.address, tenant_ref: tenant ? tenant.reference : "", rent_pcm: rent,
    rent_history_12m: history, rent_due_12m: tenant && CURRENT.has(status) ? rent * 12 : 0, rent_collected_12m: tenant && CURRENT.has(status) ? rent * 12 - arrears : 0,
    arrears, landlord_payments_12m: "", landlord_paid_on_time_12m: "",
    gas_expiry: p.gasApplicable ? p.gas : "none", eicr_expiry: p.eicr, epc_expiry: p.epc, epc_rating: p.epcRating,
    licence_expiry: p.licenceRequired ? p.licence || "missing" : "", deposit_protected: tenant ? (/protected|periodical/i.test(String(t.Deposit_Statue || "")) || t.Deposit_Registered === true ? "yes" : t.Deposit_Statue ? "no" : "") : "",
    tenancy_start: p.tenancyStart || t.Tenancy_Start_Date || "", tenant_name: p.tenantName, occupied: p.occupied, status: p.status, tenancy_status: status,
    jobs, documents, notes: "",
  };
}
const CURRENT = new Set(["Tenanted", "Arrears", "Possession Proceedings", "Court", "Let Agreed", "Maintenance Only"]);
function classify(name) {
  const n = String(name || "").toLowerCase();
  if (/tenancy|ast|agreement|lease/.test(n)) return "tenancy";
  if (/gas|cp12|landlord.?gas/.test(n)) return "gas";
  if (/eicr|electric|niceic/.test(n)) return "eicr";
  if (/epc|energy/.test(n)) return "epc";
  if (/licen[cs]e/.test(n)) return "licence";
  if (/inventory|check.?in|check.?out|inspection/.test(n)) return "inventory";
  if (/invoice|receipt/.test(n)) return "invoice";
  if (/statement|remittance|payment/.test(n)) return "statement";
  return "other";
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
  const collectedPct = rentDue ? Math.min(1, (collected || 0) / rentDue) : null;
  parts.push({ key: "collected", label: "Rent collected", score: collectedPct === null ? 35 : Math.round(35 * collectedPct), max: 35, detail: rentDue ? `£${(collected || 0).toLocaleString("en-GB")} of £${rentDue.toLocaleString("en-GB")} due in the last 12 months` : p.tenancy_status ? `Tenancy status: ${p.tenancy_status}` : "No tenancy recorded" });
  const onTimeScore = due ? Math.round(20 * ((onTime + late * 0.5 + part * 0.5) / due)) : 20;
  parts.push({ key: "ontime", label: "Paid on time by the tenant", score: onTimeScore, max: 20, detail: due ? `${onTime} of ${due} on time${late ? `, ${late} late` : ""}${part ? `, ${part} part paid` : ""}${missed ? `, ${missed} missed` : ""}` : "No payments due yet" });
  const ltScore = payments ? Math.round(15 * Math.min(1, (paidOnTime || 0) / payments)) : 15;
  parts.push({ key: "paidout", label: "Paid to you on time", score: ltScore, max: 15, detail: payments ? `${paidOnTime || 0} of ${payments} statements paid within five working days` : "Paid within five working days of the rent clearing" });
  const gas = certificate("Gas safety", p.gas_expiry, { notRequired: /^(none|no gas|n\/a)$/i.test(String(p.gas_expiry || "")) });
  const eicr = certificate("Electrical (EICR)", p.eicr_expiry);
  const epc = certificate("EPC", p.epc_expiry, { extra: p.epc_rating ? `Rating ${String(p.epc_rating).toUpperCase()}` : "" });
  const licenceRequired = p.licence_expiry && !/^(none|n\/a|not required)$/i.test(String(p.licence_expiry));
  const licence = certificate("Licence", p.licence_expiry === "missing" ? "" : p.licence_expiry, { notRequired: !licenceRequired });
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
  const openJobs = (p.jobs || []).filter((j) => !j.closed);
  if (openJobs.length) alerts.push(`${openJobs.length} repair${openJobs.length === 1 ? "" : "s"} in progress`);

  return {
    property_ref: p.property_ref, address: p.address || "", tenant_ref: p.tenant_ref || "", tenantName: p.tenant_name || "", rentPcm: num(p.rent_pcm) || 0,
    score, rag, parts, history, arrears, rentDue: rentDue || 0, collected: collected || 0, certificates: certs, alerts, notes: p.notes || "",
    jobs: (p.jobs || []).slice(0, 12),
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
