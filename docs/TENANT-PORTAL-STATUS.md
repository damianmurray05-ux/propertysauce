# Tenant portal and assistant: what is live, what tenants can ask, what is still to build

Written 23 September 2026 for Damian Murray. This is the state of propertysauce.co for tenants on the day of writing, checked against the code that is deployed, not against the plan.

## 1. The short answer

The website is ready to go live to tenants today with email verification. The phone number only adds text-message codes; it is not a blocker.

What a verified tenant can do today: see their tenant scorecard, see their repairs and their stage, and report a new repair through the assistant (which creates a Zoho maintenance ticket with photos and emails the team and the tenant). What they cannot do yet: download documents, see rent statements or balances, or ask the assistant about their own file. Those are the four builds in section 5, and none of them waits on the phone number.

## 2. Signing in

- The tenant enters one thing: their tenancy reference. The site matches it against three fields on the Zoho tenant record: Rent Payment Reference, Property Sauce Reference or Homelet Number.
- They then choose where the six-digit code goes: the email address on their record, or the mobile number on their record. Only channels that exist on the record are offered, and each is shown masked (da*****@gmail.com, ******434).
- Email codes are live now, sent from assistant@propertysauce.co through Resend. Text codes need a sending service wired in; the site is built for Twilio and nothing is configured, so the mobile option does not appear yet.
- The code lasts ten minutes; a sign-in lasts two hours on the tenant scorecard and two hours in the assistant. Five wrong codes in ten minutes locks the address out for ten minutes.
- What "seamless" needs, and my recommendation: most tenants will not know their reference. Let them sign in with the email address or mobile number on their record instead, with the same code step. That is a small change and I recommend making it before the text messages go out. The code itself stays; it is the minimum that keeps one tenant from reading another tenant's file.

## 3. Where the tenant portal gets its facts

Everything comes from Zoho CRM at the moment a tenant signs in. Nothing is copied to the website.

| Fact | Source | State |
|---|---|---|
| Who the tenant is, their property, email and mobile | Tenant record (Contacts) and its linked Landlord record | Live |
| Rent paid on time, twelve-month history | Inferred from Tenants Missed Payment Date and the tenant Status on the Zoho record. Zoho does not hold a month-by-month history | Live but approximate. Zoho Books holds the real invoices and payments and is now readable; switching the history to Books is build 5.2 |
| Arrears | Status Arrears, Possession Proceedings or Court, and Days Since Missed Payment | Live but approximate, same fix as above |
| Good neighbour | The five conduct slots on the tenant record (date, type, details, upheld or not) | Live; the team has to fill the slots |
| Looking after the home | Last inspection outcome and next inspection due on the property record | Live; the team has to record inspections |
| Repairs, with stage | Zoho Maintenance jobs linked to the tenant, with the pipeline stage in plain words (Reported, Inspection booked, Quote with landlord, Contractor booked, Work done, Signed off) | Live |
| Certificates for the property | Gas safety, EICR, EPC and licence dates on the property record, and the certificate files in Zoho and Drive | Dates live in the landlord portal only; not yet shown to tenants |
| Tenancy agreement, deposit certificate, inventory | Attachments on the tenant and property records in Zoho | Not yet shown to tenants |
| Rent statements and balance | Zoho Books: one customer per tenancy, invoices per rent period, payments recorded, bank feed | Readable since 17 September; nothing built for tenants yet |

## 4. What a tenant can ask today, and what happens

The assistant on every page has four modes. The tenant picks "Report a repair" or "Ask about my tenancy" and the site decides the rest.

**Report a repair, verified.** After the code, the assistant already knows who they are and where they live and does not ask again. It collects what is wrong, where, when it started, whether it is worsening, access arrangements and a phone number, and accepts photographs. It then creates a ticket in the Zoho Maintenance module on the tenancy file with the photos, emails the team with everything, emails the tenant a confirmation with the ticket number, and posts to the Slack webhook. Emergencies (gas smell, uncontrollable leak, no power, no water, insecure door, carbon monoxide alarm) are told to ring first and are still logged. This is fully live and tested with the PSTEST01 tenant.

