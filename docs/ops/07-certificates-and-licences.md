# Ops 07: Certificates and licences

Scope: gas, electrical, EPC, fire, selective and HMO licences, renewed before expiry, every certificate kept for the tenancy and a copy sent to the tenant.

Status: dictated by Damian on 17 September 2026 and written up by the Ops 7 chat. The certificate list in section 5 is proposed and waits for Damian's confirmation. Sections 3, 4, 6 to 9 are written once the list is agreed. No HMOs in the portfolio.

## 1. What this operation covers

Every tenanted property holds a set of certificates and licences that expire on known dates. This operation keeps one register of all of them, books the renewal with the engineer and the tenant at least three weeks before expiry, checks the new certificate is filled in correctly (landlord name exactly as at Land Registry, full address with postcode), stores it in Drive and on the Zoho record, and sends the tenant a copy from Zoho CRM so the send is on the tenant's record. Paying the engineer is Ops 06.

## 2. How it is done today

Damian's instructions, 17 September 2026:

- Renew every certificate before the existing one expires. Gas is mostly one year, electrical mostly five years, selective landlord licences five years. No HMOs, so no HMO licences.
- Keep one spreadsheet of every certificate on every property with its expiry date, so at any moment the next renewal in any category on any property can be seen.
- Contact the engineer and the tenant no less than three weeks before expiry. That leaves time to book the engineer, have the inspection done, receive the certificate and file it.
- File every certificate in Google Drive and on the tenant or landlord profile in Zoho CRM.
- Check every certificate before it is filed. The landlord section must carry the exact owner name as at Land Registry, whether that is a limited company or a person. The property address must be written in full with the full postcode. Tell the engineer this when booking, in an email that says: "Can you please ensure that you write this out to the landlord: [landlord name] at [full property address and postcode]." Then check the certificate when it arrives.
- Email every certificate to the tenant, and send it from Zoho CRM (open the tenant's profile, Send Email) so the email is stored on the tenant's record. The same rule applies to any important document or email that may need to be relied on later, such as a final maintenance confirmation receipt. Routine back-and-forth (arranging viewings, inspection times, general conversation) goes by ordinary Gmail so the CRM does not get cluttered.
- Later addition: a list of payments to be made to engineers, which Damian uploads in bulk to the bank once a week. To be built with Ops 06.

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

Other systems: Drive folder per property for the PDF; contact@propertysauce.co for the engineer booking and tenant access dates; Zoho CRM Send Email from the tenant (Contact) record for the tenant's copy; #claude-urgent on Slack for anything expired or unbooked inside three weeks.

## 4. Decision limits

[To confirm with Damian: may Claude book a renewal with the usual engineer without asking, and up to what price? Who chooses a new engineer?]

## 5. The procedure, step by step

### 5a. Certificate and licence register (proposed, to confirm)

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
| Fire risk assessment (common parts) | Every block where Property Sauce is responsible for the common parts: Catterick House, Lancaster House, any London block | Review every 12 months and after any change | Not required | Regulatory Reform (Fire Safety) Order 2005. May belong in Ops 13 |
| Fire alarm and emergency lighting service (common parts) | Same blocks | Alarm serviced every 6 months, tested weekly; emergency lighting tested monthly, 3-hour test yearly | Not required | Test logs kept in the block file |
| Fire extinguisher service (common parts) | Same blocks | 12 months | Not required | |
| Asbestos survey (common parts) | Same blocks if built before 2000 | Once, then reviewed yearly | Not required | Control of Asbestos Regulations 2012 |
| Lift inspection (LOLER) | Any block with a passenger lift | 6 months | Not required | |
| Oil boiler service (OFTEC) | Any property with oil heating | 12 months | Best practice | Only if any property has oil |

Not on this register but tracked elsewhere: deposit protection certificate and the How to Rent guide (Ops 02), buildings insurance renewal (Ops 13), the private rented sector landlord database under the Renters' Rights Act once registration opens.

### 5b. Steps

[Written once 5a is confirmed. Outline: register check daily; three weeks out, email engineer with the landlord-name and full-address instruction and email tenant for access dates; book; receive certificate; check name, address, dates, codes; file in Drive and on the Zoho record; set the new expiry date from the document only; send tenant copy from Zoho CRM; raise the engineer's payment for Ops 06.]

## 6. Escalation

[Any certificate expired, or inside three weeks with no booking, goes to #claude-urgent on Slack the same day (README rule 3). A certificate with the wrong landlord name or address goes back to the engineer the same day and is not filed until corrected.]

## 7. Done when

[The new certificate is filed in Drive and on the Zoho record, its expiry date in the register was set from the document, the tenant's copy was sent from Zoho CRM and shows on the tenant's record, and any remedial work is closed.]

## 8. Cowork routine

[Daily: read the register, list everything expiring within 21 days that has no booking, and act on it. Weekly: report to Damian what is booked, what is filed, what is late.]

## 9. Test plan

[One property, one gas renewal, every action reported before the routine runs on all properties.]

## 10. Open questions

- Confirm the register in 5a: anything to add or remove, and whether the block items (fire, lifts, asbestos) sit here or in Ops 13.
- Which properties are in a selective-licensing area today, and which councils. Claude can check each council once the address list is confirmed.
- The spreadsheet: Zoho is the single source of truth (README rule 1), so the sheet should be a Google Sheet generated from the Zoho Landlord records, not typed by hand. Confirm.
- Who the usual gas and electrical engineers are for each area, and whether Claude may book them without asking.
- Payment list for engineers: build with Ops 06 as a weekly bank bulk-upload file.
- Compliance check of all 160 let properties, 17 September 2026, is in 03-tenant-enquiries.md appendix C and 03-compliance-check-2026-09-17.csv: 5 gas and 5 EICR expired, 15 gas checks due by 11 November, insurance and licence dates stale on most records. Use it as the starting register once Damian confirms which gaps are real.


## Lead time decision, 20 September 2026

Settled by Damian: gas safety and EICR renewals are triggered six weeks before expiry; EPCs, licences and everything else four weeks before expiry. The reminder fires on that day, the engineer is booked the same day, and a failed visit is rebooked within two working days.
