# Ops 10: Landlord statements and payouts

Scope: paying landlords what is theirs, and telling them every month what happened at their properties: one email, one statement, one bill, plus the quarterly and annual summaries their accountant needs.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 10 chat. The protocol in section 5 is **proposed** from the research in the appendix and the way Books is used today; the points in section 10 need Damian's yes before the first pack goes to a landlord. Built so far: `scripts/landlord-statement.mjs` (email, statement and bill for one landlord and one month, from live Books and CRM data), `scripts/payment-run.mjs` (the Virgin Money upload file), `scripts/print-pdf.sh`. A sample pack for Crackle Property Ltd, September 2026, is in `out/statements/` (git-ignored) and was sent to Damian as PDFs.

## 1. What this operation covers

Rent reaches the Property Sauce client account from tenants (Ops 04 matches it). From there this operation does two things. First, it pays each landlord their share, rent less our fee and less any cost we paid on their behalf, on a fixed rhythm and never twice. Second, it reports: a monthly pack for every landlord that reads as a note from a person who has been watching their property, not a print-out; a quarterly summary shaped for Making Tax Digital; an annual statement for the tax year. Every figure comes from Zoho Books, every event from Zoho CRM, and nothing is sent that the office has not already recorded.

## 2. How it is done today

Damian's instructions, 19 September 2026:

- Landlord reporting has been the weakest part of the service. The landlord portal on the website is the start of fixing it; a monthly email should follow.
- The email must be short, warm and different each month, so it reads as personal: "Dear Leonard, just thought I'd send you your monthly statement and your monthly bill." Two attachments: the statement and the bill.
- The bill is the Zoho Books document that shows three things: the rent received from the tenant, the amount deducted for our fee, and the amount sent to the landlord.
- How often to send full statements, running statements and balances is open; Damian asked for the general consensus to be researched and a protocol set that Claude then sticks to. The aim: do not bore them, but show that the property is being watched and that the service is worth staying for. Everything should look as good as the email signature.
- Paying landlords: Virgin Money Business Internet Banking accepts a payment file upload. Damian's idea is one or two uploads a week: Claude fills the sheet in Virgin's column layout, the team asks for it, uploads it, the payments are made, and Claude starts a fresh sheet so nothing is paid twice. His preference would be for Claude to log in with the team's arrange-only login and set the payments up for him to authorise. Claude cannot do that (section 4), so the file route is the one built.
- Two bank logins exist: the team's login can set payments up but not release them; Damian gets a text asking him to log in and authorise.

Damian's instructions, 21 September 2026 (they apply to Ops 06 as well; Damian is passing the same text to that chat):

- Payment runs every **Wednesday and Friday** (changed later the same day to every working day, below). Each run carries three kinds of payment: landlord payments, Property Sauce fee payments, and contractor invoice payments.
- The order of events: rent is received; that rent is divided between the Property Sauce fee (if one applies), any contractor work carried out at the property, and the remainder, which goes to the landlord.
- In-house maintenance staff (Rocky, Ali and the others) do not invoice us; they work for us directly on our own properties. When one of them does a job on a managed landlord's property, that landlord is invoiced by **Elite Construction and Property Maintenance** at the fixed hourly rate plus any materials bought.
- A contractor, ours or external (a gas engineer doing a certificate, for example), is paid **only once the rent for that property has been received**. Contractors must be told this, and told to expect payment within 31 days. Because the timing depends on when the job falls against the rent date, Claude, which has every rent due date, tells the contractor the exact date their invoice will be paid, parks the invoice, and brings it into the payment run of the week that rent arrives.
- Only once the tenant's rent is in are we, as managing agent, in a position to split it: the contractor; the Luxe maintenance management fee; the Property Sauce management fee; the remaining balance to the landlord.
- At that point Claude creates a bill for the landlord in Zoho Books and emails it to them. The bill breaks down the money received, how it was dispersed, and the final balance paid to the landlord. Bills are already being created in Books, so previous ones are the model; Damian will record a skills video if the creation needs showing.
- **Muzammel approves and uploads every payment sheet.** Claude never uploads. After a few weeks or a couple of months of Claude building the sheets, and once they are trusted, Claude may be given access to upload to Virgin directly.

