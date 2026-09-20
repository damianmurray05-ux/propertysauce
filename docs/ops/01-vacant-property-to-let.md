# Ops 01: Vacant property to let

Scope: marketing, OpenRent listing, rent setting, enquiries, pre-qualification, viewings, the full document checklist, Homelet referencing, the tenancy agreement, first payment, deposit registration, the document pack and tenancy checklist, keys and move-in day.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 1 chat. Sections 4 and 10 and the templates at the end are waiting for Damian's approval. The trigger (a tenant's notice) is Ops 09; the enquiry capture is Ops 03; the works before move-in are Ops 05; the certificates sent at move-in come from Ops 07; the rent invoice it creates is then run by Ops 04. Ops 02 (tenant paperwork and due diligence) is the legal detail behind steps 12 to 15 here: right to rent, prescribed information, How to Rent guide, inventory.

## 1. What this operation covers

A property is about to be empty. Nine times in ten it is one we already manage and the sitting tenant has given notice (Ops 09 hands over the same day). The tenth time it is a property just bought and refurbished. Either way this operation takes it from "to let" to "tenant in, rent and deposit banked, everything signed and on the record" with as few vacant days as possible. It writes the ad and puts it on OpenRent, works the enquiry database, pre-qualifies every applicant before anyone drives to a viewing, books the viewings with the person who covers that area, collects the full document set from the serious applicants, runs Homelet referencing, issues the tenancy agreement through DocuSign (landlord first, then tenant), takes the first payment only after signing, registers the deposit, sends the property's documents and the tenancy checklist from Zoho CRM, gets the checklist and deposit certificate signed through DocuSign, sets the tenant up in Zoho CRM and Zoho Books, confirms the property is ready, and arranges the key handover. The people involved: Damian (landlord signer and decisions), the office (Usman, Ezad), the viewers (Dave and Ali at Lancaster House, Ali at Catterick House, Rauf in London), the area contractor for the turnaround (Ops 05), and Homelet, DocuSign and Mydeposits as outside services.

## 2. How it is done today

Damian's account, 19 September 2026, with the office spreadsheet "Moving a Tenant into Property Step by Step Process" and the three training videos (OpenRent, deposit protection, DocuSign deposit certificate) in the Drive folder linked from the letting skill:

- The Landlord record for the property in Zoho CRM is marked To Let. If a tenant has given notice, their suggested vacate date goes on the Tenant record (Ops 09 does both).
- The property goes on OpenRent. London properties get their own ad each time; Catterick House and Lancaster House have permanent ads.
- Everyone on the database of potential tenants is contacted to ask if they are still looking.
- Every applicant, from OpenRent or the database, gets the same template email before any viewing. It asks whether they are still searching and runs them through the first acceptance questions: CCJs, annual income and so on, a handful of questions, plus basic documents such as a passport or driving licence, and proof of right to rent if they do not hold a UK passport. Pre-qualification saves the office time later. Nobody in the office does a viewing for someone who has not pre-qualified.
- Viewings are booked with the person who covers the area: Dave and Ali for Newcastle (Lancaster House, Cramlington), Ali for Catterick House, Rauf for London. If the outgoing tenant is still in, the viewing is arranged through them, because Ops 09 already asked them for viewing times when their notice was accepted. This saves Vera in particular a lot of time: London properties are hard to get round from the office, whereas Dave and Ali are on site. Each viewing is confirmed three ways: with the team member in the Slack channel, with the sitting tenant if there is one, and with the applicant.
- After several viewings, when two or three people are keen, they get the second checklist: employment history, bank statements and the rest. Once that is in, referencing runs through Homelet.
- A pass means the paperwork starts. The rule that governs the order: no money is asked for until the tenant has signed the tenancy agreement. The agreement goes out on DocuSign first. It states the date the first payment is due, which is before move-in and usually a couple of days after signing. Usually two months' money: one month's rent up front and one month's deposit.
- Once the money is in, the deposit is registered with Mydeposits. The deposit certificate, every certificate for the property (EPC, electrical, landlord licence, gas safety and so on) and the tenancy checklist are sent to the tenant from Zoho CRM, in one email written so that it says "attached are X, Y and Z, and the tenancy checklist will follow on DocuSign for you to sign to confirm you have received the documents attached to this email". It has to go from Zoho CRM so the record is kept. Then the tenancy checklist and the deposit certificate go on DocuSign for signature. Signing the checklist is the tenant's admission that they received that email.
- Every DocuSign envelope has the landlord as first signer and the tenant second. That order is how Damian checks for mistakes before anything reaches the tenant. Same for the agreement, the deposit certificate and the checklist.
- By move-in day: the agreement is signed by landlord and tenant on DocuSign; the money (usually two months) is in the bank; the tenant's profile exists in Zoho CRM and Zoho Books with a recurring invoice; all the property documents and the checklist have gone from CRM and been signed on DocuSign. The move-in date is the date on the agreement and is arranged with the team member who did the viewing. The office spreadsheet adds that the team member also takes a pen signature on the agreement on the start date and hands over the keys afterwards.
- All the while the property must be fit and habitable: maintenance, cleaning, painting, decorating and rubbish removal finished before the move-in date, confirmed by the maintenance person for the area.
- What goes wrong: viewings done for people who would never pass referencing; money taken before signing (the old spreadsheet took a holding deposit at step 5, which the new rule stops); documents sent from a personal mailbox so there is no record; a DocuSign sent to the tenant before Damian has checked it; the tenant arriving to a property that is not ready.

