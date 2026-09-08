# Property Sauce

Website, brand package and AI assistant for Property Sauce, the lettings,
block and portfolio management, and property acquisition business of Sure
Lets and Manage Limited. Live at https://propertysauce.co once deployed (see
`docs/DEPLOY.md`).

Static HTML built by a small script, no framework, plus two serverless
functions for the assistant. Node 20+.

```bash
npm install            # only the Anthropic SDK, for the assistant
node build.mjs         # build to dist/
node audit.mjs         # links, alt text, metadata, copy and JSON-LD checks (runs in CI)
node server.mjs        # preview at http://localhost:4323 with the API mounted
node scripts/brand.mjs # regenerate logo files, favicon and social image
```

## Layout

| Path | Purpose |
|---|---|
| `src/pages/*.html` | One file per page: a front-matter block, then the page body |
| `src/layout.mjs` | Site facts (name, phone, address, company numbers), head with SEO and JSON-LD, header, footer, assistant shell |
| `src/chat/knowledge.mjs` | What the assistant knows. Edit this to change what it tells tenants |
| `src/chat/prompt.mjs` | The assistant's instructions per mode |
| `src/chat/tools.mjs` | What happens when the assistant raises a repair or logs an enquiry (email, webhook) |
| `src/chat/directory.mjs` | Tenant lookup from the Google Sheet or JSON directory |
| `api/chat.js`, `api/verify.js` | The two server functions (Vercel) |
| `assets/css/tokens.css` | Colour, type, spacing and motion tokens, plus the self-hosted fonts |
| `assets/css/main.css` | The design system and every component |
| `assets/js/main.js` | Progressive enhancement: header, menu, reveals, contact form |
| `assets/js/assistant.js` | The assistant UI: verification flow, conversation, photos |
| `assets/img/` | Photography, three sizes each. Credits in `src/pages/credits.html` |
| `public/brand/` | Logo files (SVG and PNG) and the brand guidelines PDF |
| `docs/DEPLOY.md` | Going live, step by step |

## How the assistant works

1. A tenant clicks **Report a repair** and enters their tenancy reference.
2. `api/verify.js` finds them in the tenant directory and sends a six-digit
   code to the email or mobile on file (Resend for email, Twilio for SMS).
   The challenge is a signed token; nothing is stored server-side.
3. The tenant enters the code and receives a signed session valid for two
   hours. Their name and address are attached to the conversation from our
   records, never from what they type.
4. `api/chat.js` runs the conversation with Claude. The model has three
   tools: `raise_repair`, `log_tenancy_question` and `handoff_to_team`. Each
   emails the team, sends a confirmation to the person, and posts to a webhook
   if one is configured. A job reference (`PS-yymmdd-nnn`) is returned.
5. Prospective tenants and enquirers skip verification and use the same
   conversation with different instructions.

If the API is not deployed or a key is missing, the assistant falls back to
phone and email so the site never dead-ends.

## Editing

- Copy: `src/pages/`. Contact details and company numbers: `src/layout.mjs`.
- Anything in `[square brackets]` on a page is a placeholder waiting for a real
  figure. Do not fill one in with a guess; the audit blocks placeholders from
  reaching structured data but they are visible on the page by design.
- The audit fails the build on em dashes, missing alt text, broken links,
  missing descriptions and invalid JSON-LD.

## Photography

Interiors and terraces are the group's own. Five building photographs are
Creative Commons from Wikimedia Commons and credited at `/credits/`.
