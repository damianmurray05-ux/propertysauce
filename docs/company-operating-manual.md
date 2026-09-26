# Property Sauce — Company Operating Manual

Started 25 September 2026. This is the main operating manual for Property Sauce: handed to the team and to any future member of staff, and to be treated as the standing reference for how things are done here. It grows as the business is built — every hard rule, every "how this actually works" decision, goes here as it's made, not just left in a chat.

Each rule below names where it's also enforced, if anywhere — in code, in a specific Ops procedure, or in the assistant's own knowledge — so nobody has to guess whether writing it here alone was enough.

---

## Document handling

### Rule: what goes on a tenant's file

The only documents ever attached to a tenant's own Zoho Contact record are documents that tenant is allowed to see, and only the current, latest certificate of each kind — never the superseded one sitting behind it.

**Never** attach to a tenant's Contact record: mortgage or loan paperwork, insurance certificates, purchase or valuation documents, owner/management statements, utility or council tax bills, meter readings, or anything else that belongs to the landlord's own file.

**Why:** the tenant portal reads a tenant's documents only from their own Contact record (never the property's Landlord/Account record, which holds all of the above alongside the actual certificates). This rule is what actually keeps a tenant's document list correct — the code enforces a second, independent check on top of it, but that check is a backstop, not a substitute for getting this right at the point of filing.

**Enforced by:** the team, when filing a certificate (see `docs/ops/07-certificates-and-licences.md`, "Hard rule"), and independently in code (`TENANT_VISIBLE_TYPES` in `src/chat/tenantfile.mjs`, covered by an automated test).

**The tenant-visible document kinds:** tenancy agreement, gas safety certificate, electrical installation report (EICR), energy performance certificate (EPC), property licence, inventory/inspection, deposit protection certificate. Nothing else, ever — see the approved list in `docs/tenant-landlord-document-visibility.md` for the full reasoning and the landlord-side equivalent.

---

## Letting a vacant property (Ops 1)

### Rule: pre-qualification pass/refer, never pass/reject by machine alone

When an applicant's pre-qualification is run automatically (through the website chat), a clean pass on the written criteria (move-in window, household fit, income at least 2.5x annual rent or benefits with a guarantor, no undischarged CCJ or bankruptcy, right to rent evidenced) goes straight through to booking a viewing.

Anything borderline — an undischarged CCJ, bankruptcy, income near the line, or anything else the written criteria doesn't cleanly answer — is **never auto-declined and never auto-accepted**. It is referred to a person, with what's known about the applicant summarised, so a human makes that call. The system should not quietly move on to a "better" applicant instead of dealing with a borderline one and skip telling anyone there was a decision to make — the referral has to happen regardless of whether it's likely to be acted on.

**Why:** this is Damian's own existing rule for the manual process (see `docs/ops/01-vacant-property-to-let.md`, step 5: "a discharged or explained one is put to Damian, not refused"), carried into the automated version rather than dropped for the sake of full autonomy. Confirmed 25 September 2026.

**Enforced by:** to be built into the assistant's own operating instructions (not just this manual) once the automated pre-qualification flow is built, so the AI agent conducting the conversation follows this rule directly rather than a human having to catch a mistake after the fact. Not yet built as of this entry — tracked here so the rule is decided before the build, not invented during it.

---

## OpenRent

### Fact: the account's registered email must be admin@propertysauce.co

OpenRent only accepts replies to applicants from the address registered on the account (3944818). It was changed to Lettings@propertysauce.co on 31 August 2026, which turned out to be a mistake — admin@ could not send as Lettings@, so every reply bounced from 2 September until 25 September, when it was changed back to admin@propertysauce.co and verified. Real cost while it was wrong: lost applicants, unanswered enquiries, and a formal warning from OpenRent that the advert would be cancelled.

**Never change the registered email away from admin@propertysauce.co** without confirming first that whichever mailbox is being registered can actually send from that exact address — the bounce is silent to us and only visible to the applicant, so a wrong setting here can run for weeks before anyone notices from this side.

### Standard replies once a property is gone or still available

Once the messaging bug above was fixed, replies no longer need to apologise for a delay - that apology was only for the backlog caused by the bug. The standing default wording, to use every time from now on:

