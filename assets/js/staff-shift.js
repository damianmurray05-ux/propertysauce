// /staff/ — the office clock. Built for a phone or shared tablet: two big
// buttons, plain words, no state the person cannot get out of. Ported from
// Luxe Stay's housekeeper clock, with the property picker removed — there
// is only one office.
(() => {
  const root = document.getElementById("staff-root");
  if (!root) return;

  const TOKEN = "ps.staff.token";
  const api = (p, opts) => fetch(p, opts).then(async (r) => {
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, d };
  });

  let token = null;
  try { token = localStorage.getItem(TOKEN); } catch { /* private mode */ }

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hhmm = (iso) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const say = (msg, tone = "") => {
    let el = root.querySelector("[data-staff-status]");
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
    el.className = `notice${tone === "bad" ? " err" : ""}`;
    if (tone === "good") el.style.borderColor = "var(--success)";
  };

  /** One fresh position fix, or null. Never rejects. */
  const position = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    const done = (v) => { clearTimeout(t); resolve(v); };
    const t = setTimeout(() => resolve(null), 12_000);
    navigator.geolocation.getCurrentPosition(
      (p) => done({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => done(null),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  });

  function renderSignIn(message) {
    root.innerHTML = `
      <h2>Sign in.</h2>
      <p class="muted">Your name and the code the office gave you.</p>
      <form class="score-form" id="staff-login" style="grid-template-columns:1fr" novalidate>
        <div class="field"><label for="st-name">Your name</label><input id="st-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="st-code">Your code</label><input id="st-code" name="code" inputmode="numeric" autocomplete="off" required></div>
        <button class="btn btn-primary" type="submit">Sign in <svg class="ic btn-ic" aria-hidden="true"><use href="/assets/icons.svg#arrow-up-right"/></svg></button>
      </form>
      <p class="notice" data-staff-status hidden></p>`;
    if (message) say(message, "bad");
  }

  function renderClock(data, holidays) {
    const open = data.open;
    const onBreak = Boolean(open?.onBreak);
    const remote = Boolean(data.staff.remote);
    root.innerHTML = `
      <h2>Hello ${esc(data.staff.name.split(" ")[0])}.</h2>
      <p class="muted">${remote ? "Working from home" : esc(data.office.name)}</p>
      ${open ? `
        <p style="margin:1rem 0">You started at <strong>${hhmm(open.startedAt)}</strong>.${onBreak ? ` On a break since <strong>${hhmm(open.breakStartedAt)}</strong>.` : ""}</p>
        ${onBreak
          ? `<button class="btn btn-primary" type="button" data-return style="width:100%;padding:1.1rem">I've returned</button>`
          : `<button class="btn btn-primary" type="button" data-break style="width:100%;padding:1.1rem">Going on break</button>`}
        <button class="btn btn-ghost" type="button" data-out style="width:100%;padding:1.1rem;margin-top:.75rem">Finish my shift</button>
      ` : `
        <button class="btn btn-primary" type="button" data-in style="width:100%;padding:1.1rem;margin-top:1rem">I am here — start my shift</button>
      `}
      <p class="notice" data-staff-status hidden style="margin-top:1rem"></p>
      <p class="muted" style="margin-top:1.5rem;font-size:var(--fs-0)">
        ${remote
          ? `Working from home, so there's no Wi-Fi check — your code is all that's needed. Something not working? <a href="#" data-help>tell the office</a>.`
          : `You need to be on the office Wi-Fi for this to work. First time today, or it won't let you
             in even though you're definitely at the office? <a href="#" data-register>Register this office Wi-Fi</a>,
             then try again. Still stuck — <a href="#" data-help>tell the office</a>, don't just carry on.`}
      </p>
      <button class="btn btn-ghost btn-sm" type="button" data-signout style="margin-top:1rem">Not you? Sign out</button>
      ${renderHolidays(holidays)}`;
  }

  function renderHolidays(h) {
    if (!h) return "";
    const hOver = h.holidayRemaining < 0, sOver = h.sickRemaining < 0;
    const row = (r) => `<li style="padding:.4rem 0;border-top:1px solid var(--line)">
      ${r.type === "sick" ? "Sick" : "Holiday"}: ${esc(r.startDate)}${r.endDate !== r.startDate ? ` – ${esc(r.endDate)}` : ""}
      — ${r.chargedDays} day${r.chargedDays === 1 ? "" : "s"}${r.shortNotice && !r.isEmergency ? ' <span class="muted">(doubled — short notice)</span>' : ""}${r.isEmergency ? ' <span class="muted">(emergency, proof on file)</span>' : ""}
    </li>`;
    return `
      <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--line)">
        <p style="margin:0 0 .5rem">${h.publicHolidays} fixed public holiday${h.publicHolidays === 1 ? "" : "s"} a year — nothing to book, the office is simply closed.</p>
        <p style="margin:0 0 .5rem">
          <strong style="${hOver ? "color:var(--danger)" : ""}">${h.holidayRemaining} holiday day${h.holidayRemaining === 1 ? "" : "s"}</strong> left this year
          <span class="muted" style="font-size:var(--fs-0)">(${h.holidayAllowance} allowed, ${h.holidayTakenDays} taken${hOver ? " — over allowance" : ""})</span>
        </p>
        <p style="margin:0 0 .75rem">
          <strong style="${sOver ? "color:var(--danger)" : ""}">${h.sickRemaining} sick day${h.sickRemaining === 1 ? "" : "s"}</strong> left this year
          <span class="muted" style="font-size:var(--fs-0)">(${h.sickAllowance} allowed, ${h.sickTakenDays} taken${sOver ? " — over allowance" : ""})</span>
        </p>
        <button class="btn btn-ghost btn-sm" type="button" data-book-holiday="holiday">Book a holiday</button>
        <button class="btn btn-ghost btn-sm" type="button" data-book-holiday="sick" style="margin-left:.5rem">Take a sick day</button>
        <div id="holiday-form" hidden style="margin-top:1rem"></div>
        ${h.requests.length ? `<ul style="margin-top:1rem;padding-left:0;list-style:none;font-size:var(--fs-0)">${h.requests.slice(0, 8).map(row).join("")}</ul>` : ""}
      </div>`;
  }

  function holidayFormHtml(type) {
    const sick = type === "sick";
    return `
      <form class="score-form" id="holiday-request-form" data-leave-type="${type}" style="grid-template-columns:1fr" novalidate>
        <div class="field"><label for="h-start">First day</label><input id="h-start" type="date" required></div>
        <div class="field"><label for="h-end">Last day</label><input id="h-end" type="date" required></div>
        <div class="field"><label for="h-reason">Reason (optional)</label><input id="h-reason" type="text"></div>
        ${sick ? "" : `<label style="display:flex;gap:.5rem;align-items:center;font-size:var(--fs-0)">
          <input id="h-emergency" type="checkbox"> This is a medical emergency (upload proof to avoid the short-notice penalty)
        </label>
        <div class="field" id="h-proof-field" hidden><label for="h-proof">Proof (PDF)</label><input id="h-proof" type="file" accept="application/pdf"></div>`}
        <button class="btn btn-primary btn-sm" type="submit">${sick ? "Log sick day" : "Request holiday"}</button>
      </form>
      <p class="notice" data-holiday-status hidden style="margin-top:.75rem"></p>`;
  }

  async function loadHolidays() {
    const { ok, d } = await api("/api/team-holiday", { headers: { authorization: `Bearer ${token}` } });
    return ok ? d : null;
  }

  async function load() {
    const { status, d } = await api("/api/team-shift", { headers: { authorization: `Bearer ${token}` } });
    if (status === 401) { try { localStorage.removeItem(TOKEN); } catch { /* ignore */ } token = null; return renderSignIn("Please sign in again."); }
    if (status !== 200) return renderSignIn(d.error || "Something went wrong. Ring the office.");
    const holidays = await loadHolidays();
    renderClock(d, holidays);
  }

  async function clock(action, extra = {}) {
    say("Checking you are at the office…");
    const coords = await position();
    const { ok, d } = await api("/api/team-shift", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ action, coords, ...extra }),
    });
    if (!ok) { say(`${d.message || d.error || "That did not work."} ${d.fix || ""}`.trim(), "bad"); return; }
    if (d.raised) { say(d.message, "good"); return; }
    await load();
    const DONE = {
      in: "Signed in. Have a good shift.",
      out: `Signed out. That was ${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m${d.breakMinutes ? ` (incl. ${d.breakMinutes}m break)` : ""}.`,
      break: "Enjoy your break.",
      return: `Welcome back.${d.breakMinutes ? ` That break was ${d.breakMinutes}m.` : ""}`,
      "register-network": "Thanks — this office Wi-Fi is now recognised. Tap below to try again.",
    };
    say(DONE[action] || "Done.", "good");
  }

  /** A File to base64, no compression — needed intact for a PDF. */
  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  root.addEventListener("submit", async (e) => {
    const loginForm = e.target.closest("#staff-login");
    if (loginForm) {
      e.preventDefault();
      say("Checking…");
      const { ok, d } = await api("/api/team-signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: loginForm.name.value, code: loginForm.code.value }),
      });
      if (!ok) return say(d.error || "That did not work.", "bad");
      token = d.token;
      try { localStorage.setItem(TOKEN, token); } catch { /* ignore */ }
      await load();
      return;
    }

    const holidayForm = e.target.closest("#holiday-request-form");
    if (holidayForm) {
      e.preventDefault();
      const type = holidayForm.dataset.leaveType === "sick" ? "sick" : "holiday";
      const statusEl = root.querySelector("[data-holiday-status]");
      const say2 = (m, bad) => { if (!statusEl) return; statusEl.hidden = !m; statusEl.textContent = m || ""; statusEl.className = `notice${bad ? " err" : ""}`; };
      say2("Checking…");
      const emergencyBox = root.querySelector("#h-emergency");
      const emergency = Boolean(emergencyBox && emergencyBox.checked);
      const fileInput = root.querySelector("#h-proof");
      let proof = null;
      if (emergency) {
        const file = fileInput?.files?.[0];
        if (!file) return say2("Add the PDF proof, or untick the emergency box.", true);
        proof = await readAsBase64(file);
      }
      const { ok, d } = await api("/api/team-holiday", {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          type,
          startDate: root.querySelector("#h-start").value,
          endDate: root.querySelector("#h-end").value,
          reason: root.querySelector("#h-reason").value,
          isEmergency: emergency,
          proof,
        }),
      });
      if (!ok) return say2(d.error || "That did not work.", true);
      await load();
      say(`Booked — ${d.chargedDays} ${type} day${d.chargedDays === 1 ? "" : "s"}${d.shortNotice && !d.isEmergency ? " (doubled for short notice)" : ""}. You have ${d.remaining} ${type} day${d.remaining === 1 ? "" : "s"} left.`, "good");
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.id === "h-emergency") {
      const field = root.querySelector("#h-proof-field");
      if (field) field.hidden = !e.target.checked;
    }
  });

  root.addEventListener("click", async (e) => {
    if (e.target.closest("[data-in]")) return clock("in");
    if (e.target.closest("[data-out]")) return clock("out");
    if (e.target.closest("[data-break]")) return clock("break");
    if (e.target.closest("[data-return]")) return clock("return");
    const bookBtn = e.target.closest("[data-book-holiday]");
    if (bookBtn) {
      const type = bookBtn.dataset.bookHoliday;
      const el = root.querySelector("#holiday-form");
      if (!el) return;
      if (!el.hidden && el.dataset.shownType === type) { el.hidden = true; return; }
      el.hidden = false;
      el.dataset.shownType = type;
      el.innerHTML = holidayFormHtml(type);
      return;
    }
    if (e.target.closest("[data-signout]")) {
      try { localStorage.removeItem(TOKEN); } catch { /* ignore */ }
      token = null;
      return renderSignIn();
    }
    if (e.target.closest("[data-help]")) {
      e.preventDefault();
      const note = prompt("What is the problem? The office will see this.");
      if (note === null) return;
      return clock("help", { note });
    }
  });

  if (token) load(); else renderSignIn();
})();
