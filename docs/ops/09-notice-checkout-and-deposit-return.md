# Ops 09: Notice, checkout and deposit return

Scope: a tenant's notice received and checked, the acceptance email and move-out checklist, the vacant-property register, the CRM and Books changes at notice and at move-out, meter readings and the day-one turnaround, deposit deductions and return, then straight back to Ops 01 to re-let.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 9 chat. The acceptance email (template T1) and the points in sections 4 and 10 are waiting for Damian's approval. Re-letting itself is Ops 01 and Ops 03; the works are Ops 05; rent chasing is Ops 04.

## 1. What this operation covers

A tenant emails to say they are leaving. Claude checks that the notice is valid under the tenancy agreement and the Renters' Rights Act 2025, accepts it in writing the same day, and in that acceptance tells the tenant exactly what we need from them: meter readings by photo and typed on the day they go, the property left clean to a checklist, any damage or marks declared now with their own view of what is theirs, and their available times for viewings. The property goes on the vacant register in Slack, the Landlord record is set to To Let, the Tenant record gets the suggested vacate date, the area contractor is warned, and the re-let starts at once through Ops 01. On the day the tenant leaves the actual date is recorded, the readings are captured, the leaver is deactivated in CRM and Books (renamed with an X, never deleted), utilities and the landlord are told, and the contractor turns the property round. Deductions are proposed against the check-in inventory and the tenant's own admissions, agreed, and the deposit is released. The objective is the fewest vacant days and the property handed back in the best condition, because every vacant day costs the landlord money and an early, written acknowledgement of damage avoids a fight at deposit time.

## 2. How it is done today

Damian's account, 19 September 2026:

- Notice arrives by email. Under the Renters' Rights Act it is easier for tenants to leave than it was: no fixed term to run down, so notice can arrive at any time.
- The office replies accepting the notice and puts the date in the CRM as the *suggested* vacate date. The actual vacate date is only entered on the day they go, because it moves by a day or two more often than not.
- The acceptance email is where the tenant is told what we expect: meter readings on the day they leave, as a photo and typed out; the place cleaned and tidied; any damage, marks on the walls or potential dangers flagged now so the maintenance team can be lined up; and their own view of how much of that damage is theirs. Asking early gives the tenant the chance to own up, and a tenant who has admitted something in writing accepts a deduction without it having to be forced. A cleaning checklist goes with it (fridge, cupboards, windows and so on). The email also asks for the best times for viewings.
- The property is marked To Let on the landlord's property record in Zoho. A Slack channel, Vacant Properties, is the running list of everything vacant or coming vacant, with the address, tenant name and phone, and the suggested and actual dates. The area maintenance person is told the date: Rocky for London, Ali for Catterick House and Lancaster House.
- London properties get an OpenRent ad the moment notice is received. Catterick House and Lancaster House have a permanent ad, so the fallback is the enquiry database from Ops 03.
- If nobody has been found by the day the tenant leaves, Ali (or Rocky) goes in on day one, confirms the readings, and gets the property painted and cleaned as fast as possible.
- Leavers are deactivated, not deleted: the actual vacate date goes on the CRM record, the recurring invoice in Zoho Books is stopped, and both the Books customer and the CRM record are renamed with an X in front so everyone can see it is an ex-tenant. The profile is kept for future reference.
- A tenant in arrears when they give notice is sent a statement from Zoho Books telling them the balance must be paid before they leave.
- What goes wrong: meter readings missed, so old and new tenants argue over a bill; damage discovered only at checkout, when it is too late to prepare or to get the tenant's agreement; vacant days lost because the re-let starts after the tenant has gone; and the date in the CRM being the one the tenant first said rather than the one they actually left.

## 3. Systems and records touched

**Zoho CRM, Tenant (Contacts) record.** The fields already exist:

