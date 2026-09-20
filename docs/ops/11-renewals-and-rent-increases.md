# Ops 11: Renewals and rent increases

Scope: the annual rent increase on every tenancy, served by Section 13 notice (Form 4A) at the earliest lawful date, recorded in Zoho CRM, applied in Zoho Books, and defended if the tenant takes it to the tribunal. There are no renewals any more: every tenancy is periodic and never expires, so "renewal" now means only the rent review.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 11 chat. The law in section 5a was checked the same day against the Housing Act 1988 section 13 as amended, the official Form 4A (version 05.26) and the transitional regulations (SI 2026/421). The percentage rule (section 4), the person-approval step (section 4) and the points in section 10 are waiting for Damian's answer. Nothing has been served.

## 1. What this operation covers

Under the Renters' Rights Act 2025 (in force for tenancies since 1 May 2026) the only way to increase the rent on a private assured tenancy is a Section 13 notice on the prescribed Form 4A, giving at least two months' notice, no more than once a year, with the new rent starting on the first day of a rent period. Rent review clauses in tenancy agreements are void, so the old practice of writing "6% a year" into the agreement and applying it at renewal is finished. This operation works out, for every tenancy, the earliest date a new rent can lawfully start, prepares the Form 4A and the covering letter about ten weeks before that date, serves it from the Tenant record in Zoho CRM (and by post or by hand where the agreement requires it), records everything on the record, changes the recurring invoice in Zoho Books so the first invoice on or after the effective date is at the new rent, and repeats every year for as long as the tenant stays. If the tenant refers the rent to the First-tier Tribunal, the increase is paused and a person takes over with the evidence pack Claude has already assembled.

## 2. How it is done today

Damian's instructions, 19 September 2026:

- Rent increases should happen as often as the law allows, using a standard percentage. Until now every tenancy was renewed each year with a 6% increase written into the agreement, which the tenant signed at the outset. The CRM still carries this: `New_Rent_On_Renewal` on the Tenant record is a formula equal to `Rent` × 1.06 on all 148 live records.
- Question 1: can a fixed annual increase (say 6%) still be written into the agreement now that every tenancy is an assured periodic tenancy? Answer in section 5a: no.
- Either way, Section 13 notices are to be served at the earliest date possible. Question 2: if the tenancy starts in month 1, is the notice served in month 10 to give two months before month 12? Answer in section 5b: the new rent can start no earlier than the first anniversary (the start of month 13), so the notice goes out in month 10, about ten weeks before.
- Question 3: what standard percentage? Damian would prefer 6% and does not want less than 3%. Answer in section 5c.
- Process once the figure is agreed: on the earliest date possible, serve the Section 13 notice by email, from Zoho CRM so it is time-stamped and searchable on the tenant's record (Gmail is not). Check first that the tenancy agreement allows notices by email. Then edit the recurring invoice in Zoho Books so that the invoice on the effective date is at the new rent, and chase that rent from then on. Repeat every year for as long as the tenant stays.
- Follow the exact Section 13 protocol at every step.

## 3. Systems and records touched

**Zoho CRM, Tenant (Contacts) record.** Fields that exist and are used (checked 19 September 2026, 251 fields on the module):

| Field | Used for |
|---|---|
| `Tenancy_Start_Date` ("Existing Tenancy Start Date") | Start of the current agreement. This is the date the 52-week clock runs from, because every renewal in the past came with a new agreement and (usually) a 6% increase on the same day. |
| `Original_Tenancy_Start_Date` | When the tenant first moved in. Reference only. |
| `Rent`, `Rent_Due_Date` (picklist 1st to 31st) | Current rent and the day each rent period begins. The new rent must start on that day of the month. |
| `Recurring_Rent_Start_Date` | The first recurring invoice date in Books. |
| `New_Rent_On_Renewal` | Formula, `Rent` × 1.06. Left in place as a reference figure; the proposed rent is set by the rule in section 4, not by this field. |
| `Status` | Only Tenanted and Arrears records are in scope. Vacated, Archived, Let Agreed and Application Stage are not. |
| `Email`, `Tenant_2_Email` (and 3, 4) | The address the notice is emailed to. Must match the address in the tenancy agreement. |
| `Landlord` lookup and the Landlord record's `Established_Landlord` | Who is told and who approves (README rule 4). |

