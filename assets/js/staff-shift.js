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

  function renderClock(data) {
    const open = data.open;
    root.innerHTML = `
      <h2>Hello ${esc(data.staff.name.split(" ")[0])}.</h2>
      <p class="muted">${esc(data.office.name)}</p>
      ${open ? `
        <p style="margin:1rem 0">You started at <strong>${hhmm(open.startedAt)}</strong>.</p>
        <button class="btn btn-primary" type="button" data-out style="width:100%;padding:1.1rem">Finish my shift</button>
      ` : `
        <button class="btn btn-primary" type="button" data-in style="width:100%;padding:1.1rem;margin-top:1rem">I am here — start my shift</button>
      `}
      <p class="notice" data-staff-status hidden style="margin-top:1rem"></p>
      <p class="muted" style="margin-top:1.5rem;font-size:var(--fs-0)">
        You need to be on the office Wi-Fi for this to work. If it will not let you in and you are
        definitely at the office, <a href="#" data-help>tell the office</a> — do not just carry on.
      </p>
      <button class="btn btn-ghost btn-sm" type="button" data-signout style="margin-top:1rem">Not you? Sign out</button>`;
  }

  async function load() {
    const { status, d } = await api("/api/team-shift", { headers: { authorization: `Bearer ${token}` } });
    if (status === 401) { try { localStorage.removeItem(TOKEN); } catch { /* ignore */ } token = null; return renderSignIn("Please sign in again."); }
    if (status !== 200) return renderSignIn(d.error || "Something went wrong. Ring the office.");
    renderClock(d);
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
    say(action === "in" ? "Signed in. Have a good shift." : `Signed out. That was ${Math.floor(d.minutes / 60)}h ${d.minutes % 60}m.`, "good");
  }

  root.addEventListener("submit", async (e) => {
    const form = e.target.closest("#staff-login");
    if (!form) return;
    e.preventDefault();
    say("Checking…");
    const { ok, d } = await api("/api/team-signin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: form.name.value, code: form.code.value }),
    });
    if (!ok) return say(d.error || "That did not work.", "bad");
    token = d.token;
    try { localStorage.setItem(TOKEN, token); } catch { /* ignore */ }
    await load();
  });

  root.addEventListener("click", async (e) => {
    if (e.target.closest("[data-in]")) return clock("in");
    if (e.target.closest("[data-out]")) return clock("out");
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
