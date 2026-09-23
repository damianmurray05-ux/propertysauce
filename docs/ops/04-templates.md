# Ops 04 templates: rent reminders, letters and landlord updates

Drafts written 20 September 2026 for Damian to read before they are loaded into Zoho CRM as email templates and into the SMS and calling tools. Placeholders are in [square brackets]. Every tenant message names the balance, the reference, how to pay, a person to speak to and free advice. Bank details are never written here (README rule 7): "the account on your invoice" is used, and the Zoho invoice carries them.

Sender for R0 to R5 and L1 to L4: Property Sauce, admin@propertysauce.co, 020 8158 8434, Top Floor, 55 Coopers Lane, Leyton E10 5DG. Formal letters (R3, R4, R5, guarantor letters) are sent from the Tenant record in Zoho CRM. Marchbank & Vale letters (MV1 onward) are sent on Marchbank & Vale paper from casework@marchbankvale.co.uk and by post.

Free advice block, used in R3, R4, R5 and MV1:

> If money is tight, free and confidential help is available: Citizens Advice 0800 144 8848, StepChange 0800 138 1111, National Debtline 0808 808 4000, Shelter 0808 800 4444. If you receive Universal Credit, tell us: the housing part can be paid straight to your landlord.

---

## R0. Wrong payment reference (email, same day the payment is matched)

Subject: Your rent payment, [date]: please use reference [REFERENCE]

Hello [first name],

Thank you, your payment of £[amount] on [date] has reached us and is recorded against [address].

It arrived with the reference "[reference used]". Your payment reference is **[REFERENCE]**, and it is mandatory on every payment. Without it a payment can be missed or recorded against the wrong tenancy, which can show you as behind with rent when you are not.

Please update your standing order or saved payee today so the reference reads [REFERENCE] exactly.

If you have any questions, reply to this email or call 020 8158 8434.

Property Sauce

---

## R1. Day 1 friendly reminder

**SMS:** Property Sauce: hello [first name], your rent of £[amount] for [address] was due on [due date] and has not reached us yet. If you have paid, please reply with the date and reference [REFERENCE]. If there is a problem, reply or call 020 8158 8434 today and we will help.

**Email subject:** Rent due [due date] for [address]

Hello [first name],

Your rent of £[amount] for [address] was due on [due date]. As of this morning it has not reached our account.

If you have already paid, please reply with the date you paid and check the reference reads [REFERENCE]. If the payment is on its way, no need to reply.

If something has gone wrong this month, tell us today. It is much easier to sort out early, and we would rather help now than write again next week.

Pay to the account on your invoice, reference [REFERENCE].

Property Sauce, 020 8158 8434, admin@propertysauce.co

---

## R2. Day 3 SMS after the call

Property Sauce: hello [first name], we tried to call about the rent of £[amount] for [address], due [due date] and still unpaid. Please tell us today when you will pay. Reply here or call 020 8158 8434. Reference [REFERENCE].

**Day 3 call script (Front Desk):** confirm speaking to [tenant name]; say rent of £[amount] due [due date] has not arrived; ask whether it has been paid and with what reference; if not, ask for a date within the next 7 days; ask whether Universal Credit is involved or anything has changed; say what happens next (a written reminder on day 7 if unpaid); confirm the date agreed by SMS. Note the call on the record.

---

## R3. Day 7 formal reminder 1 (email from Zoho CRM)

Subject: Rent arrears on [address]: £[balance] outstanding

Dear [full name],

**Tenancy:** [address]
**Rent due:** £[amount] on [due date]
**Received since:** £[amount received]
**Balance outstanding:** £[balance]
**Your payment reference:** [REFERENCE]

Your rent is now 7 days late and we have not had a payment or an agreed date from you. Under your tenancy agreement rent is due in advance on the [day] of each month.

Please pay the balance now to the account on your invoice, quoting [REFERENCE].

If you cannot pay in full today, we will agree a payment plan with you. Reply or call 020 8158 8434 with what you can pay and when, and we will confirm it in writing.