Fields to add before the test week (section 9): `Last_Rent_Increase_Date` (date), `Next_Rent_Increase_Date` (date; the earliest effective date computed by the rule in 5b), `S13_Proposed_Rent` (currency), `S13_Served_Date` (date), `S13_Service_Method` (picklist: Email, Post, Hand, Email and post, Email and hand), `S13_Effective_Date` (date), `Rent_Increase_Status` (picklist: Not due, Due, Prepared, Awaiting approval, Served, Challenged, In effect, Held, Not assured), `Tribunal_Reference` (text). The Form 4A PDF, the covering email and the proof of service are attached to the record.

**Zoho CRM Send Email.** The covering email with the Form 4A attached goes from the Tenant record (Send Email) so it sits on the record with a timestamp, the same rule as Ops 03, 04, 07 and 09. The API for a routine to do this is `POST /crm/v8/Contacts/{id}/actions/send_mail` (scope `ZohoCRM.send_mail.all.CREATE`); the "from" address must be one configured in the CRM organisation's email settings, so the build item is to confirm which Property Sauce address is set up there (section 10).

**Zoho Books, Property Sauce organisation 678590019.** One recurring invoice per tenancy. The rent line is changed with `PUT /books/v3/recurringinvoices/{recurring_invoice_id}` (new `line_items` rate) so that the next invoice generated on or after the effective date is at the new rent. The MCP connector in this session cannot edit recurring invoices; the website's Zoho key can (Ops 04 facts), so this is a build item until then and a person (Ezad or Usman) in the meantime.

**Form 4A.** "Landlord's notice proposing a new rent for assured tenancies in the private rented sector", Housing Act 1988 section 13(2) as amended, version 05.26, Crown copyright. Downloaded fresh from GOV.UK for every notice (assets.publishing.service.gov.uk, "Assured tenancy forms" collection), never from a saved copy, because an out-of-date form invalidates the notice. The PDF is fillable (51 fields, generic names such as "Text Field 109"), so the routine can complete it; mapping the field names to questions 1.1 to 4.7 and the signature box is a build item (section 9).

**Drive.** The tenancy folder gets the completed Form 4A, the covering email, the proof of service (email timestamp screenshot, certificate of posting, or the hand-delivery photo) and the comparables sheet.

**Slack.** A new channel #rent-increases (to create) carries one message per tenancy per year: prepared, approved, served, in effect or challenged. Approval is a ✅ reaction from Damian or the office on the "prepared" message (section 4). Anything challenged, any hardship mention and any notice that cannot be served the way the agreement requires goes to #claude-urgent (C0BTPPZ3JJE).

**Ops 05 and Ops 07.** Before a notice is prepared, the property must have no Maintenance ticket open for more than 28 days and every certificate in date, because the tribunal "can consider other factors like the condition of the property" (Form 4A, section 5.2).

**Ops 01 and Ops 03.** The asking rent of the last new let in the same building and flat type is the strongest market evidence we hold, so the routine reads it from the Landlord record and the OpenRent ad history.

## 4. Decision limits

Proposed, to confirm with Damian:

- **The percentage.** The proposed rent is the current rent plus 6%, rounded down to the nearest £5, **capped at the evidenced market rent** (section 5c). Where the evidence shows the market rent is less than the current rent plus 3%, nothing is served and Damian decides (serve at market, or hold for a year). Claude never proposes a rent above the evidence, because the tenant's challenge is free, cannot make the rent higher than the notice, and delays the whole increase to the day the tribunal decides.
- **Claude may, without asking:** compute the earliest effective date for every tenancy; gather the comparables; check the Ops 05 and Ops 07 position; complete the Form 4A and the covering email; post the "prepared" message to #rent-increases; after a ✅, serve by the method the agreement allows and record it; on the effective date, once no tribunal application has been notified, change the recurring invoice, update `Rent` and the increase fields, and tell the tenant the new rent is in effect; roll `Next_Rent_Increase_Date` forward a year.
- **Needs a person's ✅ before sending:** every Form 4A. README rule 2 says no notice is served without a person. The ✅ on the Slack message is that person. Section 10 asks Damian whether he wants Section 13 treated differently from Section 8 and served without approval once the test week is clean.
- **Needs the landlord's approval:** any property whose Established Landlord is not Damian, his wife or one of their companies. The landlord gets template L11 with the proposed figure and the evidence 14 days before the target service date and must reply yes. Silence is not approval. (Where the agreement names Sure Lets and Manage Limited as landlord, for example the new-template Catterick House and Lancaster House tenancies, the decision is Damian's.)
- **Never served by Claude, always Damian:** a tenancy with a hardship or vulnerability flag on the record; a tenancy with a repair complaint open more than 28 days or a certificate out of date; a tenancy where the last increase or the start date cannot be established from the agreement; a company tenant (see 5b, not an assured tenancy); anything where the tenant has already referred a rent to the tribunal.
- **After a tribunal application:** Claude changes nothing in Books, records the reference and the date, assembles the evidence pack, and Damian conducts the reply.
- **Sending is only ever from the Tenant record in Zoho CRM**, with the Form 4A attached as a PDF, plus post or hand delivery where 5d requires it. Never from Gmail alone.

