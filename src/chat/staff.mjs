// The office staff directory: who can sign in to the shift clock, and with
// what code. Same convention as src/chat/directory.mjs (the tenant
// directory) — never committed, provided as JSON in an environment
// variable. Columns: name, username, code. No titles — just names.
//
//   STAFF_DIRECTORY_JSON   JSON array, e.g.
//     [{"name":"Usman Tufail","username":"usman","code":"4821"}]
//
// "remote": true on a row (e.g. Serat, who works from home out of office
// hours) means the office Wi-Fi/GPS check never applies to that person —
// there is no building for them to be "at". See assess() in shiftclock.mjs.

const normaliseName = (n) => String(n || "").trim().toLowerCase().replace(/\s+/g, " ");

function loadRows() {
  if (!process.env.STAFF_DIRECTORY_JSON) return [];
  try { return JSON.parse(process.env.STAFF_DIRECTORY_JSON); } catch { return []; }
}

export const staffConfigured = () => Boolean(process.env.STAFF_DIRECTORY_JSON);

export const staffSlug = (name) => normaliseName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Loose name matching, same reasoning as the tenant directory and Luxe
 * Stay's team sign-in: the CODE is the credential, the name only has to
 * identify which row. A first name, a username, or the full name all work.
 */
function nameLooksLike(rowName, rowUsername, typed) {
  const a = normaliseName(rowName);
  const u = normaliseName(rowUsername);
  const b = normaliseName(typed);
  if (!b) return false;
  if (b === a || b === u) return true;
  const partsA = a.split(" ").filter(Boolean);
  const partsB = b.split(" ").filter(Boolean);
  if (partsB.length === 1) {
    const one = partsB[0];
    return partsA.some((w) => w === one || (one.length >= 3 && w.startsWith(one)));
  }
  const setA = new Set(partsA);
  return partsB.every((w) => setA.has(w)) || partsA.every((w) => partsB.includes(w));
}

/** Find a staff member by name (or username) and personal code. */
export function findStaff(name, code) {
  const typed = normaliseName(name);
  const supplied = String(code || "").trim();
  if (!typed || !supplied) return null;
  const hits = loadRows().filter((r) => {
    if (String(r.code || "").trim() !== supplied) return false;
    return nameLooksLike(r.name, r.username, typed);
  });
  return hits.length === 1
    ? { name: hits[0].name.trim(), username: hits[0].username || null, remote: Boolean(hits[0].remote) }
    : null;
}

/** The full roster, for the admin view. Codes are never returned here. */
export function roster() {
  return loadRows().map((r) => ({ name: (r.name || "").trim() })).filter((r) => r.name);
}
