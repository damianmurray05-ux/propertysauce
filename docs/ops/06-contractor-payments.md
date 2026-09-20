# Ops 06: Contractor payments and invoice checking

Scope: every contractor invoice from arrival to payment: one intake address, a check against the quote or the agreed rate, sign-off, landlord approval where the property is not ours, the weekly payment run for the bank, remittances, filing, and invoicing other landlords for work done by our own team.

Status: dictated by Damian on 17 September 2026 and written up by the Ops 6 chat. Sections 4 and 10 hold the points still to confirm. Quotes and the job itself are Ops 05; certificate bookings are Ops 07; landlord statements are Ops 10. Nothing in this file lets Claude move money: a person authorises every payment in the bank (README rule 2).

## 1. What this operation covers

Contractors send every invoice to one address, bills@propertysauce.co. Claude reads each invoice the day it arrives, finds the Maintenance ticket it belongs to, and compares the amount with what was agreed before the job: the fixed quote on the ticket, or the standing rate for that contractor and that type of job. If the invoice matches, Claude signs it off, records it in Zoho CRM and Zoho Books, and puts it in the next weekly payment run. If it does not match, Claude asks the contractor why, and if the answer is not one Claude may accept, a team member decides in #maintenance-invoices. Once a week Claude prepares a payment file for Virgin Money Business Internet Banking; Damian uploads and authorises it; Claude records the payments, sends each contractor a remittance and files the invoice. Where the property belongs to a landlord who is not Damian, his wife or one of their companies, the landlord approves the cost before the job and is charged for it afterwards. Where our own salaried team does a job on another landlord's property, Property Sauce invoices that landlord.

## 2. How it is done today

Damian's account, 17 September 2026, and what the Slack channel shows:

- There is no fixed address for invoices. They arrive by email to whoever booked the job, as photos in WhatsApp, and as photos posted in #maintenance-invoices (created 29 August 2026 by Muzammel, who set the channel purpose as "Everyone should place all invoices here regarding the maintenance, and I will pay"). The posts so far are photos with a line of text ("Uncle Shokat invoices 1 Onslow Close EICR", "shokat uncle and ranjeet invoices") with no ticket number, no amount and no quote reference.
- Muzammel pays. The Zoho picklist `Invoice_Paid_By` lists Landlord Direct, Muzammil, Usman Tufail, Vera Fernandes and Damian Murray, so payments have been made by several people from several places.
- Most jobs are quoted and agreed before the contractor attends. The quote is meant to be on the ticket (`Contractors_Quote`), but it is not always there, so there is often nothing to check the invoice against.
- Repeat jobs (gas safety records, EICRs, EPCs and other certificates) are done by the same handful of engineers at prices everyone knows in their head. Nothing is written down, so a price rise or a travel charge is only noticed, if at all, when the invoice is compared with memory.
- Nobody checks the invoice against the quote in a fixed way. Discrepancies are queried sometimes and paid unquestioned other times.
- Invoices are not filed in one place. Some are in email, some in Slack, some in WhatsApp. Zoho Books holds no contractor bills; its vendor records are the landlords who receive rent payouts.
- Where the property belongs to another landlord, approval is sought ad hoc. Where our own team does work on another landlord's property, no invoice is raised, so that labour is given away.
- Damian's own research: Claude cannot connect to a bank account and make payments, but it can produce a bulk payment file for upload to the bank. This is right, and section 5f sets out how it works with Virgin Money.
- What goes wrong: invoices with no ticket number, invoices paid twice or paid for jobs never signed off, price rises that were never agreed, no record for the landlord, no record for the accountant, and payments made by five different people with no single list of what has been paid.

## 3. Systems and records touched

**Intake mailbox.** bills@propertysauce.co, an alias on the admin@propertysauce.co mailbox (the mailbox Claude already reads). Chosen because invoices@propertysauce.co already exists and is the address Zoho Books sends tenant rent invoices from, so tenant replies land there and mixing contractor bills into it would put tenant and contractor money in one pile. accounts@ would attract the bank, HMRC and every supplier's marketing. "Send your bill to bills@" is hard to get wrong. A Gmail filter labels everything to bills@ as "Contractor bills". Invoices that arrive anywhere else are forwarded to bills@ by whoever received them, so there is one queue.