## 5. The procedure, step by step

### 5a. The law, checked 19 September 2026

Sources: Housing Act 1988 section 13 as amended by the Renters' Rights Act 2025 (legislation.gov.uk, in force 1 May 2026); Form 4A version 05.26 and its Note A (GOV.UK); the Renters' Rights Act 2025 (Commencement No. 2 and Transitional and Saving Provisions) Regulations 2026, SI 2026/421, regulation 7; GOV.UK "Guide to the Renters' Rights Act"; ONS "Private rent and house prices, UK: August 2026".

1. **No rent review clauses.** Section 13(4A) to (4C): the rent under a private assured tenancy can be increased only by a Section 13 notice, by a tribunal determination, or by written agreement after a tribunal determination. A clause in the agreement providing for an automatic or percentage increase has no effect, whether the agreement was signed before or after 1 May 2026. Our new template (Assured Periodic Tenancy Agreement, Section A, "Rent") already says the only route is Section 13. So the answer to Damian's first question is **no**: a 6% escalator cannot be written into the agreement, and if one is written in it is void and cannot be relied on.
2. **When the new rent can start** (section 13(2), Form 4A Note A). The date on the notice must satisfy all three: (a) at least two months after the notice is served; (b) not before 52 weeks after the date the first period of the tenancy began; (c) if the rent has been increased before, not before 52 weeks after the last increase took effect (53 weeks where 52 would land more than six days before the anniversary of the first increase after 11 February 2003, which only bites on weekly or four-weekly tenancies; all of ours are monthly); and (d) the first day of a period of the tenancy.
3. **Increases before 1 May 2026 count.** SI 2026/421 regulation 7: where the rent was increased under a rent review clause before 1 May 2026, a Section 13 notice may not propose a rent taking effect before 52 weeks after that increase took effect. Our 6% renewals therefore count as increases.
4. **Once a year.** Because of 2(c), never more than one increase in any 52 weeks.
5. **Prescribed form.** Form 4A from 1 May 2026 (Form 4 is now for the social sector). A notice on any other document is invalid.
6. **Service.** Form 4A's note to the landlord: "If your written tenancy agreement specifies agreed methods of service, use one of those. If it does not you can serve it by handing it over to your tenant in person, leaving it at the tenant's address or sending it by registered post." Email is acceptable only where the agreement permits it (5d).
7. **The tenant's challenge.** The tenant can refer the notice to the First-tier Tribunal (Property Chamber), free, at gov.uk/guidance/apply-for-a-market-rent-determination, and the tribunal must receive the application before the date in question 4.6. The tribunal sets the open-market rent for the property on the same terms, and can consider the condition of the property. The rent it sets cannot be higher than the rent proposed in the notice. The new rent then takes effect from the date of the tribunal's determination, not from the date in the notice, and the tribunal can defer it up to two further months for undue hardship. Until then the tenant pays the old rent. There is no back-pay.
8. **What this means for a fixed percentage.** The law contains no percentage. The only legal test is open-market rent. A standard percentage is an internal rule for what we propose; it is safe exactly as far as the market supports it and no further.

### 5b. The date rule

For every Tenanted or Arrears record:

