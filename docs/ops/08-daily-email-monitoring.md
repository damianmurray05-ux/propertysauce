# Ops 08: Email monitoring, every mailbox, every 15 minutes

Scope: every Property Sauce mailbox read every 15 minutes around the clock; every email answered by Claude where the answer is known or the thread belongs to a workflow Claude runs (Ops 01 to 07); every ongoing situation tracked to its end; anything urgent pushed to the team the same quarter hour by Slack, text and phone, day or night.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 8 chat. Sections 4 and 6 are his instructions and are procedure. Section 10 holds the points still to settle. Luxe Stay and Damian's personal mailbox are out of scope; they get their own operation under their own group.

## 1. What this operation covers

Claude is a member of the Property Sauce team who sits on the mailboxes. Every 15 minutes it reads everything new in every Property Sauce mailbox, works out who is writing and what they need, and does one of four things: answers it, carries it into the workflow it belongs to (a viewing, a repair, a rent question, a certificate), files it as noise, or raises it as urgent. A conversation Claude starts, Claude finishes: an OpenRent applicant is taken from first enquiry through viewing, application, referencing and payment, and only handed to a colleague for the final sign-off; a repair is taken from the tenant's report through the back-and-forth with tenant and contractor to a confirmed date. Anything urgent, at any hour, goes to the area's urgent Slack channel with an alert, and in the most serious cases Claude texts and phones the person who covers that area until someone answers. Every contact is logged.

## 2. How it is done today

Damian's account, 19 September 2026, and what this chat found in the mailboxes the same day.

**Damian's instructions.**

- Every mailbox monitored, at intervals as close together as possible. One hour is too long.
- Claude should be answering a large percentage of emails itself, especially standard responses, and should see itself as a team member who helps everyone else: if an email needs an answer Claude knows, Claude sends it.
- Emails in the workflow of the other operations (maintenance, rent, new lets) are Claude's first course of action, not something to wait on. An OpenRent applicant is dealt with by Claude until references are complete, payment is taken and the file is ready for final sign-off, then handed to a colleague. A maintenance job is run by Claude through the tenant and contractor back-and-forth to the confirmed date.
- Property Sauce mail is admin@propertysauce.co and its variations, and potentially Sure Lets. Never reply from Sure Lets as if you are Property Sauce, and never from Property Sauce as if you are Sure Lets.
- Urgent emails: notify the team immediately, even out of hours. Semi-urgent: post in an Urgent Slack channel. One Urgent channel per area (London, Saffron Walden, Catterick House, Lancaster House), with Damian, Usman, Muzammel, Hassan and Umar in every channel; Ali only in Catterick House and Lancaster House; Dave only in Lancaster House; Scander (Sky) Hayat only in Saffron Walden; Rocky only in London. The channel settings must make these posts stand out above all other messages.
- Very urgent (the example was a tenant locked out at Catterick House): post in the Slack channel, then text Ali and phone Ali, and tell him the situation when he answers. Saffron Walden, which is mostly Airbnb guests, goes the same way to Scander Hayat. All of these contacts are logged by Claude. This needs the Inkbox numbers set up first.

**What the mailboxes showed on 19 September 2026.**

