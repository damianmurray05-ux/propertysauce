// Ops 10: the landlord payment run. Reads every unpaid landlord payout bill
// from Zoho Books, looks up the payout account on the property's Landlord
// record in Zoho CRM, and writes ONE file for the team to upload to Virgin
// Money Business Internet Banking (Payments, Faster payments and transfers,
// Upload payment from file). Damian then authorises the batch in the bank.
//
//   node --env-file=.env scripts/payment-run.mjs                 dry run: lists what would be paid, writes nothing to Books
//   node --env-file=.env scripts/payment-run.mjs --write         writes the run file to out/payment-runs/RUN-<date>-<letter>.csv
//   node --env-file=.env scripts/payment-run.mjs --write --mark  also stamps each bill's reference in Books with the run id, so it can never enter a second file
//
// Options: --max-age-days 90 (older unpaid bills are listed for a person, never paid blind),
//          --org <Books organisation id> (default 678590019),
//          --from-sort 123456 --from-account 12345678 (the account the run is paid from;
//          or PAY_FROM_SORT and PAY_FROM_ACCOUNT in .env). Without them the file is not written.
//
// The file holds bank account numbers. It goes to the team through Drive (folder
// "Accounts/Payment runs"), never Slack, chat or email, and out/ is git-ignored.
// Virgin Money's layout, confirmed by a test upload on 20 September 2026 (see
// docs/ops/06-contractor-payments.md, step 10): plain CSV, NO header row, seven
// columns: From Sort Code, From Account Number, Payee Name, Payment Reference,
// Payee Sort Code, Payee Account Number, Amount. Sort codes are six digits with
// no hyphens, amounts are pounds.pence with no sign, nothing is quoted. Nothing
// here moves money: the upload and the authorisation are both done by people.

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { accessToken, propertiesByOwner, ownersList, getRecord } from "../src/chat/zoho.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]); return a; }, []));
const DC = (process.env.ZOHO_DC || "com").toLowerCase();
const BOOKS = `https://www.zohoapis.${DC}/books/v3`;
const ORG = args.org || process.env.BOOKS_ORG || "678590019";
const MAX_AGE = Number(args["max-age-days"] || 90);
const today = new Date().toISOString().slice(0, 10);