1. **Clock start** = the later of `Tenancy_Start_Date` and `Last_Rent_Increase_Date` (until that field exists, `Tenancy_Start_Date`, because past renewals were new agreements with the increase on the same day). If either date is missing or the record is unclear, read the agreement in the tenancy folder and write the date on the record before going further.
2. **Earliest lawful date** = clock start + 52 weeks (364 days), then move forward to the next day that is the `Rent_Due_Date` day of the month. For a monthly tenancy that is always the anniversary of the clock start in the same month, or the rent day in that month.
3. **Where the rent day is not the start day** (many records: for example Flat 20 Catterick House started 4 January 2023 and pays on the 1st), the period of the tenancy is the rent period the agreement defines. Read the agreement's "Rent" paragraph, record which day the periods run from, and use that day. If the agreement is silent, use the later of the two candidate dates, which is always lawful.
4. **Target service date** = effective date minus two months minus 14 days, moved back to the previous working day. The 14 days covers deemed service by post and any weekend. Email must leave before 4.30pm on a working day to be deemed served that day under the new template (clause 7.3).
5. **Tenancies already past their anniversary** (about sixty records on 19 September 2026 have a `Tenancy_Start_Date` before September 2025, some as far back as 2018 and 2020): the notice can go out now. The effective date is the first rent day that is at least two months and 14 days after service. Example: served 1 October 2026, rent day 15th, effective 15 December 2026.
6. **Worked example, month 1 to month 13.** Flat 22 Catterick House: started 18 July 2026, rent on the 18th. 52 weeks after 18 July 2026 is 17 July 2027, which is not a rent day, so the earliest effective date is **18 July 2027**, the first anniversary. Two months before is 18 May 2027; with the buffer, the notice is prepared in the last week of April and served by **4 May 2027**. The following year the clock restarts from 18 July 2027, so the next increase is 18 July 2028, served by 4 May 2028, and so on for as long as the tenant stays. So: served in month 10, in effect at the start of month 13, not month 12.
7. **Not assured, so no Section 13.** A tenancy to a company is not an assured tenancy. Four Lord Street records are company lets (Division 1 Deluxe Ltd, Kanege Komplex Ltd, SSU Properties, Serco). Their rent changes only as their contracts allow, by a person; mark them "Not assured" and leave them out of the routine.

### 5c. The percentage rule

Facts on 19 September 2026: ONS private rent inflation for the 12 months to August 2026 was 4.0% for England, 5.8% in the North East and North West (Lancaster House, Cramlington; Catterick House, Rotherham; Lord Street, Blackpool) and 3.0% in the South East, with London between. At Catterick House, new lets in 2026 are at £600 to £630 a month, while sitting tenants pay between £590 and £661 (several already at £630.70 after a 6% renewal): another 6% on the higher ones would propose £668, above what the identical flat lets for today, and would not survive a challenge. At Lancaster House every tenancy started in April to September 2026, so nothing is due before April 2027.

Proposed rule:

- **Proposed rent = the lower of (current rent × 1.06, rounded down to the nearest £5) and the evidenced market rent.**
- **Evidence** (kept on the record and in the tenancy folder as the comparables sheet): the asking rent of the most recent new let of the same type in the same building or street (Ops 01), plus three current listings within the last 60 days for the same bedrooms and type within a mile (OpenRent, Rightmove, Zoopla), plus the ONS regional figure. The market rent for the rule is the middle of that evidence, never the top listing.
- **Floor:** if the evidenced market rent is below current rent × 1.03, Claude does not serve; Damian decides between serving at market and holding. Damian's 3% floor is honoured as a "stop and ask", not as a figure we propose regardless of the market.
- **Why not a flat 6% regardless:** the tenant's challenge costs nothing, cannot raise the rent, and delays the entire increase to the day the tribunal decides, typically months later, with no back-pay. A 6% notice on a flat already at market therefore risks losing the 3% to 4% we would otherwise have had, plus the delay. A notice at or just under market is very rarely challenged.
- Where the evidence supports more than 6%, we still propose 6%: predictable for the tenant, low challenge rate, and the shortfall is recovered next year because the clock restarts from each increase.

### 5d. Serving it

Read the agreement in the tenancy folder before every notice and record the method on `S13_Service_Method`.

