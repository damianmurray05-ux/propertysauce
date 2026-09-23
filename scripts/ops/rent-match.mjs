// Ops 04: rent matching, dry run. Reads every uncategorised money-in line on the
// Property Sauce bank feeds in Zoho Books, builds a table of tenancies from Books
// customers and Zoho CRM Tenant records, and sorts each line into one of three
// buckets for a person to review:
//
//   certain.csv    the line names exactly one tenancy beyond doubt (section 4 rule)
//   uncertain.csv  everything else that could be tenant money, with the best candidates
//   not-rent.csv   lines that are plainly not rent (own transfers, card refunds, fees, loans)
//
//   node --env-file=.env scripts/ops/rent-match.mjs              dry run, writes the three CSVs
//   node --env-file=.env scripts/ops/rent-match.mjs --apply      NOT ENABLED: prints a refusal and stops
//
// Options: --org <Books organisation id> (default 678590019, Property Sauce)
//          --out <folder> (default docs/ops/rent-matching)
//          --drive <folder> to change the Drive copy, or --drive none to skip it
//
// Damian's rule (04-rent-collection-and-arrears.md section 4): a bank line is
// allocated only when the match is certain. CERTAIN means one of:
//   (a) the description carries an open invoice number that belongs to exactly one customer;
//   (b) the description carries the tenancy's payment reference as a whole word, and only
//       one tenancy with open invoices uses that reference;
//   (c) the payer name matches one tenant (surname plus first name or initial) AND the
//       amount equals that tenancy's rent or an open invoice, and no other tenancy matches.
// Anything less goes to a person. Nothing here writes to Zoho Books or Zoho CRM.
//
// Money in: on a Zoho Books bank account a deposit is a DEBIT (asset account convention);
// customer payments on these feeds carry debit_or_credit = "debit", checked 23 Sep 2026.
// Descriptions are copied as the bank sends them, except that any run of eight or more
// digits is masked to its last four (README rule 7: no full bank account numbers anywhere).

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { accessToken, mapRecord, normaliseRef } from "../../src/chat/zoho.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));
const DC = (process.env.ZOHO_DC || "com").toLowerCase();
const BOOKS = `https://www.zohoapis.${DC}/books/v3`;
const CRM = `https://www.zohoapis.${DC}/crm/v8`;
const ORG = args.org || process.env.BOOKS_ORG || "678590019";
const OUT = resolve(ROOT, args.out || "docs/ops/rent-matching");
const DRIVE = args.drive === "none" ? "" : (args.drive || join(process.env.HOME || "", "Library/CloudStorage/GoogleDrive-damian.murray05@gmail.com/My Drive/Claude Master Folder/01 Property Sauce/Accounts/Rent matching"));
const today = new Date().toISOString().slice(0, 10);

