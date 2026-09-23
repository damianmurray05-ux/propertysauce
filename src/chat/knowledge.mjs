// What the assistant knows about renting with Property Sauce. Plain text,
// read by the model on every conversation. Edit freely; keep it true.
// Anything in [square brackets] is not yet confirmed: the assistant will say
// the team must confirm it rather than guess.

export const knowledge = `
## Property Sauce
Property Sauce is a trading name of Sure Lets and Manage Limited (company number 16613860). It lets and manages residential property across England for private, corporate and institutional landlords, manages blocks and portfolios, and buys blocks of flats for its own account. Sister brands: Sure Lets & Manage (lettings for individual landlords) and Luxe Stay (serviced and short-stay homes). Office: Top Floor, 55 Coopers Lane, Leyton, London E10 5DG. Phone +44 (0)20 8988 8434, Monday to Friday 9am to 6pm. Email contact@propertysauce.co. Property Redress Scheme member PRS058008. ICO registration ZC027659.

## Emergencies (tell the tenant to phone, do not just log it)
- Smell of gas: leave the property, do not use switches, call the National Gas Emergency Service on 0800 111 999, then ring us.
- No heating or hot water in cold weather, a leak that cannot be stopped, no electricity, no water, sewage backing up, a broken external door or window that cannot be secured, a fire (call 999 first), carbon monoxide alarm sounding (leave, call 0800 111 999).
- For all of these: ring +44 (0)20 8988 8434 at any hour; out of hours the call goes to the on-call member of the team for the area (Vera for London, Ali for Catterick House and Blackpool, Dave for Lancaster House). Log the report as well so there is a record.

## Reporting a repair
- Existing tenants verify with the email address or mobile number we hold for them, or their tenancy reference, and a one-time code sent to that email or mobile.
- We need: what is wrong, where in the property, when it started, whether it is getting worse, photographs if possible, the best phone number, and when access is convenient. Contractors need access; if the tenant is out, whether we may use management keys.
- After the report: the team reviews it the same working day, instructs a contractor, and the contractor arranges access with the tenant. Timescales by urgency: emergencies attended within 24 hours; urgent (affects health, safety or security, or will worsen) within three working days; routine within ten working days. In-house repairs up to £150 of labour and £100 of materials are done without waiting for landlord approval; anything larger needs the landlord to approve a quote, and the tenant is kept informed.
- Landlord's responsibility (Landlord and Tenant Act 1985 s11): structure and exterior, heating and hot water, water, gas and electricity installations, sanitary ware, drains. Also smoke and carbon monoxide alarms, and keeping the home free of hazards including damp and mould.
- Tenant's responsibility: keeping the home clean and ventilated, light bulbs and smoke alarm batteries where accessible, blockages caused by misuse, minor tasks like bleeding radiators, reporting problems promptly, garden upkeep if the tenancy says so, damage caused by the tenant or their guests.
- Damp and mould: always take it seriously. Ask for photographs, whether it is worsening, and whether there is a leak. Under Awaab's Law arrangements the landlord must investigate and act to fixed timescales: we inspect damp or mould within five working days of a report, sooner if anyone in the home is vulnerable, and start remedial work within ten working days of the inspection.

## Tenancies with us (England, from 1 May 2026 under the Renters' Rights Act 2025)
- All new and existing tenancies are periodic assured tenancies rolling monthly. No fixed terms.
- The tenant may end the tenancy with two months' written notice at any time.
- The landlord may only seek possession on a statutory ground (for example selling, moving in, serious arrears, antisocial behaviour) with the proper notice, and cannot use the selling or moving-in grounds in the first twelve months.
- Rent is paid monthly in advance by standing order to the account named in the agreement. Rent in advance is limited to one month. We do not accept offers above the advertised rent.
- Rent may be increased once a year by a Section 13 notice giving at least two months' notice; the tenant can challenge it at the First-tier Tribunal.
- Deposit: at most five weeks' rent (ours is normally one month's rent), protected with Mydeposits within 30 days, with the prescribed information and certificate given to the tenant. Some older tenancies are with the TDS; the certificate on the tenant's file says which.
- Holding deposit: one week's rent, taken on a signed form once an applicant wants to proceed, and refunded once the agreement is signed and the first month's rent and the deposit have cleared. It can be kept only if the applicant withdraws, fails right to rent, or gives false information.
- Permitted payments only: rent, deposit, holding deposit, reasonable costs for lost keys, late rent interest after 14 days, and changes requested by the tenant. No admin fees.
- Pets: the tenant may ask in writing; we respond within 28 days and can only refuse for a reasonable ground. Pet insurance may be required.
- Inspections: every six months in London, Saffron Walden and Blackpool, every three months at Catterick House and Lancaster House, always with at least 24 hours' written notice at a reasonable time. Vera inspects in London, Ali at Catterick House, Dave and Ali at Lancaster House.
- Referencing: identity, right to rent (Immigration Act), income or a guarantor, and a previous landlord reference where there is one. We do not refuse applicants because they have children or receive benefits.
- Documents given at the start: tenancy agreement, the government's Renters' Rights Act information sheet (which replaced the How to Rent guide in May 2026), EPC, gas safety certificate where the property has gas, electrical safety report, deposit protection certificate and prescribed information, the inventory, and any licence details. Copies are on the tenant's file and can be re-sent on request.
- Bills: unless the agreement says otherwise the tenant pays council tax, gas, electricity, water, broadband and TV licence, and is responsible for contents insurance for their own belongings.
- Ending the tenancy: two months' notice in writing from the tenant; check-out inspection against the inventory; deposit returned within 10 days of agreeing deductions, disputes go to the scheme's free adjudication.
- Complaints: in writing to contact@propertysauce.co; acknowledged within three working days, full reply within fifteen; then review by a director; then the Property Redress Scheme, free to the tenant.

## Tenant scorecard
- Every tenant has a score out of 100 at propertysauce.co/my-tenancy/ after signing in with their reference and a one-time code. Four parts: rent paid on time (50), account up to date (15), good neighbour with no upheld noise reports (20), home looked after at inspections (15). Tiers: Platinum 95+, Gold 85+, Silver 70+, Bronze 50+.
- Rewards: Silver and above can have a landlord reference on request; Gold and Platinum get priority booking for non-urgent repairs and a same-day reference. Scores update when the file is updated, usually monthly. If a tenant thinks a figure is wrong, log it for the team.

## Landlord portal
- Landlords sign in at propertysauce.co/landlord-portal/ with their landlord reference (format PSL-1234, on the management agreement and statements) and a one-time code. They see each property scored out of 100 (rent collected 35, paid on time by the tenant 20, paid to the landlord on time 15, certificates and compliance 30), with green, amber and red, plus every document: tenancy agreements, gas safety, EICR, EPC, licences, inventories, rent invoices and statements. If a landlord cannot find their reference, take their details and pass to the team.

## Calculators on the website
- Lease extension calculator at /leasehold-calculator/ (statutory method, marriage value under 80 years, option for the 2024 Act method). Capital gains tax calculator at /capital-gains-tax-calculator/ (residential property, 2025 to 2026 figures). Both are estimates, not advice.

## Prospective tenants agreeing a new tenancy
- The assistant can explain the standard terms above and note requested changes (for example start date, pets, decorating, additional occupier, guarantor) for a member of staff to confirm. It cannot agree changes itself.
- Before move-in the tenant needs: right to rent documents, references completed, the holding deposit paid, the first month's rent and the deposit cleared, and the agreement signed by all parties.
- Nothing said by the assistant overrides the written tenancy agreement.

## Landlords, owners and sellers
- Private landlords: fully managed, rent collection or let only. Full management from 8% of the rent collected; exact fees quoted in writing after an appraisal.
- Corporate and institutional landlords: whole-portfolio management with monthly reporting, compliance tracking and arrears management.
- Block management: service charge budgets and accounts, contractors, fire and building safety, insurance, leaseholder communication, for freeholders, RTM companies and institutions.
- Acquisition: Property Sauce buys blocks of flats, converted buildings, HMOs and small portfolios across England for its own account, including distressed, part-let, receivership and probate stock. Indicative figure within days, proof of funds available, completion on the seller's timetable.
- The assistant should take the enquirer's name, contact details and a summary and pass it to the team; it must not quote fees or prices.
`;
