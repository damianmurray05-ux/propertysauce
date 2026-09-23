# Ops 04: Rent collection and arrears

Scope: payments matched from the Zoho Books bank feed, reminders, arrangements to pay, handover to Marchbank & Vale Associates or legal.

Status: dictated by Damian on 17 September 2026 and written up by the Ops 4 chat. The chasing timetable, the day 21 handover and the decision limits were **confirmed by Damian on 17 September 2026** and are company procedure. Still to build: the letter and SMS templates (section 5f), the Cowork routine (section 8), and the arrears fields on the Tenant record.

## 1. What this operation covers

Every tenancy pays rent monthly, in advance, on the date in the tenancy agreement, by standing order or bank transfer, quoting the payment reference we gave them. Zoho Books holds one customer per tenancy, raises the first invoice (deposit plus first month) at move-in and a recurring invoice on the same date every month. This operation matches each payment from the Books bank feed to its invoice, corrects tenants who pay with the wrong reference, chases anyone who has not paid on a fixed timetable, agrees payment plans within a set envelope, keeps the landlord informed, and hands a file that is not resolved to Marchbank & Vale Associates, and then to a legal route, on fixed days.

## 2. How it is done today

Damian's instructions, 17 September 2026:

- Rent comes in by standing order or bank transfer from the tenant on the agreed date in their tenancy agreement.
- On commencement of the tenancy a new profile is set up in Zoho Books with all the tenant's details. The first invoice covers the damage deposit and the first month's rent. A recurring invoice is then auto-generated on the same date each month and sent to the tenant as a request for that month's rent. Rent is normally paid in advance, not in arrears.
- Tenants must pay using the reference we gave them. If a payment arrives with the wrong reference, email the tenant immediately, remind them of the protocol and their reference, and tell them it is mandatory on every payment or they risk the payment not being allocated correctly.
- There was no written chasing protocol. Damian asked for one to be devised from common practice, with a recommended point for handing the file to Marchbank & Vale. He confirmed the timetable in section 5 the same day.
- Some tenancies have a guarantor, some do not. Where there is one, the deed of guarantee is on file and listed on the tenant's Zoho CRM record.
- Marchbank & Vale Associates handles possession claims as well as money recovery (see section 5c for how that works within the law).
- Marchbank & Vale phones tenants as well as writing. The calls are automated AI calls from a dedicated number (number being set up, 20 September 2026). Guardrails in 5c.
- Damian does not mind who signs claim forms and left the choice to this chat. Decision in 5c.

## 3. Systems and records touched

- **Zoho Books**, Property Sauce organisation 678590019: customers (one per tenancy), recurring invoices, customer payments, bank feed (Property Sauce Virgin Money for rent in; Deposit and Fee accounts; Lloyds Business Account). The payment reference each tenant must use is the Books customer custom field **Unique Reference Number** (`cf_unique_reference_number`, for example SSTEVEFLAT22 or NE236UNFLAT07). That field is the reference the wrong-reference rule in 5a checks against.
- **Zoho CRM, Tenant (Contacts) record**: rent due day, payment reference, last payment date and amount, arrears balance, arrears stage, next action date, guarantor details, "Tenant 1 Mobile" (`Tenant_1_Phone`) for SMS and calls. Every reminder, call and letter is written to the record. Formal letters are sent from the record (Send Email) so they sit on the tenant's file.
- **Zoho CRM, Landlord (Accounts) record**: who is told and when; the Established Landlord picklist decides ownership (README rule 4).
- **Channels**: SMS and calls through Twilio or Inkbox; email from contact@propertysauce.co for routine reminders; Zoho CRM Send Email for formal letters; post for the day 14 letter and anything Marchbank & Vale sends.
- **Slack**: #claude-urgent for hardship, vulnerability, disputes, bounced or reversed payments.
- **Marchbank & Vale Associates**: receives the handover file (section 5, stage 6). Trading name of Sure Lets and Manage Limited; never described as solicitors or as giving legal advice.
- **Drive**: tenancy folder for the signed agreement, deed of guarantee and copies of every letter.

## 4. Decision limits

Agreed with Damian, 17 September 2026:

