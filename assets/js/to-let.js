// Fetches the live "to let" list and renders it. No sign-in involved: this
// is the public list, built from /api/properties/, which already strips
// everything but what a prospective tenant should see.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const gbp = (n) => `£${Number(n || 0).toLocaleString("en-GB")}`;
  const bedroomLabel = (b) => {
    const s = String(b || "").trim();
    if (!s) return "";
    if (/^studio$/i.test(s)) return "Studio";
    return `${s} bed${s === "1" ? "" : "s"}`;
  };

  async function load() {
    const loading = $("#tl-loading"), empty = $("#tl-empty"), grid = $("#tl-grid");
    try {
      const r = await fetch("/api/properties/");
      const d = await r.json();
      const properties = d.properties || [];
      loading.hidden = true;
      if (!properties.length) { empty.hidden = false; return; }
      grid.innerHTML = properties.map((p) => `
        <article class="tl-card">
          <div class="tl-card-top">
            <h3>${esc(p.address)}</h3>
            <p class="tl-rent">${gbp(p.rentPcm)} <span>pcm</span></p>
          </div>
          <ul class="tl-facts">
            ${p.bedrooms ? `<li>${esc(bedroomLabel(p.bedrooms))}</li>` : ""}
            ${p.propertyType ? `<li>${esc(p.propertyType)}</li>` : ""}
            ${p.garden ? `<li>${esc(p.garden)} garden</li>` : ""}
            ${p.epcRating ? `<li>EPC ${esc(p.epcRating)}</li>` : ""}
          </ul>
          ${p.description ? `<p class="tl-desc">${esc(p.description)}</p>` : ""}
          <button type="button" class="btn btn-primary btn-sm" data-open-chat="tenancy" data-property="${esc(p.address)}">Register interest <svg class="ic btn-ic" aria-hidden="true"><use href="/assets/icons.svg#arrow-up-right"/></svg></button>
        </article>
      `).join("");
    } catch (e) {
      loading.textContent = "The list could not be loaded. Please try again shortly, or get in touch and we will send you what is available.";
    }
  }
  load();
})();
