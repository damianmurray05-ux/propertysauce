# Ops 02: Tenant paperwork and due diligence

Scope: right to rent, the tenancy agreement and its dates, the first payment and the holding-deposit refund, deposit registration and prescribed information, the How to Rent guide and the property's certificates, the tenancy checklist, the inventory, and the move-in pack. Everything that has to be right, in the right order, between "referencing passed" and "keys handed over".

Status: dictated by Damian on 20 September 2026 and written up by the Ops 2 chat. Sections 4 and 10, the template notes in appendix A and the per-property checklist method in appendix B are waiting for Damian's approval. Ops 01 owns the timeline from "to let" to move-in and its steps 7a and 10 to 16 point here; this file is the authority on what each document must contain, when the law says it must be given, and how it is evidenced. Ops 07 owns the certificates themselves; Ops 04 takes over the rent invoice; Ops 09 is the mirror at the end of the tenancy.

## 1. What this operation covers

A referenced applicant has passed and a move-in date has been agreed. This operation takes them to move-in with every legal duty met and evidenced on the Tenant record: right to rent checked and recorded for every adult; the tenancy agreement issued from the approved template with the right three dates, signed on DocuSign by the landlord first and the tenant second; the first month's rent and the deposit received only after signing, and the holding deposit from Ops 01 repaid; the deposit protected with Mydeposits and the prescribed information given inside 30 days; the property's certificates, the Renters' Rights Act information sheet, the scheme leaflets and the tenancy checklist sent from the Tenant record in Zoho CRM so the send is on the file; the checklist and the deposit certificate signed on DocuSign as the tenant's admission that the pack arrived; the move-in team member copied on that email so they can print the pack and take pen signatures on the day; the inventory, meter readings and alarm test recorded at move-in; and the Tenant and Landlord records filled in. The people: Damian (landlord signer for every Sure Lets and Manage Limited tenancy, on his personal email, and the decisions), the office (Usman, who sends from DocuSign and the CRM today, and Ezad), the move-in team member for the area (Ali at Catterick House and Lancaster House, Dave at Lancaster House, Vera in London), and Mydeposits, DocuSign and Homelet outside.

## 2. How it is done today

Damian's account, 20 September 2026, checked against the record of the last let (Flat 30, Catterick House, moved in 5 September 2026) and the last agreement filed (Flat 22, Catterick House, dated 10 July 2026):

