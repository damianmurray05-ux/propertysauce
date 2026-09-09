// Live access to Zoho CRM. The CRM is the source of truth:
//   Contacts  (labelled "Tenant")    one record per tenancy
//   Accounts  (labelled "Landlord")  one record per property, with the
//                                    landlord's details and the certificates
//   Maintenance                      one record per repair job
// Nothing from the CRM is stored here; every lookup is live.
//
// Environment:
//   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET   a Self Client from the Zoho API console
//   ZOHO_REFRESH_TOKEN                   from scripts/zoho-token.mjs
//   ZOHO_DC                              com (default), eu, in, au, jp, uk, ca
// Scopes the refresh token needs:
//   ZohoCRM.modules.contacts.READ, ZohoCRM.modules.accounts.READ,
//   ZohoCRM.modules.custom.ALL (Maintenance), ZohoCRM.modules.attachments.ALL,
//   ZohoCRM.settings.modules.READ, ZohoCRM.settings.fields.READ

const DC = (process.env.ZOHO_DC || "com").toLowerCase();
const ACCOUNTS = `https://accounts.zoho.${DC}`;
const API = `https://www.zohoapis.${DC}/crm/v8`;

// Tenancies in these states may verify, report repairs and see a scorecard.
export const CURRENT_STATUSES = new Set(["Tenanted", "Arrears", "Possession Proceedings", "Court", "Let Agreed", "Maintenance Only"]);

const TENANT_FIELDS = "id,Last_Name,Full_Name,Email,Tenant_1_Name,Tenant_1_Phone,Tenant_1_Phone1,Tenant_2_Name,Tenant_2_Email,Tenant_2_Phone,Mobile,Phone,Status,Account_Name,Rent_Payment_Reference,Property_Sauce_Reference,Homelet_Number,Rent,Rent_Due_Date,Tenancy_Start_Date,Original_Tenancy_Start_Date,Tenants_Missed_Payment_Date,Days_Since_Missed_Payment,Deposit_Statue,Deposit_Registered,Deposit_Scheme,Gas_Safe_Certificate,Rent_Received,Total_Monies_Received";
const PROPERTY_FIELDS = "id,Account_Name,Property_Reference,Property_Sauce_Reference,Last_Name,First_Name,Company_Name,Vendor_Email,Vendor_Phone,Status,Occupied,Balance,Monthly_Rent,New_Rent_Amount,Gas_Safe_Certificate,Gas_Safety_Applicable,NICEIC_Certificate,EPC_Expiry,EPC_Rating,Landlords_Property_License,Landlord_License_Exempt,Insurance_Expiry_Date,Tenancy_Start_Date,Tenancy_End_Date,Tenants_Name,Existing_Tenant,Street,Town,City,Post_Code,Landlord_Payment_Date,Modified_Time";
const MAINTENANCE_FIELDS = "id,Name,Maintenance_Ticket_Number,Maintenance_Issue,Maintenance_Issue1,Job_Status,Appointment_Status,Agreed_Date_Time,Created_Time,Modified_Time,Tenant,Landlord,Contractor1,Quote_To_Landlord,Contractors_Quote,Invoiced_Amount,Invoice_Number,Invoice_Paid_Date,Date_Tenant_Signed_Off,Date_Staff_Signed_Off,Tenants_Star_Rating,Tenants_Comments,Contractors_Comments";

let token = { value: null, exp: 0 };

export const zohoConfigured = () => Boolean(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_REFRESH_TOKEN);

