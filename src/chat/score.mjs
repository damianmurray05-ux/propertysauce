// Tenant scorecard. Turns the figures in the tenant directory into a score
// out of 100, a tier, and plain-English tips. All inputs come from the sheet;
// nothing is inferred or invented. Missing columns are treated as "no data"
// and score neutrally, never as a black mark.
//
// Directory columns used (all optional):
//   rent_history_12m   twelve characters, oldest first: O on time, L late, M missed, - not yet due
//   arrears            current arrears in pounds
//   noise_reports_12m  disturbance or noise complaints upheld in the last year
//   inspections_passed / inspections_total
//   tenancy_start      YYYY-MM-DD
//   reward_note        anything the team wants shown to this tenant

export const TIERS = [
  { name: "Platinum", min: 95 },
  { name: "Gold", min: 85 },
  { name: "Silver", min: 70 },
  { name: "Bronze", min: 50 },
  { name: "Building", min: 0 },
];

// Rewards are listed per tier. Anything in square brackets has not been
// confirmed by the team and is shown as "being finalised" rather than promised.
export const REWARDS = {
  Platinum: ["Priority booking for non-urgent repairs", "A landlord reference on request, same day", "[Renewal reward to be confirmed by the team]"],
  Gold: ["Priority booking for non-urgent repairs", "A landlord reference on request, same day"],
  Silver: ["A landlord reference on request"],
  Bronze: [],
  Building: [],
};

const n = (v) => { const x = Number(String(v ?? "").replace(/[£,\s]/g, "")); return Number.isFinite(x) ? x : null; };

export function scoreTenant(row) {
  const history = String(row.rent_history_12m || "").toUpperCase().replace(/[^OLM-]/g, "").slice(-12);
  const due = [...history].filter((c) => c !== "-").length;
  const onTime = [...history].filter((c) => c === "O").length;
  const late = [...history].filter((c) => c === "L").length;
  const missed = [...history].filter((c) => c === "M").length;
  let streak = 0;
  for (const c of [...history].reverse()) { if (c === "O") streak++; else if (c === "-") continue; else break; }

  const arrears = n(row.arrears);
  const noise = n(row.noise_reports_12m);
  const passed = n(row.inspections_passed), total = n(row.inspections_total);

  // Weights: rent on time 50, arrears 15, conduct 20, property care 15.
  const parts = [];
  const rentScore = due ? Math.round(50 * ((onTime + late * 0.5) / due)) : 50;
  parts.push({ key: "rent", label: "Rent paid on time", score: rentScore, max: 50, detail: due ? `${onTime} of ${due} payments on time${late ? `, ${late} late` : ""}${missed ? `, ${missed} missed` : ""}` : "No payments due yet" });
  const arrearsScore = arrears === null ? 15 : arrears <= 0 ? 15 : arrears < 250 ? 8 : 0;
  parts.push({ key: "arrears", label: "Account up to date", score: arrearsScore, max: 15, detail: arrears === null ? "No data" : arrears <= 0 ? "Nothing outstanding" : `£${arrears.toLocaleString("en-GB")} outstanding` });
  const conductScore = noise === null ? 20 : Math.max(0, 20 - noise * 7);
  parts.push({ key: "conduct", label: "Good neighbour", score: conductScore, max: 20, detail: noise === null ? "No data" : noise === 0 ? "No noise or disturbance reports" : `${noise} report${noise === 1 ? "" : "s"} in the last year` });
  const careScore = total ? Math.round(15 * ((passed || 0) / total)) : 15;
  parts.push({ key: "care", label: "Looking after the home", score: careScore, max: 15, detail: total ? `${passed || 0} of ${total} inspections passed` : "No inspections recorded yet" });

  const score = Math.max(0, Math.min(100, parts.reduce((a, p) => a + p.score, 0)));
  const tier = TIERS.find((t) => score >= t.min);
  const next = TIERS[TIERS.indexOf(tier) - 1] || null;

  const tips = [];
  if (late || missed) tips.push("Set the standing order for a day or two before the due date so a bank delay never makes a payment late.");
  if (arrears && arrears > 0) tips.push("Clear the balance, or ring us to agree a plan. An agreed plan protects your score.");
  if (noise) tips.push("Keep noise down after 11pm and warn neighbours before a gathering. Reports drop off the score after twelve months.");
  if (total && passed !== null && passed < total) tips.push("Before the next inspection: ventilate, keep the extractor on, and report anything broken through the assistant so it is on file.");
  if (!tips.length) tips.push("Keep doing exactly this. Report repairs early through the assistant and the score stays where it is.");

  return {
    score, tier: tier.name, next: next ? { name: next.name, pointsNeeded: next.min - score } : null,
    parts, history, streak, rewards: REWARDS[tier.name] || [], tips,
    rewardNote: row.reward_note || "",
    tenancyStart: row.tenancy_start || "",
  };
}
