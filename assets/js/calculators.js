/* Property Sauce calculators. Everything runs in the browser; nothing is sent anywhere. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const gbp = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const num = (el) => Math.max(0, Number(el.value) || 0);

  /* ---------- Lease extension ---------- */
  const lease = $("#lease-calc");
  if (lease) {
    // Indicative relativity of an unexpired lease to the freehold value, by years
    // remaining. A smoothed reading of the published graphs valuers use; real
    // cases use a specific graph and argue about it.
    const REL = [[10, 15], [20, 27], [25, 35], [30, 43], [35, 51], [40, 58], [45, 65], [50, 71], [55, 76], [60, 80.5], [65, 84], [70, 88], [75, 90.5], [80, 93], [85, 95.5], [90, 97], [99, 99], [125, 99.5], [999, 100]];
    const relativity = (y) => {
      if (y <= REL[0][0]) return REL[0][1] * (y / REL[0][0]);
      for (let i = 1; i < REL.length; i++) {
        if (y <= REL[i][0]) { const [y0, r0] = REL[i - 1], [y1, r1] = REL[i]; return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0); }
      }
      return 100;
    };
    // Present value of the ground rent over the remaining term.
    const termValue = (rent, years, pattern, cap) => {
      let pv = 0, r = rent;
      const c = cap / 100;
      const period = pattern === "double25" ? 25 : pattern === "double33" ? 33 : pattern === "double10" ? 10 : 0;
      const growth = pattern === "rpi" ? 0.03 : 0;
      for (let t = 1; t <= years; t++) {
        if (period && t > 1 && (t - 1) % period === 0) r *= 2;
        if (growth && t > 1) r *= 1 + growth;
        pv += r / Math.pow(1 + c, t);
      }
      return pv;
    };
    const calc = () => {
      const V = num($("#lc-value")), L = Math.min(150, Math.max(1, num($("#lc-years")))), rent = num($("#lc-rent"));
      const pattern = $("#lc-pattern").value, d = num($("#lc-defer")) / 100, cap = num($("#lc-cap"));
      const reform = $("#lc-reform").checked;
      const term = termValue(rent, L, pattern, cap);
      const reversionNow = V / Math.pow(1 + d, L);
      const reversionAfter = V / Math.pow(1 + d, L + 90);
      const rel = relativity(L) / 100;
      const leaseNow = V * rel;
      const leaseAfter = V * 0.99;
      let mv = 0;
      if (!reform && L < 80) mv = Math.max(0, (leaseAfter + reversionAfter) - (leaseNow + term + reversionNow)) / 2;
      const premium = Math.max(0, term + reversionNow - reversionAfter + mv);
      const lo = premium * 0.88, hi = premium * 1.15;
      $("#lo-premium").textContent = gbp(Math.round(premium / 100) * 100);
      $("#lo-range").textContent = `Likely range ${gbp(Math.round(lo / 500) * 500)} to ${gbp(Math.round(hi / 500) * 500)}, before legal and valuation fees.`;
      $("#lo-term").textContent = gbp(term);
      $("#lo-rev").textContent = gbp(reversionNow - reversionAfter);
      $("#lo-mv").textContent = gbp(mv);
      $("#lo-mv-row").hidden = reform;
      $("#lo-lease").textContent = gbp(leaseNow);
      $("#lo-rel").textContent = `${(rel * 100).toFixed(1)}%`;
      let note = "";
      if (reform) note = "Reformed method: no marriage value, ground rent capped at 0.1% of the value for valuation purposes is not yet modelled. Confirm with a valuer whether the 2024 Act rules are in force for your notice.";
      else if (L < 80) note = `Under 80 years, so marriage value applies and makes up ${Math.round((mv / premium) * 100)}% of the premium. Every year you wait adds to it.`;
      else if (L < 83) note = "Just above 80 years. Serve notice before the lease drops below 80 or the premium will jump: marriage value would then apply.";
      else note = "Above 80 years, so no marriage value. The premium is mostly the ground rent and the reversion, and it grows slowly each year.";
      $("#lo-note").textContent = note;
    };
    lease.addEventListener("input", calc);
    lease.addEventListener("change", calc);
    calc();
  }

  /* ---------- Capital gains tax on residential property ---------- */
  const cgt = $("#cgt-calc");
  if (cgt) {
    const calc = () => {
      const buy = num($("#cg-buy")), sell = num($("#cg-sell")), buyCosts = num($("#cg-buycosts")), sellCosts = num($("#cg-sellcosts")), improve = num($("#cg-improve"));
      const months = Math.max(1, num($("#cg-months"))), lived = Math.min(months, num($("#cg-lived")));
      const income = num($("#cg-income")), owners = Number($("#cg-owners").value) || 1;
      const aea = num($("#cg-aea")), band = num($("#cg-band")), pa = num($("#cg-pa")), lo = num($("#cg-lo")) / 100, hi = num($("#cg-hi")) / 100;
      const gain = Math.max(0, sell - buy - buyCosts - sellCosts - improve);
      const exemptMonths = lived > 0 ? Math.min(months, lived + 9) : 0;
      const prr = gain * (exemptMonths / months);
      const perOwnerGain = (gain - prr) / owners;
      const taxablePerOwner = Math.max(0, perOwnerGain - aea);
      const taxableIncome = Math.max(0, income - pa);
      const bandLeft = Math.max(0, band - taxableIncome);
      const atLo = Math.min(taxablePerOwner, bandLeft);
      const atHi = Math.max(0, taxablePerOwner - atLo);
      const taxPerOwner = atLo * lo + atHi * hi;
      const tax = taxPerOwner * owners;
      $("#co-tax").textContent = gbp(tax);
      $("#co-rate").textContent = gain > 0 ? `Effective rate ${((tax / gain) * 100).toFixed(1)}% of the gain${owners > 1 ? ", both owners together" : ""}.` : "No gain, no tax.";
      $("#co-gain").textContent = gbp(gain);
      $("#co-prr").textContent = prr > 0 ? `- ${gbp(prr)}` : "£0";
      $("#co-prr-row").hidden = lived === 0;
      $("#co-aea").textContent = `- ${gbp(Math.min(aea, perOwnerGain) * owners)}`;
      $("#co-taxable").textContent = gbp(taxablePerOwner * owners);
      $("#co-lo").textContent = `${gbp(atLo * owners)} at ${Math.round(lo * 100)}%`;
      $("#co-hi").textContent = `${gbp(atHi * owners)} at ${Math.round(hi * 100)}%`;
      $("#co-note").textContent = tax > 0
        ? `Report and pay within 60 days of completion using HMRC's capital gains tax on UK property service. ${atHi > 0 && atLo > 0 ? "Part of the gain falls in the basic rate band and the rest above it." : atHi > 0 ? "Your income already uses the basic rate band, so the whole gain is at the higher rate." : "The whole gain fits within the basic rate band."}`
        : "Nothing to pay on these figures, but a residential property disposal may still need reporting on your return.";
    };
    cgt.addEventListener("input", calc);
    cgt.addEventListener("change", calc);
    calc();
  }
})();

