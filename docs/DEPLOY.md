# Going live

The site is static HTML plus two small server functions (the assistant and
tenant verification). Vercel hosts both from this GitHub repository and
redeploys automatically on every push to `main`. One-off setup, about twenty
minutes, then nothing to maintain.

## 1. Connect Vercel to the repository

1. Go to <https://vercel.com/signup> and sign up with the GitHub account
   `damianmurray05-ux`.
2. Click **Add New > Project**, choose `propertysauce`, and click **Import**.
   The build settings are read from `vercel.json`; leave them as they are.
3. Click **Deploy**. In about a minute you have a preview URL such as
   `propertysauce.vercel.app`. The site works immediately; the assistant
   shows phone and email until step 2 is done.

## 2. Add the keys

In the Vercel project, **Settings > Environment Variables**, add:

| Name | Value | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | From <https://console.anthropic.com> (API Keys) | The assistant |
| `CHAT_SECRET` | Any long random string, e.g. from <https://generate-secret.vercel.app/32> | Signing verification codes and sessions |
| `RESEND_API_KEY` | From <https://resend.com> after verifying the `propertysauce.co` domain there | One-time codes by email, job emails to the team, confirmations to tenants |
| `TENANT_DIRECTORY_URL` | See step 3 | Verifying tenants |

Optional:

| Name | Value | Needed for |
|---|---|---|
| `INKBOX_API_KEY`, `INKBOX_PHONE_NUMBER_ID`, `INKBOX_WEBHOOK_SECRET` | See "Texts, via Inkbox" below | One-time codes by text, on our own UK number |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | From <https://twilio.com> | Fallback SMS codes, only used when Inkbox is not configured |
| `MAINTENANCE_WEBHOOK_URL` | A Zapier or Make webhook | Pushing every job into Trello, a sheet, or anywhere else |
| `TEAM_EMAIL` | Defaults to `contact@propertysauce.co` | Where jobs and enquiries are sent |
| `CHAT_MODEL` | Defaults to `claude-opus-5` | Which model answers |

After adding variables, go to **Deployments** and click **Redeploy** on the
latest one.

## 3. Zoho CRM: tenants, landlords, properties, repairs and documents

The live site reads Zoho CRM directly, the same way the Sure Lets site does,
so there is nothing to keep in step: tenants verify against the "Tenant"
records (rent payment reference, email and mobile), landlords sign in with the
email address on their "Landlord" property records, certificates and rent come
from those records, repairs raised through the assistant become Maintenance
tickets with the photos attached, and the documents landlords see are the
attachments on their property records.

One-off setup, about five minutes, because this site needs wider permissions
than the Sure Lets one (properties, maintenance and attachments as well as
tenants):

1. Go to <https://api-console.zoho.com> signed in as the CRM admin. Open the
   existing **Self Client** (the one used for Marchbank and Sure Lets), or
   **Add Client > Self Client** if there is none.
2. Copy the **Client ID** and **Client Secret** from the Client Secret tab.
3. On the **Generate Code** tab, paste this scope exactly:
   `ZohoCRM.modules.contacts.READ,ZohoCRM.modules.accounts.READ,ZohoCRM.modules.custom.ALL,ZohoCRM.modules.attachments.ALL,ZohoCRM.settings.modules.READ,ZohoCRM.settings.fields.READ`
   Set duration to 10 minutes, any description, click **Create**, copy the code.
4. Within ten minutes, in a terminal on this machine, run
   `node scripts/zoho-token.mjs <client id> <client secret> <code>`.
   It writes `scripts/zoho.env` with the values Vercel needs.
5. In Vercel, **Add Environment Variable**, paste the whole contents of
   `scripts/zoho.env` into the Key box (Vercel splits it into the separate
   variables), save, redeploy, then delete `scripts/zoho.env`.

When the Zoho keys are present the sheet variables below are ignored.

## 3a. Fallback only: the tenant directory as a sheet

The assistant verifies a tenant by looking up their tenancy reference and
sending a code to the email or mobile on file. That list lives outside the
code, in a Google Sheet you control:

1. Create a Google Sheet with the columns in
   `docs/tenant-directory-template.csv`: `reference, name, email, phone,
   address, notes`. One row per tenancy. Phone numbers in international
   format (`+447700900000`).
2. **File > Share > Publish to web**, choose the sheet and **Comma-separated
   values (.csv)**, click **Publish**, and copy the link.
3. Paste that link as `TENANT_DIRECTORY_URL` in Vercel. Changes to the sheet
   are picked up within five minutes.

Give every tenant their reference (it is what they will be asked for). The
format `PS-1234` is a suggestion; anything unique works.

## 3b. Fallback only: the landlord portal sheets

Landlords sign in the same way tenants do, and see their properties scored,
with certificates and documents. It reads three more sheets, or three tabs of
one Google Sheet, each published to the web as CSV like the tenant directory:

| Variable | Template | What it holds |
|---|---|---|
| `LANDLORD_DIRECTORY_URL` | `docs/landlord-directory-template.csv` | One row per landlord: reference, name, email, phone |
| `PROPERTY_DIRECTORY_URL` | `docs/property-directory-template.csv` | One row per property: landlord reference, rent figures, certificate expiry dates |
| `DOCUMENT_DIRECTORY_URL` | `docs/document-directory-template.csv` | One row per document: property reference, type, title, date, a Google Drive link |

Put the documents themselves in Google Drive, one folder per property, and
paste each file's share link into the documents sheet. Set the link to
"anyone with the link can view": the portal only shows a landlord links for
their own properties, but the Drive link itself is the thing that opens the
file, so keep it unguessable and do not post it anywhere else. Update the
property sheet when you send the monthly statement; the portal reflects it
within five minutes.

