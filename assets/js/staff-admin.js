// /staff-admin/ — Damian's view of the day: who signed in and out, who was
// refused and why, and the register of known office broadband addresses.
(() => {
  const authBox = document.getElementById("sa-auth");
  const view = document.getElementById("sa-view");
  if (!authBox || !view) return;
  const out = document.getElementById("sa-out");
  const statusEl = document.getElementById("sa-status");
  const keyField = document.getElementById("sa-key");
  const dateField = document.getElementById("sa-date");
  const monthField = document.getElementById("sa-month");
  const tsOut = document.getElementById("sa-timesheet-out");

  const STORE = "ps.staffadmin.key";
  let key = null;
  try { key = localStorage.getItem(STORE); } catch { /* ignore */ }
  dateField.value = new Date().toISOString().slice(0, 10);
  if (monthField) monthField.value = new Date().toISOString().slice(0, 7);

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const say = (m, bad) => { statusEl.hidden = !m; statusEl.textContent = m || ""; statusEl.className = `notice${bad ? " err" : ""}`; };
  const hhmm = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—");

  const TONE = {
    verified: ["var(--success)", "Wi-Fi and location both matched"],
    "verified-no-gps": ["var(--success)", "On the office Wi-Fi; no location reading"],
    learned: ["var(--gold)", "New office address — confirm it below"],
    conflict: ["var(--gold)", "On the Wi-Fi but the device said elsewhere"],
    "off-site": ["var(--danger)", "Refused — not on the Wi-Fi, device said elsewhere"],
    unproven: ["var(--danger)", "Refused — nothing placed them at the office"],
    help: ["var(--gold)", "Asked the office"],
    remote: ["var(--success)", "Works from home — no Wi-Fi check applies"],
  };

  async function get() {
    const r = await fetch(`/api/team-admin?key=${encodeURIComponent(key)}&date=${encodeURIComponent(dateField.value)}`);
    if (!r.ok) throw new Error(r.status === 404 ? "That key was not recognised." : "Could not load the log.");
    return r.json();
  }

  async function post(payload) {
    const r = await fetch("/api/team-admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, ...payload }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "That did not work.");
    return d;
  }

  async function getTimesheet() {
    const r = await fetch(`/api/team-timesheet?key=${encodeURIComponent(key)}&month=${encodeURIComponent(monthField.value)}`);
    if (!r.ok) throw new Error(r.status === 404 ? "That key was not recognised." : "Could not load the timesheet.");
    return r.json();
  }

  function renderTimesheet(d) {
    if (!d.staff.length) { tsOut.innerHTML = `<p class="muted">No completed shifts for ${esc(d.month)} yet.</p>`; return; }
    tsOut.innerHTML = d.staff.map((s) => `
      <div style="margin-bottom:1.5rem">
        <h4 style="margin:0 0 .5rem">${esc(s.name)} — <strong>${Math.floor(s.totalMinutes / 60)}h ${s.totalMinutes % 60}m</strong>${s.totalBreakMinutes ? ` <span class="muted" style="font-size:var(--fs-0)">(${Math.floor(s.totalBreakMinutes / 60)}h ${s.totalBreakMinutes % 60}m break, not paid)</span>` : ""}</h4>
        <table style="width:100%;border-collapse:collapse;font-size:var(--fs-0)">
          <thead><tr style="text-align:left;border-bottom:1px solid var(--line-strong)">
            <th style="padding:.35rem">Date</th><th style="padding:.35rem">Start</th><th style="padding:.35rem">End</th><th style="padding:.35rem">Hours</th>
          </tr></thead>
          <tbody>${s.days.map((day) => `<tr style="border-bottom:1px solid var(--line)">
            <td style="padding:.35rem">${esc(day.date)}</td>
            <td style="padding:.35rem">${hhmm(day.startedAt)}</td>
            <td style="padding:.35rem">${hhmm(day.endedAt)}</td>
            <td style="padding:.35rem">${Math.floor(day.minutes / 60)}h ${day.minutes % 60}m${day.overrun ? ' <strong style="color:var(--gold)">— left open?</strong>' : ""}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>`).join("");
  }

  async function reloadTimesheet() {
    try { renderTimesheet(await getTimesheet()); }
    catch (e) { tsOut.innerHTML = `<p class="notice err">${esc(e.message)}</p>`; }
  }

  function render(d) {
    const ACTION_LABEL = { in: "sign-in", out: "sign-out", break: "going on break", return: "back from break", help: "asked the office" };
    const row = (e) => {
      const [colour, plain] = TONE[e.status] || ["var(--muted)", e.status || ""];
      const refused = e.kind === "refused";
      const action = ACTION_LABEL[e.action] || (e.status === "help" ? "asked the office" : e.endedAt ? "shift" : "sign-in");
      return `<tr style="border-bottom:1px solid var(--line)">
        <td style="padding:.5rem">${hhmm(e.at)}</td>
        <td style="padding:.5rem">${esc(e.staffName || "")}</td>
        <td style="padding:.5rem">${esc(action)}${refused ? ' <strong style="color:var(--danger)">(refused)</strong>' : ""}</td>
        <td style="padding:.5rem">${e.minutes != null ? `${Math.floor(e.minutes / 60)}h ${e.minutes % 60}m${e.breakMinutes ? ` <span class="muted">(incl. ${e.breakMinutes}m break)</span>` : ""}${e.overrun ? ' <strong style="color:var(--gold)">— left open?</strong>' : ""}` : ""}</td>
        <td style="padding:.5rem;color:${colour}">${esc(plain)}${e.distance != null ? ` · ${e.distance} m away` : ""}</td>
        <td style="padding:.5rem;font-size:var(--fs-0);color:var(--muted)">${esc(e.ip || "")}</td>
      </tr>`;
    };

    out.innerHTML = `
      ${d.pending.length ? `
      <div class="notice" style="border-color:var(--gold);margin-bottom:1.5rem">
        <h3 style="margin:0 0 .5rem">Addresses waiting on you</h3>
        <p class="muted" style="margin:0 0 .75rem">These were accepted because the device's location matched the office — usually the router picked up a new address. Confirm the ones you recognise; remove anything you do not.</p>
        ${d.pending.map((p) => `<p style="margin:.4rem 0">
          <code>${esc(p.ip)}</code>
          <span class="muted" style="font-size:var(--fs-0)"> — first seen ${new Date(p.firstSeen).toLocaleString("en-GB")}, ${p.seenCount} time(s)</span>
          <button class="btn btn-ghost btn-sm" data-confirm data-ip="${esc(p.ip)}" style="margin-left:.5rem">Confirm</button>
          <button class="btn btn-ghost btn-sm" data-forget data-ip="${esc(p.ip)}" style="margin-left:.25rem">Remove</button>
        </p>`).join("")}
      </div>` : ""}

      <h3>Today's events</h3>
      ${d.events.length ? `
      <table style="width:100%;border-collapse:collapse;font-size:var(--fs-1)">
        <thead><tr style="text-align:left;border-bottom:2px solid var(--line-strong)">
          <th style="padding:.5rem">Time</th><th style="padding:.5rem">Who</th><th style="padding:.5rem">What</th>
          <th style="padding:.5rem">Length</th><th style="padding:.5rem">Outcome</th><th style="padding:.5rem">Address</th>
        </tr></thead>
        <tbody>${d.events.map(row).join("")}</tbody>
      </table>` : `<p class="muted">Nothing recorded for this date.</p>`}

      <h3 style="margin-top:2rem">Known office addresses</h3>
      ${d.register.length ? `<ul>${d.register.map((r) => `<li><code>${esc(r.ip)}</code>${r.confirmedAt ? " — confirmed" : " — unconfirmed"}</li>`).join("")}</ul>` : `<p class="muted">None recorded yet. The first clean sign-in on the office Wi-Fi will add one.</p>`}

      <h3 style="margin-top:2rem">Staff with a code</h3>
      <ul>${d.staff.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>`;
  }

  async function reload() {
    say("Loading…");
    try { render(await get()); say(""); }
    catch (e) { say(e.message, true); }
  }

  document.getElementById("sa-auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    key = keyField.value.trim();
    try { localStorage.setItem(STORE, key); } catch { /* ignore */ }
    try {
      await get();
      authBox.hidden = true;
      view.hidden = false;
      await reload();
      await reloadTimesheet();
    } catch (err) { say(err.message, true); }
  });

  document.getElementById("sa-reload").addEventListener("click", reload);
  document.getElementById("sa-timesheet-reload").addEventListener("click", reloadTimesheet);

  out.addEventListener("click", async (e) => {
    const confirmBtn = e.target.closest("[data-confirm]");
    const forgetBtn = e.target.closest("[data-forget]");
    if (!confirmBtn && !forgetBtn) return;
    const btn = confirmBtn || forgetBtn;
    btn.disabled = true;
    try {
      await post({ action: confirmBtn ? "confirm" : "forget", ip: btn.dataset.ip });
      await reload();
    } catch (err) { say(err.message, true); btn.disabled = false; }
  });

  if (key) {
    get().then((d) => { authBox.hidden = true; view.hidden = false; render(d); }).catch(() => {});
    reloadTimesheet();
  }
})();