export async function accessToken() {
  if (token.value && Date.now() < token.exp - 60_000) return token.value;
  const r = await fetch(`${ACCOUNTS}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: process.env.ZOHO_CLIENT_ID, client_secret: process.env.ZOHO_CLIENT_SECRET, refresh_token: process.env.ZOHO_REFRESH_TOKEN }),
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error(`zoho token: ${d.error || r.status}`);
  token = { value: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return token.value;
}

async function call(path, init = {}) {
  const t = await accessToken();
  const r = await fetch(`${API}${path}`, { ...init, headers: { authorization: `Zoho-oauthtoken ${t}`, ...(init.headers || {}) } });
  if (r.status === 204) return { data: [] };
  const text = await r.text();
  let d = {};
  try { d = text ? JSON.parse(text) : {}; } catch { d = { raw: text }; }
  if (!r.ok) throw new Error(`zoho ${init.method || "GET"} ${path} ${r.status}: ${text.slice(0, 200)}`);
  return d;
}

export async function search(module, criteria, fields, perPage = 50) {
  const d = await call(`/${module}/search?criteria=${encodeURIComponent(criteria)}&fields=${fields}&per_page=${perPage}`);
  return d.data || [];
}
export async function getRecord(module, id, fields) {
  const d = await call(`/${module}/${id}?fields=${fields}`);
  return (d.data || [])[0] || null;
}
export async function createRecord(module, record) {
  const d = await call(`/${module}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: [record] }) });
  const first = (d.data || [])[0];
  if (!first || first.status !== "success") throw new Error(`zoho create ${module}: ${JSON.stringify(first || d).slice(0, 200)}`);
  return first.details;
}
export async function listAttachments(module, id) {
  const d = await call(`/${module}/${id}/Attachments?fields=id,File_Name,Size,Created_Time,Modified_Time,$file_id`);
  return (d.data || []).map((a) => ({ id: a.id, name: a.File_Name, size: Number(a.Size) || 0, date: (a.Modified_Time || a.Created_Time || "").slice(0, 10), module, record: id }));
}
export async function fetchAttachment(module, id, attachmentId) {
  const t = await accessToken();
  return fetch(`${API}/${module}/${id}/Attachments/${attachmentId}`, { headers: { authorization: `Zoho-oauthtoken ${t}` } });
}
export async function uploadAttachment(module, id, filename, bytes, mime = "image/jpeg") {
  const t = await accessToken();
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mime }), filename);
  const r = await fetch(`${API}/${module}/${id}/Attachments`, { method: "POST", headers: { authorization: `Zoho-oauthtoken ${t}` }, body: form });
  if (!r.ok) throw new Error(`zoho attach ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

/* The reference a tenant types: letters and digits only, upper case. */
export const normaliseRef = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const normaliseEmail = (s) => String(s || "").trim().toLowerCase();

/* UK mobile numbers to E.164 so Twilio accepts them. */
export function normalisePhone(p) {
  let s = String(p || "").replace(/[^\d+]/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (s.startsWith("00")) return "+" + s.slice(2);
  if (s.startsWith("0")) return "+44" + s.slice(1);
  if (s.startsWith("44")) return "+" + s;
  return "+44" + s;
}

/* ---------- tenants ---------- */
export function mapRecord(rec) {
  const status = rec.Status || "";
  const lastName = rec.Last_Name || rec.Full_Name || "";
  const [addrFromName, nameFromName] = lastName.includes(" - ") ? lastName.split(" - ", 2) : ["", lastName];
  const name = (rec.Tenant_1_Name || nameFromName || "").trim();
  const address = (rec.Account_Name && rec.Account_Name.name) || addrFromName.trim();
  const email = (rec.Email || rec.Tenant_2_Email || "").trim();
  const phone = normalisePhone(rec.Tenant_1_Phone || rec.Mobile || rec.Tenant_1_Phone1 || rec.Tenant_2_Phone || rec.Phone);
  return {
    id: rec.id,
    propertyId: rec.Account_Name && rec.Account_Name.id,
    reference: rec.Rent_Payment_Reference || rec.Property_Sauce_Reference || rec.Homelet_Number || "",
    name, firstName: name.split(/\s+/)[0] || "there", email, phone, address, status,
    current: CURRENT_STATUSES.has(status) && !/^\s*X\b/i.test(lastName),
    notes: rec.Tenant_2_Name ? `Joint tenancy with ${rec.Tenant_2_Name}` : "",
    raw: rec,
  };
}

export async function findTenantInZoho(reference) {
  const want = normaliseRef(reference);
  if (want.length < 4) return null;
  const crit = `((Rent_Payment_Reference:equals:${want})or(Property_Sauce_Reference:equals:${want})or(Homelet_Number:equals:${want}))`;
  let rows = await search("Contacts", crit, TENANT_FIELDS, 20);
  if (!rows.length) rows = (await search("Contacts", `(Rent_Payment_Reference:starts_with:${want.slice(0, 5)})`, TENANT_FIELDS, 20)).filter((r) => normaliseRef(r.Rent_Payment_Reference) === want);
  const mapped = rows.map(mapRecord).filter((t) => t.current);
  return mapped[0] || null;
}
export async function tenantById(id) {
  const rec = await getRecord("Contacts", id, TENANT_FIELDS);
  return rec ? mapRecord(rec) : null;
}

/* ---------- landlords and properties ---------- */
export function mapProperty(rec) {
  const addr = rec.Account_Name || [rec.Street, rec.Town || rec.City, rec.Post_Code].filter(Boolean).join(", ");
  const landlordName = [rec.First_Name, rec.Last_Name].filter(Boolean).join(" ").trim() || rec.Company_Name || "";
  return {
    id: rec.id,
    reference: rec.Property_Sauce_Reference || rec.Property_Reference || "",
    address: addr,
    landlord: { name: landlordName, email: normaliseEmail(rec.Vendor_Email), phone: normalisePhone(rec.Vendor_Phone) },
    status: rec.Status || "", occupied: rec.Occupied || "", balance: rec.Balance || "",
    rentPcm: Number(rec.Monthly_Rent) || 0,
    gas: rec.Gas_Safe_Certificate || "", gasApplicable: !/no gas|n\/a|not applicable/i.test(String(rec.Gas_Safety_Applicable || "")),
    eicr: rec.NICEIC_Certificate || "", epc: rec.EPC_Expiry || "", epcRating: rec.EPC_Rating || "",
    licence: rec.Landlords_Property_License || "", licenceRequired: /requires/i.test(String(rec.Landlord_License_Exempt || "")) || (!rec.Landlord_License_Exempt && Boolean(rec.Landlords_Property_License)),
    insurance: rec.Insurance_Expiry_Date || "",
    tenancyStart: rec.Tenancy_Start_Date || "", tenancyEnd: rec.Tenancy_End_Date || "",
    tenantName: rec.Tenants_Name || (rec.Existing_Tenant && rec.Existing_Tenant.name) || "",
    tenantId: rec.Existing_Tenant && rec.Existing_Tenant.id,
    paymentDay: rec.Landlord_Payment_Date || "",
    raw: rec,
  };
}
export async function propertiesByLandlordEmail(email) {
  const e = normaliseEmail(email);
  if (!e || !e.includes("@")) return [];
  const rows = await search("Accounts", `(Vendor_Email:equals:${e})`, PROPERTY_FIELDS, 200);
  return rows.map(mapProperty).filter((p) => p.landlord.email === e);
}
export async function findLandlordByEmail(email) {
  const props = await propertiesByLandlordEmail(email);
  if (!props.length) return null;
  const l = props[0].landlord;
  return { reference: l.email, email: l.email, phone: l.phone, name: l.name, firstName: (l.name.split(/\s+/)[0] || "there"), properties: props.length };
}

/* ---------- maintenance ---------- */
export function mapJob(rec) {
  return {
    id: rec.id, ticket: rec.Maintenance_Ticket_Number || "", title: rec.Name || rec.Maintenance_Issue1 || "Repair",
    issue: rec.Maintenance_Issue || "", category: rec.Maintenance_Issue1 || "", status: rec.Job_Status || "",
    appointment: rec.Appointment_Status || "", agreed: rec.Agreed_Date_Time || "",
    created: (rec.Created_Time || "").slice(0, 10), updated: (rec.Modified_Time || "").slice(0, 10),
    tenantId: rec.Tenant && rec.Tenant.id, propertyId: rec.Landlord && rec.Landlord.id,
    quote: Number(rec.Quote_To_Landlord || rec.Contractors_Quote) || 0, invoiced: Number(rec.Invoiced_Amount) || 0, invoiceNumber: rec.Invoice_Number || "", paid: rec.Invoice_Paid_Date || "",
    tenantSignedOff: rec.Date_Tenant_Signed_Off || "", staffSignedOff: rec.Date_Staff_Signed_Off || "", rating: Number(rec.Tenants_Star_Rating) || 0,
    closed: Boolean(rec.Date_Staff_Signed_Off || rec.Invoice_Paid_Date || /Invoice Received|Tenant Signed Off/.test(rec.Job_Status || "")),
  };
}
export async function jobsForProperty(propertyId) {
  const rows = await search("Maintenance", `(Landlord:equals:${propertyId})`, MAINTENANCE_FIELDS, 100);
  return rows.map(mapJob).sort((a, b) => b.created.localeCompare(a.created));
}
export async function jobsForTenant(tenantId) {
  const rows = await search("Maintenance", `(Tenant:equals:${tenantId})`, MAINTENANCE_FIELDS, 100);
  return rows.map(mapJob).sort((a, b) => b.created.localeCompare(a.created));
}

const CATEGORY_TO_ISSUE = { heating_hot_water: "Gas Works Required", gas: "Gas Works Required", plumbing_leak: "Plumbing Issue", electrical: "Electrical Fault", structure_roof: "Roof Leaking", damp_mould: "Decorating Required" };
/* Create a Maintenance record for a verified tenant. Returns the ticket number. */
export async function createJob({ tenant, input, photos = [] }) {
  const record = {
    Name: `${(tenant.address || "").split(",")[0] || "Repair"}: ${input.summary}`.slice(0, 120),
    Tenant: tenant.id ? { id: tenant.id } : undefined,
    Landlord: tenant.propertyId ? { id: tenant.propertyId } : undefined,
    Maintenance_Issue: [input.summary, "", input.details, "", `Location: ${input.location_in_property}`, `Started: ${input.started}`, `Access: ${input.access}`, `Urgency: ${input.urgency}`, "Reported through the website assistant after one-time-code verification."].join("\n").slice(0, 2000),
    Maintenance_Issue1: CATEGORY_TO_ISSUE[input.category],
    Job_Status: "Reported",
    Tenants_Phone: input.contact_phone,
    Email: tenant.email || undefined,
    Access_Via_Keys: /key/i.test(input.access || "") ? "Yes" : undefined,
    Maintenance_Issue_Logged: true,
  };
  Object.keys(record).forEach((k) => record[k] === undefined && delete record[k]);
  const details = await createRecord("Maintenance", record);
  const id = details.id;
  for (const [i, p] of photos.slice(0, 4).entries()) {
    try { await uploadAttachment("Maintenance", id, `photo-${i + 1}.jpg`, Buffer.from(p.data, "base64")); } catch (e) { console.error("photo upload failed", e.message); }
  }
  const rec = await getRecord("Maintenance", id, "id,Maintenance_Ticket_Number");
  return { id, ticket: (rec && rec.Maintenance_Ticket_Number) || id };
}