Damian's answers, 21 September 2026 (later the same day):

- **Runs are daily, every working day, sheet ready in Drive by 12:00.** Any tenant rent for the day has landed by then; Muzammel checks the sheet and uploads it before lunch, so it is a fixed daily task. The Wednesday and Friday, and Tuesday and Friday, versions are superseded: the point of the system is to run efficiently and give landlords a better service.
- First name on the statement and email: yes.
- The old unpaid bills: Muzammel manages the reconciliation (section 5a, "The backlog").
- Sure Lets and Manage Limited is not VAT registered (Damian: "not registered"), so no VAT appears on bills or statements.
- No landlord lives abroad, so the Non-resident Landlord Scheme does not apply.
- "Leonard" was an example, not a landlord.
- Questions about this operation go to Muzammel, who runs the accounts section.

What Books shows (checked live, 19 September 2026):

- Every landlord property is a **vendor** in Books named `<Landlord> - <Property>` (about 200 landlord vendors among 400 vendors). Each month a **bill** is raised on that vendor, for example "Flat 7, 35 Lord Street - Sep 2026", with two lines: "Landlord Rent Payment" at the rent received (£583.00) and "Property Sauce Management Fee" as a negative line (9%, -£52.47), sometimes a third negative line for a repair recharge. The bill total is the payout (£530.53). Paying the landlord is recorded as a bill payment, "Bank Transfer", on the day it was sent.
- Bills are dated when the rent lands, so payouts go out property by property through the month, not on one day. 181 bills were raised in August and September across 13 landlords: Lancaster Residential Group 68, Beaucatt Homes 54, Beaumont 20, Murray & Sullivan 14, Crackle Property 12, then singles.
- Some bills are raised **before** the rent arrives (Flat 9, 35 Lord Street, September: bill dated 15 September, rent invoice still unpaid on the 19th). The generator detects this and shows the flat as awaiting rent, but the practice should stop: raise the bill when Ops 04 matches the payment.
- The payables ledger is not reconciled. Crackle Property Ltd alone shows 35 unpaid bills going back to April 2021 totalling £9,866.60; across all landlords, 214 bills are unpaid. Most will have been paid from the bank and never marked paid in Books. Until this is cleared, "balance held for you" cannot be quoted to a landlord, so the pack only lists unpaid bills dated in the last 90 days and prints the older ones as an office check.
- The fee varies by landlord: 9% (Crackle), 15% (Murray & Sullivan), none for Damian's own companies (Beaucatt Homes bills carry rent only). The percentage lives only in the fee line's description, not on any record.
- Payment run dry run, 19 September 2026 (`scripts/payment-run.mjs`, nothing written): 36 payments totalling £21,247.60 would go out today across six landlords (Lancaster Residential Group 14, Beaucatt Homes 11, Murray & Sullivan 4, Tanc Residential 2, Beaumont 2, Crackle Property 3); 177 unpaid bills were held back as older than 90 days and one ("Annex 1 Windmill Cottage") matched no Landlord record. Books names Lancaster flats "Flat 31 Lancaster House" and the CRM "31 Lancaster House"; the scripts allow for that.
- Landlord contact details: the CRM's Vendor_Email is unreliable (README rule 4); the portal maps sign-in emails to Established Landlords in `PORTAL_LANDLORD_EMAILS`. There is no field anywhere for the first name to greet, the statement email, or the fee percentage. Section 10 asks for them.

## 3. Systems and records touched