**Report a repair, not verified.** Same, but the assistant first collects name, address and contact, and the ticket is marked unverified for the team to check. Live.

**Tenancy questions, general.** Not verified, so nothing about an individual file. The assistant answers from a written knowledge sheet: how repairs work and who is responsible for what, emergencies, tenancy terms under the Renters' Rights Act (periodic tenancies, two months' notice, rent increases by Section 13, deposits and holding deposits, permitted payments, pets, inspections with 24 hours' notice, referencing, bills, ending a tenancy, complaints route and the Property Redress Scheme), the scorecard and rewards, and the calculators. Anything the office has not confirmed is marked in the sheet and the assistant says "the team will confirm" rather than guessing. Anything specific to the tenant's own tenancy, or any request to change terms, is logged with the tenant's details and emailed to the team for a person to answer. Live.

**Landlords, sellers and others.** Takes the enquiry and hands it to the team. Live.

**What the assistant cannot answer yet, even for a verified tenant:** "what is my balance", "when is my rent due", "has my payment gone through", "send me my tenancy agreement", "send me the gas certificate", "what is happening with my repair", "when is my next inspection", "who is my contractor". Every one of those is answerable from data the site can already reach; the assistant simply has no tools to read a tenant's own file yet. That is build 5.1.

**The knowledge sheet has seven gaps the assistant currently says "the team will confirm" for:** the out-of-hours arrangement, repair service levels by urgency, damp and mould timescales, which deposit scheme is used (Mydeposits, from Ops 2), inspection frequency (six months London, three elsewhere, from Ops 5), the rewards beyond references and priority repairs, and the fee schedule for landlords. Six of these are now decided in the Ops files and can be written in today.

## 5. What is left to build, in order

**5.1 The assistant reads the tenant's own file (verified mode).** Give it read-only tools for the signed-in tenant: their property's certificate dates and files, their repairs and stages, their next inspection, their deposit protection status, their rent due date and reference, and their Books invoices and payments. Then a verified tenant can ask any of the questions in section 4 and get the answer from the record, with a link to the document where there is one. Documents stream through the same signed link the landlord portal already uses, restricted to the tenant's own tenancy. Estimate: two working days. This is the build that makes the portal replace a phone call.

**5.2 Rent history and balance from Zoho Books.** Replace the inferred twelve-month history and arrears on the scorecard with the real invoices and payments from Books, and add a "Your rent" section: due date, amount, reference to use, last five payments, balance today, and a statement PDF. Depends on the Ops 4 rule that only certain matches are recorded, so the balance shown is only what a person or a certain match has confirmed. Estimate: two working days once Ops 4's matching is running.

**5.3 Documents tab on the scorecard page.** Tenancy agreement, deposit certificate and prescribed information, inventory, gas safety, EICR, EPC, licence, and the Renters' Rights information sheet, each opening from the record. Same data as 5.1, shown as a list rather than through the assistant. Estimate: one working day.

**5.4 Sign in by email or mobile as well as reference.** Section 2. Half a day.

**5.5 Text-message codes and tenant texting.** When the Inkbox number is active: wire the site's text sending to it (or to Twilio if Inkbox cannot send from a server), turn on the mobile option in sign-in, and then the launch texts to tenants go from the same number. Half a day once the number works.

**5.6 Knowledge sheet update.** Write the six decided answers in and remove the "team will confirm" wording. One hour.

**5.7 Tenant data hygiene before launch.** For every current tenant: an email address on the record (or a mobile once 5.5 is live) and one of the three reference fields filled. Any tenant without those cannot sign in. I can run the check and send the list of gaps to Usman the day before the texts go out.

## 6. Launch sequence recommended

1. Build 5.1, 5.3, 5.4 and 5.6 this week; test with PSTEST01 and one real tenant.
2. Run 5.7 and get the record gaps fixed.
3. When the number is active, 5.5, then the launch text to all tenants with the link and their reference, inviting them to sign in with their email or mobile.
4. 5.2 follows once Ops 4's rent matching is running, so balances are right when tenants first see them.
