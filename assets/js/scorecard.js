/* The tenant scorecard page: verify with reference and code (shared with the
   assistant's session), fetch the score, draw it as an app-style dashboard. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const gate = $("#score-gate");
  if (!gate) return;
  const card = $("#scorecard");
  const msg = $("#score-msg");
  const refForm = $("#score-ref-form"), codeForm = $("#score-code-form"), channels = $("#score-channels");
  const PHONE = "+44 (0)20 8988 8434";
  let pendingRef = "", token = "";
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const load = () => { try { return JSON.parse(sessionStorage.getItem("ps-assistant")) || {}; } catch { return {}; } };
  const saveSession = (session, tenant) => { try { const st = load(); st.session = session; st.tenant = tenant; sessionStorage.setItem("ps-assistant", JSON.stringify(st)); } catch {} };
  const say = (t, kind = "") => { msg.hidden = false; msg.textContent = t; msg.className = "notice " + kind; };
  const post = async (url, body) => {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    let data = null; try { data = await r.json(); } catch {}
    if (!r.ok) throw Object.assign(new Error((data && data.error) || `HTTP ${r.status}`), { status: r.status, data });
    return data;
  };

  refForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pendingRef = $("#sc-ref").value.trim();
    if (!pendingRef) return;
    msg.hidden = true;
    try {
      const res = await post("/api/verify/", { action: "lookup", reference: pendingRef });
      channels.innerHTML = "";
      const mk = (label, ch) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = label; b.addEventListener("click", () => sendCode(ch)); channels.appendChild(b); };
      if (res.email) mk(`Email a code to ${res.email}`, "email");
      if (res.phone) mk(`Text a code to ${res.phone}`, "sms");
      channels.hidden = false;
      say("Found you. Where should the code go?");
    } catch (err) {
      if (err.status === 404) say("We could not find that reference. Check it against your tenancy agreement, or ring " + PHONE + ".", "err");
      else if (err.status === 503) say("Sign-in is not switched on yet. Ring " + PHONE + " and we will read your score to you.", "err");
      else say("Something went wrong. Please try again in a moment.", "err");
    }
  });

  async function sendCode(channel) {
    try {
      const res = await post("/api/verify/", { action: "start", reference: pendingRef, channel });
      token = res.token;
      channels.hidden = true; refForm.hidden = true; codeForm.hidden = false;
      $("#sc-code").focus();
      say(`Code sent${res.devCode ? ` (dev: ${res.devCode})` : ""}. It expires in ten minutes.`);
    } catch { say("The code could not be sent. Try the other option or ring " + PHONE + ".", "err"); }
  }

  codeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = $("#sc-code").value.replace(/\D/g, "");
    if (code.length !== 6) return say("Enter the six digits.", "err");
    try {
      const res = await post("/api/verify/", { action: "check", token, code });
      saveSession(res.session, res.tenant);
      show(res.session);
    } catch (err) {
      if (err.status === 410) say("That code has expired. Start again.", "err");
      else say("That code does not match. Try again.", "err");
    }
  });

  async function show(session) {
    try {
      const d = await post("/api/scorecard/", { session });
      render(d);
      gate.hidden = true; card.hidden = false;
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      if (err.status === 401) { gate.hidden = false; card.hidden = true; say("Your sign-in has expired. Enter your reference again.", "err"); }
      else say("We could not load your scorecard. Please try again, or ring " + PHONE + ".", "err");
    }
  }

  /* ---------- drawing ---------- */
  const ICONS = ["hand-coins", "check", "users-three", "house-line"];
  const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="/assets/icons.svg#${name}"/></svg>`;
  const TIERS = [{ name: "Building", min: 0 }, { name: "Bronze", min: 50 }, { name: "Silver", min: 70 }, { name: "Gold", min: 85 }, { name: "Platinum", min: 95 }];

  // Count a number up from zero over about a second.
  function countUp(el, to, suffix = "") {
    if (reduce) { el.textContent = `${to}${suffix}`; return; }
    const t0 = performance.now(), dur = 1100;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = `${Math.round(to * e)}${suffix}`; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function ring(score) {
    const size = 232, r = 100, c = 2 * Math.PI * r, cx = size / 2;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs>
        <linearGradient id="sc-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E7D2A0"/><stop offset="0.55" stop-color="#B4924A"/><stop offset="1" stop-color="#7FB89A"/></linearGradient>
        <filter id="sc-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="14"/>
      <circle class="sc-ring-arc" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="url(#sc-grad)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${cx} ${cx})" filter="url(#sc-glow)" style="--target:${c * (1 - score / 100)}"/>
      <text class="sc-ring-num" x="${cx}" y="${cx + 22}" text-anchor="middle" font-family="Cormorant Garamond, Cormorant, Georgia, serif" font-size="84" font-weight="500" fill="#F4F5F1">0</text>
      <text x="${cx}" y="${cx + 52}" text-anchor="middle" font-family="Geist, sans-serif" font-size="12" letter-spacing="2.5" fill="rgba(244,245,241,0.7)">OUT OF 100</text>
    </svg>`;
  }

  // Smooth curve through the twelve months, with a dot per month coloured by what happened.
  function curve(hist, months) {
    const W = 640, H = 220, padX = 28, top = 26, bottom = 46;
    const val = (ch) => ch === "O" ? 100 : ch === "L" ? 72 : ch === "P" ? 50 : ch === "M" ? 12 : null;
    const col = (ch) => ch === "O" ? "#2E7D5B" : ch === "L" ? "#B4924A" : ch === "P" ? "#C9AE72" : ch === "M" ? "#C8502A" : "#C9CFC6";
    const pts = [...hist].map((ch, i) => ({ x: padX + (i * (W - 2 * padX)) / 11, y: val(ch) == null ? H - bottom : H - bottom - ((val(ch)) / 100) * (H - top - bottom), ch }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6, c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    const area = `${d} L ${pts[pts.length - 1].x} ${H - bottom} L ${pts[0].x} ${H - bottom} Z`;
    const dots = pts.map((p) => `<circle class="sc-dot" cx="${p.x}" cy="${p.y}" r="6.5" fill="${col(p.ch)}" stroke="#fff" stroke-width="2.5"><title>${months[pts.indexOf(p)]}: ${p.ch === "O" ? "On time" : p.ch === "L" ? "Late" : p.ch === "P" ? "Part paid" : p.ch === "M" ? "Missed" : "Not due"}</title></circle>`).join("");
    const labels = pts.map((p, i) => `<text x="${p.x}" y="${H - 14}" text-anchor="middle" font-family="Geist, sans-serif" font-size="12" fill="#5C6660">${months[i]}</text>`).join("");
    const guides = [100, 50].map((v) => { const y = H - bottom - (v / 100) * (H - top - bottom); return `<line x1="${padX}" x2="${W - padX}" y1="${y}" y2="${y}" stroke="#E9EBE4" stroke-dasharray="3 5"/>`; }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="auto" role="img" aria-label="Rent paid month by month">
      <defs><linearGradient id="sc-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E7D5B" stop-opacity="0.28"/><stop offset="1" stop-color="#2E7D5B" stop-opacity="0"/></linearGradient></defs>
      ${guides}<path class="sc-area" d="${area}" fill="url(#sc-area)"/><path class="sc-line" d="${d}" fill="none" stroke="#2E7D5B" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>${dots}${labels}
    </svg>`;
  }

  function render(d) {
    $("#sc-title").textContent = `Hello ${d.firstName}.`;
    $("#sc-address").textContent = d.address;
    const hist = (d.history || "").padStart(12, "-");
    const onTime = [...hist].filter((c) => c === "O").length, late = [...hist].filter((c) => c === "L").length, missed = [...hist].filter((c) => c === "M").length;
    const jobs = d.jobs || [], open = jobs.filter((j) => !j.closed).length;

    $("#sc-ring").innerHTML = ring(d.score);
    $("#sc-ring").setAttribute("aria-label", `Score ${d.score} out of 100`);
    requestAnimationFrame(() => requestAnimationFrame(() => { const arc = $(".sc-ring-arc"); if (arc) arc.style.strokeDashoffset = arc.style.getPropertyValue("--target"); countUp($(".sc-ring-num"), d.score); }));

    $("#sc-tier").innerHTML = `<span class="sc-pill sc-pill-${d.tier.toLowerCase()}">${icon("star")} ${esc(d.tier)}</span><span class="sc-tier-note">${d.next ? `${d.next.pointsNeeded} point${d.next.pointsNeeded === 1 ? "" : "s"} to ${esc(d.next.name)}` : "The top tier. Thank you."}</span>`;
    $("#sc-stats").innerHTML = [
      [onTime, "of 12 months paid on time"],
      [d.streak || 0, d.streak === 1 ? "month on time in a row" : "months on time in a row"],
      [open, open === 1 ? "repair open" : "repairs open"],
    ].map(([n, l]) => `<div class="sc-stat"><strong data-n="${n}">0</strong><span>${l}</span></div>`).join("");
    document.querySelectorAll("#sc-stats strong").forEach((el) => countUp(el, Number(el.dataset.n)));

    const current = TIERS.filter((t) => d.score >= t.min).pop();
    $("#sc-progress").innerHTML = `<div class="sc-track"><i style="--p:${d.score / 100}"></i></div><div class="sc-medals">${TIERS.slice(1).map((t) => `<div class="sc-medal ${d.score >= t.min ? "hit" : ""} ${current && current.name === t.name ? "now" : ""}" style="--at:${t.min}%"><b>${t.min}</b><span>${t.name}</span></div>`).join("")}</div>`;

    $("#sc-parts").innerHTML = d.parts.map((p, i) => `<div class="sc-part">
      <div class="sc-part-icon">${icon(ICONS[i % 4])}</div>
      <div class="sc-part-body"><div class="sc-part-head"><span>${esc(p.label)}</span><strong><b data-n="${p.score}">0</b><small>/ ${p.max}</small></strong></div>
      <div class="sc-bar"><i style="--p:${p.score / p.max}"></i></div><p>${esc(p.detail)}</p></div>
    </div>`).join("");
    document.querySelectorAll("#sc-parts b[data-n]").forEach((el) => countUp(el, Number(el.dataset.n)));
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll(".sc-bar i, .sc-track i").forEach((el) => el.classList.add("go"))));

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const start = (new Date().getMonth() - 11 + 12) % 12;
    const months = Array.from({ length: 12 }, (_, i) => MONTHS[(start + i) % 12]);
    $("#sc-bars").innerHTML = curve(hist, months);
    requestAnimationFrame(() => requestAnimationFrame(() => { const l = $(".sc-line"); if (l) l.classList.add("go"); document.querySelectorAll(".sc-dot").forEach((el, i) => { el.style.transitionDelay = `${0.6 + i * 0.06}s`; el.classList.add("go"); }); }));
    $("#sc-months").innerHTML = [["#2E7D5B", "On time", onTime], ["#B4924A", "Late", late], ["#C8502A", "Missed", missed]].map(([c, l, n]) => `<span class="sc-chip"><i style="background:${c}"></i>${l}<b>${n}</b></span>`).join("");
    $("#sc-streak").textContent = d.streak >= 12 ? "Twelve months on time in a row. That is the best it gets." : d.streak > 0 ? `${d.streak} month${d.streak === 1 ? "" : "s"} on time in a row.` : d.history ? "The streak restarts with the next on-time payment." : "";

    const rewards = d.rewards.map((x) => /\[.*\]/.test(x) ? `<li class="soon">${icon("clock")}<span>${esc(x.replace(/\[|\]/g, ""))}</span></li>` : `<li>${icon("check")}<span>${esc(x)}</span></li>`);
    if (d.rewardNote) rewards.unshift(`<li class="note">${icon("star")}<span>${esc(d.rewardNote)}</span></li>`);
    $("#sc-rewards").innerHTML = rewards.length ? rewards.join("") : `<li class="soon">${icon("clock")}<span>Rewards start at Silver. ${d.next ? `${d.next.pointsNeeded} points to go.` : ""}</span></li>`;
    $("#sc-tips").innerHTML = d.tips.map((t) => `<li>${icon("arrow-right")}<span>${esc(t)}</span></li>`).join("");

    $("#sc-jobs").innerHTML = jobs.length ? `<section class="sc-card"><h3>Your repairs <span class="sc-count">${open} open</span></h3><ul class="sc-joblist">${jobs.map((j) => `<li><span class="sc-status ${j.closed ? "done" : "open"}">${esc(j.status || (j.closed ? "Closed" : "Open"))}</span><div><strong>${esc(j.title)}</strong><small>${esc(j.ticket ? `Ticket ${j.ticket} · ` : "")}${esc(j.created || "")}</small></div></li>`).join("")}</ul></section>` : "";
  }

  $("#sc-signout").addEventListener("click", () => { saveSession(null, null); card.hidden = true; gate.hidden = false; refForm.hidden = false; codeForm.hidden = true; channels.hidden = true; msg.hidden = true; $("#sc-ref").value = ""; });

  const st = load();
  if (st.session) show(st.session);
})();
