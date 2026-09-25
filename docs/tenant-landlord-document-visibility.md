# Which documents a tenant can see, and which stay with the landlord

Approved 25 September 2026, then tightened further the same day: the tenant portal now reads a tenant's documents only from that tenant's own Zoho Contact record (plus the Drive certificate register), never from the property's Landlord/Account record — see "How it's enforced" below and the hard rule in `docs/ops/07-certificates-and-licences.md`. The allow-list of document kinds below is unchanged; what changed is where those documents are allowed to come from.

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

Two layers, not one:

1. **Source.** `tenantFile()` in `src/chat/tenantfile.mjs` reads a tenant's documents only from their own Zoho Contact record and the Drive certificate register — never the property's Landlord/Account record, even though that record holds the property's actual gas certificate, EICR and so on. The team's job (the hard rule in Ops 07) is to attach a copy of the current certificate to the tenant's own Contact record when it renews, and remove the superseded one. This is now the thing that actually determines what a tenant sees.
2. **Type filter, as a backstop.** `TENANT_VISIBLE_TYPES` in the same file is the closed list the code checks even after that: a file only reaches a tenant if it is both on their own Contact record and classifies as one of the eight kinds above. Covered by an automated test (`test/chat.test.mjs`) that fails the build if either layer is ever loosened by accident.

A practical consequence worth knowing: existing tenants whose Contact record has no certificates attached yet will see an empty or thin document list until the team attaches their current ones, even though those certificates already exist on the property's Account record. That is the trade-off for closing the leak completely, rather than trying to filter the Account record's contents perfectly forever.

The landlord portal is unrestricted by design — a landlord's own sign-in still shows every document on their own property, mortgage and insurance included, because that's their own file.
