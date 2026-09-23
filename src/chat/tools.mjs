// Tools the model can call, and what happens when it does. Every tool ends
// in an email to the team (and a copy to the person), plus an optional
// webhook. The tenant identity attached to a repair comes from the verified
// session, never from the model.
import { reference } from "./crypto.mjs";
import { sendEmail, postWebhook, TEAM_EMAIL, escapeHtml } from "./notify.mjs";
import { zohoConfigured, createJob } from "./zoho.mjs";

export const tools = [
  {
    name: "raise_repair",
    description: "Raise a maintenance job with the Property Sauce team once the fault, location, timing and access details are known. Returns a job reference to give the tenant.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        category: { type: "string", enum: ["heating_hot_water", "plumbing_leak", "electrical", "gas", "damp_mould", "appliance", "doors_windows_locks", "structure_roof", "pests", "communal_areas", "other"] },
        urgency: { type: "string", enum: ["emergency", "urgent", "routine"], description: "emergency: danger or major loss of a service, told to phone; urgent: health, safety, security or worsening; routine: everything else" },
        summary: { type: "string", description: "One line, e.g. 'Boiler not firing, no hot water since Monday'" },
        details: { type: "string", description: "Everything the tenant said that a contractor needs, including what was seen in any photos" },
        location_in_property: { type: "string" },
        started: { type: "string", description: "When it started, in the tenant's words" },
        access: { type: "string", description: "When someone can attend and whether management keys may be used" },
        contact_phone: { type: "string" },
        reporter_name: { type: "string", description: "Only for unverified reports; empty string otherwise" },
        reporter_address: { type: "string", description: "Only for unverified reports; empty string otherwise" },
        reporter_email: { type: "string", description: "Only for unverified reports; empty string otherwise" },
      },
      required: ["category", "urgency", "summary", "details", "location_in_property", "started", "access", "contact_phone", "reporter_name", "reporter_address", "reporter_email"],
    },
  },
  {
    name: "log_tenancy_question",
    description: "Pass a tenancy question, a requested change to terms, or a request to proceed with a tenancy to a member of staff.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        contact: { type: "string", description: "Email address or phone number" },
        property: { type: "string", description: "Address if known, else empty string" },
        summary: { type: "string", description: "What they asked and anything they want changed or confirmed" },
      },
      required: ["name", "contact", "property", "summary"],
    },
  },
  {
    name: "handoff_to_team",
    description: "Pass an enquiry from a landlord, owner, seller, agent or other party to the team.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        contact: { type: "string", description: "Email address or phone number" },
        audience: { type: "string", enum: ["private_landlord", "corporate_institutional", "block_freeholder_rtm", "seller", "agent_receiver_solicitor", "other"] },
        property: { type: "string", description: "Address, area, size, how it is let" },
        summary: { type: "string" },
      },
      required: ["name", "contact", "audience", "property", "summary"],
    },
  },
];

/* Read-only tools for a verified tenant: their own file, nothing else. The
   tenant identity comes from the signed session, so the model cannot ask
   about anyone else's tenancy. */
const noInput = { type: "object", additionalProperties: false, properties: {}, required: [] };
export const tenantTools = [
  { name: "my_tenancy", description: "The signed-in tenant's own tenancy: property, rent and due day, payment reference, deposit protection, tenancy start, next inspection, and whether each certificate for the property is in date. Call this for any question about their rent, balance, deposit, certificates or inspection.", strict: true, input_schema: noInput },
  { name: "my_repairs", description: "The signed-in tenant's repair tickets with the stage each is at. Call this when they ask what is happening with a repair.", strict: true, input_schema: noInput },
  { name: "my_documents", description: "Every document on the signed-in tenant's file with a link they can open: tenancy agreement, deposit certificate, inventory, gas safety, EICR, EPC, licence, statements. Call this when they ask for a copy of anything.", strict: true, input_schema: noInput },
];
export const toolsFor = (tenant) => (tenant ? [...tools, ...tenantTools] : tools);

const lines = (obj) => Object.entries(obj).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join("\n");