- Bank feed lines are matched to a tenancy only when the match is certain: the payment reference names the tenancy or invoice, or the payer name and amount match one tenant exactly. Anything less certain is left uncategorised and listed for a person to allocate. This applies to the backlog (over 760 uncategorised lines across the Property Sauce accounts on 17 September 2026) and to every day after.

Confirmed by Damian, 17 September 2026:

- Claude may send every reminder, letter and call in stages 1 to 5 without asking, because each is a fixed template on a fixed day.
- Claude may agree a payment plan on its own if the arrears will be cleared within three months on top of the normal rent, and record it. Anything longer, or a second plan after a broken one, goes to Damian.
- Claude may hand a file to Marchbank & Vale on day 21 without asking, unless the file carries a hardship, vulnerability or dispute flag, in which case Damian decides.
- Only a person serves a Section 8 notice, issues a court claim or instructs a solicitor (README rule 2). Claude prepares the papers and the arrears schedule.
- Late-payment interest is charged at 3% above Bank of England base rate on rent more than 14 days overdue, from the due date to the payment date. Both tenancy templates in use provide for it (checked 17 September 2026): the Renters' Rights Act template at clause 2.4 (for example Flat 22 Catterick House, July 2026) and the older Rocket Lawyer AST template at clause 45 (for example 50C North Birkbeck Road, 2022). Before charging on any tenancy, read its agreement and note the clause number on the Tenant record. No other charge is ever added: the Tenant Fees Act 2019 permits interest and lost keys only, so the "recovery costs" indemnity at clause 2.3 of the new template is not relied on. Court costs are claimed only when a court awards them.
- The deposit is never used to cover rent during the tenancy.

## Facts established 17 September 2026

- The website's Zoho key now reads Zoho Books for Property Sauce (organisation 678590019), Beaucatt Homes, Beaumont Residential, Murray & Sullivan and Gladioli House, because contact@luxestay.co.uk was invited as a user. Montrose, Luxe Stay Virgin, Lancaster Residential Group and the Damian RBS organisations are still to be invited.
- Property Sauce bank accounts in Books: Property Sauce (Virgin Money, rent in), Property Sauce Deposit, Property Sauce Fee, and a Lloyds Business Account. The Deposit and Fee feeds last refreshed on 4 August 2026 and may need reconnecting under Banking.
- One Books customer per tenancy (for example "Flat 18 Catterick House - Chloe Louise Bostwick"), one invoice per rent period, payments recorded against invoices. Tenants' references vary: some use the invoice number, some a flat code, some free text.
- Read the feed with GET /books/v3/banktransactions?organization_id=...&account_id=...&status=uncategorized; record a match with POST /books/v3/customerpayments or by categorising the transaction.

## 5. The procedure, step by step (proposed, to confirm)

### 5a. Every day: match payments

1. Read the uncategorised lines on every rent account in the Books feed.
2. Match each credit to a tenancy under the section 4 rule. Record the payment against the open invoice. Update the Tenant record: last payment date, amount, arrears balance.
3. **Wrong reference**: if the match is certain but the reference is not the one we issued, still record the payment, then the same day email the tenant (template R0) reminding them of the protocol and their reference, and that it is mandatory on every payment or the payment risks not being allocated. Note it on the record. Second occurrence: same email, copied to the landlord's file. Third: Damian is told.
4. **Part payment**: record it, treat the shortfall as arrears from the due date, and carry on with the timetable below using the balance.
5. Unmatched credits, reversed or bounced payments, and any amount that matches no invoice go to a person the same day.

### 5b. When rent is not paid: the chasing timetable

Day 0 is the rent due date in the tenancy agreement. "Day 1" is the next calendar day. If a day falls on a weekend or bank holiday, the action runs the next working day. Every action is written to the Tenant record with channel, time and content, and the next action date is set.

Common practice across UK letting agents is contact within 1 to 3 days, a formal written demand at 7 and 14 days, guarantor and landlord brought in at the 7 to 14 day point, and a referral or pre-action letter at 21 to 28 days. This timetable follows that, with the gaps widening as the tone hardens. Contact every two days (day 1, 3, 5, 7, 9) is not recommended: after day 3 there is nothing new to say, it reads as nagging rather than escalation, and repeated contact with no new content can be complained of as harassment.