/* ---------- Stamp duty land tax, England and Northern Ireland ---------- */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const form = $("#sdlt-calc");
  if (!form) return;
  const gbp = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const STANDARD = [[125000, 0], [250000, 0.02], [925000, 0.05], [1500000, 0.10], [Infinity, 0.12]];
  const FTB = [[300000, 0], [500000, 0.05]];
  const calc = () => {
    const price = Math.max(0, Number($("#sd-price").value) || 0);
    const type = $("#sd-type").value;
    const nonres = $("#sd-nonres").checked ? 0.02 : 0;
    const surcharge = type === "additional" || type === "company" ? 0.05 : 0;
    let bands = STANDARD, note = "Payable within 14 days of completion; your solicitor files the return.";
    if (type === "ftb") {
      if (price <= 500000) { bands = FTB; note = "First-time buyer relief applied: nothing on the first £300,000 and 5% on the slice to £500,000."; }
      else note = "First-time buyer relief does not apply above £500,000, so the standard bands apply to the whole price.";
    } else if (type === "main") note = "No surcharge, because this replaces your only main home. If you still own the old one on completion day, the surcharge applies and can be reclaimed when it sells within three years.";
    else if (type === "company" && price > 500000) note = "Company purchase above £500,000: a flat 17% can apply unless the property is let commercially or used in a qualifying business. The figure shown assumes the banded rates with the surcharge.";
    else if (surcharge) note = "Includes the 5% additional property surcharge on every band. Payable within 14 days of completion.";
    if (nonres) note += " Includes the 2% non-resident surcharge.";
    let lower = 0, total = 0;
    const rows = [];
    for (const [upper, rate] of bands) {
      if (price <= lower) break;
      const slice = Math.min(price, upper) - lower;
      const r = rate + surcharge + nonres;
      const tax = slice * r;
      total += tax;
      rows.push(`<div class="calc-row"><span>${gbp(lower)} to ${upper === Infinity ? "above" : gbp(upper)} at ${Math.round(r * 100)}%</span><strong>${gbp(tax)}</strong></div>`);
      lower = upper;
    }
    $("#sd-tax").textContent = gbp(total);
    $("#sd-rate").textContent = price ? `Effective rate ${((total / price) * 100).toFixed(2)}% of the price.` : "Enter a price.";
    $("#sd-bands").innerHTML = rows.join("");
    $("#sd-note").textContent = note;
  };
  form.addEventListener("input", calc);
  form.addEventListener("change", calc);
  calc();
})();
