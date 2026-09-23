// Ops 03 / tenant portal launch: which current tenants can sign in to the
// portal (need an email address or a mobile on the record, or a tenancy
// reference) and which cannot. Read-only. Run from the repo root with the
// sandbox off: node --env-file=.env scripts/ops/tenant-signin-check.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { accessToken, mapRecord } from "../../src/chat/zoho.mjs";

const API = `https://www.zohoapis.${(process.env.ZOHO_DC || "com").toLowerCase()}/crm/v8`;
const FIELDS = "id,Last_Name,Full_Name,Email,Tenant_2_Email,Mobile,Phone,Tenant_1_Phone,Tenant_1_Phone1,Tenant_2_Phone,Tenant_1_Name,Status,Account_Name,Rent_Payment_Reference,Property_Sauce_Reference,Homelet_Number,Tenancy_Start_Date";
const t = await accessToken();
let page = 1, rows = [];
while (true) {
  const r = await fetch(`${API}/Contacts?fields=${FIELDS}&per_page=200&page=${page}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
  if (r.status === 204) break;
  const j = await r.json(); rows.push(...(j.data || []));
  if (!j.info || !j.info.more_records) break; page++;
}
const current = rows.map(mapRecord).filter((x) => x.current);
const out = current.map((x) => ({ address: x.address, tenant: x.name, status: x.status, email: x.email ? "yes" : "NO", mobile: x.phone ? "yes" : "NO", reference: x.reference ? "yes" : "NO", canSignIn: x.email || x.phone || x.reference ? (x.email ? "email" : x.phone ? "mobile (needs the text service)" : "reference only") : "NO WAY IN", id: x.id }));
const gaps = out.filter((x) => x.canSignIn === "NO WAY IN" || x.email === "NO");
const csv = (arr) => ["Address,Tenant,Status,Email on record,Mobile on record,Reference on record,Can sign in today,Zoho id", ...arr.map((x) => [x.address, x.tenant, x.status, x.email, x.mobile, x.reference, x.canSignIn, x.id].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
mkdirSync("docs/ops/tenant-portal", { recursive: true });
writeFileSync("docs/ops/tenant-portal/signin-check.csv", csv(out));
writeFileSync("docs/ops/tenant-portal/signin-gaps.csv", csv(gaps));
console.log(`current tenancies ${current.length}; with email ${out.filter((x) => x.email === "yes").length}; with mobile ${out.filter((x) => x.mobile === "yes").length}; with reference ${out.filter((x) => x.reference === "yes").length}; no way in ${out.filter((x) => x.canSignIn === "NO WAY IN").length}; without an email (need the text service or a fix) ${gaps.length}`);
