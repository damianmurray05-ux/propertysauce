// Single-property detail page. Reads ?id= from the URL, finds that property
// in the same public /api/properties/ list the main to-let page uses (no
// separate endpoint - the list is small and already public), and renders
// its full gallery, description and prev/next navigation through the list.
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
    const loading = $("#tlp-loading"), notFound = $("#tlp-notfound"), content = $("#tlp-content");
    const id = new URLSearchParams(location.search).get("id");
    try {
      const r = await fetch("/api/properties/");
      const d = await r.json();
      const properties = d.properties || [];
      const index = properties.findIndex((p) => p.id === id);
      loading.hidden = true;
      if (index === -1) { notFound.hidden = false; return; }
      const p = properties[index];
      content.hidden = false;

      const gallery = p.gallery && p.gallery.length ? p.gallery : (p.photo ? [p.photo] : []);
      $("#tlp-gallery").innerHTML = gallery.length
        ? gallery.map((src, i) => `<img src="${esc(src)}" alt="${esc(p.address)} - photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}">`).join("")
        : "";

      document.title = `${p.address} | Property Sauce`;
      $("#tlp-address").textContent = p.address;
      $("#tlp-rent").textContent = gbp(p.rentPcm);
      $("#tlp-facts").innerHTML = [
        p.bedrooms ? bedroomLabel(p.bedrooms) : "",
        p.propertyType || "",
        p.garden ? `${p.garden} garden` : "",
        p.epcRating ? `EPC ${p.epcRating}` : "",
      ].filter(Boolean).map((f) => `<li>${esc(f)}</li>`).join("");
      $("#tlp-desc").textContent = p.description || "";
      $("#tlp-desc").hidden = !p.description;
      // The click itself is handled by assistant.js's delegated [data-open-chat] listener.
      $("#tlp-register").dataset.openChat = "tenancy";
      $("#tlp-register").dataset.property = p.address;

      const prev = properties[index - 1], next = properties[index + 1];
      if (prev) { const a = $("#tlp-prev"); a.hidden = false; a.href = `/to-let-property/?id=${encodeURIComponent(prev.id)}`; a.textContent = `← ${prev.address}`; }
      if (next) { const a = $("#tlp-next"); a.hidden = false; a.href = `/to-let-property/?id=${encodeURIComponent(next.id)}`; a.textContent = `${next.address} →`; }
    } catch (e) {
      loading.textContent = "This could not be loaded. Please try again shortly.";
    }
  }
  load();
})();