- **New template** (Assured Periodic Tenancy Agreement, used since May 2026: Catterick House, Lancaster House, the Annexe): clause 7.2 permits service by email to the address the tenant gave on the contact-details page, and that page says giving an email address is agreement to be served by email. Clause 7.3 deems email served at the time it leaves the outbox if sent before 4.30pm on a working day, first-class post two working days after posting, and a notice left at the property the same day if before 4.30pm. **Method: email from the Tenant record, Form 4A attached, before 4.30pm on a working day, and the same day either first-class post with a certificate of posting or hand delivery by Ali (Catterick House, Lancaster House) or Rocky (London) with a timestamped photo of the envelope at the door.** Two methods so that a dispute about one does not sink the notice.
- **Old Rocket Lawyer template** (2022 to 2025 London and Essex tenancies, for example 50C North Birkbeck Road): clause 48 allows service only by leaving the notice at the property or first-class post to the property, deemed served the day after. Email is not an agreed method. **Method: first-class post with a certificate of posting, or hand delivery with a photo, and the email from the Tenant record as a courtesy copy that also puts it on the record.** The two months run from the deemed postal or hand date.
- **Any other or unknown agreement:** post or hand delivery, never email alone, and a person confirms the clause before it goes.
- The email address used must be the one in the agreement. If the tenant has since given a new address, serve by post or hand as well.
- Proof of service (email sent-timestamp from the CRM, certificate of posting, or the delivery photo) is attached to the record and saved to the tenancy folder the same day.
- Signature: Form 4A is signed "Landlord's Agent", printed name of the person who gave the ✅, dated the service date. Where Sure Lets and Manage Limited is the landlord, a director signs as landlord.

### 5e. The annual cycle for one tenancy

| When | Step | What happens |
|---|---|---|
| Every working day | Scan | Routine reads every Tenanted and Arrears record, computes the effective date and target service date (5b), and sets `Rent_Increase_Status` = Due on any record whose target service date is within 14 days and whose status is Not due. |
| T minus 12 weeks | Prepare | Comparables gathered and the proposed rent set by 5c. Ops 05 and Ops 07 checks. Agreement read for the period day and the service clause. Form 4A completed: 1.1 all tenant names, 1.2 address, 2 landlord name and address exactly as on the agreement, 3 Property Sauce as agent with admin@propertysauce.co and 020 8158 8434, 4.1 current rent per month, 4.2 tenancy start, 4.3 last increase (blank if none since the start), 4.4 first increase after 11 February 2003 (blank if none), 4.5 proposed rent per month, 4.6 effective date, 4.7 nil in every row (no bills are included in our rents). Covering email S1 drafted. Third-party landlord sent L11. Message posted to #rent-increases with the figures, the evidence and the PDF. Status = Prepared, then Awaiting approval. |
| T minus 10 weeks | Serve | On the ✅ (and the landlord's yes where needed), sent from the Tenant record with the PDF, before 4.30pm; posted or hand-delivered the same day per 5d. `S13_Served_Date`, `S13_Service_Method`, `S13_Effective_Date`, `S13_Proposed_Rent` written; PDF, email and proof attached; Slack message updated. Status = Served. Tenant's reply, if any, noted on the record. A tenant who asks to talk is answered with S3 (what the notice means, how the tribunal works, and that we will listen if they think the figure is wrong). |
| T minus 4 weeks | Check | Any tribunal application must arrive before the effective date. If the tenant says they have applied, status = Challenged (5f). If the tenant proposes a different figure in writing and Damian agrees, the written agreement replaces the notice (section 13(4)) and the agreed figure is used. |
| T minus 7 days | Books | If not Challenged, edit the recurring invoice so the invoice dated on or after the effective date is at the new rent. Do this after the last old-rent invoice has generated and before the next one. `Rent` on the Tenant record updated with effect from the effective date (note the old figure and dates on the record). |
| T (effective date) | In effect | S2 to the tenant from the record: the new rent is now in force, the invoice reflects it, please change your standing order. Status = In effect. `Last_Rent_Increase_Date` = T; `Next_Rent_Increase_Date` = T + 52 weeks rolled to the rent day (5b). Landlord told on the next Ops 10 statement. Ops 04 chases the new figure from the next due date. |
| T + 14 days | Confirm | If the rent received is still the old figure, Ops 04 treats the shortfall as arrears from day 1 with a reminder that names the notice and its effective date. |

### 5f. If the tenant refers it to the tribunal

1. Status = Challenged. `Tribunal_Reference` recorded. Books is not changed; the old rent keeps being invoiced. #claude-urgent told the same day, and the landlord where third-party.
2. Claude assembles the evidence pack in the tenancy folder: the notice and proof of service, the comparables sheet, the last new-let asking rent for the same type, the inspection photos and the certificate list from Ops 05 and Ops 07, the tenancy agreement and the rent history.
3. Damian (or the landlord) files the reply in the tribunal's timetable. Marchbank & Vale may prepare it; it is not litigation, but the Ops 04 5c line about never implying solicitor status applies.
4. On the determination: `Rent` and Books are changed from the date the tribunal gives (its decision date, or up to two months later for hardship). `Last_Rent_Increase_Date` is that date, and the next cycle runs from it. If the tribunal sets a rent below the notice, that figure is used and the record says why.

### 5g. The backlog, autumn 2026

About sixty tenancies are already past 52 weeks from their current agreement's start with no increase since. They are served in batches so that the office is not answering sixty tenants at once and so that the first ten are watched before the rest go: the test tenancy in section 9 first, then the rest of Catterick House (those below the building's new-let rent only), then London and Essex in order of clock start, ten a week. Each batch is one message per tenancy in #rent-increases with a ✅ each.

