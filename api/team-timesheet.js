// GET /api/team-timesheet?key=...&month=YYYY-MM
//   Every finished shift that month, grouped by staff member, with totals —
//   what Damian pays people from. Key-protected the same way as
//   /api/team-admin, not a separate sign-in.
import { timingSafeEqual } from "node:crypto";
import { timesheet } from "../src/chat/shiftclock.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function authorised(supplied) {
  const want = process.env.STAFF_ADMIN_KEY || "";
  const a = Buffer.from(String(supplied || ""));
  const b = Buffer.from(want);
  if (!want || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const isMonth = (s) => /^\d{4}-\d{2}$/.test(s || "");

export async function GET(request) {
  const url = new URL(request.url);
  if (!authorised(url.searchParams.get("key"))) return json(404, { error: "not_found" });

  const monthParam = url.searchParams.get("month");
  const month = isMonth(monthParam) ? monthParam : new Date().toISOString().slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const from = `${month}-01`;
  const to = `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;

  const staff = await timesheet(from, to);
  return json(200, { month, from, to, staff });
}
