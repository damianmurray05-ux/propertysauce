/* The landlord portal: one-time-code sign-in, then the portfolio dashboard. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const gate = $("#portal-gate");
  if (!gate) return;
  const portal = $("#portal"), msg = $("#portal-msg");
  const refForm = $("#portal-ref-form"), codeForm = $("#portal-code-form"), channels = $("#portal-channels");
  const PHONE = "+44 (0)20 8988 8434";
  const CH = window.PSCharts, C = CH.C;
  let pendingRef = "", token = "";
  const gbp = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const gbpK = (n) => n >= 1000 ? `£${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : gbp(n);
  const esc = CH.esc;

  const load = () => { try { return JSON.parse(sessionStorage.getItem("ps-landlord")) || {}; } catch { return {}; } };
  const save = (o) => { try { sessionStorage.setItem("ps-landlord", JSON.stringify(o)); } catch {} };
  const say = (t, kind = "") => { msg.hidden = false; msg.textContent = t; msg.className = "notice " + kind; };
  const post = async (body) => {
    const r = await fetch("/api/landlord/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    let data = null; try { data = await r.json(); } catch {}
    if (!r.ok) throw Object.assign(new Error((data && data.error) || `HTTP ${r.status}`), { status: r.status, data });
    return data;
  };

  refForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pendingRef = $("#pl-ref").value.trim();
    if (!pendingRef) return;
    msg.hidden = true;
    try {
      const res = await post({ action: "lookup", reference: pendingRef });
      channels.innerHTML = "";
      const mk = (label, ch) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = label; b.addEventListener("click", () => sendCode(ch)); channels.appendChild(b); };
      if (res.email) mk(`Email a code to ${res.email}`, "email");
      if (res.phone) mk(`Text a code to ${res.phone}`, "sms");
      channels.hidden = false;
      say("Found you. Where should the code go?");
    } catch (err) {
      if (err.status === 404) say("We could not find that reference. It is on your management agreement, or ring " + PHONE + ".", "err");
      else if (err.status === 503) say("The portal is not switched on yet. Ring " + PHONE + " for anything you need.", "err");
      else say("Something went wrong. Please try again in a moment.", "err");
    }
  });
  async function sendCode(channel) {
    try {
      const res = await post({ action: "start", reference: pendingRef, channel });
      token = res.token; channels.hidden = true; refForm.hidden = true; codeForm.hidden = false; $("#pl-code").focus();
      say(`Code sent${res.devCode ? ` (dev: ${res.devCode})` : ""}. It expires in ten minutes.`);
    } catch { say("The code could not be sent. Try the other option or ring " + PHONE + ".", "err"); }
  }
  codeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = $("#pl-code").value.replace(/\D/g, "");
    if (code.length !== 6) return say("Enter the six digits.", "err");
    try {
      const res = await post({ action: "check", token, code });
      save({ session: res.session, landlord: res.landlord });
      show(res.session);
    } catch (err) { say(err.status === 410 ? "That code has expired. Start again." : "That code does not match. Try again.", "err"); }
  });

  let currentSession = "", data = null;
  async function show(session) {
    currentSession = session;
    try {
      const d = await post({ action: "portfolio", session });
      data = d; render(d); gate.hidden = true; portal.hidden = false;
      portal.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (err.status === 401) { save({}); gate.hidden = false; portal.hidden = true; say("Your sign-in has expired. Enter your reference again.", "err"); }
      else say("We could not load your portfolio. Please try again, or ring " + PHONE + ".", "err");
    }
  }

  const COLOUR = { green: C.moss, amber: C.gold, red: C.accent };
  const ring = (score, rag, size = 140) => { const r = size * 0.37, c = 2 * Math.PI * r, cx = size / 2; return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${C.paper2}" stroke-width="${size * 0.057}"/><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${COLOUR[rag]}" stroke-width="${size * 0.057}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - score / 100)}" transform="rotate(-90 ${cx} ${cx})"/><text x="${cx}" y="${cx + size * 0.11}" text-anchor="middle" font-family="Cormorant Garamond, Cormorant, Georgia, serif" font-size="${size * 0.31}" font-weight="500" fill="${C.ink}">${score}</text></svg>`; };
  const TYPES = { tenancy: "Tenancy agreements", gas: "Gas safety certificates", eicr: "Electrical reports", epc: "Energy performance certificates", licence: "Licences", inventory: "Inventories and inspections", invoice: "Rent invoices to the tenant", statement: "Your statements and payments", other: "Other documents" };
  const statusWord = { ok: "In date", due: "Due soon", expired: "Expired", missing: "Missing", na: "Not required" };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels = () => { const start = (new Date().getMonth() - 11 + 12) % 12; return Array.from({ length: 12 }, (_, i) => MONTHS[(start + i) % 12]); };

  /* ---------- Portfolio-level charts, derived from the property list ---------- */
  function dashboards(d) {
    const ps = d.properties;
    const labels = monthLabels();
    // Rent, month by month: due and collected across every property.
    const due = Array(12).fill(0), got = Array(12).fill(0);
    for (const p of ps) {
      const hist = (p.history || "").padStart(12, "-");
      [...hist].forEach((ch, i) => { if (ch === "-") return; due[i] += p.rentPcm || 0; got[i] += ch === "O" || ch === "L" ? (p.rentPcm || 0) : ch === "P" ? (p.rentPcm || 0) / 2 : 0; });
    }
    const rentBars = CH.bars(labels.map((m, i) => ({ label: m, values: [{ v: due[i], color: C.goldSoft, title: `${m}: ${gbp(due[i])} due` }, { v: got[i], color: C.ink, title: `${m}: ${gbp(got[i])} collected` }] })), { axis: gbpK, cls: "bars-rent" });
    // Health: how many properties are green, amber, red.
    const rag = { green: 0, amber: 0, red: 0 };
    ps.forEach((p) => { rag[p.rag] = (rag[p.rag] || 0) + 1; });
    const ragSegs = [{ value: rag.green, color: C.moss, label: "Green, 85 and above" }, { value: rag.amber, color: C.gold, label: "Amber, 65 to 84" }, { value: rag.red, color: C.accent, label: "Red, below 65" }];
    // Compliance: every certificate across the portfolio.
    const cert = { ok: 0, due: 0, expired: 0, missing: 0 };
    ps.forEach((p) => p.certificates.forEach((c) => { if (c.status in cert) cert[c.status] += 1; }));
    const certSegs = [{ value: cert.ok, color: C.moss, label: "In date" }, { value: cert.due, color: C.gold, label: "Due within 60 days" }, { value: cert.expired, color: C.accent, label: "Expired" }, { value: cert.missing, color: C.mist, label: "Missing" }];
    const certTotal = cert.ok + cert.due + cert.expired + cert.missing;
    // Repairs: open against closed.
    let open = 0, closed = 0;
    ps.forEach((p) => (p.jobs || []).forEach((j) => { j.closed ? closed++ : open++; }));
    const jobSegs = [{ value: open, color: C.gold, label: "Open" }, { value: closed, color: C.ink, label: "Completed" }];
    // Occupancy.
    const let_ = ps.filter((p) => /tenant|arrears|possession|court|let agreed/i.test(p.status || "") || p.tenantName || p.tenant_ref).length;
    const occSegs = [{ value: let_, color: C.ink, label: "Let" }, { value: ps.length - let_, color: C.mist, label: "Not let" }];

    $("#pl-dash").innerHTML = `
      <div class="chart-card chart-wide">
        <div class="chart-head"><h3>Rent, last twelve months</h3><span class="muted">${gbp(d.totals.collected)} collected of ${gbp(d.totals.due)} due</span></div>
        ${rentBars}
        ${CH.legend([{ color: C.goldSoft, label: "Due", text: gbp(d.totals.due) }, { color: C.ink, label: "Collected", text: gbp(d.totals.collected) }, { color: C.accent, label: "Arrears today", text: gbp(d.totals.arrears) }])}
      </div>
      <div class="chart-card"><div class="chart-head"><h3>Portfolio health</h3></div><div class="chart-row">${CH.donut(ragSegs, { label: ps.length, sub: ps.length === 1 ? "property" : "properties", aria: "Properties by score band" })}${CH.legend(ragSegs)}</div></div>
      <div class="chart-card"><div class="chart-head"><h3>Certificates</h3></div><div class="chart-row">${CH.donut(certSegs, { label: certTotal ? `${Math.round((cert.ok / certTotal) * 100)}%` : "0%", sub: "in date", aria: "Certificates by status" })}${CH.legend(certSegs)}</div></div>
      <div class="chart-card"><div class="chart-head"><h3>Repairs</h3></div><div class="chart-row">${CH.donut(jobSegs, { label: open, sub: "open", aria: "Repairs open and completed" })}${CH.legend(jobSegs)}</div></div>
      <div class="chart-card"><div class="chart-head"><h3>Occupancy</h3></div><div class="chart-row">${CH.donut(occSegs, { label: ps.length ? `${Math.round((let_ / ps.length) * 100)}%` : "0%", sub: "let", aria: "Occupancy" })}${CH.legend(occSegs)}</div></div>`;

    // Attention tables: arrears and certificates due.
    const arrears = ps.filter((p) => p.arrears > 0).sort((a, b) => b.arrears - a.arrears).slice(0, 8);
    const dueSoon = ps.flatMap((p) => p.certificates.filter((c) => c.status === "due" || c.status === "expired").map((c) => ({ p, c }))).slice(0, 10);
    $("#pl-tables").innerHTML = `
      <div class="table-card"><h3>Arrears</h3>${arrears.length ? `<table class="mini"><thead><tr><th>Property</th><th>Tenant</th><th class="num">Owed</th></tr></thead><tbody>${arrears.map(({ address, tenantName, tenant_ref, arrears: a }) => `<tr><td>${esc(address.split(",")[0])}</td><td>${esc(tenantName || tenant_ref || "")}</td><td class="num bad">${gbp(a)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Nothing outstanding. Every tenant is up to date.</p>`}</div>
      <div class="table-card"><h3>Certificates needing action</h3>${dueSoon.length ? `<table class="mini"><thead><tr><th>Property</th><th>Certificate</th><th>Status</th></tr></thead><tbody>${dueSoon.map(({ p, c }) => `<tr><td>${esc(p.address.split(",")[0])}</td><td>${esc(c.label)}</td><td><span class="pill pill-${c.status}">${statusWord[c.status]}${c.extra ? `, ${esc(c.extra)}` : ""}</span></td></tr>`).join("")}</tbody></table>` : `<p class="muted">Every certificate is in date and nothing is due in the next sixty days.</p>`}</div>`;
  }

  /* ---------- Property cards, with search, filter and sort ---------- */
  const state = { q: "", band: "all", sort: "score", shown: 24 };
  function propertyCard(p) {
    const names = monthLabels();
    const hist = (p.history || "").padStart(12, "-");
    const months = [...hist].map((ch, i) => { const cls = ch === "O" ? "on" : ch === "L" ? "late" : ch === "P" ? "part" : ch === "M" ? "missed" : "none"; const t = ch === "O" ? "On time" : ch === "L" ? "Late" : ch === "P" ? "Part paid" : ch === "M" ? "Missed" : "Not due"; return `<span class="m ${cls}" title="${t}"><i></i>${names[i][0]}</span>`; }).join("");
    const bars = p.parts.map((x) => `<div class="score-part"><div class="score-part-head"><span>${esc(x.label)}</span><strong>${x.score} / ${x.max}</strong></div><div class="score-bar"><i style="--p:${x.score / x.max}"></i></div><small>${esc(x.detail)}</small></div>`).join("");
    const certs = p.certificates.map((c) => `<div class="cert cert-${c.status}"><i></i><div><strong>${esc(c.label)}</strong><span>${esc(statusWord[c.status] || c.status)}${c.extra ? ` · ${esc(c.extra)}` : ""}</span><small>${esc(c.note)}</small></div></div>`).join("");
    const jobs = (p.jobs || []).length ? `<div class="jobs"><h4>Repairs</h4><ul>${p.jobs.slice(0, 6).map((j) => `<li><span class="job-status job-${j.closed ? "closed" : "open"}">${esc(j.status || (j.closed ? "Closed" : "Open"))}</span><strong>${esc(j.title)}</strong><small>${esc(j.ticket ? `Ticket ${j.ticket} · ` : "")}${esc(j.created)}${j.quote ? ` · quote ${gbp(j.quote)}` : ""}${j.invoiced ? ` · invoiced ${gbp(j.invoiced)}` : ""}</small></li>`).join("")}</ul>${p.jobs.length > 6 ? `<p class="muted">${p.jobs.length - 6} older repair${p.jobs.length - 6 === 1 ? "" : "s"} in the file.</p>` : ""}</div>` : "";
    const groups = {};
    for (const doc of p.documents) (groups[TYPES[doc.type] ? doc.type : "other"] ||= []).push(doc);
    const docs = Object.keys(TYPES).filter((k) => groups[k]).map((k) => `<div class="doc-group"><h4>${TYPES[k]}</h4><ul>${groups[k].map((doc) => `<li>${doc.url ? `<a href="${esc(doc.url.startsWith("/api/file") ? doc.url + "&s=" + encodeURIComponent(currentSession) : doc.url)}" target="_blank" rel="noopener">${esc(doc.title)}</a>` : `<span class="doc-title">${esc(doc.title)}</span>`}<span>${esc(doc.date)}${doc.amount ? ` · ${gbp(doc.amount)}` : ""}</span></li>`).join("")}</ul></div>`).join("");
    return `<article class="prop prop-${p.rag}">
      <div class="prop-head"><div><h3>${esc(p.address)}</h3><p class="muted">${gbp(p.rentPcm)} pcm${p.tenantName ? ` · ${esc(p.tenantName)}` : p.tenant_ref ? ` · tenant ${esc(p.tenant_ref)}` : ""}${p.status ? ` · ${esc(p.status)}` : ""}${p.arrears ? ` · <span class="bad">arrears ${gbp(p.arrears)}</span>` : ""}</p></div>${ring(p.score, p.rag, 96)}</div>
      <div class="prop-body">
        <div><div class="score-parts one">${bars}</div><div class="score-history"><h4>Rent, last twelve months</h4><div class="score-months">${months}</div></div></div>
        <div><h4>Certificates</h4><div class="certs">${certs}</div>${jobs}</div>
      </div>
      <details class="prop-docs"><summary>Documents (${p.documents.length})</summary>${docs || '<p class="muted">No documents filed yet.</p>'}</details>
    </article>`;
  }
  function filtered() {
    const q = state.q.toLowerCase();
    let list = data.properties.filter((p) => (state.band === "all" || (state.band === "arrears" ? p.arrears > 0 : p.rag === state.band)) && (!q || `${p.address} ${p.tenantName || ""} ${p.tenant_ref || ""}`.toLowerCase().includes(q)));
    if (state.sort === "score") list = list.sort((a, b) => a.score - b.score);
    else if (state.sort === "arrears") list = list.sort((a, b) => b.arrears - a.arrears);
    else if (state.sort === "rent") list = list.sort((a, b) => b.rentPcm - a.rentPcm);
    else list = list.sort((a, b) => a.address.localeCompare(b.address, "en-GB", { numeric: true }));
    return list;
  }
  function renderProps() {
    const list = filtered();
    const shown = list.slice(0, state.shown);
    $("#pl-count").textContent = list.length === data.properties.length ? `${list.length} propert${list.length === 1 ? "y" : "ies"}` : `${list.length} of ${data.properties.length} properties`;
    $("#pl-props").innerHTML = shown.map(propertyCard).join("") || `<p class="notice">No properties match. Clear the search or the filter.</p>`;
    const more = $("#pl-more"); more.hidden = list.length <= state.shown;
    if (!more.hidden) more.textContent = `Show ${Math.min(24, list.length - state.shown)} more`;
  }

  const heroRing = (score, rag) => {
    const size = 232, r = 100, c = 2 * Math.PI * r, cx = size / 2;
    const stops = rag === "red" ? ["#E8A98E", "#C8502A", "#9C3A1C"] : rag === "amber" ? ["#E7D2A0", "#B4924A", "#8C6D2F"] : ["#E7D2A0", "#B4924A", "#7FB89A"];
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset="0.55" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/></linearGradient><filter id="pl-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="14"/><circle class="sc-ring-arc" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="url(#pl-grad)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${cx} ${cx})" filter="url(#pl-glow)" style="--target:${c * (1 - score / 100)}"/><text class="sc-ring-num" x="${cx}" y="${cx + 22}" text-anchor="middle" font-family="Cormorant Garamond, Cormorant, Georgia, serif" font-size="84" font-weight="500" fill="#F4F5F1">0</text><text x="${cx}" y="${cx + 52}" text-anchor="middle" font-family="Geist, sans-serif" font-size="12" letter-spacing="2.5" fill="rgba(244,245,241,0.7)">PORTFOLIO SCORE</text></svg>`;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el, to, fmtFn) {
    const f = fmtFn || ((n) => String(n));
    if (reduce) { el.textContent = f(to); return; }
    const t0 = performance.now(), dur = 1100;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = f(Math.round(to * e)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function render(d) {
    $("#pl-title").textContent = d.firstName && d.firstName !== "there" ? `Hello ${d.firstName}.` : "Your portfolio.";
    $("#pl-sub").textContent = `${d.totals.properties} propert${d.totals.properties === 1 ? "y" : "ies"} under management · updated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
    const word = d.rag === "green" ? "Healthy" : d.rag === "amber" ? "Needs a look" : "Needs attention";
    $("#pl-tier").innerHTML = `<span class="sc-pill ${d.rag === "green" ? "" : d.rag === "amber" ? "sc-pill-amber" : "sc-pill-red"}"><svg class="ic" aria-hidden="true"><use href="/assets/icons.svg#shield-check"/></svg> ${word}</span><span class="sc-tier-note">Green is 85 and above, amber 65 to 84, red below 65.</span>`;
    $("#pl-ring").innerHTML = heroRing(d.overall, d.rag);
    $("#pl-ring").setAttribute("aria-label", `Portfolio score ${d.overall} out of 100`);
    requestAnimationFrame(() => requestAnimationFrame(() => { const arc = $("#pl-ring .sc-ring-arc"); if (arc) arc.style.strokeDashoffset = arc.style.getPropertyValue("--target"); countUp($("#pl-ring .sc-ring-num"), d.overall); }));
    $("#pl-totals").innerHTML = [
      [d.totals.rentPcm, "rent roll per month", gbp],
      [d.totals.collected, `collected of ${gbp(d.totals.due)} due, 12 months`, gbp],
      [d.totals.arrears, "in arrears today", gbp],
      [d.totals.alerts, "items needing attention", String],
    ].map(([n, l, f], i) => `<div class="sc-stat"><strong data-i="${i}">0</strong><span>${esc(l)}</span></div>`).join("");
    const fmts = [gbp, gbp, gbp, String], vals = [d.totals.rentPcm, d.totals.collected, d.totals.arrears, d.totals.alerts];
    document.querySelectorAll("#pl-totals strong").forEach((el) => countUp(el, vals[Number(el.dataset.i)], fmts[Number(el.dataset.i)]));
    dashboards(d);
    const alerts = d.properties.flatMap((p) => p.alerts.map((a) => `<li><strong>${esc(p.address.split(",")[0])}</strong> ${esc(a)}</li>`));
    $("#pl-alerts").innerHTML = alerts.length ? `<details ${alerts.length <= 6 ? "open" : ""}><summary><h3>Needs attention (${alerts.length})</h3></summary><ul class="score-list">${alerts.join("")}</ul></details>` : `<p class="notice">Nothing needs your attention. Every certificate is in date and there are no arrears.</p>`;
    state.shown = 24; renderProps();
  }

  $("#pl-search").addEventListener("input", (e) => { state.q = e.target.value; state.shown = 24; renderProps(); });
  $("#pl-sort").addEventListener("change", (e) => { state.sort = e.target.value; renderProps(); });
  $("#pl-filters").addEventListener("click", (e) => { const b = e.target.closest("button[data-band]"); if (!b) return; state.band = b.dataset.band; state.shown = 24; [...$("#pl-filters").children].forEach((x) => x.classList.toggle("active", x === b)); renderProps(); });
  $("#pl-more").addEventListener("click", () => { state.shown += 24; renderProps(); });
  $("#pl-signout").addEventListener("click", () => { save({}); portal.hidden = true; gate.hidden = false; refForm.hidden = false; codeForm.hidden = true; channels.hidden = true; msg.hidden = true; $("#pl-ref").value = ""; });
  const st = load();
  if (st.session) show(st.session);
})();