**Zoho CRM, Maintenance module.** Fields already there (checked 17 September 2026):

| Stage | Fields |
|---|---|
| Before the job | `Billing_Type` (Bill By Hours or Fixed Cost), `Contractors_Quote` (Contractors Fixed Quote), `Contractor_Hourly_Rate`, `Estimated_Material_Cost`, `Quote_To_Landlord` (formula), `Email_Quote_To_Landlord`, `Landlord_Approved_Instruct_Contractor`, `Job_Status` = Awaiting Quotation, Quotation Received, Quotation Sent to Landlord, Quotation Approved by Landlord |
| Invoice in | `Invoice_Number`, `Invoiced_Amount`, `Job_Status` = Invoice Received |
| Approved | `Job_Status` = Invoice Sent to Accounts Team for Payment (we pay) or Invoice Sent to Landlord for Payment (landlord pays direct), `Email_Invoice_To_Landlord`, `Invoice_Amount` (formula, Property Sauce Commission Amount) |
| Paid | `Invoice_Paid_Date`, `Invoice_Paid_By`, `Payment_Reference`, `Job_Status` = Invoice Paid by Accounts Team or Invoice Paid |

To add (build list): `Invoice_Received_Date`, `Invoice_Check` picklist (Matched, Query Raised, Team Sign-off, Rejected, Landlord Approval Needed), `Invoice_Query_Reason` (text), `Books_Bill_ID` (text), `Payment_Run_Date`. The stray picklist value "Invoice Paid1" is removed. The formulas behind `Quote_To_Landlord` and `Invoice_Amount` (commission) exist but their percentage is not visible through the API; see section 10.

**Zoho CRM, Team module.** This is the contractor list: about fifty records including the in-house team (Sky Hayat, Ali Hassan) and third-party trades (Jay at JsPlumbing, Danny Electrician Blackpool, Neshhwam Gas Safe, Spencer M&E, Atiq gas engineer, Skay Electrical, and others), mixed with estate agents. The Vendors module is empty and stays empty; `Contractor1` on the ticket already looks up Team. To add to Team: a subform "Agreed rates" (item, price, valid from, valid to, travel or distance rule, notes), plus `Rate_Card_Confirmed_On` (date the contractor confirmed the rates in writing), `Engaged_As` (Salaried, Per Job), `VAT_Registered`, `Bank_Details_Verified_On` (date only; never the numbers), `Payment_Terms_Days`, `Invoice_Email` (the address their invoices come from, so a bill from any other address is treated as suspect).

**Zoho Books, Property Sauce organisation 678590019.** One vendor per contractor (alongside the landlord vendors already there). One Bill per invoice with the PDF attached, the ticket number in the reference, and the property in the line description. Vendor Payments recorded after each bank run. Sales invoices from Property Sauce to third-party landlords for recharges and for in-house labour. Contractor bank details live on the Books vendor record and in the Drive sheet "Bank accounts by entity", nowhere else (README rule 7).

**Google Drive (admin@propertysauce.co).** Folder "Contractor invoices/<financial year>/<month>/" with each PDF named `<ticket number> <contractor> <invoice number>.pdf`, and the link written to the ticket as a note. Folder "Payment runs/<year>/" for each week's bank file and its summary PDF, restricted to Damian and Muzammel. The rate card is generated as a Google Sheet from the Team subform so Zoho stays the source of truth.

**Slack.** #maintenance-invoices (C0BUE0RR6GY) is the sign-off channel: Claude posts every query it could not settle, every invoice that needs a person, and the weekly run summary (payee, amount, ticket; never account numbers). #claude-urgent (C0BTPPZ3JJE) for suspected fraud and any request to change bank details.

**Email.** Queries to contractors and remittances go from contact@propertysauce.co. Landlord quote approvals and the invoice copy to a landlord are sent from the Landlord record in Zoho CRM (Send Email) so they sit on the landlord's file, the same rule as certificates in Ops 07.

**Bank.** Virgin Money Business Internet Banking, file upload by Damian. Section 5f.

## 4. Decision limits

