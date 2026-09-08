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
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | From <https://twilio.com> | One-time codes by text message |
| `MAINTENANCE_WEBHOOK_URL` | A Zapier or Make webhook | Pushing every job into Trello, a sheet, or anywhere else |
| `TEAM_EMAIL` | Defaults to `contact@propertysauce.co` | Where jobs and enquiries are sent |
| `CHAT_MODEL` | Defaults to `claude-opus-5` | Which model answers |

After adding variables, go to **Deployments** and click **Redeploy** on the
latest one.

## 3. The tenant directory

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

## 4. Email sending

Codes and job notifications go out through Resend. In Resend, add the domain
`propertysauce.co` and copy the three DNS records it gives you into the
domain's DNS (see step 5). Until the domain is verified, Resend will only
deliver to your own address, which is fine for testing.

## 5. Point the domain at Vercel

In the Vercel project, **Settings > Domains**, add `propertysauce.co` and
`www.propertysauce.co`. Vercel shows the DNS records to create. The domain's
DNS is currently at Squarespace Domains (formerly Google Domains): sign in
there, open the DNS settings for `propertysauce.co`, and add

- an `A` record for `@` pointing to Vercel's IP (shown in Vercel, currently `76.76.21.21`)
- a `CNAME` record for `www` pointing to `cname.vercel-dns.com`

plus the Resend records from step 4. Delete the old Squarespace website
records for `@` and `www` at the same time. DNS takes up to an hour to move
across; Vercel issues the SSL certificate itself.

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
