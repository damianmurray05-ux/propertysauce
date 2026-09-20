# Ops 14: Bookkeeping and reporting

Scope: money in against money out for every one of Damian's entities, kept up to date weekly from the bank feeds in Zoho Books; a bookkeeping sheet per entity on Drive that the accountant files from; the VAT threshold watched; the quarterly figures for the properties in Damian's own name; a weekly KPI note to Damian.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 14 chat. Sections 4 and 5 are **proposed** and need Damian's yes. Nothing is built yet beyond the survey in section 2. The open points are in section 10.

## 1. What this operation covers

Every company and every personal holding of Damian's needs its books kept: what came into the bank, what went out, what each line was for. That is done for all of them, not only Property Sauce. Property Sauce's own books record the fees it earns (the management fee deducted from each landlord's rent, plus any other fee income) and its costs. The landlord companies' books record rent received, the fee and costs deducted, mortgage interest, repairs, insurance and everything else that leaves the account. The books are kept every week so that at any moment Damian can see how each entity is doing, roughly what tax is building up, and how close Property Sauce is to the VAT registration threshold. From the same records this operation produces the sheet the accountant files from, the quarterly figures HMRC now wants for the properties in Damian's personal name, and a short weekly note to Damian.

## 2. How it is done today

Damian's instructions, 19 September 2026:

- Bookkeeping is money in against money out. It is to be done for every entity: Property Sauce, Beaumont Residential, Beaucatt Homes, Tanc Residential and the rest, not just the agency.
- Property Sauce must declare the fees it earns. Those fees go into a bookkeeping sheet, kept weekly or monthly so it is always current. Kept regularly, the books show how much is being earned, whether tax will be due, and leave time to plan genuine spend before a year end rather than after it.
- Property Sauce is not to become VAT registered; the headache is not worth it. So Property Sauce must stay under the threshold, and regular books are what give warning before it is reached.
- Damian personally reports every three months for the properties in his own name. The limited companies report yearly.
- Damian's suggestion for the record: a folder on Google Drive with one spreadsheet per company and a tab for each month.
- Damian tries to make sure all money goes through the bank, so the bank statements, which Zoho Books already pulls in, are the source.
- Damian also wants an "Accounting" section (a sidebar group, like Legals) where a bookkeeping and accountancy team sits; the operations report their findings to it and it produces the books for the real-life accountant to file.

What already exists (checked 19 September 2026):

- The accountant's format is already on Drive: "BookKeeping Beaumont Residential Apr 23 To Mar 24.xlsx", "Beaumont 2nd Account Bookkeeping.xlsx", "BookKeeping Absolute Apr 21 To Mar 22.xlsx" and later years, "Bookkeeping Tanc 2021-2022.xlsx", "BookKeeping Sep 2022 - Sep 2023.xlsx". One workbook per entity per year. The new sheets should follow that layout so the accountant sees nothing new.
- Zoho Books organisations the website key can read, with the bank feeds as they stood on 19 September 2026:

| Organisation (id) | Year start | Live feed accounts (last refresh) | Uncategorised lines | Oldest uncategorised |
|---|---|---|---|---|
| Property Sauce (678590019) | April | Business Account (19 Sep), Property Sauce rent account (16 Sep), Deposit (4 Aug), Fee (4 Aug) | 334, 106, 112, 115 | Aug 2019 |
| Beaucatt Homes (686965572) | January | Beaucatt Homes Limited (19 Sep), Business Account (19 Sep) | 165, 536 | Jan 2020 |
| Beaumont Residential Ltd (642272555) | April | Beaumont Residential Limited (19 Sep), Business Account (19 Sep) | 134, 470 | Jul 2019 |
| Murray & Sullivan (10027392) | April | Murray D & Sullivan (19 Sep); the two older accounts stopped Feb 2023 | 217, 74, 160 | Dec 2018 |
| Gladioli House Management (20617801) | April | Gladioli House Account (stopped 14 May 2025) | 11 | Nov 2024 |

- Not yet visible to the key (the website's Zoho user, contact@luxestay.co.uk, has not been invited): Montrose, Luxe Stay Virgin, Lancaster Residential Group, Damian RBS. Tanc Residential, Harris & Murray, Murray & Sullivan Invest Ltd and Damian's personal holdings have no organisation the key can see.
- No organisation has a VAT registration number. Each has a 20% VAT rate defined but unused.
- Books balances do not agree with the banks anywhere. Murray & Sullivan shows £1.3m in "Undeposited Funds" and £132k in "Petty Cash"; Property Sauce shows £99k in Petty Cash; Beaumont's Business Account is £557k negative in Books against £3,254 at the bank. These are years of lines posted to holding accounts and never reconciled. So the ledgers in Books cannot be trusted as they stand; the bank feed lines can, because they are the bank's own record.
- The Property Sauce Deposit and Fee feeds last refreshed on 4 August and need reconnecting (Ops 04 noted the same). Gladioli's feed stopped in May 2025. Two Murray & Sullivan accounts stopped in February 2023 and may be closed.
- Over 2,400 uncategorised bank lines sit across the five organisations, the oldest from 2018. Ops 04 is allocating the rent lines on the Property Sauce rent account; everything else is this operation's backlog.

## 3. Systems and records touched

- **Zoho Books**, every organisation listed in section 2 plus the four still to be invited. Bank feeds under Banking; bank transactions (GET /books/v3/banktransactions with status uncategorized, then categorise or match); chart of accounts; reports (Profit and Loss, cash basis, per organisation). Access as the other Ops files: the website's Zoho key, `NODE_USE_ENV_PROXY=1` from the sandbox, hosts accounts.zoho.com and www.zohoapis.com.
- **Bank feeds as the source of truth for money.** Every line comes from the bank. Nothing is typed in from memory or from a team member's word. Cash never enters the books unless it went through a bank account (Damian's rule), so "Petty Cash" and "Undeposited Funds" are not used going forward.
- **Zoho CRM**: the Landlord (Accounts) record's Established Landlord picklist (README rule 4) says which entity owns which property, so each rent line, fee line and repair can be tagged to a property and an entity. Maintenance records give the invoice behind a contractor payment (Ops 05 and 06).
- **Drive**, propertysauce.co account: a new folder "01 Property Sauce/Accounts/Bookkeeping/<Entity>/" holding one Google Sheet per entity per financial year, in the accountant's existing layout, with a tab per month plus a Summary tab and a Quarters tab. Written by Claude from the categorised Books feed; never hand-edited (a person's correction goes into Books, and the sheet is regenerated). Also "Accounts/Bookkeeping/Queries/" for the weekly list of lines a person must explain. README rule 7 still applies: no account numbers in the sheets, Slack or chat.
- **Slack**: a #accounts channel (to create) for the weekly queries list; #claude-urgent for the VAT threshold warning and a missed HMRC deadline.
- **Email**: the weekly KPI note to Damian from admin@propertysauce.co ([[verify-sender-before-sending]]), and the quarterly and year-end packs to the accountant once Damian names them.
- **HMRC**: Damian's quarterly updates for his personal-name properties go through MTD-compatible software; whether Zoho Books UK is recognised for MTD for Income Tax (it is for VAT) is an open question for the accountant (section 10).