Proposed, to confirm with Damian:

Claude may, without asking anyone:

- Sign off an invoice that is equal to or lower than the fixed quote on the ticket, or equal to or lower than the contractor's agreed rate for that item, provided the checks in step 3 all pass.
- Sign off an hourly invoice where hours times the agreed hourly rate plus materials at cost equals the invoice, the hours are consistent with the attendance record on the ticket, and the total is within the estimate on the ticket.
- Accept an increase over the quote or rate only if both conditions hold: the contractor told us in writing before the visit (an email or Slack message on the ticket dated before `Agreed_Date_Time`), or the extra is parts with a receipt or photo; and the increase is no more than £50 and no more than 15 percent of the agreed price.
- Approve any quote or invoice on Damian's behalf where the Established Landlord on the Landlord record is Damian, his wife, or one of their companies, up to £500 per job. [List of the companies to confirm: Sure Lets and Manage Limited, Beaucatt Homes, Beaumont Residential Ltd, Lancaster Residential Group Limited, Montrose Residential Group Limited, Murray & Sullivan, and any other.]
- Prepare the weekly payment file and post its summary.
- Record payments in Books and Zoho after Damian confirms the run was authorised, and send remittances.
- Raise a Property Sauce sales invoice to a third-party landlord for a job already approved by that landlord, at the approved amount.

Needs a person:

- Any increase outside the rule above: a team member in #maintenance-invoices (Ezad or Usman first, then Damian).
- Any single invoice over £500, or any invoice over the landlord's authority limit where one is set on the Landlord record: Damian.
- Any quote or invoice on a property whose Established Landlord is not Damian, his wife or their companies: that landlord approves before the job (step 1) and is told the final figure after.
- Any invoice from an address other than the contractor's `Invoice_Email`, any invoice whose bank details differ from those on file, and any request to change bank details: never processed by Claude; #claude-urgent and Damian the same hour. A person verifies by telephone on the number already on the Team record, not a number in the email, before anything is changed.
- Any invoice for a job that is not at Tenant Signed Off (or, for a certificate, whose certificate is not yet filed under Ops 07): held, not signed off, contractor told why.
- Any duplicate (same contractor and invoice number, or a second invoice on a ticket already invoiced): held, Damian told.
- Authorising the payment file in the bank: Damian, always.
- Entering or changing bank details in Books or the Drive sheet: Damian or Muzammel, after telephone verification.

## 5. The procedure, step by step

### 5a. Before the job: the price is agreed and written down

**Step 1. Every job has a price on the ticket before anyone attends.** When Ops 05 reaches the point where a third-party contractor, or a part or labour over the Ops 05 limits, is needed, Ezad or Usman get a quote and write it on the ticket: `Billing_Type`, `Contractors_Quote` (fixed) or `Contractor_Hourly_Rate` and `Estimated_Material_Cost` (hourly), `Job_Status` = Quotation Received. For a repeat job (a certificate, a service, a routine clean) the price is taken from the contractor's Agreed rates subform and written into `Contractors_Quote` automatically, with a note "Rate card price, valid from <date>". If the property is further away and the contractor's rate card has a travel or distance rule, the rule is applied and the note says so. Any extra a contractor expects (access, a second visit, a part) must be advised in writing before the visit; anything advised after is treated as an increase (step 5).

**Step 2. Landlord approval where the property is not ours.** Claude reads the Established Landlord picklist on the Landlord record (README rule 4). If it is Damian, his wife or one of their companies, Claude approves within section 4 and sets `Landlord_Approved_Instruct_Contractor` with a note "Approved on Damian's behalf under Ops 06 section 4". Otherwise: `Email_Quote_To_Landlord`, `Job_Status` = Quotation Sent to Landlord, and one email from the Landlord record: the fault, the contractor, the price (`Quote_To_Landlord`, which includes our commission), what happens if they say yes, and a request to reply yes or no. Chase after two working days; after four working days with no answer, Damian decides whether to proceed. On yes: `Job_Status` = Quotation Approved by Landlord and back to Ops 05 to instruct. For an emergency (Ops 05 step 3) the work goes ahead within the landlord's authority limit and the landlord is told the same day.

