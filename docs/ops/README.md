# Property Sauce operations procedures

One file per operation, numbered 01 to 14. Each Claude Code chat named "Ops N" owns file N: it takes Damian's dictation of how the job is done today, writes the procedure, agrees the decision limits, and builds whatever the website, Zoho or a Cowork routine needs. Cowork routines then run the operation day to day from the file.

Read first: docs/OPERATIONS-PLAN.md (principles, architecture, agents A to G, costs, decisions). Rules that apply to every operation:

1. Zoho CRM is the single source of truth. Every action is written to the record it concerns.
2. Nothing irreversible runs without a person: no payments out, no notices served, no agreements signed, no data deleted.
3. Certificate dates are set only from the document itself, never from a team member's word. Expired or expiring certificates go to #claude-urgent on Slack immediately.
4. Ownership of a property is the Established Landlord picklist on the Landlord record, never the email on the record.
5. Rent payments come from the Zoho Books bank feed, not Wise. Wise is only for direct Airbnb bookings at Luxe Stay.
6. Plain English to tenants and landlords. Always say who, how and when.
7. Bank account numbers never go into memory, docs, Slack or chat. They live in Zoho and the Drive sheet "Bank accounts by entity".

Build order: 03, 05 and 07 first (the website already does most of that work), then 04 once rent matching is wired to Zoho Books, then 01 and 02, then the rest.

| File | Operation |
|---|---|
| 01 | Vacant property to let |
| 02 | Tenant paperwork and due diligence |
| 03 | Tenant enquiries |
| 04 | Rent collection and arrears |
| 05 | Maintenance jobs |
| 06 | Contractor payments |
| 07 | Certificates and licences |
| 08 | Daily email monitoring |
| 09 | Notice, checkout and deposit return |
| 10 | Landlord statements and payouts |
| 11 | Renewals and rent increases |
| 12 | Complaints and redress |
| 13 | Block and freehold management |
| 14 | Bookkeeping and reporting |
