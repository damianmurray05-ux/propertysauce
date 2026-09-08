/* The landlord portal: one-time-code sign-in, then the portfolio dashboard. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const gate = $("#portal-gate");
  if (!gate) return;
  const portal = $("#portal"), msg = $("#portal-msg");
  const refForm = $("#portal-ref-form"), codeForm = $("#portal-code-form"), channels = $("#portal-channels");
  const PHONE = "+44 (0)20 8988 8434";
  let pendingRef = "", token = "";
  const gbp = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

  async function show(session) {
    try {
      const d = await post({ action: "portfolio", session });
      render(d); gate.hidden = true; portal.hidden = false;
      portal.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (err.status === 401) { save({}); gate.hidden = false; portal.hidden = true; say("Your sign-in has expired. Enter your reference again.", "err"); }
      else say("We could not load your portfolio. Please try again, or ring " + PHONE + ".", "err");
    }
  }

  const COLOUR = { green: "#2e7d5b", amber: "#b4924a", red: "#c8502a" };
  const ring = (score, rag, size = 140) => { const r = size * 0.37, c = 2 * Math.PI * r, cx = size / 2; return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="#e9ebe4" stroke-width="${size * 0.057}"/><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${COLOUR[rag]}" stroke-width="${size * 0.057}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - score / 100)}" transform="rotate(-90 ${cx} ${cx})"/><text x="${cx}" y="${cx + size * 0.11}" text-anchor="middle" font-family="Cormorant, Georgia, serif" font-size="${size * 0.31}" font-weight="500" fill="#0f2a22">${score}</text></svg>`; };
  const TYPES = { tenancy: "Tenancy agreements", gas: "Gas safety certificates", eicr: "Electrical reports", epc: "Energy performance certificates", licence: "Licences", inventory: "Inventories and inspections", invoice: "Rent invoices to the tenant", statement: "Your statements and payments", other: "Other documents" };
  const statusWord = { ok: "In date", due: "Due soon", expired: "Expired", missing: "Missing", na: "Not required" };

  function render(d) {
    $("#pl-title").textContent = `Hello ${d.firstName}.`;
    $("#pl-sub").textContent = `${d.totals.properties} propert${d.totals.properties === 1 ? "y" : "ies"} under management`;
    $("#pl-ring").innerHTML = ring(d.overall, d.rag);
    $("#pl-ring").setAttribute("aria-label", `Portfolio score ${d.overall} out of 100`);
    $("#pl-totals").innerHTML = [
      ["Rent roll", gbp(d.totals.rentPcm) + " pcm"],
      ["Collected, last 12 months", `${gbp(d.totals.collected)} of ${gbp(d.totals.due)}`],
      ["Arrears today", gbp(d.totals.arrears)],
      ["Items needing attention", String(d.totals.alerts)],
    ].map(([k, v]) => `<div class="fact"><strong>${esc(v)}</strong><span>${esc(k)}</span></div>`).join("");
    const alerts = d.properties.flatMap((p) => p.alerts.map((a) => `<li><strong>${esc(p.address.split(",")[0])}</strong> ${esc(a)}</li>`));
    $("#pl-alerts").innerHTML = alerts.length ? `<h3>Needs attention</h3><ul class="score-list">${alerts.join("")}</ul>` : `<p class="notice">Nothing needs your attention. Every certificate is in date and there are no arrears.</p>`;
    const names = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const start = (new Date().getMonth() - 11 + 12) % 12;
    $("#pl-props").innerHTML = d.properties.map((p) => {
      const hist = (p.history || "").padStart(12, "-");
      const months = [...hist].map((ch, i) => { const cls = ch === "O" ? "on" : ch === "L" ? "late" : ch === "P" ? "part" : ch === "M" ? "missed" : "none"; const t = ch === "O" ? "On time" : ch === "L" ? "Late" : ch === "P" ? "Part paid" : ch === "M" ? "Missed" : "Not due"; return `<span class="m ${cls}" title="${t}"><i></i>${names[(start + i) % 12]}</span>`; }).join("");
      const bars = p.parts.map((x) => `<div class="score-part"><div class="score-part-head"><span>${esc(x.label)}</span><strong>${x.score} / ${x.max}</strong></div><div class="score-bar"><i style="--p:${x.score / x.max}"></i></div><small>${esc(x.detail)}</small></div>`).join("");
      const certs = p.certificates.map((c) => `<div class="cert cert-${c.status}"><i></i><div><strong>${esc(c.label)}</strong><span>${esc(statusWord[c.status] || c.status)}${c.extra ? ` · ${esc(c.extra)}` : ""}</span><small>${esc(c.note)}</small></div></div>`).join("");
      const groups = {};
      for (const doc of p.documents) (groups[TYPES[doc.type] ? doc.type : "other"] ||= []).push(doc);
      const docs = Object.keys(TYPES).filter((k) => groups[k]).map((k) => `<div class="doc-group"><h4>${TYPES[k]}</h4><ul>${groups[k].map((doc) => `<li><a href="${esc(doc.url)}" target="_blank" rel="noopener">${esc(doc.title)}</a><span>${esc(doc.date)}${doc.amount ? ` · ${gbp(doc.amount)}` : ""}</span></li>`).join("")}</ul></div>`).join("");
      return `<article class="prop prop-${p.rag}">
        <div class="prop-head"><div><h3>${esc(p.address)}</h3><p class="muted">${gbp(p.rentPcm)} pcm${p.tenant_ref ? ` · tenant ${esc(p.tenant_ref)}` : ""}${p.arrears ? ` · <span class="bad">arrears ${gbp(p.arrears)}</span>` : ""}</p></div>${ring(p.score, p.rag, 96)}</div>
        <div class="prop-body">
          <div><div class="score-parts one">${bars}</div><div class="score-history"><h4>Rent, last twelve months</h4><div class="score-months">${months}</div></div></div>
          <div><h4>Certificates</h4><div class="certs">${certs}</div></div>
        </div>
        <details class="prop-docs"><summary>Documents (${p.documents.length})</summary>${docs || '<p class="muted">No documents filed yet.</p>'}</details>
      </article>`;
    }).join("") || `<p class="notice">No properties are linked to this reference yet. Ring ${PHONE} and we will fix that.</p>`;
  }

  $("#pl-signout").addEventListener("click", () => { save({}); portal.hidden = true; gate.hidden = false; refForm.hidden = false; codeForm.hidden = true; channels.hidden = true; msg.hidden = true; $("#pl-ref").value = ""; });
  const st = load();
  if (st.session) show(st.session);
})();
