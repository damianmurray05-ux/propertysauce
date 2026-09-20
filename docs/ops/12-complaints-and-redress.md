# Ops 12: Complaints and redress

Scope: every expression of dissatisfaction from a tenant, applicant, landlord, guarantor, neighbour or contractor about Property Sauce, a person on its team, a contractor it sent, or a landlord it acts for; recognised by Claude in the 15-minute sweep, acknowledged in the same sweep, fixed where it can be fixed, investigated and answered by Claude through the Property Sauce channel, and, once it reaches the point of escalation, handed to Marchbank & Vale Associates with a complete Drive bundle. The Property Redress Scheme (membership PRS058008) is the complainant's route beyond us, and the file is kept so that any referral there shows the complaint was handled properly.

Status: dictated by Damian on 19 September 2026 and written up by the Ops 12 chat. Section 4 (the tone rules, the limits and the handover point) is his instruction and is procedure. The templates and the points in section 10 are waiting for his answers. Repairs themselves are Ops 05, contractor money is Ops 06, rent is Ops 04, deposits are Ops 09; this file governs how the dissatisfaction is handled, not the underlying job.

## 1. What this operation covers

Somebody tells us, in any words, that they are unhappy with something we did or did not do. Most of the time it is a tenant whose repair has dragged, whose appointment was missed, or who has asked twice and heard nothing. Sometimes it is an applicant about a holding deposit, a landlord about a void or a bill, or a neighbour about a contractor. Whether or not they use the word "complaint", it is one.

The objective, in Damian's words, is that the complaint never needs to go to a redress scheme, and that happens by responding to people quickly and fairly, politely enough to soften the situation rather than trying to win it. The second objective is that if one does go to the Property Redress Scheme, the file shows that it was acknowledged within minutes, answered within days, investigated fairly, put right where we were at fault, and closed with a written final response that told the complainant about the scheme.

Claude handles the complaint itself, autonomously, through a fixed set of steps in the Property Sauce channel: recognise, acknowledge, fix, investigate, respond, follow through. If the complainant stops cooperating or threatens to take it further, Claude hands the case to Marchbank & Vale Associates, Property Sauce's recoveries and litigation support partner, by building a Drive folder with every email as PDF, the rent statements, the tenancy documents and all other correspondence, and sending Marchbank & Vale one email with the link. Marchbank & Vale then takes it up under its own protocol. Two things stay with a person: money (README rule 2) and the stage 2 review, because a review by the same hand that answered stage 1 is not a review.

## 2. How it is done today

Damian's account, 19 September 2026, and what this chat found the same day.

**Damian's instructions.**

- We do not get many complaints, but there is no written protocol, and there should be one that Claude follows every time, so that anything reaching a redress scheme has been handled in the best way possible.
- The most important part is handling it so that it does not need a redress scheme. That normally happens by responding quickly and fairly.
- Prompt and very polite. Soften the situation; do not try to win it. A tenant who feels argued with becomes more disgruntled, and that is when a grumble becomes a formal complaint and a formal complaint becomes a referral.
- Claude has recently highlighted a couple of situations early enough for them to be handled swiftly. That is the pattern to keep: spot it, say it, act on it.
- Any email that seems like a complaint gets an automatic reply, in the same sweep, that tells the person we take all complaints seriously and have a protocol we follow.
- Claude handles complaints itself, autonomously, taking each one through a set number of steps via the Property Sauce channel. When it reaches the point of escalation, which is when the tenant is not cooperating or is threatening to take it further, Claude hands it to Marchbank & Vale, who liaise with the tenant under their own protocol. The handover is a Drive folder holding every email as PDF, the full rental statements, all previous correspondence on the issue, the tenancy agreement and every other document, and one email to Marchbank & Vale, "Dear Sirs, we have a case for you", with the Drive link.

**What this chat found.**

- The email signature on admin@propertysauce.co already says "Member of the Property Redress Scheme, PRS058008", so every tenant has the scheme's name in front of them on every email. There is no complaints procedure on the website or in the tenancy pack for them to read alongside it. [To confirm: section 10.]
- Ops 08 (section 4) already treats "any complaint about staff" and anything from the Property Redress Scheme as needing a person, acknowledged in the sweep and raised to #claude-urgent. It does not yet recognise an ordinary complaint as a category of its own; a tenant's unhappy email about a repair is graded routine and handled as a repair.
- Ops 04 section 5c already defines a Marchbank & Vale handover for arrears: the bundle, the flags that stop an automatic handover (hardship, vulnerability, dispute), and the line Marchbank & Vale must not cross. This file uses the same bundle shape and the same line.
- A live example, Denise Brown, 11 September 2026: pest control fitted bait stations, told her the sealing work could not be booked because the invoice had not been cleared, then booked 1 September and did not attend; a wall repair was also outstanding. Her email was polite and never used the word complaint. Claude's reply that night apologised for the wasted day, logged both jobs as outstanding, asked for her availability and deliberately promised no date until one was confirmed. She replied the next morning with three dates and "thank you for coming back to me so promptly". Umar then booked 30 September, 9 to 1; she asked for 2 to 5. That is a complaint handled before it became one, and also an example of what the register should capture (a missed appointment caused by an unpaid contractor invoice, which is an Ops 06 root cause, not a pest-control one).
- Zoho CRM has a Cases module switched on with four test records from 2017 and 2019 and nothing since. Its standard fields (Case Number, Status, Priority, Origin, Subject, Description, Reported By, Related To, Account Name) are close to what a complaints register needs.
- What goes wrong today: a grumble is treated as a job, not as dissatisfaction, so nobody says sorry or names a person; no timeline is given, so the tenant chases and gets crosser; the record is scattered across an email thread, a ticket and someone's memory; the person the complaint is about is the person who replies; there is no register, so nobody can see that the same cause (an unpaid invoice, a contractor who does not turn up) has produced three complaints.

