# Property Sauce operating system: build plan

Written 15 September 2026 by Claude for Damian Murray. This is the plan for running Sure Lets and Manage Limited's lettings and management business, trading as Property Sauce, on a set of Claude agents around the website, Zoho CRM and Zoho Books, with the team doing only what a person legally or sensibly must. It is written so that Claude Cowork or Claude Code can pick it up and build from it without the conversation that produced it.

No em dashes. Everything in square brackets is a decision or fact still needed from Damian.

## 1. The honest answer

Doable. About eighty percent of the day-to-day work of a lettings and management business is intake, chasing, matching, drafting and reporting, and every one of those runs well on the pieces that already exist: the website and its assistant, Zoho CRM as the record, Zoho Books for money, Resend for email, Twilio for text and WhatsApp, the bank feed inside Zoho Books, and Claude in the middle. The site already verifies tenants against Zoho, writes maintenance tickets, and shows landlords a live portfolio. The rest is more of the same pattern: read the record, decide within a written limit, act through a channel, write the result back, and escalate when the limit is reached.

What stays with a person, by law or by good sense:

- Moving money. Claude will record payments, raise statements and prepare payment runs. A person presses pay.
- Signing. Tenancy agreements, section 8 notices, deposit prescribed information and management agreements are drafted by Claude and signed by a person or by the tenant through e-signature.
- Possession and court. Claude tracks grounds, dates and evidence and drafts the notice; the decision to serve it and to issue a claim is a person's, and anything reserved to solicitors is passed to one.
- Complaints. Claude acknowledges, gathers the file and drafts the reply. A named person sends the final response, as the Property Redress Scheme expects.
- Spend above a limit. Every landlord and every property gets an authority limit. Under it, Claude instructs. Over it, the landlord or Damian approves with one tap.
- Anything Claude is not sure about. The system is built to say "I am not certain, here is what I have, who decides" rather than guess.

The other caveats are practical. Something has to run around the clock, and that is the website's serverless functions and a scheduler, not a chat window on a Mac. Phone answering needs a telephony provider and a fortnight of real calls before tenants rely on it. The Zoho token needs wider scopes than it has today. The rent ledger is only as good as the bank feed and the payment references tenants use. And the Renters' Rights Act changes tenancy law during the build, so templates and notices must be checked against the commencement dates as they land.

## 2. Principles

1. Zoho CRM is the single source of truth. Every action any agent takes is written to the record it concerns: a note, a status, a date, an attachment. If it is not in Zoho, it did not happen.
2. Every agent has a written authority limit and an escalation path. Limits live in Zoho fields, not in prompts, so they can be changed without a deploy.
3. Every message to a tenant, landlord or contractor is logged with the channel, time and content. Every decision has a reason recorded.
4. Nothing irreversible runs without a person: no payments out, no notices served, no agreements signed, no data deleted.
5. Everything is idempotent and retryable. A job that fails halfway can be run again without duplicating a ticket, a message or a payment record.
6. Plain English in every message. Tenants and landlords are never told to "contact support"; they are told who, how and when.
7. Data protection first. Only the data needed for the task leaves Zoho, only to processors under contract (Anthropic, Twilio, Resend, Vercel, Google), and the privacy notice says so.

## 3. Architecture

Three layers.

**The always-on layer** is the website's serverless functions on Vercel plus a scheduler. This is where the agents actually run. They are ordinary functions that take an event (a message, a webhook, a timer), call Claude with the right tools, and write to Zoho. They run whether or not anyone's laptop is open.

**The channels** are how people reach the always-on layer and how it reaches them: the website assistant (live), SMS and WhatsApp through Twilio (the Twilio extension is already installed in Zoho CRM), the phone line, and email. The Inkbox number is an alternative for SMS and iMessage; today it holds a US number, and the UK number decides which we use.

**The supervisory layer** is Claude Cowork and Claude Code. Cowork reads the morning briefing, works the exceptions queue, and does the weekly review. Claude Code builds and changes the system. Neither is in the critical path of any tenant or landlord interaction.

### 3.1 Scheduler

Vercel's Hobby plan runs cron jobs once a day at most. The agents need hourly and some five-minute schedules. Two options:

- GitHub Actions cron in the propertysauce repository, calling the Vercel endpoints with a shared secret. Free, reliable to within a few minutes, already under our control. Recommended.
- Vercel Pro, about £16 a month, for native cron at any interval, plus longer function timeouts and more logs. Worth it once the phone line lands because voice needs the longer timeouts.

Start with GitHub Actions; move to Vercel Pro when the phone line is built.

### 3.2 Zoho changes

The CRM already has most of the structure: Contacts (labelled Tenant), Accounts (labelled Landlord, one record per property), the Maintenance module with a full job pipeline (Reported, Inspection Confirmed, Awaiting Quotation, Quotation Received, Quotation Sent to Landlord, Quotation Approved by Landlord, Contractor Instructed, Contractor Confirmed Job Complete, Requested Tenant to Sign Off, Tenant Signed Off, Invoice Received), attendance dates, quotes, invoices and sign-off fields, plus Keybook, Freeholds, Claims, Partners, Investors and Team. Zoho Sign, DocuSign and the Twilio WhatsApp and SMS extensions are installed.

What is missing and must be added, all through the Zoho API or the settings screen:

- Contractors. The Vendors module is empty. Each contractor needs trade, areas covered, properties covered, call-out and hourly rates, insurance expiry, preferred rank, contact channels and working hours. [Damian to confirm the contractor list and who covers which properties.]
- Landlord authority limit on the Landlord record (a currency field) and landlord approval channel (email, text, portal).
- Tenant channels: preferred channel, WhatsApp opt-in, out-of-hours emergency number.
- Rent ledger fields on the Tenant record: rent due day, payment reference, last payment date and amount, arrears balance, arrears stage. These mirror Zoho Books so the CRM stays readable without a Books call.
- Maintenance: severity score, trade, target date, tenant-facing status, last chased, next action date, awaiting (tenant, contractor, landlord, us).
- Lettings pipeline: use the existing Leads module (labelled Property) and Deals (labelled Progression) for enquiries, viewings and applications, with stage dates. [Confirm this is how the team already uses them.]
- Compliance: certificate date fields exist on the Landlord record. Add renewal booked date and renewal ticket link.
- A new Zoho self-client token with scopes covering CRM modules, notes, attachments, settings, and Zoho Books invoices, customers and payments. [Damian generates one grant code when asked; ten minutes.]

### 3.3 Money

Zoho Books, Property Sauce organisation 678590019, becomes the rent ledger: one customer per tenancy, a recurring invoice on the rent due day, a payment recorded when money arrives, a credit note for agreed adjustments. Landlord statements come out of the same ledger: rent received less fees and contractor invoices, paid over on a set day.

The bank feed is the one attached to Zoho Books; Wise is only used for direct Airbnb bookings at Luxe Stay. Zoho Books matches feed lines to invoices and the agent works from that. The Rent Ledger agent matches each credit to a tenancy by payment reference, then by amount and payer name, records it in Books and updates the Tenant record. Unmatched credits go to the exceptions queue. [Confirm every account that receives rent is connected to the Zoho Books bank feed.]

Payments out to landlords and contractors are prepared as a batch with every line justified, and a person authorises the batch in Wise. Claude never holds a payment credential.

## 4. The agents

Each agent is a set of functions, prompts and tool bindings with one job, a schedule or trigger, an authority limit, and a named escalation. They share the same Zoho client, the same messaging client and the same audit log.

### A. Front Desk

Purpose: be the first contact on every channel, every hour, and turn contact into a correctly filed record.

- Channels: website assistant (live now), SMS and WhatsApp (Twilio), phone (voice), email (contact@, repairs@, lettings@ routed to an inbound parser).
- Verifies the person against Zoho before disclosing anything, as the website does today.
- Repairs: gathers the report, photos, access and urgency; scores severity and trade; writes the Maintenance ticket; sends the tenant a ticket number and what happens next; flags emergencies (gas smell, flooding, no heat in winter with a vulnerable occupant, security) to the out-of-hours contractor and to a person immediately.
- Questions about a tenancy: answers from the record and the knowledge base; logs the question; hands off if unsure.
- Enquiries about letting or selling: qualifies and passes to the Lettings Desk or to Damian for acquisitions.
- Limits: never promises a date a contractor has not confirmed; never discusses another tenant; never gives legal advice.
- Escalates: emergencies, threats, safeguarding concerns, complaints, and anyone who asks for a person.