- **Zoho Books, Property Sauce organisation 678590019**: bills on landlord vendors (the payout ledger), bill payments, customer invoices and payments (rent in, from Ops 04), the Virgin Money feed. The Beaucatt, Beaumont, Murray & Sullivan and Gladioli organisations exist too; whether any landlord bills live there is an open question.
- **Zoho CRM, Landlord (Accounts) record**: Established Landlord (ownership, README rule 4), Monthly_Rent, certificates, Tenancy_End_Date, inspection fields, Landlord_Account_Name / Sort_Code / Number (payout account, README rule 7), and the new fields proposed in section 10 (Statement_Email, Statement_First_Name, Management_Fee_Percent, Statement_Frequency, NRL flag).
- **Zoho CRM, Maintenance module**: repairs completed and open in the month, certificate renewals (Ops 05 and 07).
- **Zoho CRM, Tenant (Contacts)**: arrears stage and next action (Ops 04), so the pack can say what is being done.
- **Website**: the landlord portal at propertysauce.co/landlord-portal/ (live data, documents, jobs, dashboards); the pack links to it rather than repeating it.
- **Scripts in this repo**: `scripts/landlord-statement.mjs`, `scripts/payment-run.mjs`, `scripts/print-pdf.sh`. Output in `out/` (git-ignored).
- **Drive**: "01 Property Sauce/Accounts/Statements/<landlord>/<YYYY-MM>/" for the sent PDFs; "Accounts/Payment runs/" for the upload files (restricted to Damian and the accounts team; never Slack, never chat).
- **Mail**: accounts@propertysauce.co, once it exists as a mailbox or alias and has been verified as a sender ([[verify-sender-before-sending]]). Until then admin@propertysauce.co with the accounts signature.
- **Virgin Money Business Internet Banking**: Payments, Faster payments and transfers, Upload payment from file. The file template and instructions are only shown inside that screen (checked 19 September 2026 on business.support.virginmoney.com, article KA-13117). Payment files work for Faster Payments only.
- **Slack**: #claude-urgent for a landlord dispute about money, a bounced payout, or a payout that would leave a landlord's rent account negative.

## 4. Decision limits

Proposed, to confirm with Damian:

- **Claude never moves money.** It does not log in to online banking, does not set payments up, does not hold or type bank credentials, and does not release anything. That is a fixed rule of the tools Claude runs under, not a preference. What Claude does: builds the payment file, hands it to Muzammel, records the result. **Muzammel approves the sheet and uploads it; Damian authorises in the bank; Claude confirms from the feed.** Confirmed by Damian on 21 September 2026: Claude does not upload, and will not until the sheets have been trusted for some weeks and Damian says so. Muzammel is the person Claude asks when anything in this operation needs a decision below Damian's level.
- Claude may prepare and send the monthly pack to every landlord without asking, once the template has been approved on one landlord for one month (section 9) and the payables backlog for that landlord is clean.
- A payment enters a run only when all of these are true: the rent it comes from is matched in Books (Ops 04), the bill is unpaid, the bill carries no earlier run id, the bill is dated within 90 days, the property has a complete payout account on its Landlord record, and the bill leaves the landlord's rent account at or above zero. Anything else is listed for a person, never paid blind.
- Deductions from rent, in this order (Damian, 21 September 2026): the contractor's invoice for work at that property, where Ops 05 recorded the landlord's approval; the Luxe maintenance management fee where it applies; the Property Sauce management fee at that landlord's percentage; the remainder to the landlord. Nothing else. Claude never withholds rent as a float or reserve unless the agreement says so and Damian has confirmed the amount.
- **A contractor is paid only from rent already received** for the property the work was done at, never from other landlords' rent and never in advance. If rent is late, the contractor's payment waits with it and the contractor is told the new date the same day. If the deductions exceed the rent, the landlord is paid nothing that month, the shortfall carries to the next rent, and Damian is told (section 6).
- Work by our own team on a managed landlord's property is invoiced to that landlord by Elite Construction and Property Maintenance at the fixed hourly rate plus materials (Ops 06 step 8, updated by Damian on 21 September 2026: the invoice comes from Elite, not Property Sauce). The invoice is deducted from rent like any contractor invoice.
- A landlord asking a question about their statement gets a reply within one working day with the figures from Books. A landlord disputing a figure gets an acknowledgement the same day and Damian is told; no correction is made to Books without a person.
- Nothing in the pack is written from memory or a team member's word: every number is read from Books at generation time, every event from the CRM (README rule 1).