## 4. Decision limits

Proposed, to confirm with Damian:

- **Claude categorises a bank line only when it is certain**: the payee or reference names a known tenant, landlord, contractor, lender, insurer, utility or HMRC, and the amount fits the pattern (same as the Ops 04 rule Damian set on 17 September 2026). Anything less certain stays uncategorised and goes on the weekly queries list with Claude's best guess and the reason it did not commit. Nothing is guessed to make the books balance.
- **Claude never decides what is deductible.** It records what each payment was for; the accountant decides how it is treated. Where a cost looks personal, or belongs to a different entity from the account it came out of, Claude flags it rather than posting it. A director's loan, inter-company transfer or drawing is tagged as such and listed, never buried in expenses.
- **Nothing is deleted or reversed in Books** without a person: no journal reversals, no deleting old transactions, no clearing the holding accounts. The historic mess is reported, with a proposed clean-up, for the accountant to approve (section 5e).
- **VAT threshold**: Claude computes Property Sauce's rolling twelve-month taxable turnover at every month end and warns at 80% of the threshold (£72,000 on the current £90,000). At 90% it goes to #claude-urgent and the weekly note leads with it. Claude does not register, deregister or apply for anything with HMRC.
- **Filing**: Claude prepares figures and packs; a person (the accountant or Damian) submits. Claude never submits to HMRC, never signs accounts, never files at Companies House.
- The weekly note and the sheets may be produced and sent without asking once the format has been approved on one entity (section 9).

## 5. The procedure, step by step (proposed)

### 5a. Every Monday: categorise the week