/* ---------- Zoho helpers (read only) ---------- */
async function books(path, params = {}) {
  const t = await accessToken();
  const q = new URLSearchParams({ organization_id: ORG, ...params });
  const r = await fetch(`${BOOKS}${path}?${q}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
  const d = await r.json();
  if (!r.ok || (d.code && d.code !== 0)) throw new Error(`books ${path}: ${d.message || r.status}`);
  return d;
}
async function pages(path, key, params) {
  const out = [];
  for (let page = 1; page <= 25; page++) {
    const d = await books(path, { ...params, per_page: 200, page });
    out.push(...(d[key] || []));
    if (!d.page_context || !d.page_context.has_more_page) break;
  }
  return out;
}
async function crmTenants() {
  const fields = "id,Last_Name,Full_Name,Email,Tenant_1_Name,Tenant_2_Name,Account_Name,Status,Rent_Payment_Reference,Property_Sauce_Reference,Rent,Rent_Due_Date";
  const out = [];
  let token = "";
  for (let i = 0; i < 25; i++) {
    const t = await accessToken();
    const r = await fetch(`${CRM}/Contacts?fields=${fields}&per_page=200${token ? `&page_token=${token}` : ""}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
    if (r.status === 204) break;
    const d = await r.json();
    if (!r.ok) throw new Error(`crm Contacts ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
    out.push(...(d.data || []));
    if (!d.info || !d.info.more_records) break;
    token = d.info.next_page_token;
  }
  return out;
}

/* ---------- text helpers ---------- */
const gbp = (n) => "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const unescapeHtml = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const maskDigits = (s) => String(s || "").replace(/\d{8,}/g, (m) => "x".repeat(m.length - 4) + m.slice(-4));
const tokens = (s) => unescapeHtml(s).toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
const TITLES = new Set(["MR", "MRS", "MISS", "MS", "DR", "MX"]);
const nameTokens = (s) => tokens(s).filter((t) => !TITLES.has(t));
const STOP = new Set(["FLAT", "HOUSE", "ROAD", "STREET", "DRIVE", "COURT", "LODGE", "COTTAGE", "CRAMLINGTON", "BROWNRIGG", "BROWRIGG", "COTTENHAM", "LONDON", "APARTMENT", "GROUND", "FIRST", "FLOOR", "ANNEXE", "ANNEX", "BLACKPOOL", "ROTHERHAM", "GARDENS", "CLOSE", "LANE", "PLACE", "PARK"]);
const looksLikeRef = (s) => /^[A-Z0-9]{6,}$/.test(s) && /\d/.test(s);
const sameAmount = (a, b) => Math.abs(Number(a) - Number(b)) < 0.005;
function addressKey(addr) {
  const nums = new Set(), words = new Set();
  for (const t of tokens(addr)) {
    const m = t.match(/^(\d+)([A-Z])?$/);
    if (m) nums.add(String(Number(m[1]))); // "Flat 07" and "7 Lancaster House" are the same flat
    else if (/^\d/.test(t)) nums.add(String(Number(t.replace(/\D.*$/, ""))));
    else if (t.length >= 4 && !STOP.has(t)) words.add(t);
  }
  return { nums, words };
}
const overlap = (a, b) => [...a].filter((x) => b.has(x)).length;
function addressesMatch(a, b) {
  const A = addressKey(a), B = addressKey(b);
  if (overlap(A.nums, B.nums)) return true;
  if (!A.nums.size || !B.nums.size) return overlap(A.words, B.words) >= 1;
  return false;
}
/* A tenant name is two to six words with no digits and no address words. */
const validName = (n) => { const t = nameTokens(n); return t.length >= 2 && t.length <= 6 && !t.some((x) => /\d/.test(x) || STOP.has(x)); };
const INITIAL_NOISE = new Set(["RP", "FP", "CD", "DD", "SO", "VM", "NO", "OF", "AC", "LT", "MS", "MR", "DR", "GB", "DE", "UK", "BR", "RD", "ST", "RE"]);
function namesMatch(a, b) {
  const A = new Set(nameTokens(a)), B = new Set(nameTokens(b));
  if (A.size < 2 || B.size < 2) return false;
  const shared = overlap(A, B);
  return shared >= 2 && (shared === A.size || shared === B.size);
}
/* Does a bank description name this person? Surname (whole or bank-truncated to 5+ letters)
   plus the first name or its initial. Initials arrive as short tokens such as "TD" or "H". */
function personInText(T, fullName) {
  const parts = nameTokens(fullName).filter((t) => t.length >= 2 || T.includes(t));
  if (parts.length < 2) return false;
  const surname = parts[parts.length - 1], given = parts[0];
  const surnameHit = T.includes(surname) || T.some((t) => t.length >= 5 && surname.length > t.length && surname.startsWith(t));
  if (!surnameHit) return false;
  if (T.includes(given)) return true;
  return T.some((t) => t.length <= 2 && /^[A-Z]+$/.test(t) && !INITIAL_NOISE.has(t) && t[0] === given[0]);
}

/* ---------- 1. bank lines ---------- */
const accounts = (await books("/bankaccounts")).bankaccounts.filter((a) => a.is_active && a.account_type === "bank");
const lines = [];
for (const a of accounts) {
  const tx = await pages("/banktransactions", "banktransactions", { account_id: a.account_id, status: "uncategorized" });
  const moneyIn = tx.filter((t) => t.debit_or_credit === "debit");
  console.log(`${a.account_name.padEnd(24)} uncategorised ${String(tx.length).padStart(4)}   money in ${String(moneyIn.length).padStart(4)}   money out ${String(tx.length - moneyIn.length).padStart(4)}`);
  lines.push(...moneyIn.map((t) => ({ id: t.transaction_id, date: t.date, account: a.account_name, amount: Number(t.amount), description: unescapeHtml(t.description || t.payee || "").replace(/\s+/g, " ").trim(), payee: t.payee || "" })));
}
lines.sort((a, b) => a.date.localeCompare(b.date) || a.account.localeCompare(b.account));

/* ---------- 2. tenancy table ---------- */
const customers = await pages("/contacts", "contacts", { contact_type: "customer" });
const unpaid = await pages("/invoices", "invoices", { status: "unpaid" });
const invoicesByCustomer = {};
for (const i of unpaid) (invoicesByCustomer[i.customer_id] ||= []).push({ id: i.invoice_id, number: i.invoice_number, n: Number(String(i.invoice_number).replace(/\D/g, "")), reference: i.reference_number || "", total: Number(i.total), balance: Number(i.balance), date: i.date, dueDate: i.due_date });

const tenancies = customers.map((c) => {
  const name = c.contact_name.trim();
  const former = /^X\s*-/i.test(name) || c.status !== "active";
  // "X - " marks a former tenancy, "Depo - " a deposit ledger for the same tenancy; "(SC & GR)" customers are leaseholders, not tenants.
  const body = name.replace(/^(X|DEPO)\s*-\s*/i, "");
  const parts = body.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  const isTenancy = parts.length >= 2 && !/SC\s*&\s*GR/i.test(name);
  const names = (isTenancy ? parts.slice(1) : []).filter(validName);
  if (!isTenancy && c.first_name && c.last_name && validName(`${c.first_name} ${c.last_name}`)) names.push(`${c.first_name} ${c.last_name}`);
  const invoices = (invoicesByCustomer[c.contact_id] || []).sort((a, b) => a.date.localeCompare(b.date));
  const refs = new Set(invoices.map((i) => normaliseRef(i.reference)).filter(looksLikeRef));
  return { customerId: c.contact_id, customerName: name, address: isTenancy ? parts[0] : "", names, refs, rent: null, invoices, former, isTenancy, crmId: "", crmStatus: "", crmRef: "" };
});
const byCustomerId = Object.fromEntries(tenancies.map((t) => [t.customerId, t]));

/* Zoho CRM Tenant records add the payment reference, the rent and the tenant names. */
const crm = (await crmTenants()).map((rec) => ({ rec, m: mapRecord(rec) })).filter((x) => x.m.name || x.m.address);
let linked = 0;
const unlinkedCurrent = [];
for (const { rec, m } of crm) {
  const crmRefs = [rec.Rent_Payment_Reference, rec.Property_Sauce_Reference].map(normaliseRef).filter(looksLikeRef);
  const crmNames = [rec.Tenant_1_Name, rec.Tenant_2_Name, m.name].filter(Boolean);
  const crmAddress = m.address || "";
  // The flat references (NE236UNFLAT42 and the like) outlive a tenancy, so a reference alone never links: the name must agree too.
  let found = tenancies.filter((t) => t.isTenancy && crmRefs.some((r) => t.refs.has(r)) && t.names.some((n) => crmNames.some((c) => namesMatch(n, c))));
  if (found.length !== 1) {
    found = tenancies.filter((t) => t.isTenancy && t.names.some((n) => crmNames.some((c) => namesMatch(n, c))) && addressesMatch(t.address, crmAddress));
    if (found.length > 1) found = found.filter((t) => !t.former);
  }
  if (found.length === 1) {
    const t = found[0];
    if (!t.crmId || (m.current && t.crmStatus && !["Tenanted", "Arrears", "Court", "Let Agreed"].includes(t.crmStatus))) {
      t.crmId = rec.id; t.crmStatus = rec.Status || ""; t.crmRef = rec.Rent_Payment_Reference || "";
      if (rec.Rent) t.rent = Number(rec.Rent);
      for (const r of crmRefs) t.refs.add(r);
      for (const n of crmNames.filter(validName)) if (!t.names.some((x) => namesMatch(x, n))) t.names.push(n);
      linked++;
    }
  } else if (m.current) {
    // A current tenant with no Books customer: still worth naming as a candidate, never certain.
    const row = { customerId: "", customerName: `(no Books customer) ${rec.Last_Name || m.name}`, address: crmAddress, names: crmNames, refs: new Set(crmRefs), rent: rec.Rent ? Number(rec.Rent) : null, invoices: [], former: false, isTenancy: true, crmId: rec.id, crmStatus: rec.Status || "", crmRef: rec.Rent_Payment_Reference || "" };
    tenancies.push(row); unlinkedCurrent.push(row);
  }
}
const refIndex = {};
for (const t of tenancies) for (const r of t.refs) (refIndex[r] ||= []).push(t);
const invoiceIndex = {};
for (const t of tenancies) for (const i of t.invoices) (invoiceIndex[i.n] ||= []).push({ t, i });
const openBalance = (t) => t.invoices.reduce((a, i) => a + i.balance, 0);
const label = (t) => t.customerName;
/* Zoho Books will not take a payment dated before its invoice, so only invoices raised by the
   payment date (plus a week, for tenants who pay early) can be applied; otherwise the payment
   goes on the customer's account and the next invoice is named. */
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10);
const eligible = (t, date) => t.invoices.filter((i) => i.date <= addDays(date, 7));
function invoiceFor(t, amount, date) {
  const el = eligible(t, date);
  const i = el.find((i) => sameAmount(i.balance, amount)) || el.find((i) => sameAmount(i.total, amount)) || el[0];
  if (i) return { number: i.number, id: i.id, note: sameAmount(i.balance, amount) ? "" : `, against oldest open invoice (balance ${gbp(i.balance)})` };
  return { number: `on account (next open ${t.invoices[0].number} is dated ${t.invoices[0].date})`, id: "", note: ", payment predates every open invoice" };
}
const amountMatches = (t, amount) => (t.rent != null && sameAmount(t.rent, amount)) || t.invoices.some((i) => sameAmount(i.total, amount) || sameAmount(i.balance, amount));
const whyAmount = (t, amount) => (t.rent != null && sameAmount(t.rent, amount)) ? `amount equals the rent ${gbp(t.rent)}` : `amount equals open invoice ${(t.invoices.find((i) => sameAmount(i.balance, amount) || sameAmount(i.total, amount)) || {}).number}`;

/* ---------- 3. score each line ---------- */
const OWN = /BEAUMONT RESIDENTI|BEAUCATT HOME|TANC RESIDENTIAL|MURRAY D & SULLIVA|MU\+SU BUS|MURRAY & SULLIVAN|LANCASTER RESIDENT|MONTROSE RESIDENT|SURE LETS|FREEHOLD MANAGEMENT|LUXE STAY|PROPERTY SAUCE|\bMURRAY D\b|\bMURRAY MJ\b|DAMIAN MURRAY|MICHELLE MURRAY|MURRAY DJ\b/;
const CARD = /\bCD \d{4}\b|^CARD \d+,|CASHBACK|VISAXR/;
const certain = [], uncertain = [], notRent = [];
for (const L of lines) {
  const desc = L.description;
  const U = desc.toUpperCase();
  const virgin = U.match(/^(FPS|MOB|BGC|DD|SO|CHQ|CRD\w*|CARD \d+),\s*([^,]*)(?:,\s*(.*))?$/);
  const payer = virgin ? virgin[2].trim() : U;
  const T = tokens(desc);
  const row = { date: L.date, account: L.account, amount: L.amount.toFixed(2), description: maskDigits(desc), transaction_id: L.id };

  // Plainly not rent, decided from the payer: our own accounts and companies, card refunds.
  if (/^MOB, PROPERTY SAUCE/.test(U)) { notRent.push({ ...row, reason: "internal transfer between Property Sauce accounts" }); continue; }
  if (CARD.test(U)) { notRent.push({ ...row, reason: "card refund or cashback" }); continue; }
  if (OWN.test(payer)) { notRent.push({ ...row, reason: "own company or director transfer (decision 6), not tenant rent" }); continue; }
  if (/^BBL\d|RETURNED LOAN|LOANREPAY|\bLOAN\b/.test(U)) { notRent.push({ ...row, reason: "loan drawdown or repayment" }); continue; }

  // (a) an open invoice number in the description
  const invNums = [...U.matchAll(/\bINV[-\s]?0*(\d{3,6})\b/g)].map((m) => Number(m[1]));
  const invHits = invNums.flatMap((n) => invoiceIndex[n] || []);
  const invTenancies = [...new Set(invHits.map((h) => h.t))];
  if (invTenancies.length === 1) {
    const { t, i } = invHits[0];
    if (i.date <= addDays(L.date, 7)) certain.push({ ...row, customer: label(t), invoice: i.number, rule: `(a) invoice ${i.number} named in the description${sameAmount(i.balance, L.amount) ? "" : ` (invoice balance ${gbp(i.balance)}, paid ${gbp(L.amount)})`}`, customer_id: t.customerId, invoice_id: i.id });
    else uncertain.push({ ...row, candidates: label(t), reason: `invoice ${i.number} named but it is dated ${i.date}, after the payment` });
    continue;
  }
  if (invTenancies.length > 1) { uncertain.push({ ...row, candidates: invTenancies.map(label).join(" | "), reason: "invoice numbers in the description belong to more than one customer" }); continue; }

  // (b) the tenancy's payment reference as a whole word
  const refHits = [...new Set(T.filter((tok) => tok.length >= 6).flatMap((tok) => refIndex[tok] || []))];
  if (refHits.length) {
    const withInvoices = refHits.filter((t) => t.invoices.length);
    const ref = T.find((tok) => refHits.some((t) => t.refs.has(tok)));
    // A current CRM tenant who holds the same reference but has no Books customer yet (a re-let flat) makes the payer ambiguous unless the description names the Books tenant.
    const rival = refHits.find((t) => !t.customerId && !withInvoices.some((w) => w.names.some((n) => personInText(T, n))));
    if (withInvoices.length === 1 && rival) {
      uncertain.push({ ...row, candidates: [label(withInvoices[0]), label(rival)].join(" | "), reason: `reference ${ref} is on the Books customer's open invoices but the CRM now shows a different current tenant for it` });
    } else if (withInvoices.length === 1) {
      const t = withInvoices[0];
      if (L.amount <= openBalance(t) + 0.005) {
        const i = invoiceFor(t, L.amount, L.date);
        const shared = refHits.length > 1 ? "; reference also on a former tenancy with nothing open" : "";
        certain.push({ ...row, customer: label(t), invoice: i.number, rule: `(b) payment reference ${ref}${i.note}${shared}`, customer_id: t.customerId, invoice_id: i.id });
      } else uncertain.push({ ...row, candidates: label(t), reason: `reference ${ref} matches but ${gbp(L.amount)} exceeds the open balance ${gbp(openBalance(t))}` });
    } else if (withInvoices.length === 0) {
      uncertain.push({ ...row, candidates: refHits.map(label).join(" | "), reason: refHits.some((t) => t.customerId) ? `reference ${ref} matches but the customer has no open invoice` : `reference ${ref} matches a CRM tenant with no Books customer` });
    } else uncertain.push({ ...row, candidates: withInvoices.map(label).join(" | "), reason: `reference ${ref} is on more than one tenancy with open invoices` });
    continue;
  }

  // (c) payer name plus amount
  // Former tenancies with nothing open are not candidates: the money cannot be theirs to allocate.
  const nameHits = tenancies.filter((t) => t.isTenancy && (!t.former || t.invoices.length) && t.names.some((n) => personInText(T, n)));
  const amountHits = nameHits.filter((t) => amountMatches(t, L.amount));
  if (amountHits.length === 1 && amountHits[0].customerId && amountHits[0].invoices.length) {
    const t = amountHits[0];
    const i = invoiceFor(t, L.amount, L.date);
    const others = nameHits.length > 1 ? `; other name matches ruled out by amount` : "";
    certain.push({ ...row, customer: label(t), invoice: i.number, rule: `(c) payer name ${t.names.find((n) => personInText(T, n))} and ${whyAmount(t, L.amount)}${i.note}${others}`, customer_id: t.customerId, invoice_id: i.id });
    continue;
  }
  if (amountHits.length === 1) { uncertain.push({ ...row, candidates: label(amountHits[0]), reason: amountHits[0].customerId ? "name and amount match but the customer has no open invoice" : "name and amount match a CRM tenant with no Books customer" }); continue; }
  if (amountHits.length > 1) { uncertain.push({ ...row, candidates: amountHits.slice(0, 2).map(label).join(" | "), reason: "name and amount match more than one tenancy" }); continue; }

  // Keywords that place a line for the person, after the certain rules have had their turn.
  if (/HOLDING (DEPOSIT|FEE)|HOLDING\b/.test(U)) { notRent.push({ ...row, reason: "holding deposit from an applicant (Ops 02), not rent" }); continue; }
  if (/INSURANCE|INSURE\b|\bINS\b|SERVICE CH|GROUND\/SERVICE|GROUND RENT|LPE1/.test(U)) { notRent.push({ ...row, reason: "insurance, ground rent or service charge contribution (Freehold Management), not rent" }); continue; }
  if (/\bFEES?\b|REFUND|REIMB|REPAY|\bRETURN(ED)?\b/.test(U) && !nameHits.length) { notRent.push({ ...row, reason: "fee, refund or repayment from a third party, not rent" }); continue; }
  if (/\bMBC\b|BOROUGH|COUNCIL|COUNCI\b|\bLBC\b/.test(U)) { uncertain.push({ ...row, candidates: "", reason: "council payment, possibly housing benefit paid direct; no tenant named" }); continue; }

  // Flat hints for the reviewer: "F30L", "FLAT 42", "9lancaster House".
  const flat = U.match(/\b(?:F|FLAT)\s*0*(\d+[A-Z]?)\b/) || U.match(/\b(\d+)\s*(?:LANCASTER|CATTERICK|LORD)/);
  const building = (U.match(/LANCASTER|CATTERICK|LORD ST|LEA ?BRIDGE|HOLLYBUSH|KINGSWOOD|COOPERS|HEATHCOTE|CHURCH R/) || [])[0];
  let hint = [];
  if (flat && building) hint = tenancies.filter((t) => t.isTenancy && !t.former && addressKey(t.address).nums.has(flat[1].replace(/\D/g, "")) && t.address.toUpperCase().includes(building.slice(0, 4)));
  if (nameHits.length) {
    const whole = nameHits.find((t) => t.invoices.length && sameAmount(openBalance(t), L.amount));
    uncertain.push({ ...row, candidates: nameHits.slice(0, 2).map(label).join(" | "), reason: whole ? `payer name matches and ${gbp(L.amount)} equals the total of the open invoices, but not the rent or any single invoice` : `payer name matches but ${gbp(L.amount)} is not the rent${nameHits[0].rent != null ? ` (${gbp(nameHits[0].rent)})` : ""} or an open invoice` });
  } else if (hint.length) {
    uncertain.push({ ...row, candidates: hint.slice(0, 2).map(label).join(" | "), reason: `flat ${flat[1]} ${building.toLowerCase()} named, but no reference or tenant name` });
  } else uncertain.push({ ...row, candidates: "", reason: "no invoice number, payment reference or tenant name found" });
}

