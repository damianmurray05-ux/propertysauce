# Ops 03: Tenant enquiries

Scope: maintenance, rent, certificates and general questions from tenants, by portal, email, phone and text. Also the lead side: where prospective tenants come from and how their enquiries are captured.

Status: dictated by Damian on 17 September 2026 and written up by the Ops 3 chat. Section 2 is his account in full, including the parts that belong to Ops 04 (rent), Ops 05 (maintenance) and Ops 07 (certificates); those files hold the detailed procedures and this file points to them. Section 5 is the intake procedure for this operation. The rent and certificate protocols Damian asked this chat to draft are in the appendix and wait for his confirmation; where they differ from the drafts in 04 and 07 the difference is listed in section 10 for him to settle.

Companion page (same content, formatted for the office): https://claude.ai/artifact/Th7mk8bQ5eNQe53MK5jWy8

## 1. What this operation covers

Every message from a tenant or a prospective tenant lands here first. Prospective tenants arrive from the OpenRent ads (and later the Facebook pages) and are captured as leads against the property or block they asked about. Existing tenants arrive with a maintenance problem, a rent question, a certificate or paperwork question, or something general. This operation identifies who they are, works out what they need, does the first-line work (a self-fix for a small repair, an answer to a simple question, the right form or document), and opens the right record so Ops 04, 05 or 07 carries it on. It does not book contractors (Ops 05), chase rent (Ops 04) or renew certificates (Ops 07), but it opens the door to all three.

## 2. How it is done today

Damian's dictation, 17 September 2026. His notes were pasted twice with paragraphs out of order; this is the untangled version with nothing left out.

### 2a. Where tenant enquiries come from, and advertising

- The majority of tenant enquiries come from the OpenRent advertisements.
- The London properties are each individual and unique. Each one only needs its own OpenRent ad placed as and when the existing tenant gives notice.
- Apart from new properties, the trigger for getting a property let is the existing tenant handing in notice.
- A new property is slightly different because it is vacant on purchase, so it is advertised straight away.
- For the block of flats at Catterick House and the block of flats in Newcastle (Lancaster House, Cramlington), an ad runs constantly. Turnover is relatively high, with one flat in each block becoming available every couple of weeks. The constant ad collects new leads every day. Their details are stored, and they are messaged as soon as a flat is ready to view.
- Damian is open to other advertising ideas. Once the Facebook page is built he is happy to advertise properties on it. He wants a Facebook page for each area where properties are advertised, and asked Claude to build them.

### 2b. Maintenance