| Stage | Fields |
|---|---|
| Notice | `Suggested_Vacate_Date_Time` (the date in the notice), `Tenancy_End_Date` (same date once accepted), note "Notice received <date> by email; valid from <date>; accepted <date>" with the tenant's email attached, `Cleaning_booked` left empty until the works are booked |
| Rent to the end | `Rent`, `Rent_Due_Date`, `Deposit`, `Deposit_Scheme` (Mydeposits or TDS), `Deposit_Number`, `Deposit_Held_By`, `Deposit_Statue`; arrears position from Ops 04 |
| Move-out | `Actual_Vacate_Date` (the date they actually went; `Actual_Vacate_Date_Time` is labelled "Utilities Vacate Date" and takes the same date and time for the utility letters), `Electric_Meter_Reading_Out`, `Gas_Meter_Reading_Out`, `Tenants_Forwarding_Address1`, `Sets_Of_Keys` (to count against), `Status` = Vacated, `Email_Utilities_Tenant_Vacated`, `Email_Landlord_Accounts_Tenant_Vacated`, meter photos as attachments |
| Deactivate | `Last_Name` renamed with "X - " in front of the existing name, which is already "<address> - <tenant name>", so a leaver reads "X - Flat 14, Catterick House - Pelumi Joshua Otegbola". This is the house style found on the twelve most recent X records on 19 September 2026 |
| Deposit | note "Deductions proposed <date>: <items and amounts>; agreed <date>; released <date>; scheme reference" |

There is no water reading-out field (only `Water_Meter_Reading_in`); see section 10.

**Zoho CRM, Landlord (Accounts) record** (one per property). `Status` = To Let at notice, Rented once the new tenancy starts. `Occupied` (Occupancy) stays Occupied until the tenant has gone, then Vacant, then Occupied again at move-in. `Existing_Tenant`, `Tenants_Name`, `Tenants_Phone`, `Tenants_Email`, `Tenancy_End_Date` point at the leaver until the new tenant is in. `Inspection_Area` (London, Catterick House, Lancaster House, Other) and `Maintenance_Contractor` decide who is told. `Established_Landlord` decides who owns the property and is told (README rule 4).

**Zoho Books, Property Sauce organisation 678590019.** One customer per tenancy, one recurring invoice. At move-out the recurring invoice is stopped and the customer renamed with the "X - " prefix. Statements of account come from the customer's record. The MCP connector in this session cannot stop a recurring invoice or rename a customer; the website's Zoho key can (Ops 04 facts), so those two steps are a build item or a person until then (section 5, step 10).

**Slack.** #vacant-properties (C0C2X7E7X5K, created 19 September 2026 by this chat) is the register. Area channels for the contractor: #london-maintenance (C0C21E4BH2Q) for Rocky, #catterick-maintenance (C0C1ZMSNUFK) and #maintenance-lancester-house (C0C1T2RDPGV) for Ali. Anything urgent to #claude-urgent (C0BTPPZ3JJE).

**Email.** Notice comes into contact@propertysauce.co or through the website assistant's "notice to leave" hand-off (Ops 03 section on things it must not answer). The acceptance and every later letter to the tenant go from the Tenant record with Send Email so they sit on the file. Routine reminders can go from contact@propertysauce.co.

**Drive.** The tenancy folder gets the notice email, the acceptance, the tenant's damage declaration and photos, the checkout photos, the readings and the deposit correspondence. Checkout photos follow the Ops 05 convention (longest side 1600 px, JPEG 80).

**Deposit schemes.** Mydeposits or TDS, per the Tenant record. Release or deductions are actioned in the scheme's portal by a person (README rule 2: no money out without a person).

**Law the check relies on.** Renters' Rights Act 2025, in force for tenancies since 1 May 2026: a tenant's notice must be in writing (any means, including email or text; a clause restricting the means is void, section 21) and must give not less than two months to the date it takes effect, unless the landlord agrees a shorter period in writing (section 20). Notice still has to expire at the end of a rent period or the day after. A notice can only be withdrawn if tenant and landlord agree in writing (Protection from Eviction Act 1977, section 5A). Where an older agreement lets the tenant give a shorter notice, the shorter period stands. Under the transition rules every tenancy became periodic on 1 May 2026, so there is no fixed term to hold anyone to. [To be re-read against the Act itself before the first live use: section 10.]