async function books(path, params = {}, init = {}) {
  const t = await accessToken();
  const q = new URLSearchParams({ organization_id: ORG, ...params });
  const r = await fetch(`${BOOKS}${path}?${q}`, { ...init, headers: { authorization: `Zoho-oauthtoken ${t}`, ...(init.headers || {}) } });
  const d = await r.json();
  if (!r.ok || (d.code && d.code !== 0)) throw new Error(`books ${path}: ${d.message || r.status}`);
  return d;
}
async function pages(path, key, params) {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const d = await books(path, { ...params, per_page: 200, page });
    out.push(...(d[key] || []));
    if (!d.page_context || !d.page_context.has_more_page) break;
  }
  return out;
}
const norm = (s) => String(s || "").toLowerCase().replace(/\bflat\s*0+(\d)/g, "flat $1").replace(/^\s*(flat|apartment|apt)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
const gbp = (n) => "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ageDays = (iso) => Math.round((Date.parse(today) - Date.parse(iso)) / 86400000);

/* Every property under management, with its payout account, keyed by address. */
const owners = await ownersList();
const properties = (await Promise.all(owners.map((o) => propertiesByOwner(o.name)))).flat();
// The payout account fields are not in the portal's field list, so they are read per matched property (README rule 7: they go into the file and nowhere else).
const accountOf = async (p) => { const r = (await getRecord("Accounts", p.id, "Landlord_Account_Name,Landlord_Account_Number,Landlord_Sort_Code")) || {}; return { name: (r.Landlord_Account_Name || "").trim(), sort: String(r.Landlord_Sort_Code || "").replace(/\D/g, ""), number: String(r.Landlord_Account_Number || "").replace(/\D/g, "") }; };
const findProperty = (billProperty) => properties.find((p) => norm(p.address).startsWith(norm(billProperty)) || norm(billProperty).startsWith(norm(p.address)) || norm(p.address).includes(norm(billProperty)));

/* Unpaid landlord bills: one payment per bill, unless the bill already carries a run id. */
const unpaid = await pages("/bills", "bills", { status: "unpaid" });
const isLandlordBill = (b) => b.vendor_name.includes(" - ") && !/^(freehold management|depo )/i.test(b.vendor_name);
const rows = [], skipped = [];
for (const b of unpaid.filter(isLandlordBill)) {
  const property = b.vendor_name.split(" - ").slice(1).join(" - ").trim();
  const landlord = b.vendor_name.split(" - ")[0].trim();
  const amount = Number(b.balance);
  const ref = String(b.reference_number || "");
  if (/^RUN-/.test(ref)) { skipped.push({ bill: b.bill_number, why: `already in ${ref}` }); continue; }
  if (amount <= 0) { skipped.push({ bill: b.bill_number, why: "zero balance" }); continue; }
  if (ageDays(b.date) > MAX_AGE) { skipped.push({ bill: b.bill_number, why: `dated ${b.date}, older than ${MAX_AGE} days: reconcile first` }); continue; }
  const p = findProperty(property);
  if (!p) { skipped.push({ bill: b.bill_number, why: `no Landlord record matches "${property}"` }); continue; }
  const acct = await accountOf(p);
  if (!acct.name || acct.sort.length !== 6 || acct.number.length !== 8) { skipped.push({ bill: b.bill_number, why: `payout account incomplete on the Landlord record for ${p.address}` }); continue; }
  // The reference the landlord sees on their bank statement: property then month, 18 characters max for Faster Payments.
  const reference = `PS ${property.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, " ").trim()}`.slice(0, 18).trim();
  rows.push({ billId: b.bill_id, bill: b.bill_number, vendor: b.vendor_name, landlord, property, amount, date: b.date, acct, reference, owner: p.owner });
}

/* Report (no account numbers ever printed). */
const total = rows.reduce((a, r) => a + r.amount, 0);
const byLandlord = {};
for (const r of rows) (byLandlord[r.landlord] ||= { n: 0, sum: 0 }).n++, (byLandlord[r.landlord].sum += r.amount);
console.error(`Payment run ${today}: ${rows.length} payments, ${gbp(total)}`);
for (const [k, v] of Object.entries(byLandlord).sort((a, b) => b[1].sum - a[1].sum)) console.error(`  ${String(v.n).padStart(3)}  ${gbp(v.sum).padStart(12)}  ${k}`);
if (skipped.length) { console.error(`Not in this run (${skipped.length}):`); for (const s of skipped) console.error(`  ${s.bill}: ${s.why}`); }

if (args.write === "true") {
  mkdirSync("out/payment-runs", { recursive: true });
  let letter = "A";
  while (existsSync(join("out/payment-runs", `RUN-${today}-${letter}.csv`))) letter = String.fromCharCode(letter.charCodeAt(0) + 1);
  const runId = `RUN-${today}-${letter}`;
  // Virgin Money Business Internet Banking, "Upload payment from file": no header, seven columns, nothing quoted.
  const fromSort = String(args["from-sort"] || process.env.PAY_FROM_SORT || "").replace(/\D/g, "");
  const fromAccount = String(args["from-account"] || process.env.PAY_FROM_ACCOUNT || "").replace(/\D/g, "");
  if (fromSort.length !== 6 || fromAccount.length !== 8) { console.error("Paying account missing: pass --from-sort and --from-account (or PAY_FROM_SORT / PAY_FROM_ACCOUNT in .env). File not written."); process.exit(2); }
  const clean = (v) => String(v).replace(/[",\r\n]/g, " ").replace(/\s+/g, " ").trim();
  const csv = rows.map((r) => [fromSort, fromAccount, clean(r.acct.name).slice(0, 35), clean(r.reference).slice(0, 18), r.acct.sort, r.acct.number, r.amount.toFixed(2)].join(",")).join("\r\n") + "\r\n";
  writeFileSync(join("out/payment-runs", `${runId}.csv`), csv);
  // The office copy: what each line is for, without the account numbers.
  const log = [["Run", "Bill", "Landlord", "Property", "Amount", "Bill date", "Reference on their statement"].join(","), ...rows.map((r) => [runId, r.bill, r.landlord, r.property, r.amount.toFixed(2), r.date, r.reference].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\r\n") + "\r\n";
  writeFileSync(join("out/payment-runs", `${runId}-log.csv`), log);
  console.error(`Written out/payment-runs/${runId}.csv (${rows.length} lines) and ${runId}-log.csv`);
  if (args.mark === "true") {
    for (const r of rows) {
      await books(`/bills/${r.billId}`, {}, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ reference_number: runId }) });
    }
    console.error(`Stamped ${rows.length} bills in Books with reference ${runId}`);
  } else console.error("Bills not stamped (add --mark once the run is really going to the bank).");
}