## 5. The procedure, step by step (proposed)

### 5a. Payment runs: every working day, sheet ready by 12:00

Confirmed by Damian, 21 September 2026: one run every working day. Claude builds the sheet by 12:00, by which time the day's tenant rents have landed; Muzammel checks it and uploads it before lunch; Damian authorises from the bank's text. Each run carries landlord payments, the Property Sauce fee sweep and contractor payments. A landlord therefore receives their rent the working day it clears, or the next one, which is the fastest promise an agent can make and the one the statement makes.

**The split, property by property.** Nothing is paid until the tenant's rent for that property is matched in Books (Ops 04). Then, from that one rent payment and in this order:

1. Contractor invoices for work at that property (Ops 06: approved by the landlord before the job, checked against the quote or rate card, signed off). Includes Elite Construction and Property Maintenance invoices for our own team's work on a managed landlord's property.
2. The Luxe maintenance management fee, where it applies (rate and payee in section 10).
3. The Property Sauce management fee at that landlord's percentage.
4. The remainder to the landlord.

The bill in Books records exactly that split: rent received as the positive line, each deduction as a negative line with what it was for, and the total as the landlord's payout. It is emailed to the landlord from Books when it is raised, and it is what the monthly bill (5b) summarises.

**Parking a contractor invoice.** When an approved invoice arrives and that property's rent has already gone out for the month, the invoice waits for the next rent. Claude reads the rent due date from the Tenant record, writes the expected payment date on the ticket and the Books bill, and emails the contractor the same day: "Your invoice <number> for <property> is approved for £<amount>. Rent at that property is due on <date>, so it will be in our payment run on <the working day after that date> and with you the same day." Contractors are told at engagement that payment follows the rent and is always within 31 days; if a late rent would push a payment past 31 days, Damian decides whether to pay from the fee account (section 6). Ops 06 owns the contractor side of this; the wording here is the contract between the two operations.

**The run itself.**