### 5b. The invoice arrives

**Step 3. Daily sweep of bills@.** Every working day at 9:00 Claude reads everything labelled "Contractor bills" that has no ticket note yet. For each invoice:

1. Extract contractor, invoice number, invoice date, amount, VAT, property address, ticket number, description, bank details shown.
2. Find the ticket: by `Maintenance_Ticket_Number` if quoted, else by contractor plus property plus a job at Contractor Confirmed Job Complete or later. If no ticket can be found, reply to the contractor asking for the ticket number and property, and stop.
3. Write `Invoice_Number`, `Invoiced_Amount`, `Invoice_Received_Date`, `Job_Status` = Invoice Received, and attach the PDF to the ticket.
4. Run the checks: the job is at Tenant Signed Off (or the certificate is filed); the invoice is from the contractor's `Invoice_Email`; the bank details match the ones on file (a person checks this by comparing the PDF with Books; Claude only flags whether the invoice shows bank details at all and whether the sort code and last four digits match what Books holds); the invoice number has not been seen before; VAT is only charged if `VAT_Registered` and a VAT number is shown; the property and description match the ticket.
5. Compare the amount with the agreed price (step 1). Equal or lower: `Invoice_Check` = Matched, go to step 6. Higher: go to step 5.

**Step 4. Invoices that arrive elsewhere.** A photo in Slack or WhatsApp is not an invoice until it is forwarded to bills@ by the team member who received it, with the ticket number in the subject. Claude posts a reminder in the channel when it sees an invoice photo posted without one.

### 5c. Discrepancies

**Step 5. Ask the contractor.** The same day, email from contact@propertysauce.co, template C1: "Your invoice <number> for ticket <n> at <address> is £<x>. The price agreed before the visit was £<y>. Please tell us what the difference is for. If parts were needed, please send the receipt or a photo. We cannot pass the invoice for payment until we have this." Set `Invoice_Check` = Query Raised, `Invoice_Query_Reason`. Chase after three working days. On the reply:

- Within Claude's limit in section 4, with the evidence: accept, note the reason on the ticket, `Invoice_Check` = Matched, update `Contractors_Quote` with a note "Increased to £x on <date>: <reason>", and go to step 6. If the landlord is third-party, the landlord is told the final figure.
- Outside the limit, or no reply after two chases: post to #maintenance-invoices: ticket, contractor, agreed price, invoiced price, the contractor's reason, and the recommendation. `Invoice_Check` = Team Sign-off. Ezad, Usman or Damian reply approve or reject in the thread; Claude records who and when on the ticket. Rejected: the contractor is told what we will pay and why, and asked to reissue; a credit note or a corrected invoice replaces the original.
- Where the increase is one the contractor should have advised before the visit and did not, the note on the Team record says so, and after a second occurrence Damian is told so the contractor's standing can be reviewed.

### 5d. Sign-off and who pays