## 3. Systems and records touched

**Zoho CRM, Landlord (Accounts) record** (one per property). `Status` To Let from the day of notice or completion, Let Agreed once a reference has passed and the agreement is out [confirm the picklist has that value: section 10], Rented on move-in. `Occupied` Vacant or Occupied. `Monthly_Rent` is the asking rent for the ad and the new rent once let. `Inspection_Area` decides the viewer. `Established_Landlord` decides who signs and who approves (README rule 4). The certificate date fields (`Gas_Safe_Certificate`, `NICEIC_Certificate`, `EPC_Expiry`, `Landlords_Property_License`) are read at step 13 and every one must be in date before a tenancy starts (Ops 07). `Existing_Tenant`, `Tenants_Name`, `Tenants_Phone`, `Tenants_Email`, `Tenancy_Start_Date`, `Tenancy_End_Date` are rewritten for the new tenant at step 15.

**Zoho CRM, Tenant (Contacts) record.** Applicants are created here as soon as they pre-qualify, with `Status` Applicant [Ops 03 open question 4 recommends this; until the value exists, a note "Applicant for <address>" and the Landlord lookup], so the successful one becomes the Tenant record without re-keying and the unsuccessful ones are the database for next time. Filled at step 15: `Rent`, `Rent_Due_Date`, `Deposit`, `Deposit_Scheme` Mydeposits, `Deposit_Number`, `Deposit_Held_By`, `Deposit_Statue`, `Tenancy_Type`, the tenancy checklist dates, `Sets_Of_Keys`, `Electric_Meter_Reading_In`, `Gas_Meter_Reading_In`, `Water_Meter_Reading_in`, `Status` Tenanted. Every email to an applicant goes from the record with Send Email so it is on the file. Right-to-rent evidence, referencing report, signed agreement, deposit certificate and signed checklist are attached to the record and filed in the tenancy folder in Drive.

**Zoho Books, Property Sauce organisation 678590019.** One customer per tenancy named "<address> - <tenant name>", one recurring invoice for the rent on `Rent_Due_Date`, and a one-off invoice for the first month and the deposit so the incoming payment matches in the bank feed (Ops 04). The MCP connector can create a contact and an invoice; creating a recurring invoice goes through the website's Zoho key (Ops 04 facts) or a person until that is built.

**OpenRent.** No connector. The ad copy, photos, rent and criteria are written by Claude and posted by a person or by Claude in Chrome on Damian's logged-in session (section 10). Enquiries arrive by email to contact@propertysauce.co and are captured by Ops 03. London: one ad per property, placed at notice and taken down at let agreed. Catterick House and Lancaster House: permanent ads.

**The database of potential tenants.** Every applicant record in Zoho CRM with `Status` Applicant that did not get a property, plus the OpenRent enquiries Ops 03 has captured. Filtered by building or area and by the date of their last contact; nobody older than [six] months is contacted without a fresh pre-qualification.

**Homelet.** No connector. References are ordered on the Homelet portal by a person, or by Claude in Chrome on the office login (section 10), from the document set collected at step 9. The report comes back by email and is filed on the Tenant record.