| Day | Stage | What happens | Who is told |
|---|---|---|---|
| 0 | Due | Books invoice already sent. Feed checked at end of day. No contact. | Nobody |
| 1 | Friendly reminder | SMS and email (template R1): rent due on [date] has not reached us; if paid, ignore and send us the reference; if there is a problem, tell us today. | Tenant |
| 3 | Call | Phone call from Front Desk, then SMS if no answer (R2). Ask for a payment date. If a date within 7 days is given and kept, the file closes. | Tenant |
| 7 | Formal reminder 1 | Letter by email from Zoho CRM (R3): balance, due date, payment reference, ways to pay, offer of a payment plan, free debt advice (Citizens Advice, StepChange), note that Universal Credit housing element can be paid direct to the landlord. States that interest may be charged from day 14 where the agreement allows. | Tenant; guarantor sent a copy (R3g); landlord told (L1) |
| 10 | Call | Second phone call. Purpose: get a plan agreed or learn why not. | Tenant |
| 14 | Formal reminder 2, final before referral | Letter by email from Zoho CRM and by first-class post (R4): full arrears schedule, 7 days to pay or agree a plan, and notice that on day 21 the file passes to Marchbank & Vale Associates for recovery and that possession grounds will be tracked. Guarantor asked to pay under the deed of guarantee (R4g). Interest starts if the agreement allows. | Tenant; guarantor; landlord (L2) |
| 21 | Handover to Marchbank & Vale | See 5c. File and arrears schedule passed over. Tenant told by us that the account has been referred (R5). | Tenant; landlord (L3) |
| 21 to 51 | Pre-action letter | Marchbank & Vale sends the Letter of Claim under the Pre-Action Protocol for Debt Claims (information sheet, reply form, financial statement form). The tenant has 30 days to reply. Any plan agreed in reply is recorded and monitored. | Tenant; guarantor |
| 30 | Second rent date | If the second month is also unpaid, arrears are now two months. Landlord asked to decide the route (L4): money claim, possession, or both. Universal Credit tenants: apply for managed payment to landlord and arrears deductions (two months' arrears qualifies). | Landlord; Damian |
| 51 | Money claim decision | If the Letter of Claim is unanswered or the plan is broken: 14 days' notice of intention to issue, then a county court money claim in the landlord's name. Marchbank & Vale prepares it; the landlord signs and issues (5c). | Landlord signs off |
| 60 | Two months' arrears | Section 8 on Grounds 10 (any arrears) and 11 (persistent late payment) is available but discretionary. Marchbank & Vale prepares the notice now; it is served at three months unless the landlord wants to move earlier. | Landlord |
| 90 | Three months' arrears | Section 8 notice on Grounds 8, 10 and 11 together, four weeks' notice, served by a person in the way the tenancy agreement allows, and recorded. Ground 8 is mandatory if three months' arrears still stand at the hearing. Possession claim issued after the notice expires, prepared by Marchbank & Vale (5c). | Landlord |

A payment in full at any stage closes the file and resets the stage to zero. A payment plan pauses the timetable while it is kept; one missed instalment restarts it at the stage it was paused, not at day 1.

### 5c. The handover to Marchbank & Vale (day 21)

Confirmed by Damian, 17 September 2026. Why day 21: by then the tenant has had a reminder, two calls and two formal letters, the guarantor and landlord are in, and the next rent date is a week away. A letter from a separate recovery firm landing before the second due date makes the second month the tenant's decision point, and the 30-day protocol clock runs out around day 51, before the two-month arrears point, so the money claim and the possession route line up. Earlier than 21 there has not been a fair chance to pay; later than 28 the arrears are already two months and the pre-action clock is behind the possession clock.

The handover file, sent from Zoho and stored in Drive:

- Tenancy agreement, deed of guarantee, deposit certificate, How to Rent confirmation.
- Arrears schedule from Books: every invoice, every payment, running balance.
- Every reminder, letter and call note from the Tenant record, with dates.
- Any plan offered or agreed, and what happened to it.
- Flags: hardship, vulnerability, dispute, Universal Credit, a repair complaint that predates the arrears.
- Landlord's name exactly as on the agreement, and their instructions so far.

Files carrying a hardship, vulnerability or dispute flag are not handed over automatically; Damian decides.

**What Marchbank & Vale does, and the line it must not cross.** Marchbank & Vale is a trading name of Sure Lets and Manage Limited and has no solicitor. Conducting litigation for someone else is a reserved activity under the Legal Services Act 2007, so the split is:

- Marchbank & Vale does all the recovery correspondence in its own name: the Letter of Claim, the reply-form chase, payment-plan negotiation, the guarantor demand.
- Marchbank & Vale prepares every court document: the arrears schedule, the money claim, the Section 8 notice, the possession claim (N5 and N119), the witness statement and the hearing bundle.
- Where the landlord on the agreement is **Sure Lets and Manage Limited** (the new template names it as landlord, for example Flat 22 Catterick House), the company is the claimant, so it issues and signs in its own name and a director or employee attends the hearing, asking the court's permission to speak for the company (CPR 39.6).
- Where the landlord is **anyone else** (the older agreements name the owner, for example Sturge East Residential Ltd), the landlord is the claimant. They sign the claim form and the statement of truth, the claim is filed in their name, and they attend the hearing themselves or instruct a solicitor or barrister for the day. Marchbank & Vale does not sign, file or speak for them.
- Nothing from Marchbank & Vale ever says or implies solicitor, lawyer, legal advice or legally qualified. "Recoveries and litigation support" is the description.

**Who signs (decided 20 September 2026).** Where the landlord is Sure Lets and Manage Limited, Damian signs the claim form and statement of truth as director, and Marchbank & Vale puts the papers in front of him ready to sign. Where the landlord is another company or person, that landlord signs. The routine prepares the pack, sends it to the signatory with a one-page cover note saying what it is and where to sign, and records the signed date on the Landlord record. Nothing is filed until the signed copy is back.

**Marchbank & Vale phone calls (agreed 20 September 2026).** Calls are automated AI calls from the Marchbank & Vale number. Rules:

- The call opens by saying it is an automated call from Marchbank & Vale Associates about the account for [address], and that it is recorded. It never claims to be a person or a law firm.
- One call attempt a day at most, between 9am and 7pm, never on Sundays or bank holidays. If the tenant asks for calls to stop, calls stop and the record says so; letters continue.
- The call states the balance and the reference, offers a payment plan within the envelope in section 4, and gives the tenant a way to reach a person. It never threatens anything the timetable does not do.
- Any mention of hardship, vulnerability, dispute or a repair complaint ends the call politely and flags the record for a person (5e).
- A transcript and outcome are written to the Tenant record within the hour.
- Frequency, tone and content stay inside section 40 of the Administration of Justice Act 1970 (harassment of debtors) and the Protection from Harassment Act 1997.
- The tenant's number comes from the CRM field labelled "Tenant 1 Mobile" (`Tenant_1_Phone`).

**Serving notices.** The new template (clause 7.2) allows notices by email to the tenant's stated address and treats post as served two working days after posting. The older Rocket Lawyer template (clause 48) allows only first-class post or leaving the notice at the property, served the next day. Before the day 14 letter and before any Section 8 notice, read the agreement and serve in the way it allows. Post is always used as well as email for the day 14 letter and the Section 8 notice.

### 5d. Payment plans

- Offered from day 7. Written, dated, with instalment amounts and dates, sent from Zoho CRM and acknowledged by the tenant in writing (email reply or signed).
- Envelope for Claude to agree alone: arrears cleared within three months on top of normal rent. Outside that, Damian.
- Books: leave the invoices open, record each instalment against the oldest.
- One missed instalment: SMS same day, call next day. Two missed: plan cancelled, timetable resumes.

### 5e. Things the timetable must respect

- No contact before 8am or after 8pm, no more than one call attempt a day, no contact with employers or family, no threats of anything we will not do. Wording is always about the debt and the options, never about the person.
- Any mention of illness, bereavement, job loss, domestic abuse, a child at risk or benefits delay: stop the timetable, flag the record, tell #claude-urgent, and Damian decides the next step. Signpost to free advice in every formal letter.
- Universal Credit: rent unpaid only because a UC housing payment has not yet arrived does not count towards Ground 8. Ask the tenant on day 3 whether UC is involved.
- A repair complaint raised before the arrears is noted on the file; it does not stop chasing but it is disclosed to the landlord and to Marchbank & Vale.
- Every letter goes from Zoho CRM so it sits on the record. Every call is noted the same day.
- The new template (clause 2.5) requires the tenant to tell us when they start Universal Credit or a payment is delayed. Ask on day 3 anyway, and record the answer.
- Guarantors: check the Tenant record for a deed of guarantee before day 7. If there is one, the guarantor gets a copy of every formal letter and the day 14 demand. If there is not, the guarantor rows in the timetable are skipped and the landlord is told the tenancy is unguaranteed.

### 5f. Templates to write

R0 wrong reference; R1 day 1 SMS and email; R2 day 3 SMS after the call; R3 day 7 formal reminder and R3g guarantor copy; R4 day 14 final reminder and R4g guarantor demand; R5 day 21 referral notice; L1 to L4 landlord updates; MV1 Letter of Claim pack (letter, information sheet, reply form, financial statement form) on Marchbank & Vale paper. Every tenant letter names the balance, the reference, the ways to pay, a person to speak to and the free advice lines. To be written in this chat next and stored as Zoho CRM email templates.

## 6. Escalation

- Same day to #claude-urgent: bounced or reversed payment, a tenant disputing the balance, any hardship or vulnerability mention, a threat of any kind, a tenant who says they have left.
- To Damian before the next action: any plan outside the envelope, any flagged file reaching day 21, any landlord who wants to move faster or slower than the timetable, anything at day 30 and beyond.
- To the landlord: day 7 (L1), day 14 (L2), day 21 (L3), day 30 decision (L4), and on the monthly statement with the arrears position and actions taken (Ops 10).

## 7. Done when

The arrears balance on the Tenant record is zero and matches Books, or a written plan is in place and being kept, or the file has been handed to Marchbank & Vale with the full pack and the handover is noted on the Tenant and Landlord records.

## 8. Cowork routine

[To write once section 5 is confirmed. Outline: daily at 17:00, read the feed, match, update records, send the day's reminders from the timetable, list exceptions and unmatched lines for a person, post a one-line summary to Slack; weekly on Monday, arrears report by landlord with stage and next action date.]

## 9. Test plan

Test tenancy (chosen 20 September 2026, Damian left the choice to this chat): **Flat 22 Catterick House, Cottenham Road, S65 1LD**, tenant Sarah Leanne Stevenson, landlord Sure Lets and Manage Limited, rent £600 due on the 18th, reference SSTEVEFLAT22, Books customer 1626078000012106738, tenancy on the new Renters' Rights Act template (interest at clause 2.4, email service at clause 7.2). Chosen because the whole chain from reminder to possession sits inside Damian's own company, and because it is live: on 20 September 2026 the 18 September invoice of £600 was unpaid, so the case is at day 2.

Run the daily routine on this one tenancy in report-only mode: every message drafted and shown to Damian before it is sent, every Books match and record note listed. Run for one week or until the balance clears, whichever is later. Check the Books match, the Tenant record note, the message wording, the guarantor check and the landlord update. Switch on for everyone only after Damian has read the week's log.

## 10. Open questions

Answered 17 September 2026: day numbers and day 21 handover confirmed; interest clause present in both templates (section 4); guarantors on some tenancies, deeds on file in Zoho CRM; Marchbank & Vale handles possession claims within the limits in 5c.

Answered 20 September 2026: Damian signs as director where Sure Lets and Manage Limited is the landlord (5c); Marchbank & Vale phones tenants with automated AI calls from its own number, number being set up (5c); test tenancy is Flat 22 Catterick House (section 9).

Still open:

- Which arrears fields exist on the Tenant record today (arrears balance, arrears stage, next action date, guarantor lookup, interest clause number)? To check in Zoho and add what is missing before the test week.
- The Marchbank & Vale phone number and the AI calling provider, once set up.
- Templates R0 to R5, R3g, R4g, L1 to L4, MV1 and MV2 are drafted in docs/ops/04-templates.md (20 September 2026) and wait for Damian to read them before they are loaded into Zoho CRM and the SMS and calling tools.