**Step 6. Sign off.** On Matched: create the Bill in Zoho Books (vendor, date, due date per the contractor's terms, reference "Ticket <n> <address>", PDF attached), write `Books_Bill_ID`, and set who pays:

- Our own property: `Job_Status` = Invoice Sent to Accounts Team for Payment. Goes in the next run.
- Third-party landlord, we pay and recharge (the default): `Job_Status` = Invoice Sent to Accounts Team for Payment, and the recharge (`Invoice_Amount`, cost plus commission) is queued for that landlord's next statement (Ops 10). If the landlord holds no rent with us, a Property Sauce sales invoice is raised in Books instead and emailed from the Landlord record.
- Third-party landlord, pays the contractor direct (only where the management agreement says so): `Email_Invoice_To_Landlord`, `Job_Status` = Invoice Sent to Landlord for Payment, `Invoice_Paid_By` = Landlord Direct, the invoice emailed from the Landlord record, chased after 14 days, and the contractor told who is paying.

**Step 7. File.** Save the PDF to "Contractor invoices/<financial year>/<month>/<ticket> <contractor> <invoice number>.pdf" and put the link on the ticket. The Books bill holds the same PDF for the accountant.

### 5e. Our own team on another landlord's property

**Step 8. Invoice the landlord.** Rocky, Ali, Dave, Sky and Vera are paid by Property Sauce (Rocky on a monthly salary; the others to confirm, section 10). When any of them does a job on a property whose Established Landlord is not Damian, his wife or their companies, Property Sauce raises a sales invoice in Zoho Books to that landlord: labour at the in-house rate card (hours from the attendance record times the rate, with a minimum call-out), materials at cost from receipts, plus commission, with the ticket number and the before-and-after photo link. The invoice is emailed from the Landlord record, or deducted from the landlord's next statement (Ops 10) where the management agreement allows. The landlord approved the price in step 2 before the job, so the invoice never surprises them. Inspections (Ops 05 step 14) are covered by the management fee and are not invoiced unless the agreement says otherwise.

### 5f. The weekly payment run and the payments agent

**Step 9. Build the run.** Every Wednesday at 16:00 Claude lists every Books bill that is approved and unpaid (Job_Status = Invoice Sent to Accounts Team for Payment, not on a previous run), checks each one still passes step 3, and writes two files to "Payment runs/<year>/": the bank upload file and a summary PDF (payee, invoice number, ticket, property, amount, total). It posts the summary to #maintenance-invoices and emails it to Damian. `Payment_Run_Date` is set on each ticket. Bank details go into the upload file only, taken from the Books vendor record by the build script, so they never pass through a chat, Slack or a document (README rule 7).

**Step 10. Damian authorises.** Damian logs in to Virgin Money Business Internet Banking, goes to Payments, the "Faster payments and transfers" tab, and "Upload payment from file" at the bottom of the screen, sets the payment date, chooses the file, checks the total against the summary, and authorises. What the bank's own pages and the live screen confirm (checked in Damian's logged-in banking and on business.support.virginmoney.com, 17 September 2026):

- The upload takes a CSV or TXT file of up to 750 payment entries. Files of more than 350 entries may be delayed at busy times. Our runs will be a few dozen lines.
- File upload is for Faster Payments only, so each line is limited to £30,000 and arrives the same day. Bacs (three-day, 5.10pm cut-off) is a separate facility that needs a Bacs ID and is not used for this run.
- Approval in the Virgin Money Business app shows one item for the whole file, not one per payment. If it does not appear, Accounts, the account, "Payment Status and History" shows it.
- The bank's list of reasons a file fails: sort codes starting with zero losing the leading zero (a spreadsheet problem, so the file must be written as text, never opened and re-saved in Excel); not using the bank's template; the file too large; extra spaces, commas or unexpected characters; and "incorrect or outdated payee details, including any deleted payees". That last point means every contractor must exist as a saved payee in "Manage your payees" before their line will upload, so setting up a new contractor includes a person creating the payee in the bank.
- The "Read instructions (PDF)" and "Download an example (XLSX)" links inside the upload section both return "Page Not Found" as of 17 September 2026, so the column layout could not be read from the bank. The Virgin Money help site that the in-app "Help" links to has a broken certificate and does not load either. The remaining routes to the exact layout are the bank's live chat from inside Business Internet Banking, a one-line test upload to read the validation message, or the bank's "File Upload" how-to video in its Business Internet Banking playlist.

Two things are not routes for us: Zoho Books has no payment link to Virgin Money UK, and Virgin Money's Open Banking File Payments API (JSON, up to 150 payments a file) is for licensed third-party providers only.