export async function runTool(name, input, ctx) {
  let ref = reference();
  const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
  if (/^my_/.test(name)) {
    if (!ctx.tenant || !ctx.tenant.id || !zohoConfigured()) return "The tenant's file is not available in this conversation. Offer to log the question for the team.";
    const { tenantFile, rentAccount, describeTenancy, describeRepairs, describeDocuments } = await import("./tenantfile.mjs");
    const file = await tenantFile({ id: ctx.tenant.id, pid: ctx.tenant.propertyId });
    if (!file.tenant) return "The tenancy record could not be read just now. Apologise and offer to log the question for the team.";
    if (name === "my_tenancy") { const rent = await rentAccount(file.tenant).catch(() => null); return describeTenancy(file, rent); }
    if (name === "my_repairs") return describeRepairs(file);
    if (name === "my_documents") return describeDocuments(file, ctx.session);
  }
  if (name === "raise_repair") {
    const verified = Boolean(ctx.tenant);
    let ticket = "";
    if (verified && zohoConfigured() && ctx.tenant.id) {
      try { ticket = (await createJob({ tenant: ctx.tenant, input, photos: ctx.photos })).ticket; } catch (e) { console.error("zoho job failed", e.message); }
    }
    const ref = ticket ? `Ticket ${ticket}` : reference();
    const who = verified
      ? { name: ctx.tenant.name, address: ctx.tenant.address, tenancy_reference: ctx.tenant.reference, email: ctx.tenant.email, phone: ctx.tenant.phone }
      : { name: input.reporter_name, address: input.reporter_address, email: input.reporter_email };
    const subject = `${input.urgency === "emergency" ? "EMERGENCY " : input.urgency === "urgent" ? "URGENT " : ""}Repair ${ref}: ${input.summary}${verified ? "" : " (UNVERIFIED)"}`;
    const text = `Repair report ${ref}\nRaised ${when} via the website assistant${ticket ? " and logged in Zoho CRM Maintenance" : ""}\nVerified: ${verified ? "yes, by one-time code" : "NO, details unchecked"}\n\n${lines(who)}\n\n${lines({ category: input.category, urgency: input.urgency, summary: input.summary, location: input.location_in_property, started: input.started, details: input.details, access: input.access, contact_phone: input.contact_phone })}\n\nPhotos attached: ${ctx.photos.length}`;
    const attachments = ctx.photos.map((p, i) => ({ filename: `${ref}-photo-${i + 1}.jpg`, data: p.data }));
    const team = await sendEmail({ to: TEAM_EMAIL, subject, text, attachments, replyTo: who.email || undefined });
    if (who.email) {
      await sendEmail({
        to: who.email,
        subject: `Your repair report ${ref}`,
        text: `Thank you for reporting this. Your reference is ${ref}.\n\nWhat you told us: ${input.summary}\nLocation: ${input.location_in_property}\nAccess: ${input.access}\n\nThe team reviews reports the same working day and a contractor will contact you to arrange access. If the problem is dangerous or getting worse, ring +44 (0)20 8988 8434.\n\nProperty Sauce`,
      });
    }
    await postWebhook({ type: "repair", reference: ref, raised: new Date().toISOString(), verified, reporter: who, ...input, photos: ctx.photos.length });
    ctx.raised.push({ reference: ref, note: ticket ? "It is logged on your file and the team will be in touch about access." : verified ? "The team has it and will be in touch about access." : "The team will check these details against your file before booking." });
    if (!team.ok && !team.skipped) console.error("repair email failed", team.error);
    return `Raised. Reference ${ref}. ${ticket ? "Logged as a maintenance ticket on the tenancy file. " : ""}${team.ok ? "The team has been emailed." : team.skipped ? (ticket ? "" : "Email delivery is not configured yet, so the report is logged only; tell the person to also ring or email if it is urgent.") : "Email delivery failed; tell the person to ring the office to be safe."}`;
  }
  if (name === "log_tenancy_question" || name === "handoff_to_team") {
    const kind = name === "log_tenancy_question" ? "Tenancy question" : "Enquiry";
    const subject = `${kind} ${ref}: ${input.summary.slice(0, 80)}`;
    const text = `${kind} ${ref}\nReceived ${when} via the website assistant\n\n${lines(input)}`;
    const team = await sendEmail({ to: TEAM_EMAIL, subject, text, replyTo: /@/.test(input.contact) ? input.contact : undefined });
    if (/@/.test(input.contact)) {
      await sendEmail({ to: input.contact.trim(), subject: `We have your ${kind.toLowerCase()} (${ref})`, text: `Thank you. Reference ${ref}.\n\nWhat we noted: ${input.summary}\n\nA member of the team will reply, usually the same working day. Ring +44 (0)20 8988 8434 if it is urgent.\n\nProperty Sauce` });
    }
    await postWebhook({ type: name, reference: ref, received: new Date().toISOString(), ...input });
    ctx.raised.push({ reference: ref, note: "A person will follow up." });
    return `Logged. Reference ${ref}. ${team.ok ? "The team has been emailed." : "Email delivery is not configured; tell the person to also email contact@propertysauce.co."}`;
  }
  return `Unknown tool ${name}`;
}

export { escapeHtml };