**DocuSign.** Account "Damian Murray" (a61a0a50-553e-4192-990c-a0645f74c7c3, eu.docusign.net), connected to this session as Usman Tufail, info@propertysauce.co. The account has no saved templates: every envelope is built from the documents. Claude can create and send an envelope; the landlord is always recipient 1 with routing order 1 and the tenant recipient 2 with routing order 2, so nothing reaches the tenant until the landlord has read and signed it. Three envelopes per let: the tenancy agreement, the deposit certificate, the tenancy checklist. Signed copies are pulled back and filed on the Tenant record and in Drive.

**Mydeposits.** Registered by a person in the portal within 30 days of receipt (Ops 02 has the prescribed-information duty). The certificate PDF is downloaded and attached to the Tenant record.

**Bank.** The first payment is matched in the Zoho Books bank feed (Ops 04). Bank details go to the tenant only inside the agreement or the CRM email, never in a text, and never from memory (README rule 7).

**Slack.** #vacant-properties (C0C2X7E7X5K) is the register; this operation posts every stage change in the property's thread and edits the Status line (Listed, Viewings booked, Let agreed, Re-let). Viewings are posted in the same thread with the viewer tagged: Ali U0BUVS5KGDT, Dave U0BUNS8TWER, Rauf [no Slack ID yet: section 10]. Works before move-in go through the area maintenance channel (Ops 05). Anything urgent to #claude-urgent (C0BTPPZ3JJE).

**Email.** Enquiries in through contact@propertysauce.co (Ops 03 and Ops 08). Everything to an applicant or tenant out from their Tenant record in Zoho CRM. Homelet and Mydeposits correspondence in the propertysauce mailbox, filed to the record.

**Drive.** One tenancy folder per let under the property's folder: ad copy and photos, the pre-qualification replies, the document set, the Homelet report, the three signed DocuSign envelopes, the deposit certificate, the pen-signed agreement from move-in day (skill: pen-signed tenancy filing), the check-in inventory and meter photos.

**Law this operation relies on.** Renters' Rights Act 2025 (tenancies periodic from 1 May 2026; the agreement must be in writing; no rent may be taken before the agreement is signed and no more than one month's rent in advance; no rental bidding above the advertised rent; no blanket ban on children or benefit claimants; the new template is the Assured Periodic Tenancy Agreement, Ops 11 section 3). Tenant Fees Act 2019 (deposit capped at five weeks' rent where the annual rent is under £50,000, so "one month" is within the cap; no fees for referencing or paperwork; a holding deposit of at most one week's rent is the only money that may be taken before signing, and Damian's rule is that we do not take one). Immigration Act 2014 right-to-rent check on every adult before the tenancy starts (Ops 02). Housing Act 2004 deposit protection and prescribed information within 30 days (Ops 02). [Re-read the Act's advance-rent section before first live use: section 10.]

## 4. Decision limits

Claude may, without asking anyone:

- Write the OpenRent ad and set the asking rent by the Ops 11 evidence rule: the last new let of the same type in the same building or street, three current listings within a mile in the last 60 days, and the ONS regional figure, taking the middle of the evidence. Post the figure and the evidence in the property's #vacant-properties thread before the ad goes live. If Damian has not objected by the next working day, the ad goes live at that figure.
- Contact everyone on the database for that building or area, and send E1 (pre-qualification) to every enquiry within one working hour in office hours, the next morning otherwise.
- Decide who pre-qualifies against the written criteria in step 5 and book viewings for them with the area viewer, the sitting tenant and the applicant, giving the sitting tenant at least 24 hours' written notice.
- Send E2 (full document checklist) to any applicant who viewed and asked to proceed, and chase it twice.
- Prepare the Homelet order from the documents, and order it once the office confirms the login is Claude's to use (section 10); otherwise put the prepared order in the thread for a person to submit.
- On a clear Homelet pass at the advertised rent with no conditions: draft the agreement from the approved template with the property, parties, rent, deposit, start date and payment date filled in, and send the DocuSign envelope to the landlord as first signer. The landlord's signature is the person gate (README rule 2); the tenant sees nothing until then.
- After the tenant has signed: send the payment request with the amount and date from the agreement; watch the bank feed; when it matches, tell the tenant and the viewer.
- Prepare the Mydeposits registration for a person to submit; once the certificate is on the record, send E3 (the document pack) from the Tenant record and the two DocuSign envelopes, landlord first.
- Create the Tenant record, the Books customer, the first invoice and (once built) the recurring invoice.
- Confirm the property is ready with the area contractor and arrange the key handover with the viewer.
- Tell the unsuccessful applicants (E5) once the tenant has signed, and keep them on the database.

Needs a person:

- The asking rent where Damian objects in the thread, or where the evidence is thinner than one new let plus two listings: Damian.
- Which applicant gets the property when more than one passes: Damian, with Claude's one-page comparison. A third-party landlord (Established Landlord not Damian, his wife or their companies) chooses from the same summary. The choice must rest on the criteria in step 5 and the summary records the reason; nothing about children, benefits, nationality, disability or any other protected characteristic is a reason (section 3 law).
- Any Homelet result other than a clear pass: a fail, a pass with a guarantor condition, a pass at a lower rent, a discrepancy between what the applicant said in E1 and what the documents show: Damian.
- Any change to the template agreement, any special clause, any rent, deposit or payment date other than the standard: Damian.
- Any request to pay less than a month up front, to pay after move-in, to pay in cash, or to have someone else pay: Damian.
- The deposit registration and the prescribed information: a person in the Mydeposits portal (README rule 2).
- Keys handed over before the money has cleared or before all three envelopes are signed: never; if it is asked for, Damian.
- A property whose certificates are not all in date on the planned move-in date: the move-in does not happen until Ops 07 has the certificate; Damian is told the day it is found.
- Posting to OpenRent and ordering Homelet, until the browser access in section 10 is agreed: a person, from Claude's draft.

## 5. The procedure, step by step

**Step 1. Trigger.** Ops 09 hands over on the day a notice is accepted (Landlord `Status` already To Let, suggested vacate date on the Tenant record, register message in #vacant-properties, sitting tenant's viewing times in the thread). Or Damian tells the Ops 1 routine that a purchase has completed and the refurbishment date, and Claude sets `Status` To Let and posts the register message itself. Open the tenancy folder in Drive.

**Step 2. Rent and criteria, same day.** Work out the asking rent by the evidence rule in section 4 and post it in the thread with the three comparables. Write the criteria for this property from the Landlord record and the last tenancy: number of occupants, pets (yes with a pet clause unless the landlord has a written reason), smoking, and the income test in step 5. Note the earliest start date: the day after the suggested vacate date plus the turnaround target from Ops 09 (five working days), or the refurbishment finish date.

**Step 3. The ad, live within one working day of the trigger.** London: write the OpenRent ad (headline, description in plain English, rent, deposit as "one month's rent", available date, furnishing, council tax band, EPC rating from the record, criteria, photos from the last inspection or from a photographing visit booked with the viewer). Post it, or put the copy and photos in the thread for the office to post. Catterick House and Lancaster House: check the permanent ad still shows the right rent and availability, and update it if not. Thread Status: Listed. Rightmove and Zoopla are not used today (section 10).

**Step 4. The database, same day.** Pull every Applicant record for the building or area contacted in the last [six] months, and the Ops 03 enquiries for the same, and send E1 to each from their record. E1 doubles as the pre-qualification, so nobody is booked from the database without answering it.

**Step 5. Pre-qualify every enquiry.** Every OpenRent enquiry that Ops 03 captures gets E1 within one working hour in office hours. E1 asks:

1. Are you still looking, and when do you want to move?
2. Who will live there (adults and children) and any pets?
3. Your employment: employer, role, how long, and your gross annual income (and the same for anyone else whose income will pay the rent)?
4. Any CCJs, IVAs, bankruptcy or rent arrears in the last six years?
5. Do you have a UK or Irish passport? If not, what right-to-rent document do you hold?
6. Will you need a guarantor?
7. A copy of your passport or driving licence, and your right-to-rent share code if you are not a UK or Irish citizen.

Pass if: they want to move within the availability window; the household fits the property; combined gross income is at least [30] times the monthly rent (or a guarantor with [36] times), or they are on benefits with a guarantor or a rent-in-advance arrangement Damian has agreed; no undischarged CCJ or bankruptcy (a discharged or explained one is put to Damian, not refused); and right to rent is evidenced or a share code is given. Record the answers as a note on the Applicant record ("Pre-qualified <date>: <summary>" or "Did not pre-qualify: <reason>"). Nobody who has not passed is booked. Anyone who does not answer within three working days is chased once and then left on the database.

**Step 6. Book the viewing, within three working days of pre-qualifying.** The viewer by area: Lancaster House (Cramlington, "Newcastle") Dave and Ali; Catterick House (Rotherham) Ali; London Rauf. [Blackpool, Saffron Walden and Essex: section 10.] Offer the applicant two slots taken from the sitting tenant's stated times (or the viewer's diary if empty), and group viewings on the same day where several applicants are ready. Confirm three ways, the same day: (a) in the property's #vacant-properties thread tagging the viewer, with the applicant's name, mobile, slot and what they were told; (b) to the sitting tenant by email from their Tenant record, at least 24 hours ahead; (c) to the applicant, E4, from their record. The day before, remind all three. Thread Status: Viewings booked. Record the outcome the viewer posts in the thread on the Applicant record: viewed, keen, not keen, no-show.