**One point of law that shapes the handover.** Marchbank & Vale Associates is a trading name of the same company, has no solicitor, and must never be described to a tenant as solicitors, lawyers or a legal team (Legal Services Act 2007 section 17; Ops 04 section 5c). To the tenant it is "Marchbank & Vale Associates, who handle recoveries and litigation support for Property Sauce". The handover does not close our complaints procedure: the scheme expects the member's own final response, so Claude still drafts it and Damian still sends it (step 10) whether or not the case is with Marchbank & Vale.

## 3. Systems and records touched

**Zoho CRM, Cases module: the complaints register.** One Case per complaint, opened by Claude in the sweep that recognises it. Verified 19 September 2026.

| Field | Use |
|---|---|
| `Case_Number` (auto) | The reference quoted to the complainant as "PS-C-<number>" |
| `Subject` | "<address> - <one line in plain words>", for example "Flat 3, 12 High Road - missed pest control visit 1 Sep and wall repair" |
| `Status` | Today: New, Escalated, On Hold, Closed. Proposed values (section 10): Acknowledged, Being fixed, Stage 1, Stage 2, With Marchbank & Vale, Final response sent, Referred to PRS, Closed |
| `Priority` | High: staff conduct, safety, anything mentioning solicitor, court, council, PRS, ICO or the press. Medium: formal complaint. Low: grumble |
| `Case_Origin` | Email, Phone, Web (the website assistant), Walk-in (told to Ali, Dave, Rocky or Sky in person) |
| `Related_To` | The Tenant (Contacts) record, or the applicant record once Ops 03 settles where applicants live |
| `Account_Name` | The Landlord (Accounts) record, one per property |
| `Reported_By`, `Phone` | The complainant's name and number |
| `Description` | The complaint in the complainant's own words, pasted, not paraphrased |
| Notes | One dated line per event: acknowledged, fixed, file gathered, stage 1 sent, holding update, stage 2, handover, final response, PRS reference, closed |

Custom fields to add (build list): `Level` (Grumble, Formal), `Complaint_Type` (Repair delay, Missed appointment, Contractor conduct, Staff conduct, Communication, Rent or charges, Holding deposit or application, Deposit return, Property condition, Landlord, Other), `Reviewer` (user), `Acknowledged_At`, `Stage_1_Due`, `Full_Response_Due`, `Eight_Week_Date`, `Handed_To_MV` (date), `Final_Response_Sent`, `Outcome` (Upheld, Partly upheld, Not upheld, Withdrawn, Resolved before stage 1), `Goodwill_Amount`, `Root_Cause` (text), `PRS_Reference`, and the three flags from Ops 04: `Hardship`, `Vulnerability`, `Dispute`.

A one-line note also goes on the Tenant or Landlord record: "Complaint PS-C-<n> opened <date>: <subject>. See Cases." Anything the complainant may later rely on is sent from the record with Send Mail so it sits on the file (README rule 1).

**Drive.** A "Complaints" folder in the Property Sauce Drive, one subfolder per case named "PS-C-<n> <address> <surname>", started at step 3 and completed at handover (step 8). This is the folder Marchbank & Vale receives, so it is built to be complete from the first day:

| Subfolder | Contents |
|---|---|
| 01 Complaint and correspondence | Every email thread on the matter as PDF, one PDF per thread, named "<date> <subject>", including the acknowledgement, every response we sent, and any text or call notes exported from the record |
| 02 Rent | Full statement of account from Zoho Books for the tenancy (every invoice, every payment, running balance), and the arrears schedule if any |
| 03 Tenancy | Tenancy agreement, deed of guarantee, deposit certificate and prescribed information, How to Rent confirmation, check-in inventory, right to rent record |
| 04 Property | Gas, electrical, EPC and licence documents in force (Ops 07), and the Maintenance ticket history with contractor messages and photos (Ops 05) |
| 05 Case file | The one-page summary and timeline (step 5), the stage 1 and stage 2 responses, the flags, the landlord's instructions, and the handover note |

Photos follow the Ops 05 convention. Nothing with a bank account number goes in (README rule 7); the Books statement shows the reference, not our account details.

**Gmail, admin@propertysauce.co.** New label `Claude/Complaint` alongside the Ops 08 labels. A complaint thread carries `Claude/Complaint` and `Claude/Watching` until it is closed. `Claude/Team` still applies once a colleague has replied (Ops 08 section 4).

**Slack.** Proposed: a private channel #complaints with Damian, Usman, Muzammel, Hassan and Umar, one message per case in the T7 shape with everything in its thread, as #vacant-properties does for Ops 09. Anything High priority also goes to #claude-urgent C0BTPPZ3JJE with `@channel` in the same sweep. Mistakes found during a complaint go to #claude-mistakes C0C2A0ZP6H0 as Ops 08 requires. [Channel and membership to confirm: section 10.]

**Email identity.** Everything Claude sends on a complaint goes from admin@propertysauce.co, signed "Claude, for the Property Sauce team" with the office number, per Ops 08 (section 10 asks whether Damian wants a different signature on stage 1). The stage 2 response and the final response go in Damian's name. Nothing goes from Sure Lets or a personal address. Ops 08's sender check applies to every send.

**Marchbank & Vale Associates.** Trading name of Sure Lets and Manage Limited, "Recoveries and litigation support". Google Workspace tenant with mailboxes contact@, casework@, complaints@ and others at marchbankvale.co.uk; this chat's connectors cannot send from them, but admin@propertysauce.co can send to them. Proposed intake address: casework@marchbankvale.co.uk [confirm: section 10]. The Drive folder is shared with that address as Viewer and the link goes in T8. What Marchbank & Vale does after that is its own protocol and its own operation file; this file ends at the handover, except that Property Sauce still owes the complainant a final response (step 10) and Claude reads any reply Marchbank & Vale sends to admin@.

