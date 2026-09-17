# Ops 05: Maintenance jobs

Scope: a reported fault from ticket to closed ticket, including booking the in-house maintenance team efficiently, before-and-after photos, tenant sign-off, the closing report, and the routine property inspections by Vera, Rocky, Ali and Dave.

Status: dictated by Damian on 17 September 2026 and written up by the Ops 5 chat. Sections 4, 7 and 10 hold the points still to confirm. Intake (how a tenant reports and is verified) is Ops 03; quotes, landlord approval and invoices are Ops 06.

## 1. What this operation covers

A tenant reports a fault through the website assistant ("Report a repair"), with photos. Zoho CRM creates a Maintenance ticket. Claude reads the photos, tries to talk the tenant through a self-fix where that is safe, and otherwise books an inspection or repair with the person who covers that area. Booking is done to suit the tenant inside Monday to Friday, 9 to 5, and to suit the contractor by grouping jobs in the same building or the same part of London on the same day. The booking is confirmed to the tenant by email, put in the contractor's diary and the office diary, and posted to Slack. When the job is done the contractor confirms it through the assistant and uploads before-and-after photos. The tenant confirms in writing that the job is done to their satisfaction. Only then is the ticket closed, the photos are kept for good, and, where we performed well, a chronological report on letterhead goes to the tenant. Routine inspections of every tenanted property run on the same booking machinery.

## 2. How it is done today

Damian's account, 17 September 2026:

- Reports come in by phone, email, WhatsApp and Slack as well as the website. Tickets are raised by hand in Zoho by Ezad or Usman, and not every job has a ticket. Damian has asked (15 September) that every Catterick House and Lancaster House job is posted in its Slack channel with the CRM ticket number so Claude can match them.
- Area channels were created on 15 September: #london-maintenance, #catterick-maintenance, #maintenance-lancester-house, plus #maintenance-invoices and #maintenance (empty so far). Jobs are described in a line ("Flat 5, Bedford place need to change shower mixer") with no ticket number and no dates.
- Booking is ad hoc. The same contractor can be sent to one building at 9 am and again at 4 pm. In London the flats are far apart, so bad grouping wastes hours and fuel. Damian wants all outstanding London jobs booked before Rocky goes to Pakistan.
- Photos before and after are not collected consistently. There is no fixed home for them. A "Maintenance Pictures" folder exists in Drive but is not in routine use.
- Tenants are not always asked to confirm in writing that a job is finished, so tickets stay open or get closed on the contractor's word.
- Inspections are not on a schedule.
- What goes wrong: jobs without tickets, tickets without photos, double trips, tenants not told when someone is coming, no written sign-off, and no record of what was done for the landlord.

## 3. Systems and records touched

**Zoho CRM, Maintenance module** (one record per job). Fields used, in the order they are filled:

| Stage | Fields |
|---|---|
| Reported | `Name` ("<address>: <fault>"), `Maintenance_Issue` (tenant's words, 255 chars), `Maintenance_Issue1` (category picklist), `Tenant`, `Landlord` (the property), `Tenants_Phone`, `Job_Status` = Reported, `Maintenance_Issue_Logged`, `Image_Upload_1`, `Image_Upload_2`, note "Tenant's report from the website assistant", attachments (the tenant's photos) |
| Triage | `Staff_Member`, note "Triage: self-fix attempted / inspection needed / emergency", `Contractor1` (Team lookup: Rocky, Ali, Dave, Sky or a third party), `Access_Via_Keys` |
| Booking | `Tenant_Preferred_Date_Time`, `Contractor_Preferred_Date_Time`, `Agreed_Date_Time`, `Appointment_Status` (Not Yet Proposed, Slot Proposed to Tenant, Tenant Confirmed Slot, Itinerary Sent, Contractor On Track, Contractor Running Late), `Send_Confirmation_of_Booking`, `Job_Status` = Inspection Confirmed or Contractor Instructed |
| Attendance | `Attendance_1` to `Attendance_5` with `A1_Notes` to `A5_Notes` |
| Done | `Job_Status` = Contractor Confirmed Job Complete, `Contractors_Comments`, note with the Drive link to the before-and-after photos |
| Sign-off | `Request_Sign_Off_From_Tenant`, `Job_Status` = Requested Tenant to Sign Off, then Tenant Signed Off, `Date_Tenant_Signed_Off`, `Tenants_Star_Rating`, `Tenants_Comments`, `Date_Staff_Signed_Off` |

`Maintenance_Ticket_Number` is the autonumber every message quotes (currently in the 2600s). The invoice fields belong to Ops 06.

**Zoho CRM, Team module.** The contractor record for `Contractor1`. Ali Hassan exists (record 2406742000027550690, mobile on record). Sky Hayat exists. Rocky and Dave have no record yet (see section 10).

**Zoho CRM, Contacts (Tenant) and Accounts (Landlord = property).** Tenant email and mobile for the booking email and the sign-off request; property postcode for grouping; `Established Landlord` for who is told about a job.

**Website assistant.** `/my-tenancy` "Report a repair" (verified by tenancy reference and one-time code, up to two photos, raises the Zoho ticket). A new "I'm on the team" entry for contractors is a build item (section 5, step 9).

**Google Workspace (admin@propertysauce.co).** Drive folder "Maintenance Pictures" (ID 1aBuLh-Dig80w8YN9yg22GqaVB-8tjLWQ) with one subfolder per ticket: `<year>/<ticket number> <address>/before-1.jpg, after-1.jpg ...`. Google Calendar "Property Sauce Maintenance" (the office diary) with one event per booking, and each contractor invited so it lands in their own calendar. Reports on letterhead are saved in the same ticket folder.

**Slack.** #maintenance (C0BSQHS6P55) is the office overview: every booking and completion is posted there with the ticket number. Area channels for the contractor conversation: #london-maintenance (C0C21E4BH2Q), #catterick-maintenance (C0C1ZMSNUFK), #maintenance-lancester-house (C0C1T2RDPGV). Emergencies to #claude-urgent (C0BTPPZ3JJE) and the area urgent channel (#london-urgent C0BUVF090F9, #catterick-urgent C0C00FQ4EDA, #lancaster-house-urgent C0BVARB5N74). Contractors on Slack today: Ali Hassan (U0BUVS5KGDT), Vera Fernandas (U0C06KTJ28K). Rocky and Dave are not on Slack (section 10).

**Email.** Bookings, sign-off requests and reports go from contact@propertysauce.co (Resend, as the assistant does today). Replies land in the propertysauce mailbox.

## 4. Decision limits

Claude may, without asking anyone:

- Talk a tenant through a self-fix from the safe list in step 3, and no other.
- Book any inspection, and any repair to be done by the in-house team (Rocky, Ali, Dave, Sky), at any time inside Monday to Friday, 9 to 5.
- Move a booking to group jobs, as long as the tenant has agreed the new slot.
- Send the booking email, the calendar invite, the Slack posts, the sign-off request and the reminders.
- Close a ticket once the tenant has confirmed in writing.
- Send the closing report when the targets in section 7 were met.

Needs a person:

- Any job that needs a third-party contractor, a part or materials over £100, or in-house labour expected to exceed £150: Ezad or Usman pick the contractor and Ops 06 handles the quote and the landlord's approval. [Damian to confirm these figures and any per-landlord limit.]
- Any booking outside 9 to 5 or at a weekend: the tenant and the contractor must both agree, and Damian is told.
- A tenant who refuses access twice, or cannot be reached for five working days: Damian.
- A closing report where the targets were missed: not sent; Damian decides.
- Anything gas, anything electrical beyond resetting a tripped switch, any structural or roof issue, any damp or mould beyond condensation advice: never a self-fix, always an inspection.

## 5. The procedure, step by step

**Step 1. Ticket.** The tenant reports through the website assistant (Ops 03). The assistant asks for at least one photo and prefers two. It will not raise a routine ticket without a photo unless the fault cannot be photographed (no hot water, a smell, a noise), and it records why. Zoho creates the ticket; `Job_Status` = Reported. Reports arriving any other way (Slack, phone, email, WhatsApp) are entered into Zoho by whoever received them, with the photos, and the tenant is emailed the ticket number and told that the website is the route next time (step 2).

**Step 2. The protocol email.** On the first ticket a tenant raises by any route other than the website, and once at the start of this operation to every current tenant, send the one-page "How to report a repair" email: use the website, add photos, what counts as an emergency and who to ring, what happens next and how long each stage takes. The same text goes into the tenancy agreement pack (Ops 02, open question).

**Step 3. Triage, within one working hour of the ticket.** Claude reads the photos and the description and decides one of three:

- *Emergency* (no heating in cold weather, no water, a leak that cannot be contained, no electricity, a gas smell, an insecure door or window, sewage, a fire or CO alarm sounding): tell the tenant to ring the office or the emergency service now, post to #claude-urgent and the area urgent channel, and book the same day. Gas smells: National Gas 0800 111 999 first.
- *Self-fix*: only from this list, and only with the tenant's agreement: reset a tripped switch on the consumer unit; top up boiler pressure to between 1 and 1.5 bar; bleed a radiator; reset a thermostat or programmer; plunge a sink or shower trap; replace a smoke-alarm battery; ventilate and wipe condensation on windows; check the stopcock; check the fuse in a plug; check the pre-payment meter has credit. Claude sends the steps over the chat, waits for the tenant's reply, and if it is fixed asks for a photo and the tenant's written confirmation, then closes (step 12). If it is not fixed within that conversation, book an inspection. Never more than one attempt.
- *Inspection or repair*: everything else. Go to step 4.

Write the triage outcome as a note on the ticket and set `Staff_Member` to the person overseeing it.

**Step 4. Who attends.** By the property's area:

| Area | Repairs | Inspections |
|---|---|---|
| London | Rocky | Vera |
| Catterick House, Rotherham | Ali | Ali |
| Lancaster House, Cramlington | Dave | Dave |
| Saffron Walden | Sky | Sky |
| Blackpool | Ali | Ali |

Set `Contractor1`. Third-party trades (gas, electrical, roofing) go through Ops 06.

**Step 5. Ask the tenant for times.** By email and, if they are still in the chat, in the chat: three slots that suit them, Monday to Friday, 9 to 5, in the next ten working days (three for urgent, ten for routine). Record the first choice in `Tenant_Preferred_Date_Time`. Set `Appointment_Status` = Not Yet Proposed. Give the 24 hours' written notice of access that section 11(6) of the Landlord and Tenant Act 1985 and the tenancy agreement require: the booking email in step 8 is that notice, so it must go at least one clear working day before the visit.

**Step 6. Ask the contractor.** Read their calendar first. Post in the area channel: "Ticket 2641, Flat 5 Bedford Place, shower mixer, tenant can do Tue 10 to 12, Wed 2 to 4, Thu 9 to 11. Which suits?" One message per job, or one message listing several jobs in the same building.

**Step 7. Group the jobs.** Before proposing a slot, look at every open ticket for the same contractor:

- Same building (Catterick House, Lancaster House, a London block): book them back to back, one hour apart, on one day.
- London: group by distance. Look up each property's postcode (postcodes.io gives latitude and longitude with no key) and put jobs within three miles of each other on the same morning or afternoon, nearest first. A Google Maps connector, if added, replaces this with driving times.
- Never book the same contractor to the same building twice in one day, and never send them across London for one job when another job in the same area is waiting and could be brought forward.

Propose the grouped slot to each tenant; if a tenant's slots do not fit the group, ask for one more option before booking them alone.

**Step 8. Confirm.** Once tenant and contractor both agree:

- Zoho: `Agreed_Date_Time`, `Appointment_Status` = Tenant Confirmed Slot, `Job_Status` = Inspection Confirmed (an inspection) or Contractor Instructed (a repair), `Send_Confirmation_of_Booking`.
- Email the tenant: ticket number, who is coming, date and one-hour window, what they will do, that this is the notice of access, and how to change it.
- Calendar: one event in "Property Sauce Maintenance" titled "Ticket 2641, Flat 5 Bedford Place, shower mixer (Rocky)", with the tenant's phone and the ticket link in the description, and the contractor invited.
- Slack: one line in #maintenance and in the area channel: "Booked: ticket 2641, Flat 5 Bedford Place, shower mixer, Rocky, Tue 23 Sep 10:00."
- Set `Appointment_Status` = Itinerary Sent.

The day before, remind the tenant by email and the contractor in the area channel. If the contractor says they are running late, set `Appointment_Status` = Contractor Running Late and tell the tenant.

**Step 9. The contractor closes the visit.** The website assistant gets a third entry, "I'm on the team", for contractors and staff. It asks for the ticket number, or the address if they do not have it, shows the matching open tickets, and then asks three things: is the job complete, yes or no; before photos; after photos. Before photos may be the tenant's if the contractor forgot to take their own; after photos are mandatory. It writes `Attendance_n` and `An_Notes`, and if complete sets `Job_Status` = Contractor Confirmed Job Complete and copies the notes to `Contractors_Comments`. If the job is not complete (a part is needed, a second visit), it records why and the ticket goes back to step 5 for the next visit.

**Step 10. Store the photos.** Every photo (tenant's and contractor's) is resized to a longest side of 1600 pixels at JPEG quality 80 (about 200 to 400 KB each) and saved to Drive under "Maintenance Pictures/<year>/<ticket number> <address>/", named `before-1.jpg`, `after-1.jpg` and so on. The Drive folder link goes on the ticket as a note. Drive is the permanent store because it is cheap and not tied to Zoho; the two `Image_Upload` fields on the ticket hold one before and one after as a quick view only.

**Step 11. Ask the tenant to sign off.** The same day the contractor confirms completion: `Job_Status` = Requested Tenant to Sign Off, `Request_Sign_Off_From_Tenant`. Email the tenant: "Rocky has told us the shower mixer at Flat 5 was replaced today. Please reply to confirm it is done to your satisfaction and we will close ticket 2641. If it is not, tell us what is wrong." Chase after two working days and again after five. After ten working days with no reply, close with a note "Closed without tenant reply after two reminders" and tell Damian; do not treat that as a satisfied tenant.

**Step 12. Close.** On the tenant's written yes: `Job_Status` = Tenant Signed Off, `Date_Tenant_Signed_Off`, `Tenants_Star_Rating` and `Tenants_Comments` if given, `Date_Staff_Signed_Off`. Post "Closed: ticket 2641, Flat 5 Bedford Place, shower mixer, tenant signed off" in #maintenance. The photos stay in Drive for the life of the property. Invoice matching continues in Ops 06.

**Step 13. The closing report.** If every target in section 7 was met, produce a one-page PDF on the Property Sauce letterhead: the property, the ticket number, and a dated line for each event (reported, triaged, booked, attended, completed, signed off), the before-and-after photos, and who did the work. Email it to the tenant "for your records" and save it in the ticket's Drive folder. If any target was missed, do not send it; put the draft in the folder and tell Damian in the daily summary.

**Step 14. Routine inspections.** Every tenanted property is inspected on a cycle: Catterick House and Lancaster House every three months; London every six months to start, reviewed after the first round. Saffron Walden and Blackpool every six months. Each inspection is a Maintenance ticket named "Inspection: <address>" with `Maintenance_Issue1` = Routine Inspection (picklist value to add) and `Contractor1` = the inspector from step 4. They are booked through steps 5 to 8, in blocks: Ali and Dave are on site daily, so any day works and they do a floor at a time; Vera's London round is grouped by distance so one day covers the flats in one area. The inspector uses the "I'm on the team" entry to record: smoke and CO alarms tested, signs of damp or mould, condition of each room with a photo, any repair needed, meter readings, and whether the tenant raised anything. Each repair found becomes its own ticket at step 1 with the inspection photos attached. The tenant gets the 24 hours' notice email and a copy of the findings.

**Legal basis Claude works to.** Section 11 of the Landlord and Tenant Act 1985 (repairs within a reasonable time, access on 24 hours' written notice at a reasonable time); the Homes (Fitness for Human Habitation) Act 2018; the Housing Health and Safety Rating System hazards. The Renters' Rights Act 2025 extends Awaab's Law and the Decent Homes Standard to private tenancies by regulations whose commencement date is still to be confirmed; until then Claude uses the social-housing Awaab's Law timescales as the internal standard for damp, mould and other significant hazards: investigate within ten working days, written findings to the tenant within three working days of the investigation, make safe within five working days if a significant hazard, and emergencies within 24 hours.

## 6. Escalation

- Emergency at triage: #claude-urgent and the area urgent channel immediately, and the tenant told to ring.
- No contractor reply in the area channel within one working day (urgent: two hours): message Ezad, then Damian.
- No tenant reply to a request for times within two working days: second email and a text; after five working days: Damian.
- Tenant refuses access twice: Damian.
- A safety finding at any visit (gas, electrical, structural, fire): #claude-urgent the same hour and Ops 07 if a certificate is involved.
- A job still open ten working days after the contractor confirmed completion: Damian in the daily summary.
- A dispute about whether the job is done: Damian, with the photos.

## 7. Done when

A ticket is done when `Job_Status` = Tenant Signed Off with a dated written confirmation from the tenant, before-and-after photos in the ticket's Drive folder, and the Drive link on the ticket. Targets, measured on every ticket:

| Stage | Target |
|---|---|
| Triage from report | 1 working hour |
| Tenant asked for times | same working day |
| Booking confirmed to tenant (routine) | 3 working days from report |
| Booking confirmed to tenant (urgent) | 1 working day from report |
| Visit takes place (routine) | 10 working days from report |
| Visit takes place (urgent) | 3 working days from report |
| Sign-off requested | same day the contractor confirms |
| Inspections | every property on its cycle, none more than 30 days overdue |

The closing report is sent only when all of these were met.

## 8. Cowork routine

**Maintenance sweep**, weekdays every hour 8:00 to 18:00, Europe/London.

Prompt: "Read docs/ops/05-maintenance-jobs.md and run one sweep. (1) New tickets with Job_Status Reported and no triage note: triage per step 3, write the note, set Contractor1 and, unless an emergency or self-fix, email the tenant for times (step 5) and post in the area channel (step 6). (2) Tickets with tenant times but no Agreed_Date_Time: group per step 7 and propose a slot. (3) Tickets where both sides have agreed: confirm per step 8 (Zoho, email, calendar, Slack). (4) Visits tomorrow: send reminders. (5) Tickets at Contractor Confirmed Job Complete without a sign-off request: send it. (6) Sign-off requests older than 2 and 5 working days: chase. (7) Tenant replies confirming completion: close per step 12 and, if the targets in section 7 were met, produce and send the report per step 13. (8) Anything that hits section 6: escalate. Post a one-paragraph summary of what you did to #maintenance. Never move a ticket to Tenant Signed Off without a written confirmation from the tenant."

**Inspection planner**, Mondays 8:30.

Prompt: "Read docs/ops/05-maintenance-jobs.md step 14. List tenanted properties whose last inspection is more than a cycle ago or has never happened. Create the inspection tickets, group them by inspector and area, and start the booking for the next two weeks. Post the plan to #maintenance."

Both routines report to #maintenance; emergencies to #claude-urgent.

## 9. Test plan

Week 1: Catterick House only, with Ali. The test tenant record (Flat 3, ticket 2636 "kitchen mixer tap dripping") is used first, then every real Catterick House ticket. The sweep runs in propose-only mode: every email, Slack post and Zoho change is written to #maintenance as a draft for Damian or Ezad to approve, and nothing is sent to a tenant until approved. Damian reviews at the end of the week.

Week 2: the sweep sends for Catterick House without approval; Lancaster House joins with Dave in propose-only mode.

Week 3: London joins with Rocky and Vera in propose-only mode, including the first grouped round of inspections.

Week 4: everything live. Reports (step 13) stay in propose-only mode for a further month.

## 10. Open questions

- Rocky and Dave: full names, mobile numbers, email addresses and whether they will use Slack and Google Calendar. Neither has a Team record in Zoho or a Slack account, so they cannot be booked or messaged automatically yet.
- Authority limits in section 4: in-house labour £150 and materials £100 without asking. Confirm or change, and say whether any landlord has a different limit.
- Photos: Drive as the permanent store with only a quick-view copy on the Zoho ticket. Confirm.
- Should the "How to report a repair" text go into the tenancy agreement (Ops 02) as a clause, or only as the welcome email?
- London inspections every six months and the other areas every three: confirm, and confirm Saffron Walden and Blackpool at six.
- Out-of-hours emergencies: who takes the call today, and does Rocky, Ali or Dave attend out of hours?
- Google Maps: add a connector for driving times, or accept straight-line grouping by postcode for now?
- Awaab's Law and the Decent Homes Standard for private tenancies: watch for the commencement regulations and update the timescales in step 5 when they land.

## Build list

For this chat (Zoho, Drive, Calendar, Slack):

1. Google Calendar "Property Sauce Maintenance" on admin@propertysauce.co, shared with each contractor. Done 17 September 2026.
2. Zoho: add "Routine Inspection" to the `Maintenance_Issue1` picklist; create Team records for Rocky and Dave once section 10 is answered.
3. Drive: year folder under "Maintenance Pictures" and the ticket-folder naming.
4. The "How to report a repair" email and the closing-report letterhead template.
5. The two Cowork routines in section 8, starting in propose-only mode.

For the website chat (the assistant):

6. Require at least one photo before raising a routine ticket, with the no-photo reasons allowed.
7. The "I'm on the team" entry: ticket lookup by number or address, complete yes or no, before and after photos, notes; writes to the ticket and to Drive with the resize in step 10.
8. Tenant sign-off from the chat as well as by email reply.