**Step 7. Second stage, when two or three applicants say they want to proceed.** Send E2 from each record: the full checklist (three months' bank statements, three months' payslips or the last SA302 and accounts if self-employed, employer's details for a reference, current landlord's details for a reference, five years' address history, photo ID, right-to-rent evidence, guarantor's details and the same documents for them if needed). Chase at two and five working days. Everything received goes on the record and in the tenancy folder. Check it against E1: a difference in income, employer or address history goes to Damian before referencing.

**Step 8. Choose who to reference.** If only one applicant has completed E2, reference them. If more than one has, give Damian (and the third-party landlord where there is one) a one-page comparison in the thread: move date, household, income multiple, employment, references, guarantor, anything to explain. Damian names the applicant to reference first; the others are told they are second in line and their documents are held for [14] days.

**Step 9. Homelet referencing, within one working day of a complete document set.** Order the full reference (credit, employer, previous landlord, affordability at the advertised rent, guarantor if any). Tell the applicant it is running and what Homelet will ask them to do. The report comes back by email; file it on the record and in the folder. Clear pass at the rent with no conditions: go to step 10. Anything else: Damian, with the report and Claude's recommendation. A fail is told to the applicant by E5 the same day Damian confirms, without the reasons Homelet gives beyond what the law requires us to disclose, and their record stays on the database marked "Referencing failed <date>".

