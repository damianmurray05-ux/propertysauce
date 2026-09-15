/* Small chart helpers for the portals: donut, bars and a legend. Pure SVG and
   HTML strings, no library, brand colours only. */
window.PSCharts = (() => {
  const C = { gold: "#B4924A", goldSoft: "#E4D6B4", ink: "#0F2A22", moss: "#2E7D5B", mossSoft: "#BFD9C9", accent: "#C8502A", paper2: "#E9EBE4", slate: "#55655E", mist: "#C9CFC6" };
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (n) => Number(n || 0).toLocaleString("en-GB");

  /* Donut: segments [{value, color, label}], centre label and sub line. */
  function donut(segments, o = {}) {
    const size = o.size || 168, thick = o.thick || 16, r = (size - thick) / 2, cx = size / 2, c = 2 * Math.PI * r;
    const total = segments.reduce((a, s) => a + (s.value || 0), 0) || 1;
    let offset = 0;
    const arcs = segments.filter((s) => s.value > 0).map((s) => {
      const len = (s.value / total) * c;
      const el = `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${thick}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cx})"><title>${esc(s.label)}: ${fmt(s.value)}</title></circle>`;
      offset += len; return el;
    }).join("");
    const label = o.label != null ? `<text x="${cx}" y="${cx + (o.sub ? 4 : 10)}" text-anchor="middle" font-family="Geist, system-ui, sans-serif" font-size="${o.labelSize || 34}" font-weight="600" fill="${C.ink}">${esc(o.label)}</text>` : "";
    const sub = o.sub ? `<text x="${cx}" y="${cx + 24}" text-anchor="middle" font-family="Geist, sans-serif" font-size="9" letter-spacing="1.8" fill="${C.slate}">${esc(o.sub).toUpperCase()}</text>` : "";
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(o.aria || o.label || "")}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${C.paper2}" stroke-width="${thick}"/>${arcs}${label}${sub}</svg>`;
  }

  /* Bars: groups [{label, values: [{v, color, title}]}]. HTML so it is responsive. */
  function bars(groups, o = {}) {
    const max = o.max || Math.max(1, ...groups.flatMap((g) => g.values.map((x) => x.v || 0)));
    const cols = groups.map((g) => `<div class="bar-group"><div class="bar-stack">${g.values.map((x) => `<i style="--h:${Math.max(0, Math.min(100, ((x.v || 0) / max) * 100))}%;background:${x.color}" title="${esc(x.title || "")}"></i>`).join("")}</div><span>${esc(g.label)}</span></div>`).join("");
    const axis = o.axis ? `<div class="bar-axis"><span>${esc(o.axis(max))}</span><span>${esc(o.axis(max / 2))}</span><span>${esc(o.axis(0))}</span></div>` : "";
    return `<div class="bars ${o.cls || ""}">${axis}<div class="bar-cols">${cols}</div></div>`;
  }

  const legend = (segments) => `<ul class="chart-legend">${segments.map((s) => `<li><i style="background:${s.color}"></i><span>${esc(s.label)}</span><strong>${s.text != null ? esc(s.text) : fmt(s.value)}</strong></li>`).join("")}</ul>`;

  /* Progress to the next tier: value 0..100 with named marks. */
  function progress(value, marks) {
    return `<div class="tier-track"><i style="--p:${Math.max(0, Math.min(100, value)) / 100}"></i>${marks.map((m) => `<b style="left:${m.min}%" class="${value >= m.min ? "hit" : ""}"><span>${esc(m.name)}</span></b>`).join("")}</div>`;
  }

  /* Zoho's job stages are long; these are the words a tenant or landlord needs. */
  const STAGES = { "Reported": "Reported", "Inspection Confirmed": "Inspection booked", "Awaiting Quotation": "Awaiting quote", "Quotation Received": "Quote received", "Quotation Sent to Landlord": "Quote with landlord", "Quotation Approved by Landlord": "Quote approved", "Contractor Instructed": "Contractor booked", "Contractor Confirmed Job Complete": "Work done", "Requested Tenant to Sign Off": "Awaiting sign-off", "Tenant Signed Off": "Signed off", "Invoice Received": "Completed" };
  const stage = (s, closed) => STAGES[s] || s || (closed ? "Closed" : "Open");
  // Job titles from Zoho start with the address; drop it when the card already says where.
  const jobTitle = (title, address) => { const t = String(title || ""); const i = t.indexOf(" - "); if (i > 0 && address && t.slice(0, i).trim().toLowerCase().startsWith(String(address).split(",")[0].trim().toLowerCase().slice(0, 6))) return t.slice(i + 3).trim() || t; return t; };
  return { C, donut, bars, legend, progress, fmt, esc, stage, jobTitle };
})();
