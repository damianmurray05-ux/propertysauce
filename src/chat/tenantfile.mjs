// Everything a verified tenant may see about their own tenancy, read live from
// Zoho CRM and Zoho Books at the moment they ask. Used by the assistant's
// tenant tools and by the scorecard's documents list. Nothing here writes.
import { tenantById, propertyById, jobsForTenant, listAttachments, accessToken } from "./zoho.mjs";
import { docTitle, classify, driveDocuments } from "./landlords.mjs";

const BOOKS = process.env.ZOHO_BOOKS_ORG || "678590019";
const BOOKS_API = `https://www.zohoapis.${(process.env.ZOHO_DC || "com").toLowerCase()}/books/v3`;

async function books(path) {
  const t = await accessToken();
  const r = await fetch(`${BOOKS_API}${path}${path.includes("?") ? "&" : "?"}organization_id=${BOOKS}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
  if (!r.ok) throw new Error(`books ${r.status}`);
  return r.json();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const niceDate = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const gbp = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/* The CRM side: tenant, property, repairs and every document on both records. */
export async function tenantFile(session) {
  const [tenant, property, jobs, tenantAtt, propertyAtt] = await Promise.all([
    tenantById(session.id),
    session.pid ? propertyById(session.pid).catch(() => null) : null,
    jobsForTenant(session.id).catch(() => []),
    listAttachments("Contacts", session.id).catch(() => []),
    session.pid ? listAttachments("Accounts", session.pid).catch(() => []) : [],
  ]);
  const docs = [...tenantAtt, ...propertyAtt].map((a) => { const type = classify(a.name); return { type, title: docTitle(type, a.name, a.date), file: a.name, date: a.date, url: `/api/file/?m=${a.module}&r=${a.record}&a=${a.id}`, source: "zoho" }; })
    .concat(session.pid ? driveDocuments(session.pid) : [])
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return { tenant, property, jobs: jobs.filter((j) => !j.certificate), documents: docs };
}

/* Certificate position for the tenant's property, in plain words. */
export function certificateLines(property) {
  if (!property) return [];
  const item = (label, expiry, applicable = true) => {
    if (!applicable) return `${label}: not required for this property`;
    if (!expiry) return `${label}: no date on file; the team will confirm`;
    const days = Math.round((Date.parse(expiry) - Date.now()) / 86400000);
    if (days < 0) return `${label}: expired ${niceDate(expiry)}; renewal being arranged`;
    if (days <= 42) return `${label}: valid until ${niceDate(expiry)}, renewal being booked`;
    return `${label}: valid until ${niceDate(expiry)}`;
  };
  return [
    item("Gas safety certificate", property.gas, property.gasApplicable),
    item("Electrical installation report (EICR)", property.eicr),
    item("Energy performance certificate (EPC)", property.epc) + (property.epcRating ? `, rating ${String(property.epcRating).toUpperCase()}` : ""),
    property.licenceRequired ? item("Property licence", property.licence) : "Property licence: not required at this address",
  ];
}

/* The Books side: the customer for this tenancy, open invoices, recent payments and the balance. */
export async function rentAccount(tenant) {
  if (!tenant) return null;
  const surname = (tenant.name || "").trim().split(/\s+/).pop() || "";
  const firstLine = (tenant.address || "").split(",")[0].trim();
  if (!surname) return null;
  const found = await books(`/contacts?contact_name_contains=${encodeURIComponent(surname)}&contact_type=customer&per_page=50`).catch(() => ({}));
  const candidates = (found.contacts || []).filter((c) => c.contact_name.toLowerCase().includes(firstLine.toLowerCase().slice(0, 12)) || c.contact_name.toLowerCase().includes((tenant.name || "").toLowerCase()));
  const customer = candidates[0];
  if (!customer) return { found: false };
  const [inv, pay] = await Promise.all([
    books(`/invoices?customer_id=${customer.contact_id}&sort_column=date&sort_order=D&per_page=12`).catch(() => ({})),
    books(`/customerpayments?customer_id=${customer.contact_id}&sort_column=date&sort_order=D&per_page=6`).catch(() => ({})),
  ]);
  const invoices = (inv.invoices || []).map((i) => ({ number: i.invoice_number, date: i.date, due: i.due_date, total: i.total, balance: i.balance, status: i.status }));
  const payments = (pay.customerpayments || []).map((p) => ({ date: p.date, amount: p.amount, mode: p.payment_mode, invoices: p.invoice_numbers }));
  return { found: true, customer: customer.contact_name, outstanding: Number(customer.outstanding_receivable_amount) || 0, unbilled: Number(customer.unused_credits_receivable_amount) || 0, invoices, payments };
}

/* Text for the assistant. Never includes another person's details. */
export function describeTenancy(file, rent) {
  const t = file.tenant, p = file.property, r = t.raw || {};
  const lines = [
    `Tenant: ${t.name}. Property: ${t.address}.`,
    r.Tenancy_Start_Date || r.Original_Tenancy_Start_Date ? `Tenancy started ${niceDate(r.Original_Tenancy_Start_Date || r.Tenancy_Start_Date)}.` : "",
    r.Rent ? `Rent ${gbp(r.Rent)} a month${r.Rent_Due_Date ? `, due on day ${String(r.Rent_Due_Date).replace(/^\d{4}-\d{2}-/, "").replace(/^0/, "")} of the month` : ""}.` : "",
    t.reference ? `Payment reference to use: ${t.reference}.` : "",
    r.Deposit_Statue || r.Deposit_Scheme ? `Deposit: ${r.Deposit_Statue || "on file"}${r.Deposit_Scheme ? ` with ${r.Deposit_Scheme}` : ""}.` : "Deposit: the certificate on file says which scheme holds it.",
    `Tenancy status on file: ${t.status || "current"}.`,
    p && p.inspection && p.inspection.next ? `Next inspection due ${niceDate(p.inspection.next)}${p.inspection.inspector ? ` by ${p.inspection.inspector}` : ""}.` : "Next inspection: not yet diarised.",
    ...certificateLines(p),
  ].filter(Boolean);
  if (rent && rent.found) {
    lines.push(`Rent account (Zoho Books, customer "${rent.customer}"): balance outstanding ${gbp(rent.outstanding)}${rent.unbilled ? `, credit held ${gbp(rent.unbilled)}` : ""}.`);
    const open = rent.invoices.filter((i) => i.balance > 0);
    if (open.length) lines.push(`Unpaid invoices: ${open.map((i) => `${i.number} for ${gbp(i.balance)} due ${niceDate(i.due)}`).join("; ")}.`);
    if (rent.payments.length) lines.push(`Last payments received: ${rent.payments.slice(0, 5).map((x) => `${gbp(x.amount)} on ${niceDate(x.date)}`).join("; ")}.`);
  } else if (rent && !rent.found) lines.push("Rent account: no ledger found under this name in the accounts system; a person will check.");
  return lines.join("\n");
}

export function describeRepairs(file) {
  if (!file.jobs.length) return "No repairs on file for this tenancy.";
  const STAGES = { "Reported": "reported, waiting for the team to review", "Inspection Confirmed": "inspection booked", "Awaiting Quotation": "waiting for a contractor's quote", "Quotation Received": "quote received, being checked", "Quotation Sent to Landlord": "quote with the landlord for approval", "Quotation Approved by Landlord": "approved, contractor being booked", "Contractor Instructed": "contractor booked", "Contractor Confirmed Job Complete": "work reported done, waiting for your sign-off", "Requested Tenant to Sign Off": "waiting for you to confirm it is fixed", "Tenant Signed Off": "signed off by you", "Invoice Received": "completed and closed" };
  return file.jobs.slice(0, 10).map((j) => `Ticket ${j.ticket || j.id}: ${j.title}. Reported ${niceDate(j.created)}. Stage: ${STAGES[j.status] || j.status || (j.closed ? "closed" : "open")}${j.agreed ? `. Appointment ${j.agreed}` : ""}${j.closed ? " (closed)" : ""}.`).join("\n");
}

export function describeDocuments(file, session) {
  if (!file.documents.length) return "No documents are filed for this tenancy yet; the team can send any you need.";
  return file.documents.slice(0, 25).map((d) => `${d.title}${d.date ? ` (${niceDate(d.date)})` : ""}: ${d.url.startsWith("/api/file") ? `https://propertysauce.co${d.url}&s=${encodeURIComponent(session)}` : d.url}`).join("\n");
}