1. For each organisation, read the uncategorised feed lines on every live bank account.
2. Categorise each certain line. Rent in goes through Ops 04's matching on the Property Sauce rent account; on a landlord company's account, rent received from Property Sauce is tagged to the property (the Books bill from Ops 10 gives the property and the fee already deducted). Fee income on the Property Sauce Fee account is tagged to the landlord and month. Contractor payments are matched to the Ops 06 bill. Mortgage payments are tagged to the lender and property ([[property-lenders]] holds the account references). Insurance, utilities, council tax, licences, software, bank charges, HMRC, Companies House, accountancy: to their accounts, tagged to the entity and where possible the property.
3. Transfers between Damian's own accounts and entities are matched both sides and tagged as transfers, never as income or expense.
4. Everything else goes on the queries list: date, account, amount, payee text, Claude's guess, what would settle it (an invoice, a word from the team). Posted to #accounts and saved in Drive "Accounts/Bookkeeping/Queries/<date>.csv". A person answers in the thread or in Books; Claude picks up the answers the following Monday.
5. Feed health: any feed whose last refresh is more than 7 days old is listed at the top of the queries with "reconnect under Banking". A feed that needs Damian's bank login (Strong Customer Authentication, every 90 days) is his to do; Claude only reminds.

### 5b. Every Monday: the sheets and the KPI note

6. Regenerate each entity's bookkeeping sheet for the current financial year from the categorised feed: the month tab gets every line (date, payee, description, category, property, money in, money out, running balance, feed reference), the Summary tab gets money in, money out and net per month and year to date, the Quarters tab gets the same by tax quarter (section 5c) for the personal-name entities, and a Queries tab lists the unresolved lines so the accountant sees what is still open.
7. Send Damian the **weekly KPI note** by email (short, in the house style, under 200 words plus one table). Contents, in this order:
   - Property Sauce: fee income this month to date and rolling twelve months, against the VAT threshold, as a percentage. This is the first line every week.
   - Per entity, one row: money in this month, money out, net, uncategorised lines outstanding, feed status.
   - What is coming: the next HMRC quarter end and its deadline (personal), the next company year end and its filing dates, any certificate or licence fee due (from Ops 07).
   - Rough tax building up per entity (a plain estimate from net profit at the entity's rate, labelled as an estimate, so Damian can plan; the accountant's figure replaces it).
   - Anything odd: a payee never seen before, a payment out with no invoice, a duplicate, a bounced receipt, a large transfer.

### 5c. Every quarter: Damian's personal-name properties

Making Tax Digital for Income Tax applies from 6 April 2026 to individuals with qualifying income over £50,000 from property and self-employment together. The quarters are 6 April to 5 July, 6 July to 5 October, 6 October to 5 January and 6 January to 5 April (calendar quarters can be elected instead); each update is due by the 7th of the following month (7 August, 7 November, 7 February, 7 May), and the year's final declaration and tax by 31 January. Partnerships are not yet in scope, so D Murray & R Sullivan stays on the yearly cycle for now. [To confirm with the accountant: which of Damian's holdings are in his own name, whether Michelle Murray's are in scope, and which software submits.]

8. Ten days before each quarter end, Claude checks every line for the quarter is categorised for the personal-name entities and clears the queries with the team.
9. On the first working day after the quarter end, Claude produces the quarter's figures (income and expenses by HMRC category, per property and in total) as a tab in the sheet and a one-page PDF, and sends them to Damian and the accountant. The accountant submits. Claude records the submission date when told.
10. If the accountant has not confirmed submission two working days before the deadline, Damian is told on Slack and by text.

### 5d. Every year: the companies

11. For each company, from the week after its year end: every line categorised, queries cleared, the year's workbook finalised, and a year-end pack sent to the accountant: the sheet, the Books Profit and Loss and balance sheet for the year, the bank statements' closing balances against the sheet's closing balances (they must agree to the penny), fixed-asset purchases listed, loans and inter-company balances listed, and the queries Claude could not settle.
12. Company deadlines are held in the sheet's Summary tab and in the weekly note: accounts to Companies House nine months after the year end, corporation tax paid nine months and a day after, CT600 filed twelve months after, confirmation statement on its own date. Claude reminds at 60, 30 and 7 days. Filing is the accountant's.

### 5e. Once: the backlog and the Books clean-up