## 6. Escalation

- Same day to #claude-urgent: any tribunal application; any hardship, illness, job-loss or benefits mention in a reply; a tenant who says they never received the notice; an agreement whose service clause does not allow the method we planned.
- To Damian before the next action: evidenced market below current rent plus 3%; a record whose start date or last increase cannot be established; a third-party landlord who has not replied in 14 days; a repair or certificate block that is not cleared by T minus 10 weeks (the notice waits a month, not for ever).
- To the landlord: L11 at prepare, the outcome on the next statement (Ops 10), and any challenge the same day.

## 7. Done when

For each tenancy each year: the earliest lawful effective date was computed and recorded; the Form 4A was served at least two months and 14 days before it, by a method the agreement allows, with proof attached to the Tenant record and in Drive; the recurring invoice produced the new rent on the effective date; `Rent`, `Last_Rent_Increase_Date` and `Next_Rent_Increase_Date` are correct; the tenant was told the rent is in effect; and the next cycle is already scheduled. For a challenged notice: the pack is complete, the reply filed on time, and the tribunal's figure and date applied.

Measured across the portfolio: every assured tenancy has a `Next_Rent_Increase_Date` no more than 53 weeks after its last increase, no notice served late against its earliest date, and the challenge rate below one in twenty.

## 8. Cowork routine

- *Every working day 07:30.* Scan (5e row 1). For records reaching T minus 12 weeks: comparables, checks, Form 4A, S1 draft, L11 where needed, Slack message. For records with a ✅ and a landlord yes: serve before 12:00, record, attach. For records at T minus 7 days and not Challenged: Books edit and `Rent` update. For records at T: S2, status, dates rolled. One line per action in the Ops 11 daily report.
- *Every Monday 08:00.* Post to #rent-increases: notices awaiting ✅, notices served and their effective dates, anything Challenged, anything Held, the next month's list.
- Inputs: the Tenant and Landlord records, the tenancy folder, the Ops 01 new-let rents, the Ops 05 ticket list, the Ops 07 register, the Books recurring invoices, GOV.UK for the form. Outputs: the Tenant record, Books, Drive, #rent-increases, the daily report.

## 9. Test plan

One tenancy first, from the backlog: **Flat 20 Catterick House (Michelle Murray, £595, rent day 1st, current agreement from 4 January 2023)**, because the building has fresh new-let evidence at £600 to £630, the new figure is small and uncontroversial, and the landlord is ours. Claude prepares the pack and the Form 4A and posts it; Damian reads every line before the ✅; it is served by email from the record and hand-delivered by Ali the same day; the effective date, the Books change and the S2 are watched through to the first payment at the new rent. Nothing else is served until that tenancy has paid the new rent once without correction.

Before the test, this chat builds: the nine CRM fields in section 3; the Form 4A field map (51 fillable fields to questions 1.1 to 4.7 and the signature box); the date and percentage calculator over the Tenant records; the S1, S2, S3 and L11 templates as Zoho CRM email templates; the Send Email call from the record; the Books recurring-invoice edit through the website's Zoho key; and #rent-increases.

## 10. Open questions