- admin@propertysauce.co is the working mailbox. It takes mail addressed to admin@, info@ (Usman's address in Zoho), Lettings@ (the address on the OpenRent account 3944818), invoices@ (Zoho Books rent invoices) and enquiries@ (the "PS Admin Enquires" Zoho user). About 300 messages arrived in the last seven days; about 50 went out.
- Two hands already answer from admin@: Umar, signing his own name, and a Claude routine that has run hourly since about 15 September, signing "Claude (for Damian)". The routine replies to tenants and contractors, emails Umar's personal Gmail with a brief most hours, and posts the same brief to Slack from Damian's account. It works well on the threads it holds (Flat 40 Lancaster House leak and kitchen light; Flat 42 let to Ben Richardson; Andras Banhazi's Flat 14 application) but it was built with limits Damian has now removed: it would not answer applicants, would not answer a tenant's deposit question, and emailed Umar rather than acting.
- The same thread is sometimes answered by both. On 19 September Umar replied to Sarah Barker's Flat 16 application at 10:56 with the document list, and further replies went from the same mailbox at 11:31, 11:34 and 11:52. Nothing tells the two hands apart to the tenant.
- OpenRent applicants cannot be answered by email at all. OpenRent's relay only accepts replies from the address on the account, Lettings@propertysauce.co, and admin@ has no "send mail as" identity for it. As of 19 September that had blocked replies to applicants for nineteen days; three viewing requests on Flat 42 alone in twelve hours went unanswered, on a flat that had already been let and whose advert was still live.
- admin@surelets.co.uk (Microsoft 365) is signed in as Muzammel, Accounts Manager. It receives Property Sauce tenant mail too (electric top-up codes for Lancaster House, a Waltham Forest housing enforcement letter about Flat 1, 474 Lea Bridge Road, mydeposits certificates for Lancaster House tenancies, Metastreet licence reminders). About 300 messages in the inbox. Anything sent from it goes out in Muzammel's name for Sure Lets.
- What goes wrong today: applicants left unanswered; adverts left live on let flats; two people answering one thread; briefs emailed to a personal Gmail where nobody sees them out of hours; an hourly brief even when nothing has changed; urgent items posted to Slack with no alert and no call; no single record of who was contacted about what.

## 3. Systems and records touched

**Mailboxes.** Verified 19 September 2026. Re-verify before relying on it.

| Mailbox | Connector | Read | Send as | Use |
|---|---|---|---|---|
| admin@propertysauce.co, with info@, Lettings@, invoices@, enquiries@ landing in it | `gws-propertysauce` | yes | admin@ only; Lettings@ needs the send-as identity in section 10 | All Property Sauce replies |
| contact@propertysauce.co | Resend, from the website | replies land in admin@ | website assistant only | Booking emails and sign-off requests from Ops 05 |
| admin@surelets.co.uk | Microsoft 365 `690c1b34-…` | yes | yes, as Muzammel, Sure Lets | Read for Property Sauce matters; reply from admin@propertysauce.co, never from here as Property Sauce |
| contact@surelets.co.uk, contact@marchbankvale.co.uk | Google, not consented | no | no | Out of scope until Damian completes the OAuth |
| contact@luxestay.co.uk, damian.murray05@gmail.com | own connectors | | | Out of scope for this operation |

**Gmail labels on admin@** (created by this chat, 19 September 2026): `Claude/Watching` (an open thread Claude is running), `Claude/Handled` (answered or filed this sweep), `Claude/Urgent` (raised to a Slack urgent channel), `Claude/Team` (a colleague has replied; Claude is standing back). A message with none of these labels and no reply is one the sweep has not seen.

**Slack.** Workspace user IDs: Damian U0BTYN58QN4, Usman Tufail U0BTP2664E8, Muzammel Aslam U0BUDRE67G8, Hassan Sohail U0BTAQGKGNP, Umar Farooq U0BTFG2U50V, Ali Hassan U0BUVS5KGDT, Dave (David Newey) U0BUNS8TWER, Vera Fernandas U0C06KTJ28K. Rocky and Scander (Sky) Hayat have no Slack account.

| Area | Urgent channel | Members required | Members on 19 Sep 2026 |
|---|---|---|---|
| London | #london-urgent C0BUVF090F9 | Damian, Usman, Muzammel, Hassan, Umar, Rocky | Damian, Usman (added 19 Sep), Muzammel, Hassan, Umar, Ali. Ali is not on Damian's list for London; Rocky has no account |
| Saffron Walden | #saffron-walden-urgent C0C305M6GJ2 (created 19 Sep 2026) | Damian, Usman, Muzammel, Hassan, Umar, Scander | Damian, Usman, Muzammel, Hassan, Umar (all added 19 Sep); Scander has no account |
| Catterick House | #catterick-urgent C0C00FQ4EDA | Damian, Usman, Muzammel, Hassan, Umar, Ali | Damian, Usman (added 19 Sep), Muzammel, Hassan, Umar, Ali, Dave. Dave is not on Damian's list for Catterick |
| Lancaster House | #lancaster-house-urgent C0BVARB5N74 | Damian, Usman, Muzammel, Hassan, Umar, Ali, Dave | Damian, Usman (added 19 Sep), Muzammel, Hassan, Umar, Ali, Dave. Complete |
| Everything | #claude-urgent C0BTPPZ3JJE | the office | Damian, Usman, Muzammel, Hassan, Umar |

Every urgent post opens with `@channel`, which is the only thing Slack lets a sender do to force a notification to every member regardless of their own settings. Channel notification level is a per-person setting that no admin can set for them, so each member sets the four channels to "All new messages" with mobile alerts always on; the instruction is posted in each channel and repeated in the daily digest until everyone has confirmed.

Daily summaries go to #claude-help C0BTKRMHG6N; maintenance threads also to #maintenance C0BSQHS6P55 and the area maintenance channels as Ops 05 says; viewings to #viewings-london C0BT5J520BZ, #viewings-catterick-house C0BTGRV1RRB, #viewings-lancaster-house C0BTNSQEPL1; rent to #accounts-rent C0BSZMD5REF; certificates to #certificates-compliance C0BT7S3N481.

**Phones.** Who is called and texted per area, with the record that holds the number. Numbers are read from Zoho at the time of the call, not copied here.

| Area | First call | Second call | Then |
|---|---|---|---|
| London | Rocky (no Zoho record yet, section 10) | Vera (Zoho user) | Damian |
| Saffron Walden | Sky (Scander) Hayat, Team record 2406742000082271001 | Damian | |
| Catterick House and Blackpool | Ali Hassan, Team record 2406742000027550690 | Damian | |
| Lancaster House | Dave Newey, Team record 2406742000023445248 | Ali Hassan | Damian |

Text and voice go through Inkbox once a Property Sauce number exists. Today the only Inkbox identity is Luxe Stay on a US number (+1 570 433 9974), which must not be used for Property Sauce. The Zoho CRM Twilio extension is the alternative for text. Until one of them is live, the urgent step is Slack with `@channel` plus a direct message to the on-call person, and the daily digest says every time a call could not be made.

**Zoho CRM.** Every email that concerns a tenant, applicant, landlord or job is written as a note on the record it concerns: Tenant (Contacts), Landlord (Accounts, one per property), Maintenance ticket, or the applicant record Ops 01 and 03 settle. Anything a tenant may later rely on is sent from the record with Send Mail. Contractor numbers live on Team records.

**Other operations' files.** This operation does not repeat their procedures; it starts them and carries the conversation. Viewings, applications and referencing: Ops 01 and 02 (still templates; until they are written, the applicant steps in section 5 apply). Tenant questions: Ops 03. Rent: Ops 04. Repairs: Ops 05. Contractor invoices: Ops 06. Certificates: Ops 07.

## 4. Decision limits

Damian's instructions, 19 September 2026, are the limits. Claude may, without asking anyone:

- Reply to any email where the answer is on the record, in a procedure file, in the tenancy agreement, in the How to Rent guide, or in the thread itself. Standard responses are Claude's job.
- Run an OpenRent or website applicant from first enquiry to the point of final sign-off: answer questions about the property, offer and confirm viewing slots from the area's viewing diary, send the application document list, chase documents, start referencing, confirm the holding deposit has arrived (from the Zoho Books bank feed, never from the applicant's word), and prepare the file. The hand-over to a colleague is for the final sign-off only.
- Run a maintenance report through the tenant and contractor back-and-forth to a confirmed date, within the Ops 05 limits (in-house team, Monday to Friday 9 to 5, materials under £100, labour under £150, no gas or mains electrical work).
- Send the rent reminders in the Ops 04 timetable and answer "how much, when, what reference" from the record.
- Send certificate copies and standard documents to a verified tenant.
- Tell a contractor what a tenant has said and a tenant what a contractor has said.
- File notifications, receipts and newsletters without a reply, and mark spam as spam.
- Post to any Slack channel, text and phone the on-call person in an urgent case, and email or message any team member.

Needs a person, always:

- Choosing between applicants, accepting a pet, agreeing a rent below the advertised figure, or any change to tenancy terms: the landlord through the office. Claude collects the facts and puts them in one message.
- Any money out, any deposit return amount or date, any refund, any fee waived.
- Any notice, any legal position, any complaint about staff, anything from a council enforcement officer, a solicitor, a court, the Property Redress Scheme or the ICO: acknowledged the same sweep, then #claude-urgent and Damian.
- A third-party contractor, a quote, a landlord approval: Ops 06.
- Anything Claude cannot answer with confidence: acknowledge, say when they will hear, and put it to the office in the area channel.

Identity, absolute:

- Property Sauce mail is answered from admin@propertysauce.co (or Lettings@ once the identity exists) and signed for Property Sauce. Sure Lets mail is answered from admin@surelets.co.uk in Muzammel's name for Sure Lets. Never one as the other. A Property Sauce matter that arrives in the Sure Lets mailbox is answered from admin@propertysauce.co with the original quoted. Before any send, the sender address is read back and confirmed, and the daily digest names the sending address for every message sent.

Two hands on one thread:

- If a colleague has replied on a thread, Claude adds the `Claude/Team` label and does not reply on that thread. Claude keeps reading it. If the sender's next message then goes unanswered for two working hours (30 minutes if urgent), Claude answers it and says in the daily digest that it did.
- If Claude started the thread or has been running it, Claude finishes it. A colleague who wants it says so in the thread or in Slack.

## 5. The procedure, step by step

**Step 1. Sweep, every 15 minutes, 24 hours a day.** In admin@propertysauce.co: every message received since the last sweep, plus every thread labelled `Claude/Watching` with a new message. In admin@surelets.co.uk: every unread message in the inbox. Read the whole thread before deciding anything, and read the Zoho record of the person it concerns.

**Step 2. Who is writing.** Match the sender to a Tenant, applicant, Landlord, Team or supplier record by email, then by phone or name. Nobody unmatched is told anything about a tenancy; they are asked for the property address and the name on the agreement first. OpenRent relay addresses (`…@user.openrent.com`) identify the applicant by the advert and thread number in the subject.

**Step 3. Grade it.** One of four:

- *Urgent.* Someone locked out; no water; a leak that cannot be contained or water near electrics; no electricity to a flat (not a top-up); no heating or hot water with a child, an elderly or ill person, or in cold weather; a gas smell; an insecure door or window; sewage; a fire or CO alarm sounding; a tenant or guest reporting a break-in, violence or a threat; a council, court or solicitor deadline within five working days. Go to step 6 first, in the same sweep.
- *Semi-urgent.* Anything that cannot wait until the next working day but is not a danger: a contractor unable to attend a booked visit; a tenant refusing access; a viewing or move-in due today or tomorrow with something missing; an applicant about to pay or sign; a payment bounced; a licence or certificate reminder with a date inside 30 days; a guest arriving at Saffron Walden with a problem. Post in the area urgent channel with `@channel` in the same sweep, then deal with it.
- *Routine.* Everything with a question or a next step. Answer or advance it in the same sweep.
- *Noise.* Notifications, receipts, platform digests, marketing. Label `Claude/Handled`, no reply. Metastreet, mydeposits, HomeLet and Zoho Books notifications are noise unless they carry a date or a failure, in which case they are routine for Ops 07, 02 or 04.

**Step 4. Answer or advance it, this sweep.** By what it is:

- *Applicant (OpenRent, website, direct).* Reply from Lettings@ for OpenRent relay threads, admin@ otherwise. First reply: is the property still available (read the Landlord record and the current adverts; if let, say so and offer the block waiting list), the key facts (rent, deposit, council tax band, bills, furnished or not, EPC), and three viewing slots from the area's viewing channel and the on-site person's availability. Then, in order: confirm the viewing and post it in the area viewings channel; after the viewing, send the application document list and the holding deposit instruction (the amount and the account come from the Ops 02 template, never typed from memory); chase documents every two working days; when all documents are in, start referencing; when referencing passes and the holding deposit shows in the Zoho Books feed, put the file and a one-paragraph summary in the area viewings channel for a colleague's final sign-off. Advert still live on a let flat: post it in the viewings channel and tell Usman, who holds the OpenRent account, in the same sweep.
- *Tenant.* Ops 03 section 5: identify, read the record, answer from it. A repair: photos first, self-fix if safe, otherwise open the Maintenance ticket and run Ops 05 steps 3 to 8 through email and the area channel until the date is confirmed. A rent question: answer from the record; a promise to pay late: record it and hand to Ops 04; hardship or a dispute: office the same day. A certificate: send it from the record. A deposit question: acknowledge, tell them what happens next and when, and put the money question to the office; Claude does not state an amount or a date.
- *Contractor.* Reply with what they need to do the job: access, the tenant's times, the ticket number, the photo folder. A date offered: put it to the tenant the same sweep. A job reported done: Ops 05 step 11.
- *Landlord.* Answer from the Landlord record and the open tickets. Anything about money, sale or another tenant goes to Damian.
- *Council, court, solicitor, redress scheme, ICO, insurer.* Acknowledge receipt only, label `Claude/Urgent`, post to #claude-urgent with the deadline, and write the note on the property record. Nothing substantive is sent without Damian.
- *Supplier or platform with a question.* Answer if the answer is on file; otherwise the office.

Every reply says who, how and when, in plain English, and is signed "Claude, for the Property Sauce team" with the office number. Every reply is read back for the sending address before it goes.

**Step 5. Keep the thread.** Label the thread `Claude/Watching` and write one line on the Zoho record: date, channel, what they asked, what was done, what happens next and when. Set the next-action date. A thread with no reply from the other side by that date is chased: second email, then a text, then a call, then the office (Ops 03 section 6).

**Step 6. Urgent protocol.** In this order, all inside the sweep that found it:

1. Reply to the sender: what to do right now (gas: National Gas 0800 111 999 and leave the property; leak: the stopcock; electrics and water: switch off at the consumer unit; locked out: stay somewhere warm and safe, we are calling the on-site person now), and that someone is being contacted this minute.
2. Post to the area urgent channel and to #claude-urgent, opening with `@channel`: the address and flat, the person, the problem in one line, what the sender has been told, who is being called now, and what the team needs to do. Quote the ticket number if there is one; if not, open the ticket and quote it.
3. Text the first-call person for the area (section 3 table) with the same line, then phone them. If they answer, tell them the situation and what the tenant has been told, and ask for their arrival time. If no answer in 10 minutes, text and phone the second-call person, then Damian. Keep going until a person has accepted it.
4. Tell the sender who is coming and when, or that the on-call person has been reached and will call them.
5. Log every attempt: time, channel, person, answered or not, what was said, on the ticket and in the Slack thread.
6. Until Inkbox has a Property Sauce number, steps 3 and 4 become: Slack direct message to the on-call person as well as the channel post, and the daily digest records that no call was possible.

**Step 7. Semi-urgent.** Post to the area urgent channel with `@channel` and the same content as step 6 point 2, deal with it as far as the limits in section 4 allow, and put what is left for a person in one line at the end of the post.

**Step 8. Colleague on the thread.** A reply from Umar, Usman, Muzammel, Hassan, Damian or Vera on a thread: label `Claude/Team`, keep reading, stand back per section 4. Claude never sends a second answer to a message a colleague has already answered.

**Step 9. Sure Lets mailbox.** Read only. A Property Sauce matter found there (a tenant of a Property Sauce property, a licence for a Property Sauce property, a deposit certificate) is answered from admin@propertysauce.co with the original quoted, and the Sure Lets message is marked read. A Sure Lets matter is left for Muzammel, unless urgent, in which case #claude-urgent.

**Step 10. Daily digest, 08:00, to #claude-help.** Overnight and the day before: what came in by grade, what Claude answered (with the sending address of each), what it advanced, what is waiting on whom, every urgent case and every call attempt, every thread where Claude stood back for a colleague, and every applicant who could not be answered and why. Three lines at the top for Damian: what needs him today.

**Step 11. Nothing new.** If a sweep finds nothing new, it writes nothing anywhere. No hourly brief when nothing has changed.

## 6. Escalation

- Urgent: step 6, same sweep, day or night. Nobody reached in 30 minutes: Damian by phone as well as Slack.
- Semi-urgent unanswered in the area urgent channel for two working hours: repeat the post tagging the office members by name; after four, Damian.
- An applicant Claude cannot answer (no send-as identity, no route to them): the viewings channel and Usman the same sweep, and the daily digest until fixed.
- A colleague's reply that contradicts a procedure file or a promise Claude has made: Claude does not correct the colleague to the tenant; it posts the difference in the area channel and the digest.
- Sender identity cannot be verified for a send, or the only route is the wrong identity: do not send; say so in the digest.
- Anything from a council, court, solicitor, redress scheme or the ICO: #claude-urgent within the sweep and Damian.
- A mistake Claude made (wrong flat, wrong person, wrong figure): correct it to the recipient in the same sweep it is found, post it in #claude-mistakes C0C2A0ZP6H0, and say so in the digest.

## 7. Done when

Measured every day in the digest:

| Measure | Target |
|---|---|
| Time from arrival to triage, any mailbox, any hour | 15 minutes |
| Urgent: Slack post with `@channel` and first call attempt | within the same 15-minute sweep |
| Urgent: a named person has accepted it | 30 minutes |
| Routine email with a known answer | answered in the same sweep |
| Routine email needing a person | acknowledged in the same sweep, with a time they will hear by; person told the same sweep |
| Applicant first reply | same sweep |
| Applicant taken to final sign-off without a colleague touching the thread | 80 percent of applications |
| Emails answered by Claude rather than a person | rising each week; reported as a percentage |
| Threads with two hands replying | zero |
| Sends where the digest cannot name the sending address | zero |
| Sweeps with nothing new that produced a post | zero |

## 8. Cowork routine

**Email watch**, every 15 minutes, every day, Europe/London. This replaces the hourly routine running on admin@propertysauce.co since 15 September 2026; the two must not run together.

Prompt: "You are the Property Sauce team member on the mailboxes. Read ~/Projects/propertysauce/docs/ops/08-daily-email-monitoring.md and run one sweep: steps 1 to 9. Read every new message in admin@propertysauce.co (connector gws-propertysauce) since the last sweep and every Claude/Watching thread with a new message, and every unread message in admin@surelets.co.uk (Microsoft 365). Grade each per step 3. Urgent: step 6 in full, now, whatever the hour. Semi-urgent: step 7. Routine: answer or advance it now within section 4; applicants and repairs are yours to run to the hand-over point. Noise: label and move on. Never reply as Sure Lets for Property Sauce or as Property Sauce for Sure Lets; read the sender back before every send. Never send a second answer to a message a colleague has answered. Label every thread you touch. Write one line on the Zoho record for every person or job concerned. If nothing is new, post nothing. Keep your own state in the Gmail labels, not in memory."

**Daily digest**, 08:00 every day: step 10, posted to #claude-help C0BTKRMHG6N, three lines for Damian at the top.

Both run in the cloud, not on a Mac that may be asleep. If Cowork cannot run at 15 minutes, the fallback is a Claude Code scheduled task on `*/15 * * * *`, which runs only while the desktop app is open, and the digest reports every gap.

## 9. Test plan

Damian's instruction is speed, and the mailbox is already being answered by a Claude routine, so the test is live from day one with full reporting rather than a propose-only week.

Week 1 (from the day the routine is switched over): all mailboxes, all grades, all replies live. Every action in the daily digest with the sending address. On the first working day Damian sends a test "locked out at Catterick House" email from an outside address; the target is a Slack post with `@channel`, a text and a call to Ali inside 15 minutes, all logged. Applicants are answered from Lettings@ from the day the identity exists.

Week 2: Damian reviews the digests and the `Claude/Team` threads and tightens section 4 where a person was needed but not asked, or asked but not needed.

Week 3: the percentage of emails answered by Claude is reported weekly and the target in section 7 is set from the first two weeks.

## 10. Open questions

1. **The existing hourly routine.** A Claude routine has been replying from admin@ and posting to Slack from Damian's account since about 15 September. Which platform is it on (Cowork or a routine), and can Damian switch it off the day the 15-minute routine starts, so two do not run together?
2. **Lettings@ send-as.** OpenRent only accepts replies from Lettings@propertysauce.co. Fix, two minutes, only Damian or a Workspace admin can do it: in Gmail for admin@propertysauce.co, Settings, Accounts, "Send mail as", Add another email address, enter Lettings@propertysauce.co, untick "Treat as an alias" if asked, and confirm; because it is an alias on the same domain no verification code is needed. Until then every OpenRent applicant is unanswerable by email and is posted to the viewings channel for the person with the OpenRent login.
3. **Inkbox number for Property Sauce.** Text and voice in step 6 need a UK Inkbox number on a Property Sauce identity. The only identity today is Luxe Stay on a US number. Damian to add the identity and number; until then step 6 point 6 applies.
4. **Rocky.** No Zoho Team record, no Slack account, no number on file. Until Damian supplies his full name, mobile and email, London urgent calls go to Vera, then Damian.
5. **Slack membership.** The office five are now in all four area channels (done 19 Sep 2026 through Slack in the browser; the connector cannot invite). Two people are in channels Damian's list excludes: Ali in #london-urgent and Dave in #catterick-urgent. They were added by someone before this operation, so they have been left in place; Damian to say whether to remove them. Rocky and Scander need Slack accounts to be in their channels at all.
6. **Notification settings.** No admin can set another member's channel notifications. The instruction has been posted in each channel; Damian to tell the team it is mandatory.
7. **Blackpool.** Not in Damian's list of areas. Ali covers it; proposed: it uses #catterick-urgent until it has enough properties for its own channel.
8. **Sure Lets scope.** Read-only for Property Sauce matters is proposed. Should Claude also answer Sure Lets' own mail, and if so in whose name?
9. **Digest destination.** #claude-help is proposed. Damian may prefer a direct message or a new channel.
10. **Vera.** She is a Zoho user and on Slack but not on Damian's list for the urgent channels. Include her in #london-urgent?
11. **Where applicants are stored in Zoho** (open in Ops 03 section 10) decides which record step 5 writes to for an applicant. Until then, the note goes on the Landlord (property) record.

## Build list

For this chat:

1. #saffron-walden-urgent created, 19 September 2026 (C0C305M6GJ2), with Damian, Usman, Muzammel, Hassan and Umar. Usman added to the three other area urgent channels the same day.
2. Notification instruction posted with `@channel` in #london-urgent, #catterick-urgent, #lancaster-house-urgent and #saffron-walden-urgent, 19 September 2026.
3. Gmail labels Claude/Watching, Claude/Handled, Claude/Urgent, Claude/Team on admin@propertysauce.co, 19 September 2026.
4. The Cowork routine and digest in section 8, switched on the day the hourly routine is switched off (question 1).
5. Zoho: Team record for Rocky once question 4 is answered.
6. Memory note updated: Dave is on Slack (U0BUNS8TWER); new channel ID; the existing hourly routine.

For Damian:

7. Lettings@ send-as identity (question 2).
8. Inkbox Property Sauce identity and UK number (question 3).
9. Decide on Ali in #london-urgent and Dave in #catterick-urgent (question 5); make the team's notification settings mandatory (question 6).
10. Switch off the hourly routine when the 15-minute one starts (question 1).