13. Before any of the above can be trusted, the 2,400 uncategorised lines and the holding-account balances need a plan. Proposed: work forward from each entity's current financial year start (April 2026 for most, January 2026 for Beaucatt) under the 5a rule, so the current year is right first; then propose to the accountant, in writing, how to treat the older years (most have already been filed from the old spreadsheets, so an opening-balance adjustment as at the year start, approved by the accountant, is likely simpler than re-categorising 2018 to 2025 line by line). No historic line is touched until the accountant says how.
14. Invite the website's Zoho user to the Montrose, Luxe Stay Virgin, Lancaster Residential Group and Damian RBS organisations (Damian, in Zoho Books, Settings, Users). Create organisations for any entity that has none, or confirm they are kept outside Books on a sheet alone.

## 6. Escalation

- A feed that will not reconnect, a bank account in the picklist with no feed, or an HMRC or Companies House letter: Damian on Slack the same day.
- Property Sauce fee turnover at 90% of the VAT threshold, or a personal quarterly update not confirmed two working days before its deadline: #claude-urgent.
- A payment out that Claude cannot tie to any invoice, contractor or lender, or an unexpected payee taking money by direct debit: the queries list the same Monday, and #claude-urgent if it is over £1,000 or repeats.
- A line that looks like income to the wrong entity (rent landing in a personal account, fee landing in a landlord company): the queries list, flagged, because the accountant needs to know.

## 7. Done when

Every live bank account in every organisation has no uncategorised line older than 14 days except those on the queries list awaiting a person; each entity's bookkeeping sheet for the current year on Drive agrees with the bank's closing balance to the penny; the weekly note went to Damian on Monday; the quarterly figures for the personal-name properties reached the accountant on the first working day after the quarter end; and the VAT line has been computed for the latest month end.

## 8. Cowork routine

To write once section 5 is confirmed. Outline: Monday 07:00, for each organisation read the uncategorised lines, categorise the certain ones, post the queries to #accounts and Drive, regenerate the sheets, compute the VAT line, email the KPI note to Damian. Quarterly and yearly steps run from a dates table in the same routine. A script in this repo (`scripts/bookkeeping.mjs`, to build) does the reading, categorising and sheet writing so the routine only orchestrates and reports.

## 9. Test plan

One entity for one month: Beaumont Residential Ltd (both feeds live, a manageable 134 and 470 lines, year start April, and the accountant's own Beaumont workbook on Drive to match the layout against). Run the Monday routine for four weeks with every categorisation listed before it is written to Books, the sheet compared to the old workbook's layout, and the KPI note sent to Damian only. Switch on for the other entities after Damian and the accountant have read the month's output.

## 10. Open questions

1. **Which entities are Damian's.** The Established Landlord picklist has 19 names. Confirmed his: Beaucatt Homes Ltd, Beaumont Residential Ltd, Tanc Residential Ltd, D Murray & R Sullivan, Murray & Sullivan Invest Ltd, Damian Murray. To confirm: Michelle Murray, Harris & Murray Ltd, Lancaster Residential Group Ltd, and whether Sure Lets and Manage Ltd (Property Sauce), Luxe Stay, Montrose, Damian RBS, Gladioli House Management and Marchbank & Vale are separate books. Third-party landlords (Crackle, Snap, Pop, NSUK, D & D Homes, Array, Sturge East, North East, 101 Fortitude, Yusuf Loonat) get Ops 10 statements only, not bookkeeping.
2. **Which properties are in Damian's own name**, and whether Michelle Murray's holdings are in scope for the quarterly updates.
3. **The accountant**: name, firm, email, and which MTD software they submit through (Zoho Books is HMRC-recognised for VAT; for Income Tax the accountant needs to confirm, or a bridging tool is used from the sheet).
4. **Luxe Stay income**: holiday-let income is standard-rated for VAT, unlike residential rent, so whichever entity earns it has its own threshold to watch. Which entity is that?
5. **Sheets on Drive**: agreed as the accountant's copy, one workbook per entity per year with a tab per month, generated from Books. Confirm the Drive folder name and who else may see it.
6. **Backlog treatment** (section 5e, step 13): work forward from the current year first, with the accountant to rule on the older years. Yes?
7. **The weekly note**: Monday, by email, with a copy to Slack? And the day for the queries list.
8. **The "Accounting" section**: the proposal in the Ops 14 chat is a sidebar group named Accounting with one standing chat ("Accounting team") and a skill file holding the house rules (categories, thresholds, deadlines, the accountant's preferences); Ops 14's routine does the weekly work and writes to Books and the sheets, and the Accounting team chat reviews quarterly and at year end and produces the packs for the real accountant. To confirm.
9. **Feeds**: who reconnects the Deposit and Fee feeds, Gladioli's, and whether the two Murray & Sullivan accounts that stopped in 2023 are closed.