## 4. Email sending

Codes and job notifications go out through Resend. The domain
`propertysauce.co` is added in Resend (region Ireland, return path `send`).
These are the records it needs in the domain's DNS (see step 5). Until they
are in place and Resend shows the domain as verified, keep `MAIL_FROM` on
`onboarding@resend.dev`; afterwards set it to
`Property Sauce <assistant@propertysauce.co>`.

| Type | Host | Value |
|---|---|---|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8Io/brmzr+TRFuOdWMdLruA8m+iGylv1D+UDvFYBqmALyWU+X1uK4qMPsWLXdxpVLJwUDamR/+jCi+Gm/Q71HZQKCvYfV8MfDFYQWfHtojd0WH00g6viBZ465M8hwM7tXkmpWNRioFmSWQV0WUYKZ3Xvnl+R/OynbH/l/B7VpqQIDAQAB` |
| CNAME | `rsend` | `rsend-euw1.forge.rmta.net` |
| CNAME | `send` | `send.forge.rmta.net` |
| TXT | `_dmarc` | `v=DMARC1; p=none;` (optional) |

## 4a. Texts, via Inkbox

The site has its own UK mobile number for one-time codes and inbound
replies: **+44 7457 410735**, agent identity `@propertysauce`,
`propertysauce@inkboxmail.com`. Set up once:

1. In the [Inkbox console](https://inkbox.ai/console/api-keys), create an
   API key scoped to the `@propertysauce` identity (not "Admin (all)").
   Copy the value shown — it is shown once only — into `INKBOX_API_KEY`.
2. `INKBOX_PHONE_NUMBER_ID` is fixed: `52c81de9-a09a-4997-bd7f-56ae78380cee`.
   It identifies the number, not a secret, and is already in `.env.example`.
3. Create the inbound webhook subscription (one-off, via `curl` or the
   console's Webhooks page): owner `phone_number_id` above, URL
   `https://propertysauce.co/api/inkbox-webhook/` **with the trailing
   slash** — this site redirects every route to one
   (`vercel.json` → `trailingSlash: true`), and a redirect does not reliably
   carry a POST body from an external sender — and event types
   `text.received`, `text.sent`, `text.delivered`, `text.delivery_failed`,
   `text.delivery_unconfirmed`. The response's one-time `signing_key` field
   is `INKBOX_WEBHOOK_SECRET`; it is shown once and cannot be fetched again.
4. Add all three to Vercel and redeploy.

Sending is tried through Inkbox first (see `src/chat/notify.mjs`); Twilio is
only used as a fallback when Inkbox is not configured. Inbound texts that
are a genuine reply (`text.received`) are forwarded to `TEAM_EMAIL`;
delivery receipts are logged, not emailed.

**Known limit (24 Sep 2026):** Inkbox currently refuses to send to any
recipient who has not first texted `START` to the number (`403
recipient_not_opted_in`), a rule meant for US carriers. Inkbox has agreed to
lift it for UK-to-UK numbers like ours but had not done so as of this
writing — until then, a one-time code sent to someone who has never texted
us will fail with that error (surfaced as `SmsNotOptedInError` from
`sendSms`). Email codes are unaffected. Calling is not available yet either:
Inkbox is still waiting on Anthropic for AI-call support.

## 5. Point the domain at Vercel

In the Vercel project, **Settings > Domains**, add `propertysauce.co` and
`www.propertysauce.co`. Vercel shows the DNS records to create. The domain's
DNS is currently at Squarespace Domains (formerly Google Domains): sign in
there, open the DNS settings for `propertysauce.co`, and add

- an `A` record for `@` pointing to `216.198.79.1`
- a `CNAME` record for `www` pointing to `3a647868d5b71d9d.vercel-dns-017.com`

plus the Resend records from step 4. First delete the Squarespace domain
forwarding rule (Website tab, Domain Forwarding) that sends the domain to
`www.propertysauce.org`; it owns the old `@` and `www` records. Squarespace
asks you to sign in with Google (`damian@propertysauce.co`) before it will
change anything. Leave every Google Workspace record alone: the five `MX`
records, the `spf1` TXT, `google._domainkey`, the `googlehosted` CNAME and
the `mail` A record all carry the company email. DNS takes up to an hour to
move across; Vercel issues the SSL certificate itself.

`propertysauce.org` (the old Wix site's domain) expired on 25 August 2026 and
by 14 September 2026 had dropped out of the .org registry entirely, so it
cannot be renewed, only registered again. Once re-registered, forward it to
`https://propertysauce.co` and add it back as a secondary domain in Google
Workspace if mail to it still matters.

## Testing the assistant before tenants use it

- Add yourself to the tenant sheet with your own email and reference `PS-0001`.
- Open the site, click **Report a repair or ask a question**, choose **Report
  a repair**, enter `PS-0001`, and choose email. The code arrives from
  `assistant@propertysauce.co`.
- Describe a fault and attach a photo. You should receive the job email at
  `contact@propertysauce.co` and a confirmation at your own address.

## Running it locally

```bash
npm install
cp .env.example .env     # fill in at least ANTHROPIC_API_KEY and CHAT_SECRET
node build.mjs
node server.mjs          # http://localhost:4323
```

Set `CHAT_DEV_ECHO_CODE=1` and `TENANT_DIRECTORY_JSON='[{"reference":"PS-0001","name":"Test Person","email":"you@example.com","phone":"","address":"1 Test Street"}]'`
in `.env` to try verification without an email provider: the code is shown in
the chat.