1. **Every working day at 11:45.** Claude runs `scripts/payment-run.mjs --write --mark`. It reads every unpaid landlord bill in Books, applies the section 4 tests, looks up the payout account on the Landlord record, and writes two files: `RUN-<date>-<letter>.csv` (Virgin's seven-column layout, no header, proved by the £1 test on 20 September 2026; see Ops 06 step 10) and `RUN-<date>-<letter>-log.csv` (the office copy, no account numbers). It stamps each bill's reference in Books with the run id, so a bill can never enter a second file. Contractor lines come from Ops 06's approved bills in the same file; the Property Sauce fee lines are one transfer per run from the rent account to the Property Sauce Fee account for the fees deducted on the bills in that run (`PAY_FEE_SORT` and `PAY_FEE_ACCOUNT` in .env). The upload file goes to Drive "Accounts/Payment runs" and the log is posted to the accounts team on Slack with the totals per landlord and the list of bills held back and why.
2. **The reference on the landlord's bank statement** is "PS " plus the property, cut to 18 characters, for example "PS Flat 7 35 Lord". One payment per bill, so a landlord with nine flats sees nine lines and can tie each to the statement.
3. **Muzammel approves and uploads, by 12:00 every working day.** He opens the file from Drive, checks the log against it, signs in to Virgin Money Business Internet Banking (Payments, Faster payments and transfers, Upload payment from file), sets the payment date and uploads. Any line the bank rejects, he tells Claude with the bank's error text; Claude fixes the record it points to and rebuilds. Payees must already exist under Manage your payees; a new landlord or contractor is added there by Muzammel before their first run.
4. **Damian authorises.** He receives the bank's text, signs in and authorises the batch. He tells Muzammel or Claude it is released, or the feed shows it.
5. **Confirm.** The next working day Claude reads the Virgin feed in Books and matches each debit to its bill by amount and reference, records a bill payment dated the debit date, sends each contractor its remittance (Ops 06), and posts "RUN-… released: N payments, £X" to Slack. A debit with no bill, or a bill in the run with no debit after two working days, goes to #claude-urgent.
6. **A file that was not uploaded** (holiday, bank down): the bills keep their run id, so the next run does not pick them up. Muzammel says which run is stale; Claude clears the stamp (`--unmark RUN-…`, to add) and they fall into the next file.

Cut-off: rent cleared in the feed by 11:30 is in that day's run; anything later is in tomorrow's. A day with nothing to pay still gets a one-line note to Muzammel saying so, so silence never means the run was missed. Still to decide (section 10): whether Damian's own companies are paid by the same run or left as internal transfers.

**The backlog.** Books shows 214 landlord bills as unpaid, some going back to 2021, because payments were made from the bank but never recorded against the bill. Muzammel manages clearing it (Damian, 21 September 2026). To make it quick: Claude lists every unpaid bill older than 90 days alongside the bank debits that match it by amount and date, as a sheet in Drive; Muzammel ticks each match or writes what really happened; Claude records the bill payments in Books from the ticked rows. Until a landlord's rows are cleared, that landlord's statement does not show a "held for you" figure.

### 5b. The monthly pack: first working day of the month

Sent on the first working day after the month end, covering the calendar month just ended. This is when landlords and their accountants do their own books; it is also early enough for the quarterly MTD deadline (section 5c). One email per landlord, not per property, with two PDFs attached. Generated by `scripts/landlord-statement.mjs --landlord "<Established Landlord>" --month YYYY-MM --to <first name> --pdf`, printed with `scripts/print-pdf.sh`, and read by a person before the first three months' sends.

**The email** (`email.html`), in the house style of the signature: gold rule, deep green, Helvetica, the PS mark, the accounts signature and the legal footer. Under 200 words of prose. Its parts, in order:

1. "Dear <first name>,"
2. **One opening sentence** that changes. Six openers rotate by landlord and month so no landlord sees the same one twice in a row (for example "Here is how September went at the 35 Lord Street flats. Your statement and our bill are attached."). Then **one sentence from the numbers**: "All nine rents came in and £3,431.23 went to you across the month," or "Seven of the nine rents came in, £2,715.12 went to you; Flat 9 and Flat 1 are being chased under our arrears timetable and you will hear from us at each stage." This is what makes it personal: it is specific to their month, not a synonym swapped in.
3. **One sentence on repairs and one on what is coming**: "Two repairs were completed (boiler service at Flat 3, tap at Flat 7) and one is in hand. Coming up: the gas safety certificate at Flat 4 is due on 12 October and the renewal is booked in our diary."
4. **Four tiles**: Rent received, Our fee, Other deductions, Paid to you.
5. **By property**: one row each, rent in, deducted, paid to you, paid on (or "next run"). A flat with no rent says so in a sub-line ("No rent received. £441.00 outstanding, being chased" or "No rent fell due in the month" or "Vacant"), so silence is never read as everything fine.
6. **This month at your properties**: bullets from the CRM: repairs completed (with cost and the tenant's rating), repairs in hand (with the visit date), inspections done and their outcome, certificate renewals in progress, arrears with the date and "reminders sent on our timetable". Only tickets touched in the last 60 days appear; older open tickets are an office check, not news.
7. **Coming up**: certificates expiring within 90 days (booked), fixed terms ending within 90 days (renewal in hand, Ops 11), inspections due within 60 days.
8. Buttons: Open the landlord portal; Ask a question (mailto accounts@ with the statement number in the subject).
9. The attachments line, sign-off from the accounts team (or `--from Damian` for a personal sign-off), signature, footer.

**The statement** (`statement.pdf`, A4, number PS-<code>-<YYYYMM>): landlord, period, issued date; the four tiles; **Rent account by property** (property and tenant, rent received and when, amount, deducted and what for, paid to you and when, tenant owes, position); **Cleared and waiting for the next payment run** (or "Nothing is held"); **Repairs and compliance in the period** with cost to the landlord; **Certificates and dates** for every property (gas, EICR, EPC with rating, licence, tenancy end, next inspection; red for expired or missing and already in hand, gold for due within 90 days and booked); footer with the statement number and who to ask.

**The bill** (`bill.pdf`, same number): from Sure Lets and Manage Limited trading as Property Sauce, to the landlord; per property: rent collected, management fee with the percentage, costs recharged with what they were, paid to you, paid on; totals; and the line "Nothing to pay. Our fee and any recharged costs were deducted from the rent before it was paid to you, so this bill is your record of what we charged … Keep it with your statement for your tax return: the rent collected is your gross income, and the fee and costs are allowable expenses."

**Rules the words follow.** Plain English, every sentence says who did what and when (README rule 6). Never "please find attached". Never a figure that is not in Books. Bad news is in the first paragraph, not buried: arrears, an expired certificate, a repair still open after 14 days. Money being chased is described as being chased, with the day of the timetable, never as lost. No marketing. One question at most ("Would you like us to quote for the bathroom fan while the electrician is there?"). Nothing about other landlords or tenants' personal circumstances beyond "the tenant has told us of a delay; we are in contact".

**Filing.** The three PDFs and the email HTML go to Drive under the landlord and month, and a note "Statement PS-… sent to <address> on <date>" goes on each Landlord record so the portal's documents list shows it (the portal already classifies files named "statement").

### 5c. Quarterly summary: within three working days of each MTD quarter end

From April 2026, landlords with more than £50,000 of gross property and self-employment income must keep digital records and send HMRC a quarterly update; the threshold falls to £30,000 in April 2027 and £20,000 in April 2028. The update needs **gross rent** and **expenses by category**, not a net figure, and is due by the 7th of the month after each quarter (quarters to 5 July, 5 October, 5 January, 5 April, or calendar quarters if the landlord has elected). A monthly statement that arrives mid-month is too late for the 7th, which is why the monthly pack goes on the first working day and why a quarterly summary is sent separately.

The quarterly summary is one PDF per landlord: gross rent per property for the quarter, our fees, repairs and maintenance, certificates and compliance, insurance and other costs each as its own total, and net paid; a twelve-month rent bar per property; occupancy; arrears position at quarter end; certificates due in the coming quarter. Sent within three working days of the quarter end with a two-line email. Landlords under the threshold get it anyway: it is the portfolio review the research says retains clients, and it costs nothing extra. (To build: `--quarter` in the generator.)

### 5d. Annual statement: by 30 April

Tax year 6 April to 5 April, one PDF per landlord by 30 April, laid out in SA105 order: total rents, then property income allowance note, then expenses split into rates and insurance, repairs and maintenance, legal and professional fees (our fee sits here), other costs, and the net. A separate page per property for landlords who want per-property figures. Sent with a note offering to send it straight to their accountant if they give us the address. Non-resident landlords (section 10) also need the NRL quarterly return and the annual NRL6 certificate; that is a tax duty on us as agent, so the first job is to find out whether any landlord lives abroad.

### 5e. Milestone notes: from the other operations, referenced here

Landlords hear at the moment something happens, not a month later: repair reported and quote (Ops 05), repair completed with the photo (Ops 05), inspection done (Ops 05 step 14), certificate renewed or expired (Ops 07), arrears at day 7, 14, 21 and 30 (Ops 04 L1 to L4), notice given and check-out (Ops 09), renewal and rent review (Ops 11). The monthly pack summarises those; it never breaks bad news first, because the milestone note already did. The research is clear that landlords leave agents they hear from only when something goes wrong, and stay with agents who tell them before anyone else does.

### 5f. What is deliberately not sent

No weekly emails. No newsletter. No "market update" unless it changes a decision for that landlord (a rent review, a licensing change in their borough). No portal nag. If a month had no rent movement, no repair and nothing due, the email still goes, three sentences long, because the silence itself is the news: "A quiet month: every rent in, nothing needed fixing, every certificate in date."

## 6. Escalation

- Same day to #claude-urgent: a payout that would take a landlord's rent account negative; a debit in the feed with no matching bill; a bill in a released run with no debit after two working days; a landlord disputing a figure; a bounced or returned payout.
- To Damian before the next run: any bill older than 90 days that a landlord asks about; any deduction not backed by an approval on the ticket; any request to pay a different account from the one on the Landlord record (README rule 7: account changes come only from the landlord in writing, verified by a call back to a known number, and are made in Zoho by a person).
- To the landlord: nothing from this operation is sent late. If a pack cannot be generated on the first working day (Books down, backlog unreconciled), the landlord gets a two-line note saying when it will come.

## 7. Done when

Every landlord with rent received in the month has a pack in Drive, a sent note on their Landlord records, and the email in the sent folder of the verified sending address, by the end of the first working day. Every bill dated in the month is either paid (bill payment recorded, matched to a feed debit) or in a stamped run awaiting authorisation, or listed for a person with a reason. The payables ledger shows no unpaid bill older than 90 days without a note explaining it.

## 8. Cowork routine

To write once section 10 is answered. Outline:

- **Every working day 11:45**: payment run (5a steps 1 and 2); file the upload in Drive for Muzammel by 12:00; post totals and holds to Slack.
- **Every working day 09:30**: match released runs to feed debits (5a step 5); flag exceptions.
- **First working day of the month 08:00**: generate every landlord's pack; a person reads them for the first three months, then they send unattended; file and note (5b).
- **8 July, 8 October, 8 January, 8 April**: quarterly summaries (5c).
- **20 April**: annual statements drafted for Damian's read; sent by 30 April (5d).
- Inputs: Books and CRM only. Reports to: the accounts team channel for runs, Damian for anything in section 6.

## 9. Test plan

One third-party landlord, one month, with Damian reading everything before it goes:

1. Crackle Property Ltd (nine flats at 35 Lord Street, Blackpool, 9% fee, a genuine mix of paid, unpaid and recharged this month). The September 2026 pack has already been generated and is the sample sent with this file.
2. Before sending anything to Crackle: reconcile their 35 old unpaid bills (a person marks paid the ones the bank shows were paid), stop raising bills ahead of the rent, confirm the greeting name and the statement address (section 10).
3. Payment run dry run every Tuesday and Friday for two weeks with the file produced but not uploaded; compare against what the team actually paid; fix the holds list.
4. First live upload with the team member and Damian both present; confirm the feed match next day.
5. First live pack to Crackle on 1 October 2026 covering September, read by Damian first. Then Beaumont and Murray & Sullivan (different fee percentages). Then everyone from November.

## 10. Open questions

For Damian:

1. ~~Payout rhythm~~ Answered 21 September 2026: every working day, sheet ready by 12:00.
2. ~~Who uploads~~ Answered 21 September 2026: Muzammel approves and uploads; Claude does not, until told otherwise. Still open: whether Damian's own companies (Beaucatt, Beaumont, Lancaster, Murray & Sullivan, Tanc) are in the same runs or handled as internal transfers.
3. **Statement day**: first working day of the month, as proposed?
4. **Greeting and address per landlord**: first names approved 21 September 2026. Still needed from Muzammel: the first name and statement email for each Established Landlord (Crackle: is it Aman, and which of the two addresses on the records?). Proposed: three new fields on the Landlord record, Statement_First_Name, Statement_Email, Management_Fee_Percent, set once per Established Landlord and copied to every property record.
5. ~~The payables backlog~~ Answered 21 September 2026: Muzammel manages it (5a, "The backlog").
6. ~~VAT~~ Answered 21 September 2026: not VAT registered.
7. ~~Non-resident landlords~~ Answered 21 September 2026: none.
8. **Own-company landlords**: do Beaucatt, Beaumont and the rest want the same pack (useful for their accountants) or a shorter internal version?
9. **Sign-off**: the accounts team, or Damian by name on the smaller landlords?
10. ~~"Leonard"~~ Answered 21 September 2026: an example, not a landlord.
11. **The Luxe maintenance management fee** (new, 21 September 2026): which entity charges it, at what rate or amount, on which jobs, and which account it is paid to. It is not on any Books bill today.
12. **Elite Construction and Property Maintenance**: the hourly rate and minimum call-out for recharging our own team's labour, whether Elite invoices from its own Books organisation or from Property Sauce's, and its bank account for the run (Books already has a vendor "ELITE CONSTRUCTION MAINTENANCE").
13. **Contractor terms**: the wording to send every contractor once ("payment follows the rent, always within 31 days") and whether Damian will fund from the fee account when a late rent would breach 31 days.

Damian's instruction, 21 September 2026: questions on any of the above go to Muzammel, who runs this section.

For the office: download Virgin's payment file template from Business Internet Banking and save it to Drive "Accounts/Payment runs/virgin-template.csv"; confirm whether accounts@propertysauce.co exists as a mailbox or alias; confirm whether any landlord bills are raised in a Books organisation other than Property Sauce.

## Appendix: what the research found (19 September 2026)

- **Content of a statement.** The consistent minimum is three figures, rent received, fee, net paid, with every line traceable to a source document, and deductions such as repairs itemised with their invoice. Propertymark's client accounting standard is that clients see their position at least monthly and that the landlord statement reconciles to the client account. Sources: [Propertymark, client account reporting](https://www.propertymark.co.uk/professional-standards/rules/accountants-report.html); [UK letting agent client account reconciliation guide](https://invoicedataextraction.com/blog/uk-letting-agent-client-account-reconciliation); [QuickFile, bookkeeping for letting agents](https://support.quickfile.co.uk/t/bookkeeping-for-letting-agents/18588).
- **Making Tax Digital changes the shape.** From April 2026 landlords over the £50,000 gross threshold report gross rent and itemised expenses quarterly, by the 7th of the month after the quarter; a net-only statement, or one that arrives mid-month, does not work for them. Source: [How letting agent statements work under MTD](https://mtd.digital/mtd-income-tax/mtd-letting-agent-statements/).
- **Frequency.** Monthly statements are the norm; an annual statement for the tax return is expected; quarterly is the new MTD rhythm. Sources: as above and [SA105 landlord tax return guide](https://www.propertytaxpartners.co.uk/blog/landlord-tax-essentials/landlord-tax-return-complete-guide-2026).
- **Payout timing.** No statutory rule; the management agreement sets it, and speed is a selling point: same-day or next-day payout is marketed as a differentiator. Source: [Solace, what same-day landlord payments take](https://solacemanagement.co.uk/resources/same-day-landlord-payments).
- **Why landlords leave.** Poor communication is the most common reason landlords switch agents or complain: 48% name it as a top frustration and 77% call it a main problem in one survey; only 6% are "very satisfied" with value for money. Agents that send proactive updates at each tenancy milestone, and never let a landlord hear of a problem from someone else first, keep clients longest. Sources: [Landlord Today, landlords unhappy with service](https://www.landlordtoday.co.uk/breaking-news/2026/04/landlords-unhappy-with-service-from-letting-agents-new-data/); [Property Reporter, better communication needed](https://www.propertyreporter.co.uk/business/better-communication-needed-among-landlords-tenants-and-letting-agents.html); [Hinch, keeping landlord clients happy](https://www.hinchpm.com/the-letting-agents-guide-to-keeping-landlord-clients-happy/); [Goodlord, state of the lettings industry 2025](https://www.goodlord.com/state-of-the-lettings-industry-report-2025).
- **What a monthly owner report contains** (US practice, transferable): exception-based, occupancy and arrears with collection steps, open and completed work orders, inspection findings, compliance items, and recommended next steps. Source: [Property management monthly reporting guide](https://hhredstone.com/property-management-monthly-reporting/).
- **Fee transparency and client money.** Fees must be published with what they cover; client money must be protected and shown as held for the client. Source: [Business Companion, landlords, letting agents and property management](https://www.businesscompanion.info/en/quick-guides/services/landlords-letting-agents-and-property-management).
- **Virgin Money payment files.** Business Internet Banking: Payments, Faster payments and transfers, Upload payment from file; instructions and example templates are shown on that screen; files are for Faster Payments only. Source: Virgin Money business support article KA-13117 (read 19 September 2026). The Virgin Money developer portal's file-payments API is JSON, up to 150 payments per file, for integrators only, and is not the route used here.