**When a property has gone (default, used for a block with no vacancy right now):**
> Hi, thank you for your interest. This one has since gone, I'm afraid. We do believe we'll have another one becoming available in the coming weeks, and we'll be in touch as soon as it is. Kind regards, Property Sauce

**When a property is still available (default pre-qualification reply):**
> Hi, thank you for your interest. The property is still available. Before we book a viewing, could you answer a few quick questions:
> 1. Are you still looking, and when would you want to move?
> 2. Who would be living there, and any pets?
> 3. Your employer, role, how long you've been there, and gross annual income? (Same for anyone else whose income counts towards the rent.)
> 4. Any CCJs, IVAs, bankruptcy or rent arrears in the last six years?
> 5. Do you hold a UK or Irish passport - if not, what right-to-rent document do you have?
> 6. Will you need a guarantor?
> Once we have this we can get a viewing booked in. Kind regards, Property Sauce

**Enforced by:** to be wired into whatever sends automated OpenRent/website replies once that's built. Until then, the team sends these by hand. Confirmed 26 September 2026.

---

## Evergreen adverts and the property waitlist

### Rule: blocks of flats are advertised constantly, not just when a unit is vacant

Catterick House (42 flats) and Lancaster House (55 flats) each turn over roughly one flat every couple of months. Rather than taking the advert down between vacancies and starting from zero each time, **one advert per block runs permanently**, even when nothing is currently available. Lord Street may follow the same approach but is not decided yet. This does not apply to one-off single properties.

Every applicant who enquires while nothing is available is told the block "gone" reply above, and is added to a waiting list (name, phone, email, which building, which flat if known). When a flat in that block next becomes available, the whole waiting list for that building is emailed with a link to the listing. Nobody has to still be looking at the exact moment a flat comes up for this to work - a message to someone who registered a year ago and has since fallen out with their landlord can fill a flat with no fresh marketing at all.

**Where the list lives:** Zoho CRM's standard **Leads** module, used only for this. Not a new custom module (no extra Zoho module-creation permission needed, no extra cost) and not Excel. Reasons: it stays completely separate from Accounts (Landlord) and Contacts (Tenant) - a waitlist entry is someone who is neither yet; and Zoho's own mailing tool, **Zoho Campaigns**, syncs natively from Leads, so "email everyone on the list" does not need Mailchimp or any other third party wired in separately. Deduplicated by phone number when adding a new entry, so a repeat enquirer updates their existing entry rather than creating a second one.

**Enforced by:** `addToWaitlist()` in `src/chat/zoho.mjs`. Not yet wired into anything that calls it automatically (OpenRent enquiries, the phone agent, the website) - that's the next step. Historical applicants from past Lancaster House and Catterick House adverts are being backfilled from OpenRent's enquiry history separately. Confirmed 26 September 2026.

---

## Lancaster House - which room-let disclosure applies to which flat

Lancaster House rooms are let on a house-share basis (no separate postal address, electricity on a top-up meter, not currently banded for council tax). Two versions of the wording exist depending on whether water and Wi-Fi are included in the room's price - **always check the flat number below before replying**, since sending the wrong one misdescribes the room to an applicant.

**Draft A - water & Wi-Fi included:** flats 26a, 32c, 25a, 5a

**Draft B - one-bedroom, water & Wi-Fi extra (not included):** flats 32a, 32b, 6a, 1a, 2a, 3a, 4a

Both drafts also carry the standard six pre-qualification questions (see above). The exact wording for each is saved as a Note on that flat's own record in the Zoho CRM Landlord (Accounts) module, so it travels with the property even if this manual is out of date. Confirmed 26 September 2026 - more flats will be added to this list as Damian confirms them; treat any flat not listed here as undecided and check with him rather than guessing which draft applies.

---

## Phone agent (Inkbox) - open question on emergency guidance

The current call-agent instructions (`docs/inkbox-voice-instructions.md`) tell a caller to dial 999 for a fire. Flagging rather than changing silently: in the UK, 999 covers police, fire, ambulance and coastguard, so it is the correct number for a fire as well as police/ambulance - this may be worth double-checking before any wording change, since telling a caller in a genuine fire not to call 999 would be a real safety risk. Holding this instruction as-is until Damian confirms.

---

*Sections to come as they're built: full Ops 1 automated pre-qualification and viewing booking, OpenRent listing automation, the voice pipeline, and the rest of the numbered Ops procedures as each is finished and proven.*