**Step 10. The tenancy agreement, within one working day of the pass.** Draft from the approved template (Assured Periodic Tenancy Agreement for new lets since May 2026; Ops 11 section 3 and Ops 02 hold the template and the clause notes): property, landlord entity per `Established_Landlord`, all adult tenants named, rent, `Rent_Due_Date`, deposit (one month's rent, stated in pounds and within the five-week cap), start date agreed with the applicant, and the first-payment date (rent for the first month plus the deposit, due before move-in, normally two days after signing), the bank account from Zoho, and the standard clauses only. Create the DocuSign envelope: recipient 1 the landlord signer (Damian, or the third-party landlord), recipient 2 each tenant, sequential routing. Nothing is asked of the tenant for money at this step. Post in the thread: "Agreement sent to landlord for signature". Thread Status: Let agreed. Landlord `Status` Let Agreed. London: take the OpenRent ad down or mark it let agreed.

**Step 11. Landlord signs, then tenant signs.** Damian reads and signs, which is his check; if he finds a mistake he declines and the envelope is corrected and re-sent. DocuSign then routes to the tenant. Chase the tenant at two and four working days. When all parties have signed, pull the completed PDF and certificate of completion to the record and the folder.

**Step 12. First payment.** Only now, send the payment request from the Tenant record: the amount (first month's rent plus deposit as the agreement states), the date, the account and the reference to use ("<surname> <flat>"), and what happens next. Raise the matching one-off invoice in Zoho Books so the bank feed matches. Watch the feed; when the money is in, note "First payment received <date> £x" on the record and post in the thread. If it has not arrived by the date in the agreement, chase the same day and tell Damian; the move-in date does not stand until it has cleared.

**Step 13. Deposit and the document pack, within five working days of the money clearing and always before move-in.** A person registers the deposit with Mydeposits from the record's figures and downloads the certificate and prescribed information (Ops 02). Attach both to the record. Then check every certificate on the Landlord record is in date on the start date (gas safety, EICR, EPC, licence where required; Ops 07 fixes any gap first). Send E3 from the Tenant record with attachments: the deposit certificate and prescribed information, gas safety certificate, EICR, EPC, landlord licence where applicable, the How to Rent guide (current version), and the tenancy checklist, written as Damian specified: the attachments are listed by name, and the tenant is told the tenancy checklist will follow on DocuSign for them to sign to confirm they have received everything in this email. Then create two DocuSign envelopes, landlord first, tenant second: the deposit certificate, and the tenancy checklist. Chase at two and four working days. All three completed envelopes are on the record before keys are handed over.

**Step 14. The property is ready.** From the day of the trigger the turnaround runs through Ops 05 and Ops 09 step 14 (paint, clean, repairs, rubbish, keys cut to the standard set count). Three working days before the start date, ask the area contractor in the maintenance channel to confirm in the thread that the property is clean, empty of the last tenant's things, every job closed, and to post photos of every room and the meters. If anything is outstanding, book it now and, if it cannot be done in time, tell Damian and the tenant the same day and agree a new start date in writing (the agreement is amended by a signed variation, not a verbal promise).

**Step 15. Set the tenant up in the systems, before move-in.** Tenant record: `Status` Tenanted, `Rent`, `Rent_Due_Date`, `Deposit`, `Deposit_Scheme`, `Deposit_Number`, `Deposit_Held_By`, `Deposit_Statue`, `Tenancy_Type`, checklist dates, `Sets_Of_Keys`; rename `Last_Name` to "<address> - <tenant name>" in the house style. Landlord record: `Existing_Tenant`, `Tenants_Name`, `Tenants_Phone`, `Tenants_Email`, `Tenancy_Start_Date`, `Monthly_Rent`, `Status` Rented and `Occupied` Occupied on the start date. Zoho Books: customer "<address> - <tenant name>", recurring invoice for the rent on `Rent_Due_Date` starting from the second month (the first is on the one-off invoice), so Ops 04 chases from month two. Send the tenant the welcome message: the website assistant for maintenance, the office number, who their area contact is, and how rent is paid each month.

**Step 16. Move-in day.** The viewer (Dave or Ali, Ali, or Rauf) meets the tenant at the property at the agreed time: takes the pen signature on a printed copy of the agreement (filed under the pen-signed tenancy filing skill), reads and photographs the meters with the tenant, completes the check-in inventory with photos, counts out the keys against `Sets_Of_Keys`, and posts all of it in the thread. Claude writes `Electric_Meter_Reading_In`, `Gas_Meter_Reading_In`, `Water_Meter_Reading_in`, attaches the inventory and photos, tells the utilities and the council the new occupier and start readings, and tells a third-party landlord (T-style letter from Ops 09 step 12 in reverse: tenant in, rent, deposit reference, start date). Thread Status: Re-let (moved in <date>), ✅ on the register message. Tell the runners-up (E5) if not already told. This file is closed for that property.

## 6. Escalation

- No enquiries within seven days of the ad going live, or no pre-qualified applicant within 14 days: Damian, with the enquiry count and a price recommendation (Ops 09 has the same 14-day flag).
- Viewer does not confirm a viewing in the thread by the day before: chase in the thread, then Damian; the applicant is never left to arrive at an empty property.
- Sitting tenant refuses viewings or is unreachable: Damian; Ops 09 governs what the agreement lets us do.
- Difference between E1 answers and E2 documents, or any suspicion of forged documents or a share code that does not check out: Damian the same day, and the applicant is not referenced until resolved.
- Homelet anything other than a clear pass: Damian.
- Landlord (third party) silent 48 hours on the applicant choice or the envelope: chase, then Damian.
- First payment not received by the agreement date: Damian the same day.
- Certificate not in date on the start date, or property not ready three working days before: Damian and the tenant the same day.
- Any request for money before signing, cash, or payment from a third party; any request to change the template: Damian.
- Anything safety-related found at the pre-move-in check: #claude-urgent.

## 7. Done when

For the property: ad live within one working day of the trigger; every enquiry answered with E1 within one working hour in office hours; nobody viewed who had not pre-qualified; a Homelet reference ordered within one working day of a complete document set; the agreement issued within one working day of a pass; no money requested before the tenant signed; first month and deposit cleared before move-in; deposit registered and the certificate on the record; E3 sent from the Tenant record with every certificate and the checklist; all three DocuSign envelopes completed, landlord first; Tenant record, Landlord record, Books customer and recurring invoice all in place; property confirmed ready with photos; pen-signed agreement, inventory and meter readings filed on move-in day; register message ticked. Measured per let: days from trigger to ad live (target 1), days from first viewing to let agreed (target 10), days from let agreed to move-in (target 10), vacant days (target 0 where notice was two months).

## 8. Cowork routine

Trigger: the Ops 09 hand-off, Damian's completion notice, and three schedules on the Property Sauce Cowork routine.

- *Every working day 08:00 and 13:00.* Read Ops 03's new enquiries and the propertysauce mailbox for replies to E1, E2, Homelet and DocuSign; send E1 to new enquiries; grade E1 replies and book viewings; chase E2; check DocuSign envelope status and chase; check the bank feed for first payments; for every property at Let agreed, check the certificates and the turnaround against the start date. Report every action in the property's thread and in the Ops 1 daily report line to Damian: properties to let, enquiries, viewings booked, applications in progress, envelopes waiting on whom, move-ins this week.
- *Every working day 17:00.* Viewing reminders for tomorrow to viewer, sitting tenant and applicant; day-before reminders to viewers for move-ins.
- *Every Monday 08:00.* With Ops 09's summary: every property To Let or Let Agreed, days on the market, enquiries and viewings to date, next action and who it is waiting on; anything past 14 days without a pre-qualified applicant flagged.

Inputs: the Landlord and Tenant records, #vacant-properties threads, the propertysauce mailbox, the tenancy folder, DocuSign envelope status, the Zoho Books bank feed. Nothing in this routine sends a DocuSign envelope to a tenant, submits a Homelet order or registers a deposit without the person gate in section 4.

## 9. Test plan

The next property to come vacant, whichever it is. For that one let, from trigger to move-in, every step is run by the routine but every email, ad, Slack post, envelope and CRM change is reported in the Ops 1 chat before it goes, and Damian sees E1, E2, E3, E4 and E5 as they are sent and the agreement before it reaches DocuSign. The OpenRent posting, the Homelet order and the Mydeposits registration are done by a person in that test and observed. Switch on for everyone once one let has gone from trigger to move-in with nothing corrected.

Before the test, this chat builds: the E1 to E5 templates as Zoho CRM email templates on the Tenant module; the Applicant status (or note convention) on Contacts; the DocuSign envelope call with landlord-first routing for the three documents; the agreement fill from the approved template; the one-page applicant comparison; the Books customer, first invoice and recurring invoice through the website's Zoho key; the rent-evidence lookup shared with Ops 11; and the thread Status edits in #vacant-properties.

## 10. Open questions

- **No money before signing.** The office spreadsheet's step 5 takes a holding deposit before referencing. Damian's rule today is that nothing is requested until the agreement is signed, which also matches the Renters' Rights Act's advance-rent rule. This file follows Damian. Confirm the spreadsheet is retired and the office told.
- **Rauf.** Named today for London viewings. He has no Slack account, Zoho Team record or number on file. Supply them, or say whether Vera covers London until then. Also confirm "Rauf" is the spelling.
- **Other areas.** Blackpool, Saffron Walden (Sky) and Essex were not mentioned. Who views there?
- **Lancaster House.** Damian said Dave and Ali for Newcastle today; Ops 09 has an open conflict between Dave and Ali for turnarounds. Assumed both can view and the thread post tags whoever is free first. Confirm.
- **Income test.** [30] times the monthly rent in gross annual income, [36] with a guarantor, proposed as the pre-qualification line. Confirm the multiples, and the rule for applicants on benefits (guarantor, or a rent-in-advance arrangement within the one-month limit).
- **Applicant status.** Add "Applicant" to the Tenant `Status` picklist (Ops 03 open question 4) so the database is a filter rather than a note search. Confirm, and Ops 03's chat or this one adds it.
- **Let Agreed on the Landlord record.** Confirm the Landlord `Status` picklist has (or should have) Let Agreed between To Let and Rented.
- **Browser access.** OpenRent and Homelet have no connectors. Should Claude post ads and order references in Chrome on the office logins, with the action reported in the thread each time, or does a person keep those two clicks?
- **DocuSign account.** The connector signs in as Usman (info@propertysauce.co) on the "Damian Murray" account. Envelopes will be sent from that user. Confirm that is right, and whether the templates should be saved in DocuSign so the tabs (signature, date, initials) are fixed rather than placed each time.
- **Deposit scheme.** Damian said Mydeposits today; Ops 09 records Mydeposits or TDS on existing records. New lets go to Mydeposits unless told otherwise. Confirm.
- **Database age.** Six months since last contact proposed as the cut-off for re-contacting an old applicant without a fresh E1. Confirm.
- **Runner-up hold.** Fourteen days proposed for holding the second applicant's documents. Confirm.
- **Rightmove and Zoopla.** Named in the scope line but not used today. Leave out until Damian says otherwise?
- **Law check.** The advance-rent and rental-bidding points in section 3 are from summaries of the Renters' Rights Act 2025, not the Act. Re-read on legislation.gov.uk before the first live let and correct this file if needed.
- **Third-party landlords.** For a property whose Established Landlord is not one of ours, does the landlord sign the agreement on DocuSign as recipient 1, or does Sure Lets and Manage Limited sign as agent? The template's landlord clause decides; confirm per landlord.

## Templates

All go from the Applicant or Tenant record with Send Email so they sit on the file. Square brackets are merge fields. Sign-off is the office: Property Sauce, contact@propertysauce.co, the office number, and a named person. No bank details in E1, E2, E4 or E5.

### E1: Are you still looking, and a few questions first

Subject: [address]: available from [date], a few quick questions

Dear [first name],

Thank you for your interest in [address], which is available from [available date] at £[rent] a month with a deposit of one month's rent.

Before we book a viewing we ask everyone the same short questions, so that we only take up your time (and our viewer's) if the property is a realistic match. Please reply to this email with:

1. Are you still looking, and when would you like to move in?
2. Who will live at the property (adults and children), and do you have any pets?
3. Your employer, your role, how long you have been there, and your gross annual income. If someone else's income will help pay the rent, the same for them.
4. Any CCJs, IVAs, bankruptcy or rent arrears in the last six years? A yes is not automatically a no from us, but we need to know now.
5. Do you hold a UK or Irish passport? If not, which right-to-rent document do you have?
6. Will you need a guarantor?
7. Please attach a copy of your passport or driving licence, and if you are not a UK or Irish citizen, your right-to-rent share code from gov.uk.

We reply within one working day. If the answers fit the property we will offer you two viewing times straight away.

Kind regards,
[name], Property Sauce

### E2: Documents we need to proceed

Subject: [address]: next step, the documents we need

Dear [first name],

Thank you for viewing [address] and for telling us you would like to go ahead. The next step is referencing, which we run through Homelet. To start it we need the following from you [and from your guarantor], by reply to this email or by upload to the link below:

1. Bank statements for the last three months, all pages.
2. Payslips for the last three months, or if you are self-employed your last SA302 and accounts.
3. Your employer's name, address, email and phone for an employment reference.
4. Your current landlord's or agent's name, email and phone for a landlord reference.
5. Your address history for the last five years, with dates.
6. Photo ID (passport or driving licence) if not already sent.
7. Right-to-rent evidence: UK or Irish passport, or your share code and date of birth.
8. [Guarantor's full name, address, email, phone and the same documents.]

Nothing is paid at this stage, and referencing costs you nothing. Once Homelet confirms the reference we will send you the tenancy agreement to read and sign online, and the agreement will state what is due and when. Please do not send any money until you have signed the agreement.

We will confirm receipt of each item and tell you when the reference has been ordered.

Kind regards,
[name], Property Sauce

### E3: Your tenancy documents for [address]

Subject: [address]: your tenancy documents, and one form to sign

Dear [first name],

Your tenancy at [address] starts on [start date]. Attached to this email are the documents you are entitled to receive before you move in:

- Deposit protection certificate and prescribed information (Mydeposits, reference [deposit number])
- Gas safety certificate dated [date]
- Electrical installation condition report dated [date]
- Energy performance certificate, rating [rating], valid to [date]
- [Landlord licence, [council], valid to [date]]
- The government's How to Rent guide, current edition
- Tenancy checklist

In the next few minutes you will receive the tenancy checklist and the deposit certificate from DocuSign. Please sign both. Signing the checklist confirms that you have received the documents attached to this email; the certificate needs your signature for the deposit scheme. [Landlord name] signs first, then you.

Once both are signed we will confirm your key collection with [viewer name], who will meet you at the property on [start date] at [time], take the meter readings with you and go through the inventory.

Kind regards,
[name], Property Sauce

### E4: Your viewing is booked

Subject: [address]: viewing on [day, date] at [time]

Dear [first name],

Your viewing of [address] is booked for [day, date] at [time]. [Viewer name] will meet you at the property; their mobile is [number] if you are running late. [The current tenant is still living there, so please be on time and let us know as early as you can if you cannot make it.]

If you want to go ahead after the viewing, reply to this email and we will send you the list of documents for referencing the same day.

Kind regards,
[name], Property Sauce

### E5: The property has been let

Subject: [address]: update

Dear [first name],

Thank you for your interest in [address]. The property has now been let to another applicant, and we are sorry not to have better news. We keep your details on file for [six] months and will contact you when another property in [area] comes up, or you can reply to this email at any time to tell us what you are looking for.

Kind regards,
[name], Property Sauce