### B. Works Coordinator

Purpose: take every Maintenance ticket from Reported to Invoice Received without a person unless a decision is needed.

- Trigger: a new ticket, a status change, a contractor or tenant reply, and an hourly sweep of anything waiting.
- Picks contractors from the Vendors list by trade, area, property coverage and rank; sends the brief with photos by WhatsApp, SMS or email; asks for availability and a price.
- Under the property's authority limit, instructs the best reply and books access with the tenant, offering two slots and confirming one. Over the limit, sends the quote to the landlord for approval (portal, email or text) and chases it.
- Chases: tenant for access, contractor for a date, contractor for completion, tenant for sign-off, contractor for the invoice. Chase cadence lives in a table, not a prompt.
- On completion, asks the tenant to confirm and rate, matches the invoice to the quote, and flags any difference above a tolerance for a person.
- Writes every step to the ticket: stage, timestamps, messages, attachments.
- Escalates: no contractor reply within the target, quote over limit and landlord silent for 48 hours, tenant refusing access twice, any safety finding, any dispute.

### C. Compliance Officer

Purpose: no certificate or licence lapses, and the evidence is on the record.

- Daily sweep of gas safety, EICR, EPC, licences, fire risk assessments for blocks, legionella where required, and deposit protection status.
- Sixty days out: raises a renewal ticket, books the engineer through the Works Coordinator, and tells the landlord it is in hand.
- On receipt: files the certificate against the property, updates the date, and sends the tenant their copy (gas safety within 28 days, as required).
- Tracks Awaab's Law timescales on damp and mould reports, ready for the extension to private tenancies. [Commencement date for the private rented sector to be confirmed.]
- Escalates: any certificate that will lapse within fourteen days without a booking, any failed inspection, any licence condition breach.

### D. Rent Ledger and Arrears

Purpose: every pound of rent recorded the day it arrives, every late payment chased the same way every time, and arrears handed on before they grow.

- Zoho Books bank feed on each credit: match to the tenancy, record the payment, update the Tenant record, thank the tenant if they asked to be told.
- Due day plus one: friendly reminder by the tenant's preferred channel. Day seven: firmer reminder with the balance and a payment link. Day fourteen: formal letter by email and post, and a call from Front Desk. Day twenty-one: hand to Marchbank and Vale Associates with the file, and start tracking section 8 grounds. [Confirm the cadence and wording; the drafts follow the pre-action protocol.]
- Payment plans: can agree a plan within a written envelope (for example, arrears cleared within three months on top of rent) and records it; anything outside goes to Damian.
- Monthly: landlord statement per property from Books, sent on the statement day, with the arrears position and the actions taken.
- Escalates: unmatched credits, part payments, bounced payments, any tenant who disputes the balance, any mention of hardship or vulnerability.

### E. Lettings Desk

Purpose: from enquiry to keys with a person only at referencing decisions and signing.