- **The percentage.** Confirm the rule in 5c: 6% capped at evidenced market, stop-and-ask below 3%. Or state a different default.
- **Approval.** README rule 2 has a person on every notice. A ✅ in Slack per notice is quick. Does Damian want Section 13 notices to go without a ✅ once the test week is clean, or keep the ✅ for good?
- **Third-party landlords.** L11 requires a yes. Should silence after 14 days count as yes for landlords whose management agreement authorises rent reviews? Which agreements do?
- **Rent day versus start day.** Around forty records pay on the 1st or 15th but started mid-month. The routine will read each agreement and record the period day; where an agreement is silent it uses the later date. Confirm, or tell the chat which day the office treats as the period start for Catterick House.
- **Data to tidy before the backlog.** Records still marked Tenanted but renamed "X -" (Ops 09 lists them); Windmill Cottage with no start date; Flat 5 Lord Street (Serco) at £0; the four company lets marked Not assured.
- **Old agreements with a 6% clause.** Damian says the old agreements carried a 6% annual increase. The 50C North Birkbeck Road agreement of November 2022 (Rocket Lawyer) has no such clause: the rent is a fixed figure. If other agreements do have one it is void from 1 May 2026 and must not be applied; no action needed beyond not relying on it.
- **Who signs.** The Form 4A "Landlord's Agent" line: the person who gives the ✅, or always Damian?
- **Universal Credit tenants.** Form 4A tells the tenant to report the change to DWP. Should S2 remind them, and should Ops 04 expect the housing element to lag by a month?

## Templates

All go from the Tenant record with Send Email so they sit on the file. Square brackets are merge fields. Sign-off: Property Sauce, admin@propertysauce.co, 020 8158 8434, and the named person.

### S1: Covering email with the notice

Subject: Notice of proposed new rent for [address] from [effective date]

Dear [first name],

Please find attached a formal notice (Form 4A, under section 13 of the Housing Act 1988) proposing a new rent for [address].

- Current rent: £[current] a month
- Proposed rent: £[proposed] a month
- The new rent would start on: [effective date], which is the first day of a rent period and more than two months from today

We have set the figure by looking at what similar homes in [area] let for now. If you would like to see that evidence, ask and we will send it.

If you accept the new rent, please change your standing order so that £[proposed] reaches us on [effective date] and every month after. If you claim Universal Credit or Housing Benefit, tell them once the new rent starts.

If you think the proposed rent is more than the market rent, you can refer it to the First-tier Tribunal, free of charge, at gov.uk/guidance/apply-for-a-market-rent-determination. The tribunal must receive your application before [effective date]. If you do apply, please tell us. You can also simply talk to us first: if there is something about the figure or your circumstances we should know, reply to this email or call [name] on 020 8158 8434.

[Where posted or hand-delivered as well: A paper copy of this notice has also been [posted to you first class today / delivered to your door today].]

Kind regards,
[name], Property Sauce

### S2: New rent in effect

Subject: Your rent for [address] is now £[proposed] a month

Dear [first name],

As set out in our notice of [served date], your rent for [address] is £[proposed] a month from today, [effective date]. This month's invoice from Zoho Books shows the new figure. Please make sure your standing order is updated; if you have already done so, thank you.

If you receive Universal Credit or Housing Benefit, please report the new rent to them today so your payments keep up.

Kind regards,
[name], Property Sauce

### S3: Reply to a tenant who queries the notice

Subject: Re: Notice of proposed new rent for [address]

Dear [first name],

Thank you for getting in touch. The notice proposes £[proposed] a month from [effective date]. We set it by comparing [address] with [two-line summary of the comparables]. The evidence is attached.

You have three options: accept it and update your standing order for [effective date]; tell us in writing if you think a different figure is right, and we will consider it; or refer it to the First-tier Tribunal before [effective date], free, at gov.uk/guidance/apply-for-a-market-rent-determination. The tribunal decides the market rent and cannot set it higher than the figure in our notice.

If your circumstances make the increase difficult, tell us now so we can talk it through.

Kind regards,
[name], Property Sauce

### L11: Landlord approval (third-party landlords only; sent from the Landlord record)

Subject: Proposed rent increase at [address]: your approval needed by [date]

Dear [landlord first name],

The annual rent review at [address] is due. Under the Renters' Rights Act a rent increase now needs a formal notice (Form 4A) with two months' notice, once a year, and the tenant may refer it to a tribunal that sets the market rent.

- Current rent: £[current]
- Proposed rent: £[proposed] (evidence attached: last new let in the building and three current listings)
- Notice to be served: [target service date]; new rent from [effective date]

Please reply "approved" by [date], or tell us a different figure and why. We will not serve without your reply.

Kind regards,
[name], Property Sauce
