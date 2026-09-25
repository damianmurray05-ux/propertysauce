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

---

*Sections to come as they're built: full Ops 1 automated pre-qualification and viewing booking, OpenRent listing automation, the voice pipeline, and the rest of the numbered Ops procedures as each is finished and proven.*