- Enquiry intake from Rightmove and Zoopla emails, the website, phone and WhatsApp. Qualifies against the property's criteria (move date, household, income multiple, pets, guarantor) and answers questions from the listing.
- Viewings: offers slots from a shared calendar, books them, sends confirmations and reminders, records the outcome. [Who conducts viewings: a team member, a viewing agent, or self-viewing with a lockbox from the Keybook module.]
- Applications: collects the application, right-to-rent documents and references through a referencing provider, and presents a one-page summary with a recommendation. A person decides.
- Tenancy agreement: drafts from the approved template with the property, parties, rent, deposit, term and special clauses filled in; sends for e-signature through Zoho Sign or DocuSign; files the signed copy. [Template to be provided and checked against the Renters' Rights Act commencement.]
- Deposit: registers with the scheme, serves the prescribed information within thirty days, files the certificate. [Which scheme.]
- Move-in: How to Rent guide, gas safety, EPC, EICR, inventory booking, meter readings, welcome message with the assistant and portal details.
- Renewals and rent reviews: ninety days before the end of a fixed term, proposes the renewal or the notice, drafts the paperwork, and tracks the response.
- Escalates: referencing failures, guarantor needs, any discrimination risk, any request to deviate from the template.

### F. Landlord Relations

Purpose: landlords hear from us before they need to ask.

- Approvals: quotes over the limit, tenancy decisions, rent review proposals, each as one message with the facts and a yes or no.
- Statements and reports: monthly statement per property, quarterly portfolio review for portfolio and block clients, annual tax summary.
- Onboarding a new landlord: management agreement drafted and signed, property record created, certificates collected, keys logged, tenant introduced.
- Portal: already live. Adds an approvals inbox and a messages thread.
- Escalates: any complaint, any request to end management, any legal question.

### G. Watchtower

Purpose: the system watches itself, and a person sees what matters in five minutes a day.

- Every function reports success or failure to one log. Failures retry, then alert.
- Daily 8am briefing to Damian and to Cowork: overnight reports by severity, tickets waiting on someone, approvals outstanding, certificates due, rent received and missing, unmatched credits, enquiries and viewings, anything the agents escalated, and any system errors.
- Weekly review, run by Cowork: the numbers (time to first response, time to contractor booked, jobs closed in seven days, rent collected on time, arrears ageing, void days), what the agents escalated and why, and three improvements to make.
- Kill switches: one environment variable per agent to pause it, and a global pause. Pausing an agent stops its actions but not its logging.

## 5. Build sequence

Each phase is shippable on its own. Weeks are working time in sessions like this one, not calendar weeks; calendar time depends mostly on the third-party steps marked with Damian's name.

**Phase 0, now: finish the website.** Fees, director, testimonials, the tools page and the dashboards are done. Left: Google Search Console and Business Profile, the twelve testimonials as they are approved, and real rent figures once Phase 3 lands.

**Phase 1, weeks 1 to 2: reachable everywhere, one ticket pipeline.**
- New Zoho token with full scopes. [Damian: one grant code.]
- Twilio SMS and WhatsApp intake to the same assistant, with the same verification. [Damian: approve the WhatsApp sender in Twilio, using the company name and the website; Meta takes a few days.]
- Email intake: Google Workspace routes repairs@ and contact@ copies to an inbound parser. [Damian: confirm the mailboxes that exist and which should be parsed.]
- Severity, trade and target date written on every ticket. Tenant progress messages on every status change.
- GitHub Actions scheduler and the Watchtower log and alerts.
- Deliverable: a tenant can report by web, text or WhatsApp at 2am and gets a ticket number; the team sees a scored queue in Zoho; Damian gets the first daily briefing.

**Phase 2, weeks 2 to 4: works coordination and compliance.**
- Vendors module populated. [Damian: contractor list, coverage, rates, and the authority limit per landlord or a default.]
- Works Coordinator end to end, run first in "propose only" mode where it drafts every message for a person to send, then switched to send.
- Landlord approvals by email, text and portal.
- Compliance Officer daily sweep and renewal booking.
- Deliverable: the average ticket moves from Reported to Contractor Instructed without a person touching it; certificates are booked sixty days out.

**Phase 3, weeks 4 to 6: rent ledger and arrears.**
- Zoho Books as the ledger: customers, recurring invoices, payment recording. [Damian: confirm tenants and rent due days are right in Zoho; confirm the Zoho Books bank feed covers every rent account.]
- Zoho Books feed polling, matching, exceptions queue.
- Reminder cadence and letters; hand-off to Marchbank and Vale at the agreed day.
- Monthly statements from Books, and the portal's rent figures switched from CRM guesses to Books.
- Deliverable: every payment recorded on the day; every late payment chased identically; statements sent without a person.

**Phase 4, weeks 6 to 8: lettings.**
- Enquiry intake and qualification; viewing booking; application and referencing hand-off. [Damian: referencing provider, viewing method, deposit scheme.]
- Tenancy agreement drafting and e-signature from the approved template. [Damian: the template, reviewed for the Renters' Rights Act.]
- Move-in pack and deposit registration.
- Deliverable: from Rightmove enquiry to signed agreement with a person only at the referencing decision and the signature.

**Phase 5, weeks 8 to 10: the phone line and the polish.**
- 24/7 AI phone line on the office number's overflow and out of hours, then on the main line once trusted. [Damian: the number, and whether it ports or forwards.]
- Landlord approvals inbox and messages in the portal; tenant home page with ticket history and documents.
- Renewals and rent reviews.
- Deliverable: every channel answered around the clock; landlords approve from the portal; tenants see their history.

**Phase 6, ongoing: run it.** Cowork takes the daily briefing and weekly review. Claude Code takes changes. Damian takes decisions from the exceptions queue and the approvals inbox.

## 6. Running costs

Estimates at today's volume of roughly 170 properties, excluding what is already paid for (Zoho, Google Workspace, Vercel Hobby, Claude subscription).

| Item | Roughly per month | Notes |
|---|---|---|
| Claude API for the agents | £60 to £200 | Depends on message volume; the assistant today is a few pounds |
| Twilio SMS and WhatsApp | £20 to £60 | Per message; WhatsApp conversations are cheaper than SMS |
| Twilio voice for the phone line | £40 to £120 | Per minute; includes speech in and out |
| Resend email | £0 to £16 | Free tier covers a few thousand emails |
| Vercel Pro | £16 | Only when the phone line needs longer function timeouts |
| Referencing provider | per applicant | [Provider to choose] |
| E-signature | £0 to £30 | Zoho Sign is in the CRM already |
| Total | £140 to £440 | Against £300 plus setup for PropServ's repairs desk alone |

## 7. Risks and how the plan handles them

- Wrong action by an agent: authority limits, propose-only mode for the first fortnight of each agent, everything logged and reversible, kill switches.
- Law changing mid-build: templates and notices reviewed against commencement dates; the Compliance Officer holds a dated checklist; anything reserved goes to a solicitor.
- Data protection: processors listed in the privacy notice; minimum data per call; call recordings retained for a fixed period. [Retention period to decide.]
- Bank feed gaps: unmatched credits are never guessed; exceptions queue daily.
- Zoho API limits: batching and caching; the CRM is the record, not a chat log.
- Phone quality: two weeks of shadow calls before tenants rely on it; a person always reachable for emergencies.
- Key person risk: everything in the repository and in Zoho; this document and the runbook are the handover.

## 8. Handover to Claude Cowork

What Cowork runs:

- Every weekday at 8am: read the briefing at the Watchtower endpoint, work the exceptions queue (approve, reassign, reply, or escalate to Damian), and post a three-line summary to Damian.
- Every Monday: the weekly review, with the numbers and three improvements, filed in the repository under docs/reviews/.
- On any alert: read the log, retry if safe, otherwise pause the agent and tell Damian.

Where everything lives:

- Code and documents: github.com/damianmurray05-ux/propertysauce, folder docs. This plan is docs/OPERATIONS-PLAN.md. Deployment steps are docs/DEPLOY.md.
- Live site and functions: Vercel project propertysauce under team Property Sauce. Environment variables are the only configuration; secrets are entered by Damian.
- Records: Zoho CRM (tenants, landlords, properties, maintenance, contractors) and Zoho Books (rent ledger, statements).
- Channels: Twilio (text, WhatsApp, voice), Resend (email), Google Workspace (mailboxes), Zoho Books (bank feed and ledger).
- Recovery: Marchbank and Vale Associates for arrears from the agreed day.

How to intervene: pause an agent with its environment variable; edit an authority limit in Zoho; reply to any tenant or landlord thread from the mailbox and the agents will read it as a human reply and stand back on that thread for 24 hours.

Who decides what: Damian for anything over a limit, any legal step, any money out, and any complaint. Cowork for the exceptions queue within the written limits. The agents for everything under the limits, always logged.

## 9. Decisions and inputs needed from Damian

1. A Zoho grant code with the wider scopes, when asked (ten minutes).
2. The contractor list: who, which trades, which properties, rates, and a default authority limit per property (for example £250) and per landlord where different.
3. Which mailboxes exist on propertysauce.co, and which should feed the agents.
4. The phone number for the line, and whether Twilio or Inkbox carries text.
5. Confirmation that the Zoho Books bank feed covers every rent account, and the statement day for landlords.
6. The arrears cadence: reminder days and the day it goes to Marchbank and Vale.
7. The tenancy agreement template, the deposit scheme, the referencing provider, and how viewings are done.
8. Retention period for call recordings and messages.
9. The name that signs complaints responses.

Once these nine are answered, nothing in this plan waits on a person until a decision genuinely needs one.
