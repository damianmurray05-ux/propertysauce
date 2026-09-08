/* The tenant scorecard page: verify with reference and code (shared with the
   assistant's session), fetch the score, draw it. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const gate = $("#score-gate");
  if (!gate) return;
  const card = $("#scorecard");
  const msg = $("#score-msg");
  const refForm = $("#score-ref-form"), codeForm = $("#score-code-form"), channels = $("#score-channels");
  const PHONE = "+44 (0)20 8988 8434";
  let pendingRef = "", token = "";

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

  const gold = "#b4924a", ink = "#0f2a22", paper2 = "#e9ebe4", accent = "#c8502a";
  function render(d) {
    $("#sc-title").textContent = `Hello ${d.firstName}.`;
    $("#sc-address").textContent = d.address;
    const r = 52, c = 2 * Math.PI * r, pct = d.score / 100;
    $("#sc-ring").innerHTML = `<svg viewBox="0 0 140 140" width="140" height="140"><circle cx="70" cy="70" r="${r}" fill="none" stroke="${paper2}" stroke-width="8"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${gold}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 70 70)" style="transition: stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"/><text x="70" y="78" text-anchor="middle" font-family="Cormorant, Georgia, serif" font-size="44" font-weight="500" fill="${ink}">${d.score}</text><text x="70" y="98" text-anchor="middle" font-family="Geist, sans-serif" font-size="9" letter-spacing="2" fill="#55655e">OUT OF 100</text></svg>`;
    $("#sc-ring").setAttribute("aria-label", `Score ${d.score} out of 100`);
    $("#sc-tier").innerHTML = `<strong>${d.tier}</strong><span>${d.next ? `${d.next.pointsNeeded} point${d.next.pointsNeeded === 1 ? "" : "s"} to ${d.next.name}` : "The top tier. Thank you."}</span>`;
    $("#sc-parts").innerHTML = d.parts.map((p) => `<div class="score-part"><div class="score-part-head"><span>${p.label}</span><strong>${p.score} / ${p.max}</strong></div><div class="score-bar"><i style="--p:${p.score / p.max}"></i></div><small>${p.detail}</small></div>`).join("");
    const names = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const now = new Date(); const start = (now.getMonth() - 11 + 12) % 12;
    const hist = (d.history || "").padStart(12, "-");
    $("#sc-months").innerHTML = [...hist].map((ch, i) => { const cls = ch === "O" ? "on" : ch === "L" ? "late" : ch === "M" ? "missed" : "none"; const title = ch === "O" ? "On time" : ch === "L" ? "Late" : ch === "M" ? "Missed" : "Not due"; return `<span class="m ${cls}" title="${title}"><i></i>${names[(start + i) % 12]}</span>`; }).join("");
    $("#sc-streak").textContent = d.streak >= 12 ? "Twelve months on time in a row. That is the best it gets." : d.streak > 0 ? `${d.streak} month${d.streak === 1 ? "" : "s"} on time in a row.` : d.history ? "The streak restarts with the next on-time payment." : "";
    const rewards = d.rewards.map((x) => /\[.*\]/.test(x) ? `<li class="muted">${x.replace(/\[|\]/g, "")}</li>` : `<li>${x}</li>`);
    if (d.rewardNote) rewards.unshift(`<li><strong>${d.rewardNote}</strong></li>`);
    $("#sc-rewards").innerHTML = rewards.length ? rewards.join("") : `<li class="muted">Rewards start at Silver. ${d.next ? `${d.next.pointsNeeded} points to go.` : ""}</li>`;
    $("#sc-tips").innerHTML = d.tips.map((t) => `<li>${t}</li>`).join("");
  }

  $("#sc-signout").addEventListener("click", () => { saveSession(null, null); card.hidden = true; gate.hidden = false; refForm.hidden = false; codeForm.hidden = true; channels.hidden = true; msg.hidden = true; $("#sc-ref").value = ""; });

  const st = load();
  if (st.session) show(st.session);
})();