## 4. Decision limits

Claude may, without asking anyone:

- Accept a valid notice and send the acceptance email (T1) the same working day.
- Where the notice is shorter than the agreement or the Act allows, reply with T1s: it tells the tenant the earliest date the notice can legally take effect, records that date as the suggested vacate date, and says we will confirm within two working days whether we can release them earlier. Whether to agree the earlier date is Damian's call (section 10 recommends a rule).
- Enter the suggested vacate date, set the Landlord record to To Let, post to #vacant-properties, tell the area contractor, and trigger Ops 01 (OpenRent ad for London; enquiry database for Catterick House and Lancaster House).
- Send the seven-days-before reminder, the day-of readings chase, and the utilities and landlord notifications after move-out.
- Rename the leaver with the "X - " prefix, set the actual vacate date and Vacated status, and stop the recurring invoice (once the Books connection exists; until then, ask Ezad or Usman in #vacant-properties).
- Send a Books statement to a tenant in arrears at notice, with the T2 paragraph, and keep the Ops 04 timetable running to the last day.
- Propose deposit deductions in writing to the tenant (T7) where every item is (a) admitted by the tenant in their declaration, or (b) plain from the check-in inventory against the checkout photos, and the total is £250 or less. [Figure to confirm.]

Needs a person:

- Agreeing a shorter notice than the law or the agreement requires, or agreeing a withdrawal of notice: Damian, in writing to the tenant.
- Any deposit deduction the tenant disputes, any deduction over £250, or any claim beyond the deposit: Damian, and the landlord where the Established Landlord is not Damian, his wife or their companies.
- Releasing or claiming the deposit in the scheme portal: a person, always.
- A tenant who has gone without giving readings or returning keys, who has left belongings, or who has left the property in a dangerous state: Damian and #claude-urgent the same day.
- Anything about possession, a tenant refusing to leave after their notice date, or a dispute about whether notice was ever given: Damian; nothing is served by Claude (README rule 2).
- Never delete a Tenant record or a Books customer (README rule 2 and Damian's rule of 19 September).

## 5. The procedure, step by step

**Step 1. Notice arrives.** By email to contact@propertysauce.co, by reply to a rent invoice, or through the website assistant, which acknowledges and hands over (Ops 03). Anything spoken (a call, a message to Ali or Rocky, a WhatsApp) is not notice: ask the tenant to put it in an email the same day, and record the conversation on the Tenant record. Save the email to the tenancy folder in Drive and as an attachment on the Tenant record.

**Step 2. Check it, within one working hour.** Read the tenancy agreement from the tenancy folder and check four things:

1. *In writing and from the tenant.* Email is fine. If it comes from someone else (a parent, a partner not on the agreement), ask for it from a named tenant. For joint tenants, a notice from one ends the tenancy for all; tell the other tenants the same day and record it.
2. *Long enough.* Not less than two months from the day it is received to the leaving date, unless the agreement allows the tenant a shorter period, in which case the agreement's period applies.
3. *Ends on the right day.* The end of a rent period (the day before `Rent_Due_Date`) or the day after. If the tenant has named a mid-month date, the notice takes effect at the next valid date; T1 says so plainly.
4. *Arrears.* Read the Ops 04 position. If anything is owed, step 4 applies.

Write the result on the record: "Notice received <date>; earliest valid end date <date>; tenant asked for <date>; arrears £x."

**Step 3. Accept, the same working day.** Send T1 from the Tenant record. If the requested date is earlier than the earliest valid date, send T1s instead and put the question to Damian in #vacant-properties with the facts (rent, area, how quickly the property is likely to re-let). Damian answers in the thread; Claude confirms to the tenant in writing within two working days. Set `Suggested_Vacate_Date_Time` to the date accepted or, with T1s, the earliest valid date until Damian decides. Set `Tenancy_End_Date` to match.

**Step 4. Arrears at notice.** If the tenant owes rent, T1 carries paragraph T2 and a Books statement of account is sent the same day from the customer record. Rent remains due to the last day, and the Ops 04 timetable keeps running; the file goes to Marchbank & Vale on its normal day if it is not cleared. Note on the record that the deposit cannot be treated as the last month's rent unless Damian agrees it in writing.

**Step 5. The register.** Post one message to #vacant-properties in this shape, one property per message, and keep every update in that message's thread:

```
🏠 <address>
Tenant: <name> · <mobile>
Notice received: <date> · Suggested vacate: <date> · Actual vacate: —
Landlord: <Established Landlord> · Area: <London / Catterick House / Lancaster House> · Contractor: <Rocky / Ali>
Rent: £<x> pcm · Deposit: £<x> (<scheme> <ref>) · Arrears: £<x or none>
Status: Notice received
```

Statuses, in order: Notice received, Listed, Viewings booked, Let agreed, Vacated, Turnaround, Re-let (moved in <date>). Edit the Status line at each change and add a ✅ reaction when the new tenant has moved in, so the channel at a glance is the list of what is vacant or coming vacant. Every Monday at 08:00 the routine posts a one-line-per-property summary with days to vacate or days vacant.

**Step 6. The CRM.** Landlord record: `Status` = To Let. `Occupied` stays Occupied. Tenant record: as step 3, plus a task on the record for the suggested vacate date.

**Step 7. Tell the contractor.** In the area channel, the same day:

> Ticket none yet. <address>: tenant has given notice, expected to leave <date>. Plan for a paint-and-clean turnaround starting <date + 1>. The tenant's list of damage will follow within seven days. If it is not re-let by then you are in on day one for meter readings and photos.

Rocky covers London; Ali covers Catterick House and Lancaster House (Damian, 19 September; Ops 05 has Dave on Lancaster House, section 10). Rocky is not on Slack yet, so his message goes by text or WhatsApp from a person until he is (Ops 05 section 10).

**Step 8. Start the re-let now.** Hand to Ops 01 the same day: a London property gets its OpenRent ad written and live within one working day, with photos from the last inspection or a request to the tenant for a viewing to photograph; Catterick House and Lancaster House use the permanent ad and Ops 03's enquiry database, contacting every live enquiry for that building with the date. The tenant's viewing times from T1 go to whoever runs viewings, and every viewing gets 24 hours' written notice to the tenant. Nothing in this step waits for the tenant to leave.

**Step 9. The tenant's declaration, seven days after T1.** If the tenant has not replied with their list of damage and their view of what is theirs, chase once by email and once by text. Whatever comes back goes on the record and into the thread, and the contractor gets the list so materials and time are lined up. Where the tenant admits an item, note it as "admitted by tenant <date>"; that note is what makes the deduction in step 13 uncontested.

**Step 10. Seven days before the date.** Send T5: the readings instructions again, keys and forwarding address, the cleaning checklist, and how the deposit return works. Confirm with the contractor the day-one visit. Tell the landlord (where the Established Landlord is not one of ours) the date and the plan.

**Step 11. Moving day.** By 18:00 on the day, Claude expects an email from the tenant with a photo of each meter and the typed readings, the forwarding address, and confirmation of where the keys are. If nothing by 18:00, chase by text and email. The next morning the contractor goes in (whether or not the tenant sent readings): confirms the readings with their own photos, photographs every room, counts the keys against `Sets_Of_Keys`, notes anything dangerous, and posts all of it in the thread. If the tenant's readings and the contractor's do not match, the contractor's photo taken the next morning is the record and the tenant is told.

**Step 12. Close the tenancy in the systems, the same day the contractor confirms the property is empty.**

- Tenant record: `Actual_Vacate_Date` and `Actual_Vacate_Date_Time` (the real date), `Electric_Meter_Reading_Out`, `Gas_Meter_Reading_Out`, water in the note until the field exists, `Tenants_Forwarding_Address1`, `Status` = Vacated, then rename `Last_Name` to "X - <existing name>". Both together: four of the twelve most recent X records still show Tenanted or Let Agreed, and one has no actual vacate date, so the rename has been happening without the status and date. Tick `Email_Utilities_Tenant_Vacated` and `Email_Landlord_Accounts_Tenant_Vacated` once those emails have gone.
- Landlord record: `Occupied` = Vacant. `Status` stays To Let.
- Zoho Books: stop the recurring invoice with effect from the last rent period, rename the customer to "X - <existing name>", and if a final part-period invoice or credit is needed raise it and send it with the statement. Never delete the customer.
- Utilities and council: email the electricity and gas suppliers and the water company the closing readings, the vacate date and the forwarding address, and tell the council tax office the property is empty from that date and who the owner is. The landlord (or the office for our own) is responsible for the bills during the void.
- Landlord: for a third-party landlord, T6 from the Landlord record: the tenant has gone, the readings, the state of the property, the works planned and when the property is expected to be re-let.
- #vacant-properties: Status = Vacated, actual date filled in.

**Step 13. Deposit.** Within five working days of the checkout: compare the check-in inventory and photos with the checkout photos and the tenant's declaration, and cost anything that is not fair wear and tear from the in-house rate card or a quote. Send T7 from the Tenant record: each item, the amount, the reason and the evidence, with what the tenant admitted marked as such, and the balance to be returned. Within Claude's limit (section 4) the proposal goes without asking; above it or with a third-party landlord, Damian or the landlord approves first. The tenant has ten days to agree or dispute. Agreed: a person releases the deposit in the scheme portal within ten days of the agreement, and Claude records the date and reference. Disputed: the undisputed part is released, the disputed part goes to the scheme's free dispute service with the inventory, photos, declaration and T7 as the evidence bundle, and Damian is told. No deductions: T7 says so and the whole deposit is released. Note everything on the Tenant record, and stop: the record is now an X.

**Step 14. Turnaround.** The contractor's list from step 11 becomes Ops 05 tickets the same day, grouped as one visit where possible: paint, clean, any repairs, keys cut to the standard set count, and the certificates checked against Ops 07 so nothing expires during the void. Target: keys ready for a new tenant within [five] working days of the property being emptied. [Figure to confirm.] When the new tenant moves in (Ops 02), the Landlord record goes to `Status` = Rented and `Occupied` = Occupied, the register message gets its ✅, and this file is closed for that property.

## 6. Escalation

- Notice by any route other than writing, or from someone not on the agreement: ask the same day, and if nothing in writing within three working days, Damian.
- Requested date earlier than the law allows: Damian in the #vacant-properties thread, answer within two working days.
- Tenant in arrears at notice: Ops 04 timetable and its escalations; Damian is told at notice.
- Tenant unreachable for the readings, keys not returned, belongings left, property dangerous or uninhabitable, squatters or an occupier who was not on the agreement: #claude-urgent and Damian the same day.
- Tenant still in the property after the notice date: Damian the same day; nothing is served by Claude.
- Deposit dispute, deductions over the limit, or a claim beyond the deposit: Damian, and the landlord where third-party.
- Property not re-let 14 days after it was emptied: Damian, with the enquiry count, viewings held and the asking rent, and a recommendation on price.

## 7. Done when

For the leaver: notice accepted in writing on the day it arrived; suggested date entered at notice and actual date entered on the day they left; meter readings photographed and typed on the record, matched by the contractor's photos; arrears cleared or on the Ops 04 track; deposit proposal sent within five working days of checkout and the deposit released within ten days of agreement; Tenant record and Books customer renamed with X, recurring invoice stopped, nothing deleted; utilities, council and landlord told.

For the property: on the register and set To Let on the day notice arrived; re-let started the same day; contractor warned the same day; keys ready within the turnaround target; new tenant moved in with the fewest vacant days. Measured per property: days from notice to ad live (target 1), days from empty to keys ready (target 5), days vacant (target 0 where notice was two months, otherwise as few as possible).

## 8. Cowork routine

Trigger: three schedules on the Property Sauce Cowork routine, plus the Ops 03 hand-off.

- *Every working day 08:00.* Read the propertysauce mailbox and the Ops 03 hand-offs for notice emails since the last run; run steps 1 to 8 for each; report every action in #vacant-properties and in the Ops 9 report. Then read every Tenant record with a `Suggested_Vacate_Date_Time` in the next seven days and send T5 where it has not gone; for any date that is today, set the 18:00 readings check; for any date that was yesterday with no `Actual_Vacate_Date`, ask the contractor in the area channel for the day-one visit and run steps 11 and 12 as the answers arrive. Chase declarations due (step 9).
- *Every working day 18:00.* Readings check for anyone leaving today (step 11).
- *Every Monday 08:00.* Summary post to #vacant-properties: every Landlord record with `Status` = To Let, days to vacate or days vacant, register status, and anything past 14 days flagged.

Inputs: the propertysauce mailbox, the Tenant and Landlord records, the tenancy folder in Drive, the Ops 04 arrears position, the Books customer. Reports to #vacant-properties (per property) and to Damian by the Ops 9 daily report line: notices received, dates entered, emails sent, escalations open.

## 9. Test plan

The next tenant to give notice, whichever property it is. For that one tenancy, for a week and then through to move-out, every step is run by the routine but every email, post and CRM change is reported in the Ops 9 chat before it goes, and Damian sees T1, T5, T6 and T7 as they are sent. The X rename, the Books stop and the deposit release are done by a person in that test and observed. Switch on for everyone once one tenancy has gone from notice to deposit release with nothing corrected.

Before the test, this chat builds: the notice-reading check in the routine; the #vacant-properties message format; the T1 to T7 templates as Zoho CRM email templates; the Books stop-and-rename call through the website's Zoho key; and the water reading-out field.

## 10. Open questions

- **T1.** Approve the acceptance email and checklist below, or mark up changes.
- **Shorter notice.** Damian said the Act makes it more lenient for tenants. The Act sets a tenant's minimum at two months (section 20), which is longer than the one month most periodic tenants gave before, but they can serve it from day one. Recommended rule: accept any earlier date the tenant asks for whenever a new tenant can start on or before it, because a vacant day costs more than a month of a departing tenant's rent is worth arguing over; hold them to the valid date only where the property will not re-let in time. If agreed, Claude applies that rule in step 3 without asking. Until then Damian decides each one.
- **Lancaster House.** Damian said Ali today; Ops 05 (17 September) has Dave on Lancaster House repairs and inspections. Which is right for the day-one visit and the turnaround?
- **Old X records.** Four of the twelve most recent X-renamed tenants still have `Status` Tenanted or Let Agreed, and one has no `Actual_Vacate_Date`. Shall this chat tidy every X record to Vacated with the date where it can be found on the record, and list the rest for the office?
- **Water readings.** There is no `Water_Meter_Reading_Out` field. Add one (text, next to the electric and gas out fields)?
- **Notice given status.** The Tenant `Status` picklist has no "Notice Given" value, so between notice and move-out the record still says Tenanted. Add "Notice Given" so the CRM list shows it without opening the record?
- **Deduction limit.** £250 proposed as the amount Claude may put to a tenant without approval where each item is admitted or plain from the inventory. Confirm or change.
- **Turnaround target.** Five working days from empty to keys ready. Confirm, and whether the in-house team's paint-and-clean cost is charged to third-party landlords (Ops 06).
- **Deposit release.** Who logs into Mydeposits and TDS today, and does the office want Claude to prepare the release or claim so that person only clicks approve?
- **Last month's rent from the deposit.** Tenants often ask. Assumed no unless Damian agrees in writing. Confirm.
- **Law check.** The section numbers and the "end of a rent period or the day after" rule in section 3 were taken from a landlord guide, not from the Act. Re-read sections 20 and 21 of the Renters' Rights Act 2025 on legislation.gov.uk before the first live notice and correct this file if needed.
- **Registering the register.** A Slack List or Canvas would hold the vacant properties as a table rather than a thread per message. Messages and threads are used first because they work today; switch if the channel gets busy.

## Templates

All go from the Tenant record with Send Email so they sit on the file, except where marked. Square brackets are merge fields. Sign-off is the office: Property Sauce, contact@propertysauce.co, the office number, and a named person.

### T1: Notice accepted

Subject: Your notice for [address]: accepted, and what happens next

Dear [first name],

Thank you for your email of [date received] giving notice to end your tenancy at [address].

We accept your notice. Your tenancy will end on **[end date]**, and we have recorded that as the date you expect to move out. If that date changes by a day or two, tell us as soon as you know, because the property, the meters and your deposit are all handled from the day you actually leave.

Rent is due as normal up to and including [end date]. Please cancel your standing order after your final payment on [last rent date].

[T2 paragraph here if in arrears]

**Four things we need from you**

1. **Meter readings on the day you leave.** Take a clear photo of each meter (electricity, gas and water if you have a water meter) and email the photos to us, with the numbers typed out, on the day you go. This protects you: it fixes the date your bills stop and stops any argument between you and the next tenant about who used what.

2. **Tell us now about any damage, marks or faults.** Within the next seven days, please reply with a list and photos of anything at the property that is damaged, marked, broken or unsafe, however small: marks on walls, a chipped worktop, a loose handle, a cracked tile. Say which items you think are down to you and which you think are normal wear and tear. We ask this now so our maintenance team can be ready with the right materials the day after you leave, and so that anything that does affect your deposit is agreed with you now rather than argued about later. Normal wear and tear is never charged.

3. **Viewings.** We will start looking for the next tenant straight away. Please tell us which days and times suit you for viewings over the next few weeks. We will always give you at least 24 hours' notice in writing before anyone visits, and we will keep visits short.

4. **Leave the property clean and tidy.** The checklist is below. A property left as it is described there gets the full deposit back without delay; cleaning we have to arrange is charged at cost.

**Moving-out checklist**

Kitchen: fridge and freezer emptied, defrosted, wiped clean and switched off with the doors left open; oven, hob, grill and extractor hood cleaned inside and out; all cupboards and drawers emptied and wiped; sink, taps and worktops clean; washing machine drawer and filter clean; bins emptied and washed.
Bathroom: bath, shower, screen, tiles, sink and toilet clean and free of limescale and mould; plugholes clear; extractor fan clean.
Every room: floors hoovered and mopped; carpets free of stains; walls free of marks, Blu Tack and picture hooks (fill and touch up any holes you made); skirting boards, doors and light switches wiped; windows cleaned inside, sills wiped; light bulbs all working; curtains and blinds in place and clean; furniture that came with the property put back where it was; nothing of yours left behind, including in lofts, sheds and cupboards.
Outside, if you have it: garden tidy, grass cut, bins emptied and left in their place.
Safety: smoke and carbon monoxide alarms in place and working; nothing left that could be a hazard.
Keys: every set you were given, including fobs, post-box, window and meter-cupboard keys, [number] sets in total, returned as we agree nearer the time. Missing keys mean a lock change at your cost.
Admin: give us your forwarding address; redirect your post; tell your broadband and TV provider; tell the council you have moved (we tell the council and the energy and water companies the closing readings and the date).

**Your deposit**

Your deposit of £[deposit] is protected with [scheme], reference [number]. After you leave we compare the property with the check-in inventory. If we propose any deductions we will send you each item, the amount and the reason in writing within five working days of your move-out, with photos. Once the amount is agreed the deposit is returned within ten days. If we cannot agree, the disputed part goes to [scheme]'s free dispute service and they decide.

If you have any questions, reply to this email or call [name] on [office number].

Kind regards,
[Name]
Property Sauce

### T1s: Notice accepted, date to confirm

Same as T1, with the second paragraph replaced by:

We accept your notice. Under your tenancy agreement and the Renters' Rights Act 2025 a tenant's notice has to give at least [two months / the period in the agreement] and end on [the last day of a rent period], so the earliest date it can take effect is **[earliest valid date]**, and rent is due up to that date. You have asked to leave on [requested date]. We will tell you within two working days whether we can agree to release you on that earlier date; if we can, we will confirm it in writing and rent will stop on that day instead.

### T2: Arrears paragraph (into T1) and the statement covering note

Your account is currently £[arrears] behind, made up of [months and amounts]. A statement of account from our accounts system is attached. This balance must be cleared before you leave, on top of the rent due for your remaining time. Your deposit is not rent and cannot be used as your last month's payment. If you want to talk about how to clear it, reply to this email or call [name] on [office number] and we will agree a plan with you.

### T3: Slack register post

See section 5, step 5. Posted by the routine to #vacant-properties; updates in the thread.

### T4: Contractor warning (Slack area channel, or text for Rocky until he is on Slack)

See section 5, step 7.

### T5: Seven days to go

Subject: [address]: seven days to go

Dear [first name],

A week today you are due to leave [address] on [end date]. A reminder of what happens that day:

- Photograph each meter and email us the photos and the typed readings on the day. [Ali/Rocky] will read them again the following morning; the two should match.
- Leave all [number] sets of keys [where agreed: with Ali/Rocky at the handover at [time], or through the office letterbox at [address]]. Tell us if a key is missing so we can plan.
- Send us your forwarding address for the deposit and any post.
- The cleaning checklist is attached again. Cleaning we have to arrange is charged at cost; everything else on the list is free.
- Your final rent payment of £[amount] on [date] covers you to [end date]; cancel the standing order after that.
- Your deposit: any proposed deductions in writing within five working days of your move-out, return within ten days of agreement.

Thank you for looking after the property. Reply to this email or call [name] on [office number] with anything at all.

Kind regards,
[Name]
Property Sauce

### T6: Landlord notified of move-out (from the Landlord record, third-party landlords)

Subject: [address]: tenant moved out [date]

Dear [landlord first name],

[Tenant name] left [address] on [actual date]. Closing meter readings: electricity [x], gas [x], water [x], photographed and on file. Keys returned: [n] of [n]. Condition: [one or two sentences from the day-one visit, with the photo folder link]. Works planned: [list], starting [date], expected to finish [date], at [cost / covered by the management fee]. Marketing: [ad live since / enquiries / viewings booked], expected re-let [date]. Deposit: [no deductions proposed / deductions of £x proposed to the tenant on [date]]. The council and the utility companies have been told the property is empty from [date]; bills during the void are addressed to [you / the office] until the next tenant moves in.

I will update you when the works are done and when a tenant is agreed.

Kind regards,
[Name]
Property Sauce

### T7: Deposit proposal

Subject: Your deposit for [address]

Dear [first name],

Thank you for leaving [address] on [actual date]. We have compared the property with the check-in inventory of [date] and the photos taken on [date].

[Either] There are no deductions to propose. Your full deposit of £[deposit] will be released to you through [scheme]; you will receive their email asking you to confirm your bank details, and the money reaches you within ten days of that.

[Or] We propose the following deductions:

| Item | Amount | Why | Evidence |
|---|---|---|---|
| [e.g. Repaint bedroom wall, marks and filled holes] | £[x] | [Beyond wear and tear; you told us on [date] this was yours] | [Check-in photo 12, checkout photo 4] |

Total proposed deductions £[x]; deposit to be returned to you £[y]. Normal wear and tear has not been charged. If you agree, reply "agreed" and we will release £[y] through [scheme] within ten days. If you disagree with any item, tell us which and why within ten days; the part you agree is released straight away and the rest goes to [scheme]'s free dispute service, where an independent adjudicator decides from the inventory, photos and correspondence.

Kind regards,
[Name]
Property Sauce