**Step 11. Record and remit.** When Damian replies "authorised" (or Thursday's bank feed shows the debits), Claude records a Vendor Payment in Books against each bill (paid through the Property Sauce account, reference = the invoice number), sets `Invoice_Paid_Date`, `Invoice_Paid_By` = Damian Murray, `Payment_Reference`, `Job_Status` = Invoice Paid by Accounts Team, and emails each contractor a remittance from contact@propertysauce.co: invoice number, ticket, property, amount, date paid. If a line in the file was rejected by the bank, Damian says which, and Claude leaves that bill open and tells the contractor. Nothing is recorded as paid on Claude's assumption.

**Step 12. Contractors are told the rules once.** Template C0, sent once to every active contractor when this operation goes live and to every new contractor on their first job: invoices go to bills@propertysauce.co only, one PDF per invoice, showing our ticket number and the property address, the price agreed before the visit, VAT only if registered, and their bank details as we hold them; any extra cost must be advised in writing before the visit; invoices without a ticket number are returned; approved invoices are paid in the weekly run, on terms of 14 days from a correct invoice; we will never change bank details on the strength of an email and will telephone the number we hold to confirm any change. Certificate providers also receive their rate card to confirm in writing, and are asked to give notice of any yearly increase before it applies.

## 6. Escalation

- Suspected fraud (unknown sender address, changed bank details, a payee we do not recognise, an invoice for a job with no ticket and no team member who knows it): #claude-urgent and Damian the same hour; nothing paid.
- Discrepancy outside section 4, or contractor silent after two chases: #maintenance-invoices, tagging Ezad and Usman; Damian if no answer in two working days.
- Any single invoice over £500, or over a landlord's authority limit: Damian.
- Third-party landlord silent four working days after a quote: Damian.
- An invoice on a job not signed off by the tenant, or a certificate not filed: held, contractor told, Ops 05 or Ops 07 chased.
- Bank rejects a line: Damian tells Claude which; the contractor is told the same day.
- Payment run not authorised by Friday 12:00: reminder to Damian; contractors whose terms would be breached are told when to expect payment.

## 7. Done when

An invoice is done when `Invoice_Check` = Matched (or Team Sign-off approved, with who and when on the ticket), a Books bill exists with the PDF attached, the PDF is in the Drive folder with the link on the ticket, the payment is recorded in Books and on the ticket with `Invoice_Paid_Date`, the remittance has been sent, and, for a third-party landlord, the recharge is on their statement or invoiced. Targets, measured on every invoice:

| Stage | Target |
|---|---|
| Invoice read and matched to a ticket | same working day |
| Discrepancy query sent | same working day |
| Invoice approved or in #maintenance-invoices | 3 working days from arrival |
| Approved invoice in a payment run | next Wednesday |
| Paid | 14 days from a correct invoice |
| Remittance sent | same day as the payment is recorded |
| Landlord recharge raised | same week as the invoice is approved |

## 8. Cowork routine

**Invoice sweep**, weekdays 9:00 Europe/London.

Prompt: "Read docs/ops/06-contractor-payments.md and run one sweep. (1) Every email labelled Contractor bills with no ticket note: extract the invoice, find the ticket, write the invoice fields, run the step 3 checks and compare with the agreed price. (2) Matched: create the Books bill, set who pays per step 6, file per step 7. (3) Higher than agreed: send template C1 per step 5, or if a reply is in, decide within section 4 or post to #maintenance-invoices. (4) Queries older than 3 working days: chase. (5) Team sign-off threads with an approve or reject: record it and continue. (6) Tickets at Tenant Signed Off for more than 14 days with no invoice: ask the contractor for it. (7) Third-party landlord quotes awaiting approval: chase at 2 days, escalate at 4. (8) Anything in section 6: escalate. Post a one-paragraph summary to #maintenance-invoices. Never mark anything paid, never change bank details, never accept an invoice from an address other than the contractor's Invoice_Email."

**Payment run**, Wednesdays 16:00.

Prompt: "Read docs/ops/06-contractor-payments.md steps 9 to 11. Build this week's run from approved unpaid bills, write the bank file and the summary PDF to Payment runs, post the summary (no account numbers) to #maintenance-invoices and email it to Damian. When Damian replies authorised, or the bank feed shows the debits, record each vendor payment in Books, update the tickets, and send remittances. Report lines rejected by the bank."

Both report to #maintenance-invoices; fraud and bank-detail changes to #claude-urgent.

## 9. Test plan

Week 1: certificate invoices only (gas and EICR renewals from Ops 07), propose-only: every extraction, match, query and Books bill is posted to #maintenance-invoices as a draft for Damian or Muzammel to approve; nothing is sent to a contractor. The first payment run is built as a file and summary but Damian keys the payments by hand while checking the file against what he would have typed.

Week 2: certificate invoices go live; Catterick House maintenance invoices (Ali and the Rotherham trades) join in propose-only mode. Damian uploads the first real file.

Week 3: all maintenance invoices, propose-only for third-party landlord recharges only.

Week 4: everything live. Muzammel stops paying invoices directly; every payment goes through the run.

## 10. Open questions

- The intake address: bills@propertysauce.co as proposed, or accounts@. Whichever it is, Damian adds it as an alias on admin@propertysauce.co in Google Admin (Users, the user, Add alternate email); Claude cannot create aliases.
- Section 4 limits: increases of up to £50 and 15 percent with evidence; £500 per job on Damian's behalf; 14-day terms. Confirm or change.
- The list of owners who count as "ours" for approval on Damian's behalf: Damian, his wife (name to add), Sure Lets and Manage Limited, Beaucatt Homes, Beaumont Residential Ltd, Lancaster Residential Group Limited, Montrose Residential Group Limited, Murray & Sullivan. Any others, for example Crackle Property Ltd and 101 Fortitude Properties Ltd, which appear in Books as landlords receiving payouts.
- Who is salaried and who invoices per job: Rocky is on a monthly salary; Ali, Dave, Sky and Vera to confirm. The in-house rate card for recharging labour to other landlords (hourly rate per person, minimum call-out) and the commission percentage in the `Quote_To_Landlord` and `Invoice_Amount` formulas.
- Third-party landlords: is the default that Property Sauce pays the contractor and recharges through the statement, with "Landlord Direct" only where the agreement says so? Confirm, and confirm that management agreements allow deduction from rent.
- The Virgin Money upload file layout: the bank's template links are dead (step 10). Damian to decide which of the three routes to use: ask the bank's live chat for the current CSV template from inside Business Internet Banking; allow a one-line test upload (a £1 payment to a Property Sauce account, not authorised) so the validation screen shows the expected columns; or both. Also whether a second user should authorise runs over a set amount. Faster Payments is settled: file upload only supports it.
- The agreed rate card for each certificate provider: who they are per area (Ops 07 open question), their current prices, and any travel rule. Claude will email each one template C0 with their rates to confirm once Damian supplies the list.
- Construction Industry Scheme: a lettings and management business paying trades is not normally a CIS contractor unless it is a "deemed contractor" (over £3 million of construction spend in a rolling twelve months). Confirm with the accountant so no deductions are needed from contractor payments.
- Reverse charge VAT and VAT registration of contractors: confirm which contractors are VAT registered so the check in step 3 is right.
- Muzammel's role once the run is live: does he stay as the second bank authoriser?

## Build list

For this chat (Zoho, Books, Drive, Slack):

1. Google Workspace: bills@propertysauce.co alias on admin@propertysauce.co (Damian), and the Gmail filter and label "Contractor bills" (Claude, once the alias exists).
2. Zoho CRM Maintenance: fields `Invoice_Received_Date`, `Invoice_Check`, `Invoice_Query_Reason`, `Books_Bill_ID`, `Payment_Run_Date`; remove "Invoice Paid1" from `Job_Status`.
3. Zoho CRM Team: subform "Agreed rates" and the fields `Rate_Card_Confirmed_On`, `Engaged_As`, `VAT_Registered`, `Bank_Details_Verified_On`, `Payment_Terms_Days`, `Invoice_Email`; a "Contractor" tick or view to separate trades from the estate agents in the same module.
4. Zoho Books: one vendor per contractor (bank details entered by Damian or Muzammel), the "Contractor invoices" expense account, and the recharge item for sales invoices to landlords.
5. Drive: "Contractor invoices" and "Payment runs" folders with restricted sharing; the rate card sheet generated from Team.
6. Templates: C0 (rules to contractors, with the rate card for certificate providers), C1 (discrepancy query), the remittance email, the landlord quote-approval email, and the landlord recharge invoice layout.
7. The payment file build script, written to the Virgin Money layout once Damian supplies it, reading bank details from Books and writing only to the Payment runs folder.
8. The two Cowork routines in section 8, starting in propose-only mode per section 9.

For the website chat (the assistant):

9. Nothing required for this operation. Optional later: a contractor entry under "I'm on the team" (Ops 05 step 9) that lets a contractor upload their invoice against the ticket, which would replace email intake for the in-house team.