Your agreement (clause [2.4 or 45]) allows interest at 3% above Bank of England base rate on rent more than 14 days late. We would rather not charge it, so please pay or agree a plan before [day 14 date].

[Free advice block]

If we do not hear from you by [day 14 date] we will write again and, where there is a guarantor, ask them to pay.

Property Sauce, on behalf of [landlord name]
020 8158 8434, admin@propertysauce.co

## R3g. Day 7 guarantor copy

Subject: Rent arrears on [address]: for your information as guarantor

Dear [guarantor name],

You signed a guarantee dated [date] for [tenant name]'s tenancy of [address]. The rent of £[amount] due on [due date] has not been paid and the balance outstanding is £[balance]. A copy of our letter to [tenant first name] is attached.

We are not asking you to pay at this stage. We are telling you now so you can speak to [tenant first name] and so nothing later comes as a surprise. If the balance is not cleared or a plan agreed by [day 14 date], we will write to you again asking for payment under the guarantee.

Property Sauce, 020 8158 8434, admin@propertysauce.co

---

## R4. Day 14 final reminder before referral (email from Zoho CRM and first-class post)

Subject: Final reminder: rent arrears of £[balance] on [address]

Dear [full name],

**Balance outstanding:** £[balance] as at [date]
**Made up of:** [invoice date] £[amount]; [invoice date] £[amount]; interest from [date] £[interest] (clause [2.4 or 45], 3% above base rate)
**Your payment reference:** [REFERENCE]

We wrote on [day 1 date] and [day 7 date] and called on [day 3 date] and [day 10 date]. The rent remains unpaid and no payment plan has been agreed.

You have 7 days, until [day 21 date], to either pay the balance in full or agree a written payment plan with us.

If neither happens by [day 21 date]:

1. Your account will be passed to Marchbank & Vale Associates, a recoveries firm, who will write to you about recovering the debt.
2. Your landlord will begin recording the arrears against the grounds for possession in Schedule 2 of the Housing Act 1988. Three months' arrears is a mandatory ground.
3. Where there is a guarantor, they will be asked to pay.

None of that is what we want. Please call 020 8158 8434 or reply today.

[Free advice block]

Property Sauce, on behalf of [landlord name]
020 8158 8434, admin@propertysauce.co

## R4g. Day 14 guarantor demand

Subject: Request for payment under your guarantee: [address]

Dear [guarantor name],

Further to our letter of [day 7 date], the rent arrears on [tenant name]'s tenancy of [address] now stand at £[balance]. Under the guarantee you signed on [date] you agreed to pay any rent the tenant does not pay.

We ask you to pay £[balance] by [day 21 date] to the account on the attached statement, quoting [REFERENCE]G, or to contact us to agree a plan. If the balance is unpaid on [day 21 date] the account, including your guarantee, passes to Marchbank & Vale Associates for recovery.

Property Sauce, 020 8158 8434, admin@propertysauce.co

---

## R5. Day 21 referral notice (email from Zoho CRM)

Subject: Your rent account for [address] has been referred

Dear [full name],

As we said in our letter of [day 14 date], the arrears of £[balance] on [address] have today been passed to Marchbank & Vale Associates. They will write to you within a few days and may call you from [MV number]. Please deal with them directly about the arrears from now on.

Your tenancy continues and you must keep paying rent on the [day] of each month to the account on your invoice, reference [REFERENCE]. Repairs and anything else about the property still come to us on 020 8158 8434.

Property Sauce, on behalf of [landlord name]

---

## L1 to L4. Landlord updates (email, from admin@propertysauce.co)

**L1, day 7:** Subject: [address]: rent 7 days late. Body: rent of £[amount] due [due date] unpaid; contact made on day 1 and day 3 ([summary of what tenant said]); formal reminder sent today; guarantor [copied / none on file]; next step is a call on day 10 and a final reminder on day 14; no action needed from you.

**L2, day 14:** Subject: [address]: final reminder sent, arrears £[balance]. Body: what has been sent and said; guarantor asked to pay; if unpaid by day 21 the file goes to Marchbank & Vale Associates on [day 21 date]; tell us by then if you want anything done differently.