- Tenants are to be told to use the website to report a maintenance job: go to the Property Sauce website, the "Report a Maintenance Job" tab, upload photos and a description of the issue.
- Claude examines the photos and tries to talk the tenant through fixing it themselves, or at least reduces the urgency of the job with its directions.
- Once the job is reported Claude opens a maintenance ticket in the Zoho CRM Maintenance module and messages the relevant contractor on the Slack channel:
  - Rocky covers all of the London area.
  - Sky covers the Saffron Walden area (Damian's dictation came through as "Southwark Walden"; read as Saffron Walden, to confirm).
  - Ali covers Catterick House, Lancaster House and Blackpool.
- Claude asks the tenant for potential inspection dates and times in working hours, Monday to Friday 9 to 5, sometimes Saturday, and any days or times that are no good for them. Claude then refers to the contractor's diary to find a date and time to suggest to the contractor.
- Claude structures the calendar and bookings so they work as efficiently as possible. This needs some kind of Google Maps connector. When booking a job in one part of London, if another job is available at the same property or in the same area, book it for the same time to reduce travelling and fuel. Once the list of jobs has been assessed and grouped so the contractor can visit two places in one trip (or, for Ali, two flats in Catterick House), book them in the same two-hour window.
- With confirmation from tenant and contractor that the date and time are acceptable, the job is confirmed to both and added to the contractor's diary. A main diary and a confirmation note also go to the office so they know what is going on.
- It is imperative that the contractor takes before and after pictures, uploaded through the website, landing directly in Google Drive under the relevant maintenance issue. Damian would accept them as photos in Zoho CRM under the issue instead, but worries Zoho charges more for storage than Drive; Claude is to assess that and set the protocol. Either way the contractor needs back-end access to the website chatbot to upload the photos.
- Once the job is complete Claude emails the tenant asking for confirmation that the job is done and they are satisfied. If they do not respond, Claude emails them regularly until it gets a response.
- If a job is not done, seems to be taking too long, and there is a chance the tenant will start to complain, Claude escalates to the office. The office assists with whichever area is causing the friction.

### 2c. Rent

- Once a tenancy is set up the monthly amount is known. The Zoho Books invoice goes to the tenant as a rent demand, payable to Property Sauce as managing agent. Property Sauce deducts its fees and sends the balance to the landlord.
- Claude chases the tenant if rent is not paid on time, and writes the protocol for what that looks like (for example day 1 of non-payment = text, day 2 = email, day 3 = phone call, and so on). Pressure is applied instantly to encourage prompt payment.
- Non-payment is seen in Zoho Books or the bank feed. Zoho Books is the main point of reference because it is connected to all the bank accounts. Tenant phone and email come from Zoho CRM.
- When the protocol is exhausted, the final step is handing the file to Marchbank Vale. Damian described them as "our legal representatives who chase tenants for non-payment and any other legal-related issue". (See section 10: they are an arrears recovery firm and must never be described to a tenant as solicitors or legal representatives.)
- At that stage Claude emails cases@marchbankvale.co.uk with a Google Drive link to a folder holding everything they need:
  - every piece of email correspondence downloaded as a PDF and placed in the folder;
  - a profile sheet for the tenant with all their contact details;
  - all PDFs related to the move: tenancy agreement, tenancy checklist, referencing, bank statements, passports;
  - a chronological list of events explaining the position as we understand it;
  - a Zoho Books statement showing all rent payments and rent demands.

### 2d. Certificates

- Certificates are a very important part of residential letting in the UK. All certificates must be constantly up to date and tenants given a copy of each new one.
- Gas Safe certificate: renewed every year. A copy is emailed to the tenant.
- Electrical certificate: generally lasts five years, so a new one is done before the old one expires, often with a week or two of overlap.
- Four weeks before a certificate is due, Claude emails the Gas Safe engineer for that area and emails the tenant to arrange the inspection, then chases the engineer for the certificate. Claude stores it as an attachment in Zoho CRM, uploads it to the Google Drive certificate folder, and emails a copy to the tenant.
- Important emails that may need to be relied on later are sent from the CRM: open the tenant profile in Zoho CRM, Send Mail, and the email is saved in the attachments section of that profile. Sending everything from there would be a mess, but for important ones (complaints for antisocial behaviour, a copy of a certificate, the initial tenancy agreement, and so on) it is the right place, because Gmail has no equivalent filter.
- Damian wants a protocol listing every certificate a property in the United Kingdom needs to be eligible for renting, so he can agree it and stamp it into company procedures. He wants an initial deep dive of each property now to confirm compliance, and a set of dates in a calendar so Claude always knows when the next certificate on any property is due.
- Damian's closing note: this was the third of fourteen operations to dictate, given first because Claude asked for it; he welcomes feedback and further questions.

## 3. Systems and records touched

- **Website** (propertysauce.co, repo ~/Projects/propertysauce): the "Report a Maintenance Job" page (tenant intake with photos and description), the tenant assistant, and a contractor upload route for before and after photos. Which of these exist today is confirmed in Ops 05's build list.
- **OpenRent**: the source of nearly all prospective-tenant enquiries. Per-property ads for London; permanent ads for Catterick House and Lancaster House. No connector; enquiries arrive by email to contact@propertysauce.co.
- **Facebook pages**: one per area, not yet created (section 10).
- **Zoho CRM** (single source of truth, README rule 1):
  - `Contacts` = Tenant: phone, email, `Rent`, `Rent_Due_Date`, `Tenants_Missed_Payment_Date`, tenancy dates, deposit fields, `Gas_Safe_Engineer`. Send Mail from this record for anything that may be relied on later.
  - `Accounts` = Landlord, one record per property: certificate expiry fields (`Gas_Safe_Certificate`, `NICEIC_Certificate`, `EPC_Expiry`, `Landlords_Property_License`, `Insurance_Expiry_Date`), `Gas_Safety_Applicable`, `Landlord_License_Exempt`, `Tenancy_Start_Date`, `Monthly_Rent`, `Sale_Date`.
  - `Leads` = Property: the acquisition pipeline, not the let portfolio. Prospective tenants are not Leads; where they are stored is an open question (section 10).
  - `Maintenance` custom module: `Maintenance_Ticket_Number`, `Tenant`, `Landlord`, `Contractor1`, `Maintenance_Issue` (tenant's description), `Maintenance_Issue1` (category), `Tenant_Preferred_Date_Time`, `Contractor_Preferred_Date_Time`, `Agreed_Date_Time`, `Attendance_1` to `Attendance_5`, `Job_Status`, `Appointment_Status`, `Date_Tenant_Signed_Off`, `Tenants_Star_Rating`, `Image_Upload_1` and `_2`. Already fits the dictated process; no new module needed.
  - `Team` module: contractors (polluted with estate agents, so search by record ID, see Ops 05).
- **Zoho Books**: rent invoices and the bank feed (Ops 04).
- **Slack**: #maintenance C0BSQHS6P55 (office overview); area channels #london-maintenance C0C21E4BH2Q, #catterick-maintenance C0C1ZMSNUFK, #maintenance-lancester-house C0C1T2RDPGV; urgent: #claude-urgent C0BTPPZ3JJE, #london-urgent C0BUVF090F9, #catterick-urgent C0C00FQ4EDA, #lancaster-house-urgent C0BVARB5N74. Ali is U0BUVS5KGDT. Rocky, Sky and Dave have no Slack account yet.
- **Google Drive** (admin@propertysauce.co): "Maintenance Pictures" folder 1aBuLh-Dig80w8YN9yg22GqaVB-8tjLWQ for before and after photos; a certificates folder per property (Ops 07); an arrears folder per tenant for the Marchbank Vale pack (Ops 04).
- **Google Calendar** (admin@propertysauce.co): "Property Sauce Maintenance", ID c_717d8d3325e94d1ec4638c85c1be489990eec542d8e1987344ec2596de45de49@group.calendar.google.com, is the office diary. Contractor diaries and a compliance calendar are still to be created.
- **Mail and SMS**: contact@propertysauce.co (gws-propertysauce connector) for routine back-and-forth; Zoho CRM Send Mail for anything to be relied on; Twilio or Inkbox for texts.
- **Marchbank Vale Associates**: cases@marchbankvale.co.uk, receives the arrears pack (Ops 04).

## 4. Decision limits

Proposed, to confirm with Damian.

Claude may, without asking:
- Reply to any tenant or prospective tenant with information already on their record or in these procedures.
- Give self-fix guidance for minor issues (tripped RCD, boiler pressure, blocked trap, bleeding a radiator, resetting a thermostat, changing a bulb or fuse, condensation and mould wiping) and downgrade urgency accordingly.
- Open a Maintenance ticket, grade its urgency, and post it to the area Slack channel.
- Send the rent reminders in the chasing timetable up to the point where the office is looped in (Ops 04 sets that day).
- Send certificate copies and standard documents to a verified tenant.
- Store a prospective tenant's details and send them viewing availability.

Claude must not:
- Confirm a contractor booking, spend money or agree a quote (Ops 05 and 06 limits apply).
- Refer a file to Marchbank Vale, serve any notice, or agree a payment plan without the office (README rule 2).
- Tell a tenant anything about another tenant, a landlord's finances or a sale.
- Give a tenant legal advice on their tenancy; anything beyond the tenancy agreement and the government How to Rent guide goes to the office.
- Set or change a certificate date from anything but the certificate itself (README rule 3).

Anything that smells of a dispute, a threat, a safety hazard (gas smell, no heating in winter for a vulnerable tenant, water into electrics, structural movement) or a complaint about staff goes to #claude-urgent the same hour.

## 5. The procedure, step by step

### 5a. Prospective tenant enquiries (from OpenRent, later Facebook)

1. **Trigger.** An individual London property gets an OpenRent ad when the sitting tenant's notice is received (Ops 09 raises it) or on completion of a purchase (Ops 01). Catterick House and Lancaster House ads run permanently and are never taken down.
2. **Capture.** Every enquiry is stored the day it arrives: name, phone, email, which property or block, move-in date wanted, household size, pets, and what they said. Stored against the property or block record (where exactly is question 4 in section 10).
3. **First reply, same working day.** For a specific property: confirm it is still available, send the key facts (rent, deposit, council tax band, bills, furnished or not, EPC rating), and offer viewing slots. For a block with nothing ready: say so plainly, give the expected date of the next flat, and confirm they are on the list.
4. **Block waiting list.** When Ops 09 or Ops 05 marks a flat "ready to view", message everyone on that block's list the same day, newest flat first, with viewing slots. Anyone who does not answer two messages a week apart is marked cold, not deleted.
5. **Hand over.** A viewing booked or an application started goes to Ops 01 (viewings, referencing, choosing the tenant) and Ops 02 (paperwork).

### 5b. Existing tenant: identify first

1. Match the sender to a Tenant record by email or phone. If neither matches, ask for the property address and the name on the tenancy before saying anything about the tenancy.
2. Read the record before replying: rent status, open maintenance tickets, certificate dates, notes from the last 30 days. Never make the tenant repeat what we already know.
3. Log the enquiry as a note on the Tenant record: date, channel, one line on what they asked, one line on what was done.

### 5c. Maintenance reports

1. **Steer to the website.** A repair reported by email, text or phone gets a reply with the "Report a Maintenance Job" link and a request for photos. If they cannot use it (no smartphone, elderly, urgent), take the details by phone and enter them.
2. **Look at the photos first.** Before any ticket, examine what was sent. Decide: is this something the tenant can safely fix in five minutes, is it a genuine repair, or is it an emergency.
3. **Self-fix.** If it is safe and simple, send numbered steps in plain English and ask them to reply within the hour with the result. Tenants are never asked to touch gas, mains electrics beyond the consumer unit switches, anything at height, or anything with water near electrics.
4. **Grade urgency.** Emergency (gas smell, flood, no heating or hot water with a vulnerable person, insecure door or window, sewage): tell the tenant what to do now (gas emergency line 0800 111 999, stopcock, isolate power), post to the area urgent channel and #claude-urgent within the hour, and hand to Ops 05 as a same-day job. Urgent (no heating or hot water, single toilet not working, leak contained, fridge or cooker dead): Ops 05, within 24 hours. Routine: Ops 05, within the week. Cosmetic: batched with the next visit to that property.
5. **Open the ticket.** Create the Maintenance record with the tenant, the property's Landlord record, the category, the tenant's description word for word, the photos, the urgency, and the tenant's available times (Mon to Fri 9 to 5, Saturdays if offered, and their no-go times). Quote the ticket number to the tenant.
6. **Post to Slack.** One message in the area channel: ticket number, address, category, urgency, one-line description, tenant's availability, link to the photos. Rocky (London), Sky (Saffron Walden), Ali (Catterick House, Lancaster House, Blackpool) until Damian confirms otherwise; Ops 05 holds the current roster.
7. **Hand to Ops 05.** Booking, grouping by area into two-hour windows, the contractor's diary, before and after photos, the office diary note, completion sign-off and the chase-until-they-answer loop are all Ops 05. Ops 03 keeps answering the tenant's questions about the job in the meantime, reading the ticket for the answer.

### 5d. Rent questions and non-payment

1. "How much do I owe", "when is rent due", "what is my reference": answer from the Tenant record and the Zoho Books invoice.
2. "I have paid": ask for the payment reference or a screenshot, check the Zoho Books bank feed, reply with what we can see. Never confirm receipt from the tenant's word alone.
3. "I cannot pay" or "I will pay late": record what they said and the date they promised, thank them for telling us, and hand to Ops 04, which runs the chasing timetable and the Marchbank Vale handover. If they mention hardship, benefits or a dispute about the amount, escalate to the office the same day.
4. Ops 04 owns the chase. Ops 03 does not send arrears notices of its own.

### 5e. Certificates and documents

1. "Can I have a copy of the gas certificate / EPC / tenancy / deposit certificate": send it from the Tenant record in Zoho CRM (Send Mail) so the send is logged, attaching the file from the Landlord record or the Drive certificates folder. If we do not hold it, say so and raise it with Ops 07 the same day.
2. An engineer or inspection visit query: read the Landlord record and the office diary, answer with the booked date, or hand to Ops 07 if nothing is booked.
3. A tenant reporting a safety device (smoke or CO alarm) not working: treat as urgent maintenance (5c) and note it on the Landlord record.

### 5f. General questions

1. Answer from the tenancy agreement, the How to Rent guide, the check-in checklist and the Tenant record. Keep answers short, plain and specific: who, how, when.
2. Notice to leave, subletting, adding an occupier, a rent increase query, a complaint about neighbours or staff, a deposit dispute: acknowledge the same day, record it, and hand to Ops 09, 11 or 12 as appropriate. Do not give an answer on the merits.
3. Anything Claude cannot answer with confidence: say when the tenant will hear back, and put it to the office.

### 5g. Facebook pages (not yet built)

Claude cannot create Facebook pages or accounts. Once Damian has created the pages and given Claude access through Meta Business Suite, Claude writes the bios, cover copy and a listing post template per area, and adds Facebook to step 5a as a lead source. Proposed pages: Property Sauce London, Property Sauce Rotherham, Property Sauce Cramlington and Newcastle, Property Sauce Blackpool, Property Sauce Essex.

## 6. Escalation

- Safety hazard, gas, flood, insecure property, a vulnerable tenant without heating: #claude-urgent and the area urgent channel within the hour, then the tenant is told what has been done and when they will hear next.
- A tenant threatening a complaint, the council, a solicitor or the press: #claude-urgent the same hour, with the ticket or note link and what has been said so far.
- A maintenance ticket where the tenant is chasing and Ops 05 has no booking after 3 working days (routine) or 1 working day (urgent): office overview channel #maintenance, tagging Damian.
- A rent conversation that turns into hardship or a dispute: office the same day (Ops 04 timetable continues for the undisputed amount).
- Anyone claiming to be a tenant who cannot be matched to a record: nothing about the tenancy is disclosed; office told if they persist.
- Two unanswered messages to a tenant on an open matter: try the other channel (text if email, email if text), then a phone call, then the office.

## 7. Done when

- A prospective tenant enquiry is done when they are stored with full details and have either a viewing booked (handed to Ops 01) or a place on the block waiting list with a dated first reply.
- A maintenance enquiry is done when a ticket exists with photos, urgency, tenant availability and a Slack post in the right channel, and the tenant has the ticket number and, where relevant, self-fix steps. Completion itself is Ops 05's "done".
- A rent enquiry is done when the tenant has an answer drawn from Zoho Books, or the matter is on the Tenant record and handed to Ops 04.
- A document request is done when the document has gone from Zoho CRM Send Mail and shows on the Tenant record.
- A general question is done when the tenant has a plain answer, or a dated promise of one and the office has the question.

## 8. Cowork routine

- **Every 30 minutes, 8am to 8pm, seven days:** read contact@propertysauce.co, the website maintenance submissions and the SMS inbox. For each new item: identify the sender (5b), classify (5a, 5c, 5d, 5e or 5f), do the first-line work, write the note or ticket, post to Slack where 5c says so. Reply to the sender the same run.
- **Daily at 9am:** list the open enquiries with no reply from the tenant in 2 days and nudge on the other channel. List anything in 6 that has tripped and confirm it was posted.
- **Daily at 5pm, Mon to Fri:** one message in #maintenance: new enquiries by type, tickets opened by area, block waiting-list activity, anything escalated.
- **Weekly, Monday 9am:** report to Damian: enquiry counts by source and property, time to first reply, tickets opened, self-fixes that worked, open questions.

Inputs: the connectors above. Outputs: Zoho notes and Maintenance records, Slack posts, replies from contact@propertysauce.co or Zoho Send Mail. Reports to #maintenance and Damian.

## 9. Test plan

- One block (Catterick House) and one London property, one week.
- Every enquiry handled is reported in #maintenance as it happens: what came in, what Claude decided, what it sent, what it wrote to Zoho.
- Damian or the office corrects anything wrong; corrections go into section 4 or 5 of this file the same day.
- Switch on for all properties only when a week has passed with no correction to the classification or the tone.

## 10. Open questions

1. **Marchbank Vale wording.** Damian called them "our legal representatives". Marchbank & Vale Associates is an arrears recovery brand and must never be described as solicitors or legal representatives (Legal Services Act 2007 s.17). In anything a tenant sees: "instructed to recover the arrears". Confirm.
2. **Facebook pages.** Claude cannot create them. Damian creates the pages and grants Meta Business Suite access; Claude then writes the content (5g). Confirm the five page names.
3. **"Southwark Walden"** read as Saffron Walden (4 High Street; the Windmill Cottage properties in Sible Hedingham). Confirm.
4. **Where prospective tenants are stored.** Leads = Property is the acquisition pipeline, so tenant applicants need a home: a separate Zoho module, a picklist on Contacts ("Applicant"), or a Google Sheet per block. Recommendation: Contacts with `Tenancy_Type` or a new `Contact_Stage` picklist = Applicant, linked to the Landlord (property) record, so a successful applicant becomes the Tenant record without re-keying.
5. **Route planning.** No Google Maps connector is attached. Grouping by postcode district (E10, E11, E17, E4 together; CR0 and CR2 together) covers most of the benefit. Add Google Maps if drive-time optimisation is wanted.
6. **Photo storage.** Recommendation: Google Drive. Zoho CRM gives about 1GB of file storage per user and then charges per 5GB block; before and after photos across 160 properties would outgrow it. The Maintenance record holds the Drive link. Ops 05 has adopted this; confirm.
7. **Contractor diaries.** Do Rocky, Sky, Ali and Dave have Google calendars Claude can write to, or should one be created per contractor on admin@propertysauce.co and shared with them? Rocky and Dave also need Slack accounts and Zoho Team records before they can be booked automatically.
8. **Rent demands.** Are Zoho Books invoices going out for every tenant today with a due date matching the tenancy? Ops 04's chase keys off that invoice.
9. **Gas engineers per area.** `Gas_Safe_Engineer` on the Landlord record is blank on most properties. Who is the engineer for London, Saffron Walden, Rotherham, Cramlington and Blackpool?
10. **Reconcile the drafts.** Three chats drafted overlapping timetables on 17 September. Damian to pick one of each:
    - Arrears handover to Marchbank Vale: Ops 04 says day 21; this chat's draft (appendix A) says day 17.
    - Certificate lead time: Damian said 4 weeks; Ops 07 wrote 3 weeks; this chat recommends 8 weeks for gas (so a failed access visit does not push it past expiry, and a check done in months 10 to 12 keeps the original expiry date), 12 weeks for EICR and EPC, 16 weeks for licences.
    - Certificate list: Ops 07's register (5a there) and appendix B here agree on the core items; appendix B adds deposit protection, How to Rent, Right to Rent and buildings insurance as things Ops 03 gets asked about, and drops the block-only items (lifts, asbestos, extinguishers) to Ops 13.
11. **Compliance data.** The deep dive in appendix C found insurance and licence dates expired or blank on most records. Damian to say which are real gaps and which are block renewals never written back, before the compliance calendar is built from them.

## Appendix A. Rent arrears chasing protocol (this chat's draft, 17 September 2026)

Day 0 is the due date on the Zoho Books invoice. Zoho Books is checked at 5pm every working day. Every contact is a note on the Tenant record. "CRM" means sent from the Tenant record in Zoho so the copy is stored.

| Day | Action |
|---|---|
| 0, 5pm | Text: rent shows unpaid today, please pay or reply if already sent. |
| 1 | Text again, plus email with the invoice attached and the payment reference. |
| 2 | Email (CRM): first formal notice of arrears. Amount, due date, how to pay, reply by end of next day. |
| 3 | Phone call. Voicemail and a text if no answer. Any promise to pay gets a date and a reminder set for that date. |
| 5 | Email (CRM) and text: second notice. Account will be referred for recovery if not cleared within seven days of the due date. Ask if there is a problem we should know about. |
| 7 | Call again. Guarantor written to and called. Office told in one line (tenant, property, amount, what has been said). Office decides on any payment plan. |
| 10 | Email (CRM) and posted letter: final notice. Seven days to clear or agree a plan, otherwise referral to Marchbank Vale Associates for recovery. |
| 14 | Late-payment interest may now be charged if the tenancy provides for it (Tenant Fees Act 2019: 3% above Bank of England base rate, daily, only once 14 days late). Last call. |
| 17 | Referral. Drive folder built (list in 2c), email to cases@marchbankvale.co.uk with the link, tenant told in writing, landlord told the same day. |
| Ongoing | Rent stays in the daily check. A second missed month while a file is open goes to Marchbank Vale as an update. |

Stop conditions: payment lands (thank-you text, close the note); tenant says they have paid (ask for proof, check the feed, pause one working day); disrepair complaint or amount dispute (office same day, chase continues for the undisputed part); benefit tenant (ask on day 3 about a managed payment to landlord; office handles the DWP form).

Law note: since the Renters' Rights Act 2025 took effect on 1 May 2026 there is no Section 21, and mandatory ground 8 needs three months' arrears (13 weeks if weekly) at service and at hearing, with four weeks' notice. The timetable is about being paid quickly; the office is told when those thresholds are reached. The referral pack must include the deposit certificate, prescribed information, How to Rent guide and the gas, electrical and EPC certificates served at the start, because a possession claim fails without them.

## Appendix B. Certificates every rented property in England needs (this chat's draft)

| Item | Rule | Lasts | Copy to tenant | Start work |
|---|---|---|---|---|
| Gas Safety Record (CP12) | Every property with a gas supply, even if the boiler is off. Gas Safe engineer only. | 12 months; done in months 10 to 12 the old expiry is kept | Within 28 days of the check; before move-in for a new tenant | 8 weeks out |
| EICR | Every rented property. C1, C2 or FI fixed within 28 days with written proof. | 5 years or sooner if stated | Within 28 days; before move-in; to council within 7 days if asked | 12 weeks out |
| EPC | E or better to let. Government has confirmed C for new tenancies from 2028 and all tenancies from 2030. | 10 years | At the start of every tenancy | 12 weeks out |
| Property licence | Council-dependent. Waltham Forest (E4, E10, E11, E17) is borough-wide selective. Rotherham and Blackpool have selective areas. Five or more unrelated sharers is a mandatory HMO licence anywhere. | Up to 5 years | Not required; licence number on the tenancy | 16 weeks out |
| Buildings insurance | Landlord and lender obligation | 12 months | No | 6 weeks out (Ops 13) |
| Fire risk assessment (blocks) | Common parts of Catterick House, Lancaster House, 35 Lord Street | Reviewed every 12 months | Fire safety instructions to every flat | 8 weeks out (Ops 13) |
| Smoke and CO alarms | Smoke alarm every storey; CO alarm in every room with a fixed fuel-burning appliance (gas cooker excluded). Tested day one of every tenancy. | Ongoing | Test recorded on the checklist | Check-in day |
| Deposit protection | Registered within 30 days; certificate and prescribed information served | Life of tenancy | Within 30 days | Day of deposit receipt (Ops 02) |
| How to Rent guide | Current version at the start and at renewal if a new version is out | Per tenancy | Yes | Move-in and renewal (Ops 02, 11) |
| Right to Rent | All adult occupiers before move-in; follow-up before time-limited permission expires | Per tenancy | No | Application (Ops 02) |
| Legionella risk assessment | Written assessment, not a certificate; redo on system change or void | Review every 2 years | Not required | Every 2 years and every void |
| Furniture and appliances | Supplied furniture carries fire labels; annual PAT on supplied white goods is the accepted standard, not law | PAT 12 months | No | At the gas or EICR visit |
| Coming in | PRS landlord and property database, Decent Homes Standard, both under the Renters' Rights Act, dates by regulations | | | Watch |

Renewal routine: trigger from the compliance calendar at the lead time; email the area engineer (from `Gas_Safe_Engineer`) with address, tenant name and phone, ask for three slots; email and text the tenant the slots; confirm to both, engineer's diary and office diary; chase the certificate from the day after the visit, every two working days; file three ways (attach to the Landlord record and set the expiry field from the document, save to the Drive certificates folder, send to the tenant from Zoho CRM Send Mail); any remedial work becomes a Maintenance ticket the same day with the 28-day deadline; certificate not in hand 7 days before expiry goes to #claude-urgent.

## Appendix C. Compliance check, 17 September 2026

Read live from the Zoho Landlord (Accounts) module: every record with a rent or tenancy start date and no sale date, 160 properties. Full table: `03-compliance-check-2026-09-17.csv` in this folder. Blank means nothing recorded, not necessarily no certificate.

| Item | Expired | Due within 60 days | Blank | OK | Not applicable |
|---|---|---|---|---|---|
| Gas | 5 | 15 | 12 | 18 | 110 (no gas supply) |
| EICR | 5 | 0 | 5 | 150 | |
| EPC | 3 | 0 | 3 | 154 | |
| Licence | 55 | 1 | 22 | 15 | 67 (exempt) |
| Insurance | 98 | 1 | 58 | 3 | |

Genuinely overdue on the data as recorded:
- 3 Stourhead Gardens SW20: gas expired Nov 2024, EICR expired Aug 2025.
- 49 Brighton Road CR5: gas expired Mar 2022, EICR expired Feb 2025.
- 38a Steel Road E11: gas expired Jul 2023, EICR expired Aug 2024.
- 171 Farmer Road E10: gas expired Jan 2023; EICR and licence blank.
- 261 Cann Hall Road E11: gas expired Jan 2025, EPC expired May 2026, licence expired Apr 2026.
- 7c Tomlin's Grove E3: EICR expired Jan 2023; gas, EPC, licence blank.
- 28a Kenilworth Gardens IG10: EPC expired Nov 2020; gas, EICR, licence blank.
- Flat C Hollybush Lodge E10 has two records, one showing EICR and EPC expired, the other blank. Merge and confirm.
- Gas status unknown and gas date blank: 39 Palatine Road Blackpool, 32D Hollybush Lodge, Flat 5 Bedford Place, 2 The Cornfields, 50 Green Pond Close, 4 Mayford Close, 664B High Road. Set `Gas_Safety_Applicable` on each.

Gas checks due in the next eight weeks (all Rocky's area except 3 Radley Court): 1 Oct 26 Kenilworth Gardens; 2 Oct 10 Claremont Road and 122 Morley Road; 3 Oct 3 Radley Court and FF 55 Coopers Lane; 6 Oct 15 Heathcote Grove; 8 Oct GF 225 Church Road; 16 Oct 127C Grange Park; 31 Oct 47 Willmot Road; 1 Nov 102 New Road, 72C and 72D Kingswood Road; 2 Nov 15 Fulready Road; 5 Nov 1 Onslow Close; 11 Nov 125 Kitchener Road.

Probably stale data rather than real gaps (Damian to confirm, question 11):
- Catterick House: all 41 flats show licence expired 30 Apr 2025 and block insurance expired 31 Mar 2024. Looks like a block renewal never written back to the flats.
- 35 Lord Street Blackpool: nine flats, insurance expired Nov 2023, licences blank.
- Lancaster House: fifty flats, insurance blank on every one; gas, EICR and EPC clean.
- London selective licences expired 2020 to 2026 on Karen Terrace, Valley Side Parade, Onslow Close, Heathcote Grove, Radley Court, Coopers Lane GF and FF, Morley Road, Grange Park. Waltham Forest renewed its scheme in 2025, so these need fresh applications if not already made.
- Insurance expired or blank on 156 of 160. Real renewal dates needed from the broker, or confirmation of which blocks sit on one policy.

The compliance calendar is built only once the data is confirmed; from the data as it stands it would raise about 150 false alarms.