- The templates are already in place: the Assured Periodic Tenancy Agreement (used for every new let since May 2026; the prescribed information for the deposit is printed inside it at pages 6 to 8), the Required Document Checklist ("New Tenancy Check List"), and the holding deposit form from Ops 01. Damian is open to changing the agreement where this chat has found problems (appendix A).
- Once the applicant has passed referencing, a move-in date is agreed with them and the paperwork starts. The first document is the tenancy agreement, sent on DocuSign. The law does not let us take any money for the tenancy until the agreement is issued and signed, so the agreement carries three dates: the agreement date (the day it is issued and signed), the payment date (the day the money must be in), and the tenancy start date (move-in). Damian's example: today is the 20th and the tenant wants to move as soon as possible; the agreement is dated the 20th, the money is due on the 21st, the tenancy starts on the 22nd. The tenant signs on the 20th, pays on the 21st, moves in on the 22nd. Flat 22 shows the same shape: dated 10 July, initial rent by 17 July, start 18 July.
- The holding deposit taken in Ops 01 (one week's rent, £125 in Damian's example) is refunded once the tenant has signed and paid, and the full first payment is taken in one piece, usually two months' money: the first month's rent and a deposit of one month's rent. Damian wants the refund rather than netting it off, to keep the accounts clean.
- Once the money is in, the deposit is registered with Mydeposits and the certificate comes back. Then one email goes to the tenant from their Tenant record in Zoho CRM, never from Gmail, with everything attached: a copy of the tenancy agreement (unsigned), the registered deposit certificate, the prescribed information, the Renters' Rights Act information sheet (which replaced the How to Rent guide on 1 May 2026), the electrical certificate, the gas safety certificate where there is gas, and whatever else that property carries (licence, EPC, fire safety information for the block, the deposit scheme leaflets), plus the tenancy checklist that lists all of it. The last one, Flat 30 on 4 September 2026, carried ten attachments: EPC, EICR, the agreement, the deposit certificate, the checklist, the How to Rent guide (October 2023 file), the Catterick fire safety information, the Mydeposits insured-scheme leaflet, the Mydeposits scheme leaflet, and the Renters' Rights Act information sheet.
- Ali or Dave (or Vera in London) is copied on that email because they meet the tenant on move-in day: they print every document, take it with them and have the tenant ink-sign it in front of them as witness, so there are two signed sets, one on DocuSign and one in pen with a witness (filing rules: the pen-signed tenancy filing skill).
- Straight after the email, two more DocuSign envelopes go out: the tenancy checklist (the tenant's signature is their admission that the documents listed were sent by the email before it) and the deposit certificate. Every envelope, all three, is sent by Property Sauce, signed first by the landlord, which for Sure Lets and Manage Limited means Damian on his personal email, and then by the tenant. Landlord first is how Damian checks each document before the tenant sees it.
- When all three envelopes are back signed, the money is in and the record is set up, the tenant can move in on the start date and the team member hands over the keys after the pen signing.
- What goes wrong: a date wrong on the agreement (agreement date after the tenant's signature, or payment date after the start date); money requested before signing; the pack sent from a personal mailbox so there is no record; a document missing from the pack because nobody had a list of what that property needs (hence appendix B); the withdrawn How to Rent guide still going out instead of the Renters' Rights Act information sheet; the deposit registered late; a DocuSign envelope reaching the tenant before Damian has read it; the pen-signed pack dated after move-in or unwitnessed.

## 3. Systems and records touched

**Zoho CRM, Tenant (Contacts) record.** Fields that exist today and what this operation writes in them (checked 20 September 2026):

| Stage | Fields |
|---|---|
| Holding deposit (Ops 01 step 7a) | `Date_holding_deposit_was_sent`, `Holding_deposit_amount_sent_to_our_account` |
| Right to rent | `UK_Passport`, `Passport_Number`, `Driving_License_Number_T1`, `Share_Code`, `Right_To_Rent_Verified`, `Payslips` (file upload labelled "Right to Rent Docs": the passport or share-code result is uploaded here) |
| Agreement | `Agreement_Date`, `Tenancy_Start_Date`, `Moving_in_date`, `Initial_Rent_Due_Date`, `Rent`, `Rent_Due_Date`, `Recurring_Rent_Start_Date`, `Deposit`, `Tenancy_Type`, `Guarantor_Required1` and the guarantor fields, `Tenancy_signed_by_Landlord`, `Tenancy_signed_by_tenant`, `New_Docusign_Tenancy_Uploaded` |
| Money | `Deposit_Received` ("Deposit Received & Doc Signed"), `Deposit_Recieved` (amount), `Rent_Received`, `Rent_Payment_Reference` |
| Deposit protection | `Deposit_Scheme` (Mydeposits), `Deposit_Number`, `Deposit_Held_By`, `Deposit_Registered`, `Deposit_Statue`, `Tenant_Signed_Depo_Cert`, `Deposit_Certificate_Signed_Uploaded` |
| Document pack | `EPC`, `Electric_Cert`, `Gas_Safe1`, `Oct_2023_How_To_Rent_Guide` (picklist named after the 2023 edition; section 10 asks to rename it), `Checklist_signed_by_Landlord`, `Checklist_signed_by_Tenant`, `New_Docusign_Checklist_Uploaded` |
| Move-in | `Sets_Of_Keys`, `Electric_Metre_Reading`, `Gas_Metre_Reading`, `Water_Meter_Reading_in`, `Hard_copy_docs_signed_on_move_in`, `Hard_copy_docs_signed_uploaded`, `New_Pen_Sign_Checklist_Uploaded`, `Usman_Approves_move_in`, `Signed_off_by_DM`, `Email_Landlord_Tenant_Move_In_Complete`, `Status` Tenanted |

Every email to the tenant in this operation goes from the Tenant record with Send Email. The sent email, its attachments and the DocuSign completed PDFs sit on the record; the same PDFs go in the tenancy folder in Drive.

**Zoho CRM, Landlord (Accounts) record** (one per property). Read, never guessed: `Established_Landlord` (who signs, README rule 4), `Gas_Safety_Applicable` and `Gas_Safe_Certificate`, `NICEIC_Certificate`, `EPC_Expiry` and `EPC_Rating`, `Landlords_Property_License` and `Landlord_License_Exempt`. Every certificate the property needs must be in date on the start date (Ops 07). The per-property "Tenancy Checklist - <address>" PDF from appendix B is attached here and is the list of what that property's pack must contain.

**DocuSign.** Account "Damian Murray" (a61a0a50-553e-4192-990c-a0645f74c7c3, eu.docusign.net), connected as Usman Tufail, info@propertysauce.co, no saved templates. Three envelopes per let, each with recipient 1 the landlord (Damian's personal email for Sure Lets and Manage Limited tenancies; section 10 for third-party landlords) at routing order 1 and recipient 2 each tenant at routing order 2: (1) the tenancy agreement, (2) the tenancy checklist, (3) the deposit certificate. The Ops 01 holding deposit form is a fourth, earlier envelope with the same order. Completed PDFs and the certificate of completion are pulled back to the record and the folder.

**Mydeposits.** Insured scheme, deposit held by Sure Lets and Manage Limited (agreement clause 5.1). The holding deposit from Ops 01 is always refunded in full, never credited (Damian, 20 September 2026). Registered by a person in the portal within 30 days of the money arriving; the certificate and the prescribed information PDF are downloaded and attached to the Tenant record; `Deposit_Number` is typed from the certificate, not from memory. The scheme leaflets ("What is the Tenancy Deposit Scheme?" and the insured-scheme information for tenants) are the standing PDFs in Drive; keep the current versions.

**Renters' Rights Act Information Sheet 2026, in place of the How to Rent guide.** Checked on gov.uk on 20 September 2026: the How to Rent page was withdrawn on 1 May 2026 "due to changes from the Renters' Rights Act", and its last edition remains October 2023. What replaced it is the government's four-page "Renters' Rights Act Information Sheet 2026" (assets.publishing.service.gov.uk), which explains to tenants that fixed terms have gone, assured shorthold tenancies became assured periodic tenancies, rent rises only by Section 13 notice, no Section 21, the grounds a landlord may use, the tenant's two months' notice, and the right to ask for a pet. The office has been sending it in every pack since May 2026 (the file name in the Flat 30 pack). Rule: the information sheet goes in every pack; the October 2023 How to Rent file is retired and the Tenant field `Oct_2023_How_To_Rent_Guide` is repurposed or renamed for the information sheet. Keep the current gov.uk version in Drive and check the page each quarter.

**Block fire safety information.** A one-page "Important Fire Safety Information & Emergency Procedures" letter for each block (Catterick House and Lancaster House versions exist in Drive), written by the office as the building's annual fire safety notice: the stay-put policy, when to evacuate, the assembly point, the routine checks, and how a resident with a disability asks for a personal emergency evacuation plan. It goes in every pack for a flat in a block; it is not a statutory certificate but it is the residents' fire safety information the Fire Safety (England) Regulations 2022 expect the responsible person to give.

**Zoho Books.** The one-off invoice for the first month and the deposit (Ops 01 step 12) so the bank feed matches; the holding deposit refund is a payment out that needs a person (README rule 2) and is recorded against the same customer so the ledger nets to zero.

**Drive.** Tenancy folder per let: agreement, three completed envelopes, deposit certificate and prescribed information, the pack as sent, right-to-rent evidence, the inventory and meter photos, the pen-signed pack (filed by the pen-signed tenancy filing skill into "Pen Signed Documents"). Standing documents: the agreement template, the checklist template, the holding deposit form, the How to Rent guide, the scheme leaflets, the Renters' Rights Act information sheet, and the block fire safety information sheets.

**Slack.** The property's thread in #vacant-properties (C0C2X7E7X5K) carries each stage: agreement out, signed, money in, deposit registered, pack sent, envelopes complete, move-in. The move-in team member is tagged there as well as copied on the pack email (Ali U0BUVS5KGDT, Dave U0BUNS8TWER; Vera for London). Pen-signed packs are reported in #pen-sign-documents. Anything that would stop a move-in goes to #claude-urgent (C0BTPPZ3JJE).

**The website's Zoho access.** The Vercel deployment's Zoho self-client token (ZohoCRM.modules.ALL) can read a Tenant record's sent emails and their attachments and can attach files to a Landlord record. Appendix B's script uses it. The Zoho MCP connector cannot read email bodies or upload attachments.

**Law this operation relies on** (England; re-read on legislation.gov.uk before first live use, as Ops 01 section 10 says):

- Renters' Rights Act 2025: every new tenancy is an assured periodic tenancy; the terms must be in writing before the tenant is bound; no rent may be demanded or accepted before the agreement is signed, and no more than one month's rent in advance. This is the reason for the three dates.
- Tenant Fees Act 2019: the only money before signing is a holding deposit of at most one week's rent; the deposit is capped at five weeks' rent where the annual rent is under £50,000 (one month is within the cap); a holding deposit must be repaid within seven days of the tenancy being entered into unless the tenant agrees to it going towards the first rent or the deposit; it may be kept only if the applicant withdraws, fails a right-to-rent check, gives false or misleading information, or unreasonably delays past the agreed deadline, and then written reasons go to them within seven days.
- Housing Act 2004 sections 212 to 215: the deposit is protected and the prescribed information given within 30 days of receipt. Penalty one to three times the deposit, and no possession on some grounds until it is put right.
- Immigration Act 2014: a right-to-rent check on every adult who will live at the property, before the tenancy starts, from original documents seen in person or a Home Office online check with a share code; a follow-up check before a time-limited right expires; copies kept for the tenancy plus one year. Civil penalty up to £20,000 per occupier for a repeat breach.
- Gas Safety (Installation and Use) Regulations 1998: a copy of the current gas safety record to a new tenant before they move in. Electrical Safety Standards Regulations 2020: a copy of the EICR before occupation. Energy Performance of Buildings Regulations: the EPC given free of charge. Smoke and Carbon Monoxide Alarm Regulations 2015: alarms tested on the first day of the tenancy.
- The How to Rent guide was a Section 21 prerequisite (Housing Act 1988 section 21A and the 2015 Prescribed Requirements Regulations). With Section 21 gone and the page withdrawn on 1 May 2026, the document a new tenant gets is the Renters' Rights Act Information Sheet 2026 alongside the written statement of terms, which our agreement's Section A provides. Housing Act 1988 sections 47 and 48: the landlord's name and an address in England and Wales for service (the agreement's contact details page).

## 4. Decision limits

Claude may, without asking anyone:

- Work out the three dates from the agreed start date: agreement date is the day the envelope is sent; payment date is the working day before the start date, or two working days after the agreement date if that is later, in which case the start date moves and the applicant is told; start date as agreed. Never a payment date before the agreement date or after the start date.
- Fill the agreement from the approved template with the property, the landlord entity per `Established_Landlord`, every adult tenant, the rent, the rent day, the deposit in pounds, the three dates, the permitted occupiers, and nothing else changed. Create the DocuSign envelope with the landlord first.
- Check the right-to-rent evidence on the record against the rule in step 1 and record the result. Claude cannot see an original document in person; it can check a share code online and read what the team member uploaded.
- After the tenant has signed: send the payment request from the Tenant record and the Books invoice; watch the bank feed; when the money is in, prepare the holding-deposit refund for a person to pay and tell the tenant when to expect it.
- Prepare the Mydeposits registration figures; once a person has registered it and the certificate is on the record, send the document pack from the Tenant record using that property's Tenancy Checklist as the list, copying the move-in team member; then create the checklist and deposit-certificate envelopes, landlord first.
- Chase envelopes at two and four working days; chase the money on the payment date.
- Write every field in section 3 as each step completes, and post each stage in the property's thread.
- Refuse, politely and with the reason, any request to move in before all three envelopes are complete and the money has cleared, and tell Damian.

Needs a person:

- Reading and signing every envelope: the landlord signer (README rule 2). A declined envelope comes back to Claude to correct and re-send.
- The in-person right-to-rent check of an original document, and the decision where a share code shows a time-limited or conditional right: the move-in team member sees the document; Damian decides anything conditional.
- Any change to the template, any special clause, any rent, deposit or payment arrangement other than the standard, any request to pay in cash or from a third party: Damian.
- Keeping any part of a holding deposit: Damian, and the written reasons go out within seven days.
- The Mydeposits registration and the holding-deposit refund: a person in the portal and at the bank.
- A property whose certificates are not all in date on the start date, or whose licence has lapsed: the move-in does not happen until Ops 07 has fixed it; Damian is told the day it is found.
- Whether Sure Lets and Manage Limited signs as landlord or a third-party landlord signs for their own property: per landlord, section 10.

## 5. The procedure, step by step

**Step 1. Right to rent, before the agreement is issued.** For every adult who will live at the property (tenants and permitted occupiers):

- British or Irish citizen: the team member who did the viewing, or the one doing the move-in, sees the original passport (or another List A document) in person or by live video with the original in hand, and uploads a clear copy to the Tenant record's "Right to Rent Docs" with the date seen and their name. `UK_Passport` Yes, `Passport_Number` from the document, `Right_To_Rent_Verified` Yes.
- Everyone else: the applicant gives a share code from gov.uk and their date of birth; Claude runs the online check on gov.uk/view-right-to-rent, saves the result page as a PDF to the record with the check date, and records `Share_Code` and `Right_To_Rent_Verified`. If the right is time-limited, note the expiry on the record and set a follow-up check for the earlier of the expiry and twelve months.
- Not evidenced by the day the agreement is due to go out: the agreement waits, the applicant is told what is missing, and Damian is told if it is not resolved in three working days. A failed check means the holding deposit may be retained (section 3 law) and the applicant record is marked "Right to rent failed <date>". No tenancy starts without a recorded check for every adult.

**Step 2. The three dates.** Agree the start date with the applicant and the move-in team member (the team member's availability decides the time on the day). Set the agreement date to today, the payment date per section 4, and the start date. Write `Agreement_Date`, `Initial_Rent_Due_Date`, `Tenancy_Start_Date` and `Moving_in_date` (the same day as the start date unless the tenant chooses to collect keys later) on the record. `Rent_Due_Date` is the day of the month the start date falls on; `Recurring_Rent_Start_Date` is one month after the start date.

**Step 3. The agreement, envelope 1.** Draft from the approved template (appendix A lists the clauses that must not be changed and the ones waiting for amendment): landlord per `Established_Landlord`; all adult tenants named, jointly and severally; property address in full with postcode; the three dates; initial rent equal to one month's rent, subsequent rent on the rent day each month; deposit equal to one month's rent in pounds; permitted occupiers listed or "None"; parking; utilities all to the tenant unless the record says otherwise; the landlord's address for service, admin@propertysauce.co and the office number; the tenant's phone and email as given on the application (the email address on the contact page is the agreed service address, so it must be the one the tenant actually uses). Check the whole document once more against the record before sending. DocuSign envelope: subject "<address> - Assured Periodic Tenancy Agreement", recipient 1 landlord signer with signature, initials on every page and date tabs; recipient 2 each tenant with the same; guarantor as an extra recipient at order 2 where `Guarantor_Required1` is Yes. Post "Agreement sent to landlord for signature" in the thread. `Tenancy_signed_by_Landlord` and `Tenancy_signed_by_tenant` are written from the envelope's completion dates, not the day the envelope went out.

**Step 4. Money, only after both signatures.** Pull the completed agreement and the certificate of completion to the record and the folder; tick `New_Docusign_Tenancy_Uploaded`. Send the payment request from the Tenant record: the amount (first month's rent plus the deposit, both stated), the payment date from the agreement, the account named in the agreement (the bank details live in the agreement and in Zoho, never typed from memory, README rule 7), the reference to use (`Rent_Payment_Reference`), and what happens next. Raise the Books invoice. When the bank feed shows the money, write `Rent_Received`, `Deposit_Recieved` and `Deposit_Received`, post in the thread, and prepare the holding-deposit refund: the exact amount from `Holding_deposit_amount_sent_to_our_account`, back to the account it came from, for a person to pay within seven days of the agreement's completion date. Tell the tenant the refund is on its way and when. Money not in by the payment date: chase the same day, tell Damian, and the start date does not stand until it clears.

**Step 5. Deposit protection, within five working days of the money clearing and always inside 30 days.** A person registers the deposit with Mydeposits from the record's figures (tenant names exactly as on the agreement, address in full, deposit amount, start date, landlord Sure Lets and Manage Limited or the third-party landlord). Download the deposit protection certificate and the prescribed information document; attach both to the record; write `Deposit_Scheme`, `Deposit_Number`, `Deposit_Held_By`, `Deposit_Registered`, `Deposit_Statue`. The prescribed information pages inside the agreement are a second copy, not a substitute: the scheme's own prescribed information and its leaflet go in the pack.

**Step 6. The document pack, from the Tenant record, the same day as step 5.** Open the property's "Tenancy Checklist - <address>" on the Landlord record (appendix B) and assemble exactly that list, checking each certificate's date against the Landlord record on the way:

1. Assured Periodic Tenancy Agreement, unsigned copy as issued.
2. Mydeposits deposit protection certificate, and the prescribed information.
3. Mydeposits scheme leaflet ("What is the Tenancy Deposit Scheme?") and the insured-scheme information for tenants.
4. The Renters' Rights Act Information Sheet 2026 (gov.uk).
5. Electrical installation condition report, in date.
6. Gas safety record, in date, where `Gas_Safety_Applicable` is Yes.
7. Energy performance certificate.
8. Selective licence where the property has one (not where `Landlord_License_Exempt` is Yes).
9. Block fire safety information and emergency procedures (Catterick House, Lancaster House, any London block).
10. The Required Document Checklist, filled in for this tenancy (property, start date, landlord, tenant), unsigned.
11. Inventory and schedule of condition where one exists for the property (section 10: none at Lancaster House today).

Send template P1 below from the Tenant record with every item attached and named as in the checklist, to every tenant's email, copying the move-in team member (section 10 for their addresses) and contact@propertysauce.co. Tick `EPC`, `Electric_Cert`, `Gas_Safe1` and the information-sheet field. Post "Pack sent, <n> attachments" in the thread with the list. If anything on the checklist is missing or out of date, the pack is not sent: Ops 07 or the office fixes it first and Damian is told the same day.

**Step 7. Envelopes 2 and 3, straight after the pack.** From the same PDFs: envelope 2 "<address> - Required Document Checklist", envelope 3 "<address> - Deposit Protection Certificate", each with the landlord signer first and each tenant second, signature and date tabs. Chase at two and four working days. On completion, pull the PDFs to the record, tick `Checklist_signed_by_Landlord`, `Checklist_signed_by_Tenant`, `Tenant_Signed_Depo_Cert`, `Deposit_Certificate_Signed_Uploaded`, `New_Docusign_Checklist_Uploaded`, and post "All three envelopes complete" in the thread.

**Step 8. Inventory and the move-in pack, before the start date.** The move-in team member prints the pack from the email (agreement, checklist, deposit certificate and prescribed information, the information sheet, every certificate, leaflets) and takes it to the property. Where the property has an inventory, print it too; where it does not, the team member's room-by-room photographs and the meter photographs on the day are the schedule of condition and are attached to the record. Confirm the property is ready per Ops 01 step 14.

**Step 9. Move-in day.** The team member meets the tenant at the property at the agreed time, and in this order: sees the original right-to-rent document if step 1 was done on a copy; tests every smoke and carbon monoxide alarm with the tenant and records it on the checklist; takes the pen signatures on every document, dated that day and never later, with the team member signing as witness with their printed name (the pen-signed tenancy filing skill has the full list of what is signed and how it is checked); reads and photographs the meters; counts out the keys against `Sets_Of_Keys`; hands over the keys. They post the photographs and readings in the thread the same day and put the pack in the scanning tray for the pen-signed filing skill. Claude writes the meter fields and `Hard_copy_docs_signed_on_move_in`, and tells the utilities and the council.

**Step 10. The record, complete.** Every field in section 3 filled; `Status` Tenanted; `Usman_Approves_move_in` and `Signed_off_by_DM` are the office's and Damian's ticks that they have looked at the record; Landlord record and Books per Ops 01 step 15; `Email_Landlord_Tenant_Move_In_Complete` once the third-party landlord (where there is one) has been told. Thread Status: Re-let (moved in <date>).

## 6. Escalation

- Right to rent not evidenced for any adult three working days after the agreement was due: Damian. A share code that shows no right, or a document the team member doubts: Damian the same day, and the agreement is not issued.
- Landlord signer has not signed within two working days: chase, then Damian (or the third-party landlord's contact, then Damian at 48 hours).
- Tenant has not signed within four working days of the landlord: chase, then Damian; the start date moves if signing would leave less than one working day before the payment date.
- Money not in by the payment date: Damian the same day; keys are never handed over on a promise.
- Deposit not registered by day 20 after receipt: #claude-urgent, Damian and Usman, because day 30 is the legal limit.
- Any certificate on the checklist out of date or missing, or a lapsed licence: Damian and Ops 07 the same day; the pack and the move-in wait.
- Pen-signed pack dated after move-in, unwitnessed, or not signed: the pen-signed filing skill's list in #pen-sign-documents, and `DM_Red_Alert` on the record.
- Any request to change the template or a clause: Damian; no envelope goes out with a change he has not approved.

## 7. Done when

For the tenancy: a right-to-rent check recorded for every adult before the agreement date; agreement dated on the day it was sent, payment date between the agreement date and the start date, start date as agreed; landlord signed before the tenant on all three envelopes and no envelope reached the tenant unsigned by the landlord; no money requested before the tenant had signed, other than the Ops 01 holding deposit; first month and deposit cleared before the start date; holding deposit refunded within seven days of the agreement completing; deposit registered and prescribed information given within 30 days of receipt, with the certificate and its number on the record; the pack sent from the Tenant record matching that property's Tenancy Checklist, with the move-in team member copied; checklist and deposit certificate completed on DocuSign; alarms tested, meters read, keys counted and a pen-signed pack filed on move-in day; every field in section 3 written. Measured per let: days from referencing pass to agreement sent (target 1), days from tenant signature to money cleared (target 2), days from money to deposit registered (target 5, limit 30), packs sent with every checklist item present (target 100%).

## 8. Cowork routine

Trigger: Ops 01 step 9 (a clear referencing pass) and the same Property Sauce Cowork schedule Ops 01 runs on.

- *Every working day 08:00 and 13:00.* For every tenancy between "referencing passed" and "moved in": check right-to-rent evidence on the record; check DocuSign envelope status and chase; check the bank feed for the first payment and prepare the refund; count days since the deposit was received and warn at day 20; read the property's Tenancy Checklist and confirm every item is on the Landlord record and in date; send the pack once the certificate is on the record; write the fields. Report in the property's thread and in the Ops 1 daily line: which tenancies are waiting on whom (landlord signature, tenant signature, money, registration, pack, envelopes, move-in), and any date or certificate problem.
- *Every working day 17:00.* Day-before reminder to the move-in team member with the time, the tenant's name and mobile, the number of key sets, and "print the pack from the email dated <date>".
- *Quarterly, first working day.* Check gov.uk for a new version of the Renters' Rights Act information sheet (or a successor to How to Rent) and the Mydeposits site for new leaflet versions; replace the standing PDFs in Drive and say so in #vacant-properties.

Nothing in the routine sends an envelope to a tenant without the landlord signing first, registers a deposit, or pays a refund.

## 9. Test plan

The same let as the Ops 01 test, whichever property comes vacant next. For that tenancy every date, envelope, email, refund instruction and field change is reported in the Ops 2 chat before it happens, and Damian sees the filled agreement, the pack email with its attachment list, and the two later envelopes before they go. Before that, appendix B runs on every let property so the checklists exist and Usman has checked them. Switch on for everyone when one tenancy has gone from pass to move-in with nothing corrected and the pen-signed pack has been filed clean.

Before the test, this chat builds: the date rule as a check the routine runs on every agreement; the DocuSign envelope calls for the four documents with landlord-first routing and the tab positions fixed (or saved DocuSign templates, Ops 01 section 10); the agreement fill from the template with the amendments in appendix A once approved; the P1 pack email as a Zoho CRM email template on the Tenant module; the per-property Tenancy Checklist PDFs on every Landlord record (appendix B) and the script that regenerates one when a certificate changes; the share-code check; and the field writes in section 3.

## 10. Open questions

- **Refund or credit.** Settled by Damian on 20 September 2026: always refunded, never credited against the first payment. H1 and step 4 say so.
- **Landlord signer.** Settled by Damian on 20 September 2026: every Sure Lets and Manage Limited envelope goes to Damian on his personal email as recipient 1. Still open for third-party owners: Flat 6 Catterick House's checklist names Beaucatt Homes Limited as landlord: for third-party landlords, does Sure Lets and Manage Limited still sign as landlord (as the Flat 22 agreement does), or does the owner sign? Same question as Ops 01.
- **How to Rent edition.** Settled on 20 September 2026 by checking gov.uk: withdrawn on 1 May 2026, no edition after October 2023, replaced by the Renters' Rights Act Information Sheet 2026 (section 3). The October 2023 file stops going out; the Tenant field `Oct_2023_How_To_Rent_Guide` is renamed "RRA information sheet sent".
- **Catterick House licence.** Damian says (20 September 2026) a new selective licence has just been granted. It is not in Drive (latest file is the January 2024 licence) nor on the Catterick House Main record, and every flat's `Landlords_Property_License` still says 30 April 2025. Usman to supply the new licence PDF; then Ops 07 writes the new expiry and number on all 43 Catterick records, files it, and the checklists are regenerated so the licence line reads from the new date.
- **Prescribed information timing.** The agreement's pages 6 to 8 give the prescribed information before the deposit is received. The pack sends the scheme's own prescribed information after registration, which is what the Act asks for. Confirm the pack always includes the Mydeposits prescribed information document, not only the certificate.
- **Move-in team member emails.** Which addresses are copied on the pack: Ali and Dave (Vera in London). None are on the Team records today.
- **Inventory.** No inventory at Lancaster House (pen-signed filing skill). Confirm which properties have one, and whether photographs on the day are the schedule of condition for the rest.
- **Template amendments.** Appendix A lists what this chat found in the Flat 22 copy. Damian to say which to adopt; the amended template then goes to a solicitor before first use (the tenancy document review skill's rule).
- **Checklist template wording.** The Required Document Checklist still says "Prescribed Information (ASTs only)", and its email-authority paragraph says documents "can be sent by post". Rewrite it to the assured periodic tenancy, name Mydeposits, list the items in step 6, and make the email-authority paragraph match agreement clause 7.2. Draft in appendix C.
- **In-person checks.** Confirm the viewing team member sees the original passport at the viewing, or the move-in team member on the day (which is after the agreement is signed; the check must be before the tenancy starts, so the day itself is the last lawful moment).
- **DocuSign templates.** Saving the four documents as DocuSign templates fixes the tabs and makes the envelope call a fill rather than a build. Ops 01 section 10 asks the same.

## Appendix A: Assured Periodic Tenancy Agreement, template notes

Read in full from the Flat 22, Catterick House copy dated 10 July 2026 (DocuSign envelope 29801A14). These are the points to put to Damian and then a solicitor; nothing changes in the template until he says so. Each applies to every tenancy signed on the template since May 2026, so the exposure is the whole new-template portfolio, not one flat.

1. **Clause 2.3, indemnity for notice costs and bank charges.** Requires the tenant to pay the landlord's costs of serving any notice and any bank charges for a failed payment. The Tenant Fees Act 2019 schedule 1 does not permit either; a prohibited payment is a civil penalty and the term is unenforceable. Proposed: delete the second and third bullets; keep recovery of costs awarded by a court.
2. **Clause 4.3, "final and binding".** The landlord's own assessment of condition becomes final if the tenant misses a second check-out appointment. Consumer Rights Act 2015 fairness risk. Proposed: "will be relied on in any deposit claim, and the tenant may still dispute it through the scheme".
3. **Clause 2.32, "not leave the property empty for more than 28 days in any circumstances".** Absolute prohibition with no reasonableness qualifier. Proposed: "without telling us, and not for more than 60 days without our written agreement, which we will not unreasonably withhold".
4. **Prescribed information pages, scheme naming.** The pages name MyDeposits at the top but say "an award has been made by TDS" and carry The Dispute Service Limited's disclaimer, and paragraph (vi) reads "set out in clause(s) of the tenancy agreement" with no clause number. Proposed: Mydeposits throughout, "clause 5.4", and the last paragraph ends properly.
5. **Prescribed information given before the deposit.** Pages 6 to 8 are signed at the agreement date, before any deposit is received. Keep them as a copy, and always send the scheme's prescribed information after registration (step 5).
6. **Section A, rent wording.** "Initial rent payment ... to be paid in advance by <payment date>" plus "the deposit ... in full to Landlord" is right for the three-date rule. Make sure the payment date field can never be filled with a date before the agreement date.
7. **Clause 8.2, forfeiture where the tenancy is not assured.** Harmless for our lets but confusing; leave.
8. **Clause 2.4, interest at 3% above base after 14 days.** Within the Tenant Fees Act. Keep (Ops 04 relies on it).
9. **Guarantor block and witness block.** Present on page 20. The DocuSign envelope must map both when a guarantor is required; the witness block is for the pen-signed copy.
10. **Bank details in the agreement.** They are the tenant's payment instructions and belong there; they must not be copied into any other document, note or message (README rule 7).

## Appendix B: The per-property Tenancy Checklist

Damian's request, 20 September 2026: one document per property on its Landlord record saying exactly what the move-in pack for that property must contain, built from what the most recent tenant was actually sent from Zoho CRM, so Usman can check every property once and the routine has a fixed list ever after.

**Method.** A script in the website repo (`scripts/tenancy-checklist.mjs`, run with the Vercel Zoho token) does, for every Landlord record that is Rented or To Let and is a lettable unit (not a block's "Main" record):

1. Take the current tenant from `Existing_Tenant`; if empty, the most recent Contact on that property by tenancy start date.
2. List that tenant's sent emails on the record and pick the latest one whose subject contains "Checklist", "Check List" or "Tenancy Documents" and that has attachments. If the current tenant has none, look at the previous tenants of the same property, newest first.
3. Read the email's attachment names and sort them into the standard items (agreement, deposit certificate, prescribed information, scheme leaflets, How to Rent, EICR, gas safety, EPC, licence, fire safety information, Renters' Rights Act sheet, checklist, inventory, other).
4. Compare with what the Landlord record says the property needs and mark each item Sent, Not sent, or Not applicable at this property. The record decides: gas safety only where `Gas_Safety_Applicable` is Yes (Catterick House and Lancaster House are "No Gas Supply - N/A"); selective licence only where `Landlord_License_Exempt` is not "Exempt From Licensing" (Lancaster House is exempt, Catterick House and the Blackpool and London licensed properties are not); block fire safety information for flats in a block; the How to Rent guide is marked not required since 1 May 2026. So no two buildings' checklists are the same, and a wrong line is fixed by correcting the Landlord record and regenerating, not by editing the PDF.
5. Write "Tenancy Checklist - <address>.pdf" with: the property and landlord entity; the source (tenant, email subject, date sent, who sent it); the list of documents that were sent with their file names; the standard list with Sent / Not sent / Not applicable; the certificate expiry dates on the record; and a box for Usman to confirm or correct, with a date and initials. Where no pack email exists on any tenant of the property, the PDF says so and lists the standard items from the record fields only, marked "derived, not seen".
6. Attach the PDF to the Landlord record and write one line per property to a summary sheet for Usman: address, source tenant and date, items sent, items missing, licence and certificate dates.

**First run.** Flat 1, Catterick House was Damian's suggested start. Its current Tenant record (Damian Hawkey, since January 2023) carries no pack email, only an EICR email of April 2025 and workflow emails; the previous tenant's record has none either. So Flat 1's checklist is derived from the record and the block, and the worked example is Flat 30, Catterick House, whose pack of 4 September 2026 is the most recent in the building. The run covers every let property and the summary sheet goes to Usman; the office checks each PDF against the property and the routine then treats the checklist as the list.

**Result of the first run, 20 September 2026 (regenerated the same evening after Damian's corrections: Lancaster House licence lines now read "not applicable" from the record's "Exempt From Licensing" value, gas lines from "No Gas Supply - N/A", and the How to Rent line is marked not required since 1 May 2026).** 152 lettable Landlord records (141 Rented, 12 To Let, minus the block "Main" records). 135 checklists were built from a real pack email; 17 properties have no pack email on any tenant record and carry a derived list marked as such: 3a, 4a, 5a, 25a, 26a and 32c Lancaster House; Flats 1 and 20 Catterick House; 4 High Street Saffron Walden; 28a Kenilworth Gardens; 664B High Road; FF and GF 55 Coopers Lane; Flat 2, 253 Lea Bridge Road; Flat 5, 35 Lord Street; Hawkesmead; Windmill Cottage 1. Every PDF is attached to its Landlord record and the summary sheet is out/tenancy-checklists/summary.csv (not committed). What the packs show, for Usman's check and for Ops 07: the Renters' Rights Act sheet was missing from 98 packs (most predate May 2026), block fire safety information from 45, the deposit certificate from 59 (many packs were sent before the certificate came back, or the certificate went in a later email), an EICR from 30, an agreement copy from 28, a licence from 48 of the licensed properties; 55 records show a selective licence expiry in the past (every Catterick House flat at 30 April 2025 among them). Flat 2 Catterick House's pack email is titled "Flat 17" and is flagged on its sheet. The oldest packs relied on date from September 2023.

**After the first run.** The checklist is regenerated by the routine whenever a certificate date on the Landlord record changes (Ops 07) and after every new let, so it is always the last pack plus the current record. A later step (section 10) is to hold the same list in a field on the Landlord record so the routine reads it without opening a PDF.

## Appendix C: Templates

Every email goes from the Tenant record with Send Email. Square brackets are merge fields. No bank details anywhere except inside the agreement.

### P1: Your tenancy documents for [address]

Subject: Tenancy documents - [address]

Dear [tenant first name(s)],

Your tenancy at [address] starts on [start date]. Thank you for signing the agreement and for your payment, which we have received. [Your holding deposit of £[amount] is being returned to the account it came from and will reach you by [date].]

Attached to this email are the documents you are entitled to receive before you move in. Please keep them:

1. Assured Periodic Tenancy Agreement (copy of the agreement you signed on DocuSign)
2. Mydeposits deposit protection certificate, reference [deposit number], and the prescribed information
3. Mydeposits scheme leaflet and information for tenants
4. The government's Renters' Rights Act Information Sheet 2026
5. Electrical installation condition report, valid to [date]
6. [Gas safety record, valid to [date]]
7. Energy performance certificate, rating [rating], valid to [date]
8. [Selective licence, [council], valid to [date]]
9. [Fire safety information and emergency procedures for [block]]
10. Required Document Checklist
11. [Inventory and schedule of condition]

In a moment you will receive two short documents from DocuSign: the Required Document Checklist, which lists everything attached to this email, and the deposit protection certificate. [Landlord name] signs first, then you. Signing the checklist confirms that you have received the documents in this email.

[Team member name] will meet you at the property on [start date] at [time] to hand over the keys. They will bring a printed copy of these documents for you to sign in ink as well, test the smoke and carbon monoxide alarms with you, and take the meter readings.

Kind regards,
[name], Property Sauce
Top Floor, 55 Coopers Lane, Leyton, London E10 5DG
02081588434, admin@propertysauce.co

### C1: Required Document Checklist (replaces the 2023 wording; for Damian's approval)

Required Document Checklist
Each tenant signs this form at the start of the tenancy.

Property: [address]
Tenancy start date: [start date]
Landlord: [Established Landlord]
Landlord's agent: Property Sauce, Top Floor, 55 Coopers Lane, Leyton, London E10 5DG, admin@propertysauce.co, 02081588434
Tenant(s): [names]
Tenant's email address for service: [email]

We, the tenants, confirm that we were sent a copy of each of the following by email from Property Sauce on [date of P1], before the tenancy started:

- Assured Periodic Tenancy Agreement
- Mydeposits deposit protection certificate and prescribed information
- Mydeposits scheme leaflet and information for tenants
- Renters' Rights Act Information Sheet 2026
- Electrical installation condition report
- Gas safety record [or: not applicable, no gas at the property]
- Energy performance certificate
- Selective licence [or: not applicable]
- Fire safety information and emergency procedures for the building [or: not applicable]
- Inventory and schedule of condition [or: photographs taken at move-in]

Service by email: by giving the email address above, the tenant agrees that the landlord or its agent may send the documents listed here, and serve notices and other documents about this tenancy, by email to that address, as clause 7.2 of the tenancy agreement provides. Notices sent by email before 4.30pm on a working day are treated as served at that time, otherwise on the next working day (clause 7.3).

Alarms: the tenant confirms that the smoke alarms and, where fitted, the carbon monoxide alarms were shown to be working on the day the tenancy started.

Tenant signature / print name / date, for each tenant. Landlord signature / print name / date.

### D1 to D4: DocuSign envelopes

| Envelope | Document | Subject | Recipient 1 (routing 1) | Recipient 2 (routing 2) | Tabs |
|---|---|---|---|---|---|
| D1 (Ops 01 step 7a) | Holding deposit form H1 | [address] - Holding deposit | Landlord signer | Each applicant | Signature, date |
| D2 (step 3) | Assured Periodic Tenancy Agreement | [address] - Assured Periodic Tenancy Agreement | Landlord signer | Each tenant, guarantor if required | Signature, date, initials every page |
| D3 (step 7) | Required Document Checklist C1 | [address] - Required Document Checklist | Landlord signer | Each tenant | Signature, print name, date |
| D4 (step 7) | Mydeposits deposit protection certificate | [address] - Deposit Protection Certificate | Landlord signer | Each tenant | Signature, date |

Landlord signer: Damian on his personal email for Sure Lets and Manage Limited, or the third-party landlord's signer per section 10. Sender: the DocuSign account user (info@propertysauce.co today). Every completed envelope's PDF and certificate of completion go on the Tenant record and in the tenancy folder.
