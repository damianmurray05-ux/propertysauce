# Which documents a tenant can see, and which stay with the landlord

For approval, 25 September 2026. Once approved, this is the exact list already hardwired into the site — nothing changes on the site until you say so; this is the record of what it currently does.

## A tenant may see (and only these)

| Kind | What it covers | Legal basis |
|---|---|---|
| Tenancy agreement | The signed AST/agreement itself | The tenant's own contract |
| Gas safety certificate (CP12) | Annual gas safety check | Must be given to the tenant by law, where the property has gas |
| Electrical installation report (EICR) | Electrical safety check | Must be given to the tenant by law |
| Electrical certificate | Any other electrical certificate on file | Same basis as EICR |
| Energy performance certificate (EPC) | The property's EPC rating | Must be given to the tenant by law |
| Property licence | Selective licence, HMO licence, etc. | Relevant to the tenant's right to occupy |
| Inventory and inspection | Check-in/check-out inventory, inspection reports | Concerns the tenant's own occupation |
| Deposit protection certificate | Confirms which scheme and that it's protected | Must be given to the tenant by law |

Nothing else is ever shown, including anything the system cannot classify into one of these eight kinds — an unrecognised file is withheld by default, not shown as "other."

## Stays with the landlord only, never shown to a tenant

| Kind | Examples on file today |
|---|---|
| Mortgage and loan paperwork | Mortgage statements, redemption statements, completion statements, loan offer letters, lender correspondence |
| Insurance | Landlord's buildings insurance certificate |
| Purchase and valuation | Completion statements, valuation letters |
| Owner/management statements | Rent remittance statements to the landlord (different from a statement sent to a tenant) |
| Utility and council tax bills | The landlord's copies of these |
| Meter readings | Move-in/void meter readings on the landlord's file |
| Anything not on the tenant list above | By default — see note above |

## How it's enforced

Not a checklist someone has to remember: `TENANT_VISIBLE_TYPES` in `src/chat/tenantfile.mjs` is the one list the code checks against every time a signed-in tenant asks for their documents, on the website and through the assistant. A file only reaches a tenant if it's on that list. Covered by an automated test (`test/chat.test.mjs`) that fails the build if it's ever loosened by accident.

The landlord portal is unrestricted by design — a landlord's own sign-in still shows every document on their own property, mortgage and insurance included, because that's their own file.
