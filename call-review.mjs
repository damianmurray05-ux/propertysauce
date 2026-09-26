#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Read back what the phone agent (Alex) actually said, and flag where it
// went wrong. Ported from Luxe Stay's call-review.mjs (26 Sep 2026), after a
// day of live testing there found real faults nobody had noticed by ear.
// Same Inkbox hosted agent, same model, same voice - so the same checks
// apply here, minus the capacity check, which is meaningless for lettings
// (there is no "sleeps six" equivalent for a flat).
//
// Deliberately DETERMINISTIC: no model judgement, just rules with an
// obvious right answer, because a reviewer that cries wolf gets ignored.
// Anything needing judgement is left for a human to read in the transcript,
// which is why every finding prints the line it came from.
//
//   INKBOX_API_KEY=... node --use-env-proxy call-review.mjs [--days 1] [--json]
// ---------------------------------------------------------------------------

const API = 'https://inkbox.ai/api/v1';
const KEY = process.env.INKBOX_API_KEY;
if (!KEY) { console.error('INKBOX_API_KEY is not set.'); process.exit(2); }

const argv = process.argv.slice(2);
const days = Number(argv[argv.indexOf('--days') + 1]) || 1;
const asJson = argv.includes('--json');

const get = async (path) => {
  const res = await fetch(`${API}${path}`, { headers: { 'X-API-Key': KEY } });
  if (!res.ok) throw new Error(`${res.status} on ${path}`);
  return res.json();
};

const since = new Date(Date.now() - days * 864e5);
const spoken = (segs) => segs.filter((s) => s.party === 'local');
const heard  = (segs) => segs.filter((s) => s.party === 'remote');

const checks = [
  {
    id: 'hung-up',
    // The one Ollie kept doing at Luxe Stay. ended_by "local" means Alex put
    // the phone down himself, which the brief now explicitly forbids.
    test: ({ call }) => call.ended_by === 'local',
    say: () => 'Alex ended the call himself. He is told never to hang up.',
  },
  {
    id: 'no-goodbye',
    test: ({ segs }) => {
      const last = spoken(segs).slice(-1)[0];
      return last && !/good ?bye|bye for now|take care/i.test(last.text);
    },
    say: ({ segs }) => `Last thing he said was "${spoken(segs).slice(-1)[0].text.slice(0, 70)}" — no goodbye.`,
  },
  {
    id: 'greeting',
    test: ({ segs }) => {
      const first = spoken(segs)[0];
      return first && !(/property ?sauce/i.test(first.text) && /alex/i.test(first.text));
    },
    say: ({ segs }) => `Opened with "${spoken(segs)[0].text.slice(0, 70)}" — should name both Property Sauce and Alex.`,
  },
  {
    id: 'language',
    // A mis-transcription once flipped a whole Luxe Stay call into Arabic.
    test: ({ segs }) => spoken(segs).some((s) => /[^\u0000-ɏ -⁯]/.test(s.text)),
    say: ({ segs }) => {
      const s = spoken(segs).find((x) => /[^\u0000-ɏ -⁯]/.test(x.text));
      return `Spoke outside the Latin alphabet: "${s.text.slice(0, 60)}"`;
    },
  },
  {
    id: 'quoted-price',
    // The brief says never to quote fees, prices or rent figures aloud.
    test: ({ segs }) => spoken(segs).some((s) => /£\s?\d|\d+\s?(pounds|quid)/i.test(s.text)),
    say: ({ segs }) => {
      const s = spoken(segs).find((x) => /£\s?\d|\d+\s?(pounds|quid)/i.test(x.text));
      return `Said a price aloud: "${s.text.slice(0, 80)}"`;
    },
  },
  {
    id: 'promised-no-enquiry',
    // He said a text/callback was coming; nothing was recorded to action it.
    test: ({ segs, items }) =>
      spoken(segs).some((s) => /I'?ll text|text you|send you.*(link|price)|call you back/i.test(s.text))
      && items.length === 0,
    say: () => 'Promised a text or callback but nothing was recorded for anyone to follow up.',
  },
  {
    id: 'no-record',
    test: ({ segs, items }) => heard(segs).length > 2 && items.length === 0,
    say: () => 'A real conversation with nothing recorded for anyone to follow up.',
  },
];

const calls = (await get('/phone/calls?limit=100'))
  .filter((c) => new Date(c.started_at) >= since && c.status === 'completed');

const findings = [];
for (const summary of calls) {
  const [call, segs] = await Promise.all([
    get(`/phone/calls/${summary.id}`),
    get(`/phone/calls/${summary.id}/transcripts`).catch(() => []),
  ]);
  if (!segs.length) continue;
  const items = call.post_call_action_items ?? [];
  const ctx = { call, segs, items };
  const hits = checks.filter((c) => { try { return c.test(ctx); } catch { return false; } });
  if (hits.length) {
    findings.push({
      id: call.id,
      at: call.started_at,
      from: call.remote_phone_number,
      direction: call.direction,
      issues: hits.map((h) => ({ id: h.id, detail: h.say(ctx) })),
    });
  }
}

if (asJson) {
  console.log(JSON.stringify({ reviewed: calls.length, since: since.toISOString(), findings }, null, 2));
} else {
  console.log(`\nReviewed ${calls.length} call${calls.length === 1 ? '' : 's'} since ${since.toISOString().slice(0, 16).replace('T', ' ')}\n`);
  if (!findings.length) { console.log('  Nothing to flag.\n'); }
  for (const f of findings) {
    console.log(`  ${f.at.slice(0, 16).replace('T', ' ')}  ${f.direction}  ${f.from}`);
    for (const i of f.issues) console.log(`     [${i.id}] ${i.detail}`);
    console.log(`     https://inkbox.ai/console/calls/${f.id}\n`);
  }
  console.log(`  ${findings.length} of ${calls.length} calls have something worth reading.\n`);
}
