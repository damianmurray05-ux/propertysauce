# Ops 07: Certificates and licences

Scope: gas, electrical, EPC, fire, selective and HMO licences, renewed before expiry, every certificate kept for the tenancy and a copy sent to the tenant.

Status: dictated by Damian on 17 September 2026, register confirmed 20 September 2026. Block items (fire, alarms, extinguishers, asbestos, lifts) moved to Freehold Management FM Ops 08 the same day. Waiting on Usman for the engineer list and the selective-licence list. No HMOs in the portfolio.

## 1. What this operation covers

Every tenanted property holds a set of certificates and licences that expire on known dates. This operation keeps one register of all of them, books the renewal with the engineer and the tenant six weeks before expiry for gas safety and EICR and four weeks before expiry for everything else, checks the new certificate is filled in correctly (landlord name exactly as at Land Registry, full address with postcode), stores it in Drive and on the Zoho record, and sends the tenant a copy from Zoho CRM so the send is on the tenant's record. Paying the engineer is Ops 06.

## 2. How it is done today

Damian's instructions, 17 September 2026:

- Renew every certificate before the existing one expires. Gas is mostly one year, electrical mostly five years, selective landlord licences five years. No HMOs, so no HMO licences.
- Keep one spreadsheet of every certificate on every property with its expiry date, so at any moment the next renewal in any category on any property can be seen.
- Contact the engineer and the tenant no less than six weeks before expiry for gas safety and EICR, and four weeks for everything else (dictated as three weeks on 17 September; revised by Damian on 20 September 2026). That leaves time to book the engineer, have the inspection done, receive the certificate and file it.
- File every certificate in Google Drive and on the tenant or landlord profile in Zoho CRM.
- Check every certificate before it is filed. The landlord section must carry the exact owner name as at Land Registry, whether that is a limited company or a person. The property address must be written in full with the full postcode. Tell the engineer this when booking, in an email that says: "Can you please ensure that you write this out to the landlord: [landlord name] at [full property address and postcode]." Then check the certificate when it arrives.
- Email every certificate to the tenant, and send it from Zoho CRM (open the tenant's profile, Send Email) so the email is stored on the tenant's record. The same rule applies to any important document or email that may need to be relied on later, such as a final maintenance confirmation receipt. Routine back-and-forth (arranging viewings, inspection times, general conversation) goes by ordinary Gmail so the CRM does not get cluttered.
- Later addition: a list of payments to be made to engineers, which Damian uploads in bulk to the bank once a week. To be built with Ops 06.

Damian, 20 September 2026:

- Block certificates (fire risk assessment, alarms and emergency lighting, extinguishers, asbestos, lifts) belong to block management, not here. Moved to FM Ops 08.
- Once every certificate is on file, do a reconciliation: check every date in Zoho CRM under the Landlord module against the document itself and correct Zoho where they differ.
- Claude may book the usual engineers without asking. Usman knows who they are per area.
- Usman knows which properties do not carry a selective licence.

## 3. Systems and records touched

**Zoho CRM, Landlord (Accounts) record**, one per property. Certificate fields that already exist (checked 17 September 2026):

| Item | Fields |
|---|---|
| Gas | `Gas_Safe_Certificate` (Gas Safe Expiry), `Gas_Safe_Engineer` (lookup), `Gas_Safety_Applicable` |
| Electrical | `NICEIC_Certificate` (NICEIC Expiry) |
| EPC | `EPC_Expiry`, `EPC_Start_Date`, `EPC_Rating`, `EPC_Ref_Number` |
| Selective licence | `Landlords_Property_License` (expiry), `Landlords_License_Number`, `Landlord_License_Exempt` |
| Insurance | `Insurance_Expiry_Date` (Ops 13) |

No fields yet for fire risk assessment, legionella, PAT or the alarm test date. To add once the register in 5a is confirmed. The register spreadsheet is generated from these fields, so Zoho stays the single source of truth.

Other systems: Drive folder per property for the PDF; contact@propertysauce.co for the engineer booking and tenant access dates; Zoho CRM Send Email from the tenant (Contact) record for the tenant's copy; #claude-urgent on Slack for anything expired or unbooked inside its lead time (six weeks for gas safety and EICR, four weeks for everything else).

## 4. Decision limits

Claude may, without asking anyone:

- Book a renewal with the usual engineer for that area (list from Usman, section 10) at any time inside Monday to Friday, 9 to 5, and agree the date with the tenant.
- Send the engineer the landlord-name and full-address instruction, the tenant the access request, the tenant's certificate copy from Zoho CRM, and the Slack posts.
- Set the expiry date in Zoho from the document once it has been checked.

Needs a person:

- A new or different engineer: Usman picks.
- A certificate that fails the checks (wrong landlord name, wrong or partial address, missing postcode, C1 or C2 faults, EPC below E): Claude sends it back to the engineer and tells Usman; Damian is told if it is not corrected within five working days.
- Remedial work from an EICR or gas check: a Maintenance ticket under Ops 05, and Ops 06 for anything over the in-house limits.
- Paying the engineer: Ops 06.

## 5. The procedure, step by step

### 5a. Certificate and licence register (confirmed 20 September 2026)

Applies to England. "Copy to tenant" is the legal deadline for giving the tenant a copy.

| Item | Applies to | Renewal | Copy to tenant | Notes |
|---|---|---|---|---|
| Gas Safety Record (CP12) | Every property with a gas appliance, pipework or flue | 12 months | Within 28 days of the check; before move-in for a new tenant | Can be done up to two months early and keep the same expiry date. Keep for two years |
| Electrical Installation Condition Report (EICR) | Every property | 5 years, or sooner if the report says so | Within 28 days; before move-in for a new tenant; to the council within 7 days if asked | Any C1, C2 or FI code must be fixed within 28 days and written proof kept |
| Energy Performance Certificate (EPC) | Every property | 10 years | Before the tenant signs; also shown when marketing | Rating must be E or better to let. Government intends C by 2030 for existing tenancies |
| Selective licence | Properties in a council selective-licensing area | 5 years | Not required, but keep the licence conditions with the tenancy | Rotherham (Catterick House area), Blackpool and some London boroughs run schemes; Northumberland (Cramlington) to be checked per property |
| Smoke and carbon monoxide alarm test | Every property | Tested on the first day of every new tenancy | Recorded on the check-in inventory | Not a certificate but a dated record. Smoke alarm every storey; CO alarm in every room with a fixed gas or solid-fuel appliance (not a cooker) |
| Legionella risk assessment | Every property | Review every 2 years or when the water system changes | Not required | Written assessment; a simple one for an ordinary flat |
| Portable appliance test (PAT) | Properties let with landlord's appliances | 12 months (best practice, not law) | Not required | Some selective-licence conditions require it |
| Oil boiler service (OFTEC) | Any property with oil heating | 12 months | Best practice | Only if any property has oil |

Not on this register but tracked elsewhere: block common-parts items (fire risk assessment, alarm and emergency lighting servicing, extinguishers, asbestos survey, lift inspection) in Freehold Management FM Ops 08; deposit protection certificate and the How to Rent guide in Ops 02; buildings insurance renewal in Ops 13; the private rented sector landlord database under the Renters' Rights Act once registration opens.

### 5b. Steps

[Step 0, once: collect every current certificate into Drive, then reconcile every date in the Zoho Landlord record against the document and correct Zoho. Then the routine: register check daily; six weeks out for gas safety and EICR, four weeks out for everything else, email engineer with the landlord-name and full-address instruction and email tenant for access dates; book; receive certificate; check name, address, dates, codes; file in Drive and on the Zoho Landlord (Account) record; set the new expiry date from the document only; attach a copy to the tenant's own Zoho Contact record and remove the superseded one (see the hard rule below); send tenant copy from Zoho CRM; raise the engineer's payment for Ops 06.]

**Hard rule, confirmed 25 September 2026, for the team and for Claude:** the tenant portal reads a tenant's documents only from that tenant's own Zoho Contact record (and the Drive certificate register), never from the property's Landlord/Account record. The Account record still holds the full history for the office and the landlord — every certificate, current and expired, mortgage paperwork, everything — exactly as it does today. Nothing changes there. What changes is the tenant's own Contact record:

- Only attach a document to a tenant's Contact record if you are content for that tenant to see it. There is no second check after that — if it's on their Contact record and it's a certificate type, it shows.
- Only the current, latest certificate of each kind goes on a tenant's Contact record. When a certificate renews, remove the superseded one from the Contact record as well as updating the Account record — do not leave the old one sitting there alongside the new one.
- Never attach anything from the landlord-only list (mortgage or loan paperwork, insurance certificates, purchase or valuation documents, owner statements, utility or council tax bills, meter readings) to a tenant's Contact record, even by mistake, even briefly.
- This is enforced twice: by this rule for what the team uploads, and separately in code (a closed list of document types a tenant may ever be shown, regardless of where it came from) as a second layer in case of a slip. But the rule above is the one that actually keeps the list right — the code is a backstop, not a substitute for it.

## 6. Escalation

[Any certificate expired, or inside its lead time (six weeks for gas safety and EICR, four weeks for everything else) with no booking, goes to #claude-urgent on Slack the same day (README rule 3). A certificate with the wrong landlord name or address goes back to the engineer the same day and is not filed until corrected.]

## 7. Done when

[The new certificate is filed in Drive and on the Zoho record, its expiry date in the register was set from the document, the tenant's copy was sent from Zoho CRM and shows on the tenant's record, and any remedial work is closed.]

## 8. Cowork routine

**Certificate register**, every weekday at 08:00, Europe/London. It reads Zoho CRM and never writes to it: no certificate date is set or changed by the routine (README rule 3), nothing is booked, and no engineer email is sent. The routine does two things: refresh the register, and post to #claude-urgent when anything is expired or due. The scripts are `scripts/ops/certificate-register.mjs` (the register: docs/ops/certificate-register.csv and the Drive copy at My Drive > Claude > 01 Property Sauce > Compliance > Certificate register.csv) and `scripts/ops/certificate-reminders.mjs` (the preview of the Slack post, the engineer emails and the licence list, written to docs/ops/certificate-reminders-preview.md). The `--post` and `--send` flags on the reminders script are deliberately not enabled: engineer emails wait for Usman's engineer list and Damian's review of a preview.

Prompt: "You are the Property Sauce compliance officer. Read ~/Projects/propertysauce/docs/ops/07-certificates-and-licences.md, then in ~/Projects/propertysauce run `node --env-file=.env scripts/ops/certificate-register.mjs`. It reads every live property from Zoho CRM, rewrites docs/ops/certificate-register.csv and the Drive copy, and ends with a line counting the expired or due items. If that count is zero, stop: post nothing. If it is not zero, run `node scripts/ops/certificate-reminders.mjs`, open docs/ops/certificate-reminders-preview.md, and post the text under section 1 to #claude-urgent (C0BTPPZ3JJE) as one message, exactly as written, starting with @channel. Do not send the engineer emails in section 2, do not book anything, do not write to Zoho CRM, and do not set or change any certificate date. Then stop."

What Damian sees: on a weekday morning when anything is expired or due, one post in #claude-urgent grouped by area with the address, item, expiry date and days; on a clear day, nothing. The register file is refreshed on every run whether or not anything is posted.

Where it runs: Cowork in the cloud with the repository and its .env (the Zoho self client) available. If Cowork cannot run Node against the repository, the fallback is a Claude Code scheduled task on `0 8 * * 1-5` on Damian's Mac, which only runs while the desktop app is open.

## 9. Test plan

[One property, one gas renewal, every action reported before the routine runs on all properties.]

## 10. Open questions

- Asked Usman on Slack, 20 September 2026: the usual gas and electrical engineers per area (name, email, phone), and which properties do not carry a selective licence. Waiting for his reply.
- The spreadsheet is generated from the Zoho Landlord fields in section 3 after the reconciliation in 5b step 0. Fields to add for legionella, PAT and the alarm test date.
- Payment list for engineers: build with Ops 06 as a weekly bank bulk-upload file.
- Compliance check of all 160 let properties, 17 September 2026, is in 03-tenant-enquiries.md appendix C and 03-compliance-check-2026-09-17.csv: 5 gas and 5 EICR expired, 15 gas checks due by 11 November, insurance and licence dates stale on most records. Use it as the starting register once Damian confirms which gaps are real.


## Lead time decision, 20 September 2026

Settled by Damian: gas safety and EICR renewals are triggered six weeks before expiry; EPCs, licences and everything else four weeks before expiry. The reminder fires on that day, the engineer is booked the same day, and a failed visit is rebooked within two working days.