**Other operations.** The underlying job stays in its own file: a repair complaint opens or reprioritises the Ops 05 ticket; a missed contractor visit caused by an unpaid invoice is an Ops 06 fact; rent and charges are Ops 04, and a complainant who withholds rent joins the Ops 04 timetable from the day the rent was due; a deposit dispute is Ops 09 and goes to the deposit scheme's own dispute service, not the PRS; a holding deposit dispute is Ops 02. Ops 08 does the sweep; this file is the branch it takes when the sweep finds a complaint.

**The Property Redress Scheme.** Membership PRS058008 (from the signature; certificate to be found and filed under Ops 07). What the scheme expects of a member, as this chat understands it and to be checked against the current scheme rules before the first live formal complaint (section 10): a written in-house complaints procedure, available to consumers; the complaint acknowledged promptly (three working days is the norm); a written response; a final written response within eight weeks of the complaint, which tells the complainant they may refer the matter to the scheme and by when (twelve months from the final response is the figure this chat has; verify); the member's cooperation with the scheme's investigation and compliance with its decision. Contact details for the final response letter: Property Redress Scheme, Premiere House, 1st Floor, Elstree Way, Borehamwood WD6 1JH; 0333 321 9418; info@theprs.co.uk; theprs.co.uk. [Verify before use.]

**The landlord ombudsman.** The Renters' Rights Act 2025 requires every private landlord to join the new landlord redress scheme once it opens. As of the Propertymark FAQ on file (November 2025) it was not yet open. When it is, complaints about the landlord (as opposed to the agent) will have a second route, and Damian's and his family's own landlord entities will need to be members. Until then this file treats a complaint about a landlord's decision the same as any other, with the landlord told (step 6). [Track: section 10.]

## 4. Decision limits

**Tone rules. Damian's instruction, 19 September 2026, and procedure on every complaint message Claude writes:**

1. Reply promptly. A complaint is acknowledged in the sweep that finds it, day or night, never left for the morning.
2. Very polite, and warmer than the complainant. Use their name. Thank them for telling us.
3. Soften, do not win. Never argue in an acknowledgement. Never point out that the tenant was late, wrong, or difficult, even when they were. If a fact needs correcting it is corrected once, gently, in the stage 1 response, with the evidence attached and without adjectives.
4. Say sorry for what they have been through. "I am sorry you kept the day free and nobody came" is an apology for their experience and is always safe. "We accept we were negligent" is an admission and is a person's decision. Claude apologises for the experience in every message; whether we were at fault is said plainly in the stage 1 response, in the words section 4 allows.
5. Never blame a colleague, a contractor or a landlord to the complainant. "The contractor did not turn up" is a fact we can state; "it was the contractor's fault, not ours" is not said, because to the tenant we are all Property Sauce.
6. Who, how and when, every time (README rule 6). A name, a date, and what happens if that date is missed.
7. Promise nothing that is not confirmed. Denise Brown was told no date until one was booked, and told why. A second broken promise is worse than the first.
8. Plain English, short sentences, no legal language, no "as per our terms", no "please be advised".
9. One voice on the thread. The person the complaint is about never replies on it.
10. Tell them what happens next, including that they can go further if they are not satisfied. A complainant who is told about stage 2 and the scheme by us, early and calmly, is less likely to use them.
11. Marchbank & Vale is never called solicitors, lawyers, legal, or "our legal team". It is "Marchbank & Vale Associates, who handle recoveries and litigation support for Property Sauce".

**Claude may, without asking anyone:**

- Recognise a complaint at either level (step 1), open the Case, label the thread, create the Drive folder, post to #complaints, and send the acknowledgement T1 or T2 in the same sweep.
- Fix immediately anything inside another operation's limits: book or rebook the in-house contractor within Ops 05's limits, reprioritise a ticket, send a certificate, correct a wrong figure on a rent reminder, chase a contractor, put the correct information on the record.
- Gather the file, write the one-page summary and timeline (step 5), and send the stage 1 response (T4) itself, including saying plainly where we fell short in service terms: a missed visit, a message not passed on, a delay, a wrong figure, a promise not kept.
- Send holding updates, progress updates, chasers and the closing message T5.
- Decide that the point of escalation has been reached under the tests in step 8, build the bundle, share the folder, send T8 to Marchbank & Vale and T9 to the complainant, and tell Damian in #complaints the same sweep. Exception: a Case carrying a hardship or vulnerability flag is not handed over without Damian, as in Ops 04.
- Draft the stage 2 response, the final response and the scheme submission for Damian, chase him for each deadline, and escalate under section 6 when a deadline is missed.
- Record the outcome and root cause, and put the lesson into the relevant Ops file's section 10.

**Needs a person, always:**

- Any money: a refund, a fee waived, a rent credit, a goodwill payment of any amount (README rule 2). Claude recommends a figure in the summary; Damian approves with one tap in the Slack thread; Claude then tells the complainant. [Proposed one-tap limit: section 10.]
- Any admission that could carry legal liability (negligence, breach of the management agreement or of a statutory duty), any statement about the landlord's legal obligations, and any complaint from a landlord about the agency: Damian.
- Any complaint about the conduct of a team member or a contractor: Claude acknowledges and opens the Case; Damian investigates; the person concerned does not see the thread until Damian says. A complaint about Damian: Usman.
- The stage 2 review and its response, and the final response with the scheme's details: drafted by Claude, read and sent by Damian, because the scheme expects a fresh and senior look and the final letter carries the company's name.
- Anything from the Property Redress Scheme, a solicitor, a court, the council or the ICO about a complaint: Ops 08 section 4; acknowledged in the sweep, then #claude-urgent and Damian, and the bundle goes to Marchbank & Vale the same day (step 8).
- A handover where the Case carries a hardship or vulnerability flag: Damian decides.

## 5. The procedure, step by step

**Step 1. Recognise it, in the Ops 08 sweep.** Ops 08 step 3 gains a grade, *Complaint*, checked before the routine grade. It applies whenever a message expresses dissatisfaction with Property Sauce, a colleague, a contractor we sent, or a landlord we act for, whether or not it uses the word. Two levels:

- *Grumble.* Dissatisfaction without a demand for a process: a missed appointment, a repair that has dragged, "I have asked twice", "still waiting", "nobody came", "this is not good enough", "I am disappointed", a second chaser on the same job, an apology asked for, a tone that is clearly cross. Also anything a contractor or colleague reports a tenant saying in person.
- *Formal.* Any of: the words complaint, formal, escalate, manager, director, compensation, refund, redress, ombudsman, Property Redress Scheme, solicitor, legal, court, council, environmental health, ICO, Trading Standards, press, review, "unacceptable"; a request for "your complaints procedure"; a grumble about the same matter that has already had a grumble acknowledgement and a fix that did not hold; anything about the conduct of a person; a landlord complaining about the agency. When in doubt between the two, formal.

A message from the Property Redress Scheme itself is not a new complaint: it is step 11.

**Step 2. Acknowledge in the same sweep.** Grumble: T1, warm and specific, which names the thing they are unhappy about in their words, says sorry for the experience, says what is being done right now, gives a time they will hear by, and carries the one line Damian asked for: that we take every complaint seriously and have a set way of handling them. Formal: T2, which does everything T1 does and also gives the reference PS-C-<n>, states the timeline (a written response within three working days, or a holding update by then with a date no later than ten working days), links the published procedure, tells them about stage 2 and the scheme in one calm sentence, and asks what outcome would put it right for them. Neither is ever a generic autoresponder: each one refers to the actual point raised, and if the message is the second on a thread the acknowledgement refers to the first.

If the complaint arrived by phone, in person or through a contractor, the acknowledgement goes by email to the address on the record (and by text if there is no email), and says "you told Ali today that...".

**Step 3. Open the record, same sweep.** Create the Case with the fields in section 3 and `Acknowledged_At` set. Copy the Ops 04 flags (hardship, vulnerability, dispute) from the Tenant record if any. Label the thread `Claude/Complaint` and `Claude/Watching`. Create the Drive subfolder with its five subfolders and save the complaint email as PDF in 01. Write the one-line note on the Tenant or Landlord record. Post T7 to #complaints; if High priority, also #claude-urgent with `@channel`. Set `Stage_1_Due` to three working days from receipt, `Full_Response_Due` to ten working days, `Eight_Week_Date` to eight weeks.

**Step 4. Fix what can be fixed now.** In the same sweep, within the other operations' limits: rebook the visit at the tenant's stated times, reprioritise the ticket, chase the contractor by the Ops 05 route, send the document, correct the figure. Tell the complainant in the acknowledgement what has been done, not what will be. Most grumbles end here: if the fix holds and the complainant replies satisfied or says nothing further within five working days after the fix, the Case is closed with Outcome "Resolved before stage 1" and step 12 applies. A grumble that cannot be fixed inside the limits (a third-party contractor, a landlord decision, money) goes on to step 5 as if formal.

**Step 5. Gather the file, within one working day.** From the Zoho notes, the Maintenance ticket, the email threads, the Slack threads and the contractor messages, Claude writes a one-page summary in subfolder 05 and posts it in the Slack thread:

1. What the complainant says, in their words.
2. What the record shows, as a dated timeline: what was promised, by whom, when; what happened.
3. Where we fell short, plainly, and where we did not.
4. The cause (an unpaid invoice, a contractor no-show, a message not passed on, a wrong figure).
5. What the complainant has asked for, and what Claude proposes: the fix, any goodwill and a figure (for Damian's tap), and the words for the response.
6. Anything that needs Damian or the landlord under section 4.

At the same time Claude fills subfolders 02, 03 and 04 from Books, the tenancy folder and the ticket, so the bundle is complete before anyone asks for it.

**Step 6. Stage 1 response, within three working days of receipt.** Claude sends T4: what happened, what we found, where we fell short and where we did not, what has been done, what will be done and by when, any goodwill Damian has approved, and what to do if they are not satisfied (reply within ten working days and Damian reviews it afresh). If a point in section 4 needs Damian or the landlord and the answer has not come by day three, Claude sends T3 by day three with a date, and T4 by day ten at the latest, chasing Damian or the landlord daily in between. Where the complaint concerns a third-party landlord's decision or money, the landlord is told on day one with the summary and asked for their position by a date that keeps us inside day ten.

**Step 7. Follow through.** Every promise in T4 becomes a dated task on the Case. Claude chases the person who owes it the day before, confirms to the complainant when it is done, and sends a short update before the complainant has to ask if anything slips. A promise that slips is a new grumble on the same Case and raises the priority one level.

**Step 8. The point of escalation: handover to Marchbank & Vale.** Checked at every sweep on an open Case. The case is handed over when any one of these is true:

- *Not cooperating.* No reply to two messages over ten working days on a matter that needs the complainant's input; access for the fix refused or missed twice; the stage 1 outcome rejected without the complainant saying what would put it right; or the complainant continuing to write about the same matter after T4 and T7's promises have all been kept.
- *Threatening to take it further.* A solicitor, a court, a claim, a council enforcement referral, the press or social media named as the next step; or rent withheld or threatened to be withheld over the complaint.
- *Money.* A demand for compensation above the one-tap limit, or arrears on the account that are already on or past the Ops 04 day 14 letter, so that the two files should be one.

A statement that they will go to the Property Redress Scheme is not, on its own, a trigger: it is their right, the scheme requires them to finish our procedure first, and the correct response is to complete stage 2 and send the final response quickly (steps 9 and 10). In that case Claude builds the bundle and shares it with Marchbank & Vale so they are ready, but Marchbank & Vale does not write to the complainant unless another trigger fires.

Handover, in the sweep the trigger is found (Damian first if the Case carries a hardship or vulnerability flag):

1. Complete the Drive folder: every email thread on the matter exported to PDF into 01 (including anything since the summary), the current Books statement into 02, the tenancy documents into 03, the certificates and ticket history into 04, and into 05 a handover note: the trigger, the timeline in ten lines, what has been offered and refused, the flags, the landlord's name exactly as on the agreement and their instructions, and whether the final response has been sent.
2. Share the folder with the Marchbank & Vale intake address as Viewer.
3. Send T8 from admin@propertysauce.co to Marchbank & Vale with the link: "Dear Sirs, we have a case for you".
4. Send T9 to the complainant: the matter has been passed to Marchbank & Vale Associates, who will be in touch; their complaint with Property Sauce remains open and our final response will follow.
5. Case Status = With Marchbank & Vale, `Handed_To_MV` set, T7 updated, Damian tagged in #complaints with the trigger in one line.
6. From here Claude does not write to the complainant about the substance, only to send the final response (step 10) or to answer a plain service request (a repair, a certificate). Anything the complainant sends about the dispute is forwarded to the Marchbank & Vale intake address the same sweep and filed in 01.

**Step 9. Stage 2, within ten working days of the complainant's request.** If the complainant replies that they are not satisfied with T4, Claude refreshes the summary with the stage 1 response and their reply, drafts the stage 2 response, and puts both to Damian in the thread. Damian looks at it afresh, may phone the complainant (logged on the Case), and sends the stage 2 response in his name. If the case has been handed to Marchbank & Vale, stage 2 is folded into the final response.

**Step 10. Final response.** When stage 2 is answered, when a handover has happened, or at eight weeks from receipt whatever stage has been reached, Damian sends T6, drafted by Claude and headed as our final response: what was complained of, what we found, what we have done or offered, and that if they remain dissatisfied they may refer the complaint to the Property Redress Scheme, with the scheme's details and the time limit. `Final_Response_Sent` is set. Claude puts T6 to Damian at week six at the latest so that the eight-week date is never missed. Nothing more is sent on the substance unless the scheme asks or the complainant raises something new.

**Step 11. The scheme writes to us.** Ops 08 step 4 applies to receipt: acknowledge, `Claude/Urgent`, #claude-urgent with the deadline, Damian. Within two working days Claude assembles the submission from the Case and the Drive folder (which is already the bundle) and drafts our reply for Damian. Damian sends it inside the scheme's deadline. The scheme's decision is recorded on the Case with `PRS_Reference`, and anything it requires us to pay or do is done by a person within the scheme's time limit. A referral is reported to Damian the same day and reviewed at the next monthly review for the lesson.

**Step 12. Close.** Send T5 (unless T6 was the last word), set `Outcome`, write `Root_Cause` in one line, set Status Closed, update the Slack message, note the close on the Tenant or Landlord record. A complaint upheld against a contractor is noted on their Team record; two upheld in six months goes to Damian with a recommendation. The lesson, if there is one, is written into the relevant Ops file's section 10 the same day ("Ops 06: an unpaid pest-control invoice delayed the sealing works at <address> and produced PS-C-<n>").

**Step 13. Monthly review.** First working Monday, 08:00, to #complaints: cases opened and closed in the month, time to acknowledge, time to stage 1, upheld rate, root causes grouped, any theme seen twice, any case past a deadline, cases handed to Marchbank & Vale and what came of them, and any referral. Quarterly, the same to Damian with what has changed as a result.

## 6. Escalation

| Situation | Who, how, how fast |
|---|---|
| Formal complaint received | #complaints in the same sweep; #claude-urgent with `@channel` and Damian if High priority |
| High priority (staff conduct, safety, solicitor, court, council, PRS, ICO, press, social media, landlord complaint) | Damian, same sweep; nothing substantive sent without him beyond the acknowledgement |
| A section 4 decision (money, admission, landlord) needed to send stage 1 | Damian or the landlord tagged on day one; chased daily; T3 to the complainant on day three if still open |
| Day ten passed with no stage 1 response | Damian by Slack direct message and in #claude-urgent |
| Stage 2 request with no response from Damian by day eight of ten | Chase; day ten, T3 to the complainant and Damian by direct message |
| Week six reached with no final response | Damian, with T6 drafted, so the eight-week date is met |
| A promise in T4 slips | Complainant told before they ask; priority up one level; the person who owes it tagged |
| Handover trigger on a Case with a hardship or vulnerability flag | Damian decides, tagged in the thread, same sweep; T3 to the complainant meanwhile |
| Handover done | Damian tagged in #complaints with the trigger, same sweep |
| Complainant threatens or reports harm, or the complaint reveals a safety issue | Ops 08 step 6 urgent protocol, same sweep |
| The complaint is about Claude (a wrong reply, a wrong flat, a wrong figure) | Correct it in the same sweep, #claude-mistakes, and the daily digest (Ops 08 section 6); the Case is still opened, and Damian sends stage 1 on that one |
| The scheme writes | Ops 08 step 4; submission drafted within two working days; bundle to Marchbank & Vale the same day; Damian responds |

## 7. Done when

For each complaint: acknowledged in the sweep it arrived; Case opened with the complaint in the complainant's words; fixed in the sweep where it could be; summary within one working day; stage 1 response within three working days (or holding update by day three and response by day ten); every promise dated, kept and confirmed; the bundle complete in Drive from day one so that a handover is one share and one email; final response, if needed, inside eight weeks with the scheme's details; outcome and root cause recorded; lesson written into the operation that caused it.

Measured in the monthly review:

| Measure | Target |
|---|---|
| Time from arrival to acknowledgement, any hour | 15 minutes |
| Grumbles fixed in the same sweep | most; reported as a percentage |
| Stage 1 response within three working days | 100 percent, or a holding update by day three and response by day ten |
| Final response inside eight weeks | 100 percent |
| Complaints escalated to stage 2 | falling |
| Complaints handed to Marchbank & Vale | reported; each one reviewed for whether an earlier step could have settled it |
| Complaints referred to the scheme | zero |
| Same root cause appearing twice in a quarter | zero, or a change made in the operation concerned |
| Complaint threads where the person complained about replied | zero |
| Messages calling Marchbank & Vale solicitors, lawyers or legal | zero |

## 8. Cowork routine

No separate sweep. Steps 1 to 4 and the step 8 check run inside the Ops 08 15-minute email watch, whose prompt gains this paragraph:

"Before grading a message as routine, check whether it is a complaint under docs/ops/12-complaints-and-redress.md step 1 (any dissatisfaction with Property Sauce, a colleague, a contractor we sent or a landlord we act for, whether or not the word is used; formal if it asks for a process, mentions compensation, redress, a solicitor, the council or a person's conduct, or is a second grumble on the same matter). If it is: send T1 (grumble) or T2 (formal) from admin@propertysauce.co in this sweep, specific to what they said, sorry for their experience, with a time they will hear by; open a Zoho Case, label the thread Claude/Complaint and Claude/Watching, create the Drive folder with its five subfolders, post T7 to #complaints (and #claude-urgent with @channel if High priority); fix now anything inside Ops 04, 05 or 07 limits and say so in the acknowledgement. Never argue, never blame, never promise an unconfirmed date, never call Marchbank & Vale solicitors or legal. Then run steps 5 to 7: summary, bundle and stage 1 response within the file's deadlines, every promise chased. On every open Case, test step 8; if a trigger fires and there is no hardship or vulnerability flag, complete the bundle, share it with the Marchbank & Vale intake address, send T8 to them and T9 to the complainant, and tag Damian. Money, admissions, staff conduct, stage 2 and the final response go to Damian with a draft."

**Complaints check**, every working day 08:00, before the Ops 08 daily digest: every open Case with a due date today or passed; chase or escalate under section 6; every promise due today; every grumble fixed five working days ago with no further word, closed; every Case at week six with no final response, T6 drafted to Damian. Three lines into the Ops 08 digest for Damian: complaints open, anything due from him today, anything past its date or handed over since yesterday.

**Monthly review**, first working Monday 08:00, step 13, to #complaints.

## 9. Test plan

Complaints are rare, so the test is staged rather than waited for.

Day one: Damian sends four emails to admin@propertysauce.co from an outside address: a polite grumble about a missed visit; a formal complaint asking for compensation; a complaint about a named team member; and, on the second thread two days later, a reply saying "I will be speaking to my solicitor". Targets: four acknowledgements inside 15 minutes, each specific to the message; three Cases; three Slack posts (the third also in #claude-urgent); no money offered and no substantive reply on the third without Damian; and on the solicitor reply, the bundle completed, the folder shared, T8 and T9 sent, and Damian tagged, all inside the sweep. Damian reads every message and marks up the templates. The test Marchbank & Vale email goes to the intake address and is deleted there afterwards.

First three real complaints: everything runs as the file says, and Damian reads each stage 1 response in the Slack thread before it is sent (a two-hour window, after which it goes). After three, Claude sends stage 1 without the window unless section 4 needs him.

Before the test this chat builds the items in the build list, and the published procedure (P1) goes on the website so T2 can link to it.

## 10. Open questions

1. **Signature on stage 1.** Claude sends T1 to T5 as "Claude, for the Property Sauce team", as Ops 08 does, with the office number. A complainant who feels fobbed off by an automated reply gets crosser, so T2 and T4 say a person reviews anything they are not satisfied with and name Damian. Alternative: stage 1 goes out in the office's name or Usman's, still written and sent by Claude. Damian to choose.
2. **Timelines.** Proposed: acknowledgement in the sweep; stage 1 in three working days, or a holding update by day three and the response by day ten; stage 2 within ten working days of the request; final response within eight weeks of receipt at the latest. Confirm.
3. **Goodwill.** Proposed: Claude may recommend a goodwill gesture up to £50 (a rent credit or a voucher) in the summary, and Damian approves it with one tap in the thread; anything above £50, or any refund of a fee or rent, is a decision Damian makes on the file. Claude never offers money without the tap. A demand above £50 is also a handover trigger in step 8. Confirm the figure.
4. **The register.** Proposed: the existing Zoho Cases module, renamed "Complaints" in the tab, the Status picklist changed to the values in section 3, the custom fields added, and the four test records left in place or deleted as Damian says (README rule 2). Alternative: a new custom module. Cases is recommended because it already links to Contacts and Accounts.
5. **Slack.** Proposed: a new private channel #complaints with Damian, Usman, Muzammel, Hassan and Umar. Alternative: use #claude-urgent for everything. A separate channel is recommended so that the monthly review and the quiet cases are not lost among lockouts.
6. **Published procedure.** The scheme expects members to have a written procedure available to consumers. Proposed: P1 below as a page at propertysauce.co/complaints, linked from the email signature next to the PRS number, sent in the tenancy welcome pack, and linked from every T2. Confirm the wording or mark up.
7. **Marchbank & Vale intake.** Which address receives T8 and the Drive share: casework@marchbankvale.co.uk is proposed. Does Marchbank & Vale already have a routine reading that mailbox that will take up a case automatically, or is that a build for the Marchbank & Vale side? Until it exists, Claude also tags Damian so a case is never sent into an unread inbox.
8. **Handover triggers.** Step 8 lists them. Two points for Damian: (a) a threat to go to the Property Redress Scheme is deliberately not a trigger on its own, because the scheme wants our procedure finished and a recovery firm writing to someone who has just said "I will complain to your redress scheme" reads badly if the scheme later sees the file; Claude readies the bundle instead. (b) A Case with a hardship or vulnerability flag goes to Damian before handover, as arrears files do in Ops 04. Confirm both, or change.
9. **Complaints about landlords.** A tenant complaining about a third-party landlord's decision (a refused pet, a rent increase, a repair the landlord will not fund) is acknowledged by us and the landlord is told on day one. Does Damian want the landlord asked to answer, or Property Sauce to answer on their behalf with the landlord's instruction? The landlord ombudsman under the Renters' Rights Act will change this once it opens; this chat will check its status monthly and update section 3.
10. **Scheme rules.** The eight-week limit, the twelve-month referral window and the scheme's address in section 3 are from this chat's knowledge, not from the current PRS rules. Before the first live formal complaint, read the scheme's current rules and complaints guidance for members on theprs.co.uk and correct section 3, T6 and P1. The membership certificate for PRS058008 should be found and filed under Ops 07 with its renewal date.
11. **Applicants.** A holding deposit complaint from an applicant (the most common complaint in lettings) is handled by this file, but the Case's `Related_To` needs the applicant record that Ops 03 section 10 has not yet settled. Until then it links to the Landlord (property) record only.
12. **Luxe Stay.** Guest complaints at Saffron Walden and the Airbnb properties are out of scope here and follow the platform's process; a guest complaint arriving at admin@propertysauce.co is forwarded to the Luxe Stay mailbox and acknowledged. Confirm.
13. **Email to PDF.** Gmail's connector returns a thread's text and HTML but not a PDF. The bundle needs one PDF per thread, so the build is a small script (HTML from the thread, rendered to PDF with the headers, dates and attachments listed) run by the routine into subfolder 01. Until it exists, the thread is saved as an HTML file and the routine says so in the handover note.

## Templates

Every template is adapted to the message it answers; the words in angle brackets are filled from the thread and the record, and the first paragraph always refers to the specific thing they raised.

### T1: Grumble acknowledgement (same sweep)

Subject: Re: <their subject>

Hi <first name>,

Thank you for telling us, and I am sorry about <the specific thing, in their words: "that you kept 1 September free and nobody came" / "that you have had to ask twice about the boiler">. You should not have had to <chase this / give up a day / wait this long>, and I understand why you are frustrated.

Here is what has happened since your email: <what was done in this sweep: "I have rebooked the visit for Wednesday 30 September between 2 and 5 pm, which is the slot you asked for, and the contractor has confirmed it" / "I have moved your repair to the top of this week's list and asked Ali for a date; you will hear from me by 5 pm tomorrow either way">.

We take every complaint seriously and have a set way of handling them, so this is now logged under reference PS-C-<n> and I am keeping it open until it is put right. If anything I have said here is wrong, or there is more to it, reply to this email and it comes straight to me.

Kind regards,
Claude, for the Property Sauce team
020 8158 8434

### T2: Formal complaint acknowledgement (same sweep)

Subject: Your complaint, reference PS-C-<n>

Dear <name>,

Thank you for your email about <the matter in their words>. I am sorry that <the experience: "it has come to this" / "you have had to write to us about it" / "the visit was missed and you were left without an update">.

We take every complaint seriously and have a written procedure for handling them, which is at propertysauce.co/complaints. This is what will happen now:

- Your complaint is logged under reference PS-C-<n>. Please quote it if you write again.
- I will look at everything on file and reply to you in writing by <date, three working days>. If it needs longer to look into properly, I will write to you by that date to say why and give you a new date, which will be no later than <date, ten working days>.
- <If anything was fixed in this sweep: "In the meantime I have <action>, so that the underlying problem is not waiting on the complaint.">
- If you are not satisfied with my reply, tell me and it will be reviewed afresh by Damian Murray, who has not been involved. If you are still not satisfied after that, you can take it to the Property Redress Scheme, of which we are a member (PRS058008); our final letter will explain how.

It would help me to know what outcome would put this right for you, if you have not already said. Anything you add to this thread goes on the file.

Kind regards,
Claude, for the Property Sauce team
020 8158 8434

### T3: Holding update (by day three)

Dear <name>,

I said you would hear from me by today about your complaint PS-C-<n>. I have <what has been done: read the file, spoken to the contractor, asked the landlord for their position>, and I am waiting on <what>. I will write to you with a full reply by <date, no later than day ten>. <One line on anything already done or offered.>

I am sorry to ask you to wait; I would rather give you a proper answer than a quick one.

Kind regards,
Claude, for the Property Sauce team

### T4: Stage 1 response (sent by Claude, within three working days)

Dear <name>,

Thank you for your patience while I looked into your complaint of <date>, reference PS-C-<n>.

**What you told us.** <Two or three sentences in their words.>

**What I found.** <The dated timeline in plain words, no longer than it needs to be.>

**Where we fell short.** <Plainly, in service terms: "We should have told you on 1 September that the visit was not going ahead. We did not, and I am sorry." Or, where we did not: "I could not find that we were told <x>; if you have a message showing otherwise, send it to me and I will look again." Nothing about liability, negligence or the law without Damian.>

**What we have done.** <Done, with dates.>

**What we will do.** <Each promise with a date and a name.> <Any goodwill Damian has approved: "As an apology for the wasted day, we have credited £<x> to your rent account, which will show on your next statement.">

If this puts things right, you do not need to reply. If you are not satisfied, tell me within ten working days and it will be reviewed afresh by Damian Murray, who has not been involved so far. If after that you are still not satisfied, you may refer the complaint to the Property Redress Scheme; we will set out how in our final letter.

Kind regards,
Claude, for the Property Sauce team
020 8158 8434

### T5: Closing message

Hi <first name>,

Thank you for confirming that <the work is done / you are happy with how this has been resolved>. I have closed the complaint PS-C-<n> on our file today. Thank you again for telling us about it; it has changed <how we do x> so it does not happen to anyone else. If anything comes up again, write to us and quote the reference and it will come straight back to me.

Kind regards,
Claude, for the Property Sauce team

### T6: Final response (drafted by Claude, sent by Damian in his name)

Subject: Final response to your complaint, reference PS-C-<n>

Dear <name>,

This is Property Sauce's final response to your complaint of <date>.

**Your complaint.** <Summary in their words.>

**What we found.** <Summary of stage 1 and stage 2.>

**What we have done or offered.** <List.>

**Our position.** <Upheld / partly upheld / not upheld, with the reason in plain words.> <If handed over: "The <arrears / claim / access> side of this matter is now being dealt with by Marchbank & Vale Associates, who handle recoveries and litigation support for us, and they will correspond with you about it separately.">

If you are not satisfied with this response, you may refer your complaint to the Property Redress Scheme, which is independent and free to use. We are a member, number PRS058008. You must refer it within <twelve months> of the date of this letter. Property Redress Scheme, Premiere House, 1st Floor, Elstree Way, Borehamwood WD6 1JH; 0333 321 9418; info@theprs.co.uk; theprs.co.uk. [Verify before first use: section 10.]

Thank you for giving us the chance to look into this.

Damian Murray
Property Sauce

### T7: Slack post to #complaints (one per case, updates in the thread)

```
📣 PS-C-<n> · <Grumble / Formal> · <Low / Medium / High>
<address> · <complainant name> · <tenant / applicant / landlord / neighbour>
About: <one line>
Received: <date time> · Acknowledged: <time> · Stage 1 due: <date> · 8 weeks: <date>
Fixed now: <what, or "nothing within limits">
Flags: <hardship / vulnerability / dispute / none> · Needs Damian: <what, or "nothing">
Status: Acknowledged
```

Statuses, in order: Acknowledged, Being fixed, Stage 1, Stage 2, With Marchbank & Vale, Final response sent, Referred to PRS, Closed. Edit the Status line at each change; ✅ reaction when closed.

### T8: Handover email to Marchbank & Vale (from admin@propertysauce.co)

Subject: New case: PS-C-<n>, <address>, <complainant surname>

Dear Sirs,

We have a case for you.

Property: <address>. Tenant: <name>, <email>, <mobile>. Landlord as named on the agreement: <name>. Property Sauce reference PS-C-<n>.

The matter: <two lines: what the complaint was and what the tenant is now doing or threatening>. Trigger for referral: <not cooperating / solicitor named / rent withheld / compensation demanded above our limit / arrears already at day <n>>. Flags: <none / dispute>. Our final response <has been sent on <date> / will follow by <date>>.

The complete file is in the shared Drive folder: <link>. It holds every email as PDF (01), the full rent statement (02), the tenancy agreement, guarantee, deposit certificate and inventory (03), the certificates and repair history (04), and our summary, timeline and handover note (05).

We will forward anything further the tenant sends us, and will not correspond with them on the substance from here.

Yours faithfully,

Property Sauce
Sure Lets and Manage Limited
admin@propertysauce.co, 020 8158 8434

### T9: Message to the complainant at handover

Dear <name>,

Thank you for your message of <date>. Because <the reason in neutral words: "you have told us you intend to take this further" / "we have not been able to agree a way forward" / "rent for <month> has not been paid">, we have passed this matter to Marchbank & Vale Associates, who handle recoveries and litigation support for Property Sauce. They will write to you directly, and from now on anything about <the dispute> should go to them; anything you send us we will pass on the same day.

Your complaint with Property Sauce, reference PS-C-<n>, remains open. <"Our final response was sent on <date>." / "You will receive our final response by <date>.">, and it explains how to take the complaint to the Property Redress Scheme if you are not satisfied. Repairs and anything else about your tenancy you can still send to us as normal.

Kind regards,
Claude, for the Property Sauce team

### P1: Published complaints procedure (for propertysauce.co/complaints, the welcome pack and T2)

**How to complain to Property Sauce**

We want to know if something has gone wrong. Tell us by email to admin@propertysauce.co, by phone on 020 8158 8434, or in writing to Top Floor, 55 Coopers Lane, Leyton, London E10 5DG. Say what happened, when, and what you would like us to do.

**What happens next**

1. We acknowledge your complaint within one working day, usually within the hour, with a reference number.
2. We look into it and write to you within three working days. If it needs longer, we will tell you why and give you a date, which will be no more than ten working days from your complaint.
3. If you are not satisfied, tell us within ten working days and a director who has not been involved will review it afresh and write to you within ten working days.
4. If you are still not satisfied, or eight weeks have passed since your complaint, we will send you our final response.

**Going further**

Property Sauce is a member of the Property Redress Scheme, membership number PRS058008. If you have received our final response and are not satisfied, you can refer your complaint to the scheme within twelve months. It is independent and free. Property Redress Scheme, Premiere House, 1st Floor, Elstree Way, Borehamwood WD6 1JH; 0333 321 9418; info@theprs.co.uk; theprs.co.uk. [Verify.]

Deposit disputes go to your deposit protection scheme's dispute service, which is free and independent; your prescribed information tells you which scheme holds your deposit.

Property Sauce is a trading name of Sure Lets and Manage Limited, company number 16613860.

## Build list

For this chat, once section 10 is answered:

1. Gmail label `Claude/Complaint` on admin@propertysauce.co.
2. Zoho Cases: Status picklist values, the custom fields and flags in section 3, the tab renamed Complaints, and the four test records dealt with as Damian decides.
3. Drive folder "Complaints" in the Property Sauce Drive, with a template of the five subfolders.
4. Slack #complaints (private) with the office five, and the T7 format pinned.
5. The paragraph in section 8 added to the Ops 08 routine prompt, and the 08:00 complaints check and the monthly review added to the routine.
6. T1 to T6 and T9 as Zoho CRM email templates on the Contacts module; T8 as a template in the routine.
7. The email-to-PDF export (question 13) and the Books statement export into subfolder 02.
8. P1 published at propertysauce.co/complaints (in the propertysauce repo, deploy per docs/DEPLOY.md), and the signature line "Complaints: propertysauce.co/complaints" added next to the PRS number.
9. Ops 08 step 3 amended to add the Complaint grade and to point here.
10. The PRS rules check in question 10, and the certificate filed under Ops 07.

For Damian:

11. Answer questions 1 to 9 and 12.
12. Confirm the Marchbank & Vale intake address and whether its side reads it automatically (question 7).
13. Send the four test emails on day one of the test.