/* ---------- 4. write the files ---------- */
const csv = (rows, cols) => [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\r\n") + "\r\n";
mkdirSync(OUT, { recursive: true });
const files = {
  "certain.csv": csv(certain, ["date", "account", "amount", "description", "customer", "invoice", "rule", "transaction_id", "customer_id", "invoice_id"]),
  "uncertain.csv": csv(uncertain, ["date", "account", "amount", "description", "candidates", "reason", "transaction_id"]),
  "not-rent.csv": csv(notRent, ["date", "account", "amount", "description", "reason", "transaction_id"]),
};
for (const [name, body] of Object.entries(files)) writeFileSync(join(OUT, name), body);
console.log(`\nWritten ${Object.keys(files).join(", ")} to ${OUT}`);
if (DRIVE) {
  try {
    mkdirSync(DRIVE, { recursive: true });
    for (const name of Object.keys(files)) copyFileSync(join(OUT, name), join(DRIVE, name));
    console.log(`Copied to ${DRIVE}`);
  } catch (e) { console.log(`Drive copy skipped: ${e.message}`); }
}

/* ---------- 5. report ---------- */
const sum = (rows) => rows.reduce((a, r) => a + Number(r.amount), 0);
console.log(`\nRent matching ${today}: ${lines.length} uncategorised money-in lines on ${accounts.length} active accounts`);
console.log(`  certain    ${String(certain.length).padStart(4)}  ${gbp(sum(certain)).padStart(12)}`);
console.log(`  uncertain  ${String(uncertain.length).padStart(4)}  ${gbp(sum(uncertain)).padStart(12)}`);
console.log(`  not rent   ${String(notRent.length).padStart(4)}  ${gbp(sum(notRent)).padStart(12)}`);
console.log(`\nTenancy table: ${tenancies.filter((t) => t.isTenancy).length} tenancies from ${customers.length} Books customers, ${linked} linked to a CRM Tenant record, ${unlinkedCurrent.length} current CRM tenants with no Books customer, ${unpaid.length} open invoices worth ${gbp(unpaid.reduce((a, i) => a + Number(i.balance), 0))}`);
console.log(`\nTwenty oldest uncategorised money-in lines:`);
for (const L of lines.slice(0, 20)) console.log(`  ${L.date}  ${L.account.padEnd(22)}  ${gbp(L.amount).padStart(11)}  ${maskDigits(L.description).slice(0, 70)}`);

/* ---------- 6. --apply: deliberately not built ---------- */
if (args.apply === "true") {
  console.log("\nrecording payments is not enabled until Damian has reviewed certain.csv");
  process.exit(2);
}