**L3, day 21:** Subject: [address]: referred to Marchbank & Vale. Body: file passed today with the arrears schedule attached; they will send a Letter of Claim giving 30 days; your rent statement this month will show the arrears position.

**L4, day 30 decision:** Subject: [address]: second month unpaid, your decision needed. Body: arrears now £[balance], two months; options with what each involves and when: (a) money claim only after the Letter of Claim period ends about [day 51 date]; (b) Section 8 notice on Grounds 10 and 11 now, discretionary, four weeks; (c) wait for three months' arrears about [day 90 date] and serve on Grounds 8, 10 and 11, Ground 8 mandatory; recommendation [x]; Universal Credit managed payment applied for [yes/no]; please reply with your choice by [date].

---

## MV1. Letter of Claim (Marchbank & Vale, post and email, Pre-Action Protocol for Debt Claims)

Letterhead: Marchbank & Vale Associates, Recoveries and Litigation Support. Footer: Marchbank & Vale Associates is a trading name of Sure Lets and Manage Limited, company number 16613860, registered office Lancaster House, Brownrigg Drive, Cramlington NE23 6UN. Never the words solicitor, lawyer, legal advice or legally qualified.

Dated and posted the same day. Enclosures: Information Sheet and Reply Form (Annex 1 to the Protocol), Financial Statement form (Annex 2), statement of account.

Dear [full name],

**Letter of Claim: rent arrears, [address]**

We act for [landlord name] ("the landlord") in recovering rent owed under your tenancy agreement dated [date] for [address].

**Amount owed:** £[balance] as at [date], made up as shown on the enclosed statement of account. This is rent due under the written tenancy agreement, of which you hold a copy; a further copy is available on request.

**Interest:** £[interest] to [date] under clause [2.4 or 45] of the agreement at 3% above Bank of England base rate, continuing at £[daily] a day.

**What we ask:** pay £[balance] within 30 days of the date of this letter to [landlord account name] using the enclosed details, reference [REFERENCE]MV; or complete and return the enclosed Reply Form within 30 days telling us how you propose to pay, with the Financial Statement if you are asking for time.

**If you do not reply within 30 days**, the landlord may start court proceedings against you for the debt without further notice beyond this letter, and you may become liable for court fees and interest.

**If you dispute the debt** or any part of it, say so on the Reply Form with your reasons and any documents, and we will consider them. We are willing to discuss the matter and to use an independent dispute resolution service if the debt is disputed.

**Free advice** is listed on the Information Sheet. You can also contact Citizens Advice 0800 144 8848, StepChange 0800 138 1111 or National Debtline 0808 808 4000.

Please quote [REFERENCE]MV in any contact. We can be reached at casework@marchbankvale.co.uk, by post at the address below, or on [MV number].

Yours sincerely,
Marchbank & Vale Associates

## MV2. Automated call script (Marchbank & Vale)

Opening, always: "This is an automated call from Marchbank & Vale Associates about the rent account for [address]. This call is recorded. Am I speaking with [full name]?" If no or unclear: "Please ask [full name] to call us on [MV number]. Goodbye." and end.

If yes: "The account shows £[balance] owed to [landlord name]. We wrote to you on [date]. Can you pay this in full in the next 7 days?" Yes: confirm date, "Please use reference [REFERENCE]MV. Thank you." and end. No: "We can agree a plan. What amount could you pay each month on top of your rent?" Accept within the envelope; otherwise "I will pass that to a colleague who will call you back within two working days." Any mention of illness, bereavement, job loss, abuse, a child at risk, a benefits delay, a dispute or a repair: "Thank you for telling me. I will stop this call here and a person will contact you within two working days." and end, flag record. Close every call: "You can reach a person at casework@marchbankvale.co.uk or on [MV number]. Goodbye."

Never: claim to be a person or a law firm; mention court unless the Letter of Claim has already been sent; call more than once a day; call before 9am, after 7pm, on a Sunday or a bank holiday.
