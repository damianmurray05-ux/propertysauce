/* Property Sauce. Progressive enhancement only: the site works without this file. */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Header: gains a hairline and blur once scrolled, via IntersectionObserver on a sentinel. */
  const header = $(".site-header");
  if (header) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:40px;height:1px;width:1px;pointer-events:none";
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => header.classList.toggle("is-scrolled", !e.isIntersecting), { threshold: 0 }).observe(sentinel);
  }

  /* Mobile menu */
  const toggle = $(".menu-toggle");
  const mobile = $("#mobile-nav");
  if (toggle && mobile) {
    const set = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
      if (open) {
        mobile.hidden = false;
        requestAnimationFrame(() => mobile.classList.add("is-open"));
      } else {
        mobile.classList.remove("is-open");
        setTimeout(() => { if (!mobile.classList.contains("is-open")) mobile.hidden = true; }, reduce ? 0 : 400);
      }
    };
    toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") set(false); });
  }

  /* Scroll reveal: opacity/transform only, once. */
  const revealables = $$("[data-reveal]");
  if (revealables.length && !reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  /* Contact form: static hosting, so the message is handed to the visitor's
     mail client with everything filled in. */
  const form = $("#enquiry-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const required = ["name", "email", "message"];
      let ok = true;
      required.forEach((k) => {
        const field = form.elements[k];
        const err = $(`[data-error-for="${k}"]`, form);
        const bad = !String(d.get(k) || "").trim() || (k === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.get(k)));
        field.setAttribute("aria-invalid", String(bad));
        if (err) err.hidden = !bad;
        if (bad) ok = false;
      });
      if (!ok) { form.querySelector("[aria-invalid='true']").focus(); return; }
      const lines = [
        `Name: ${d.get("name")}`,
        `Email: ${d.get("email")}`,
        `Phone: ${d.get("phone") || "-"}`,
        `I am: ${d.get("role") || "-"}`,
        `Property: ${d.get("property") || "-"}`,
        "",
        d.get("message"),
      ];
      const subject = encodeURIComponent(`Enquiry from ${d.get("name")} via propertysauce.co`);
      window.location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
      $("#form-sent").hidden = false;
    });
  }

  /* Pointer-lit surfaces and a gentle magnetic pull on primary buttons.
     Disabled for touch and reduced motion. */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".cell, .group, .cta").forEach((el) => {
      el.classList.add("lit");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
    $$(".btn-primary:not(.chat-form .btn)").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate(${dx * 5}px, ${dy * 5}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* Accordions: native details, one open at a time per group. */
  $$("[data-accordion]").forEach((group) => {
    group.addEventListener("toggle", (e) => {
      if (e.target.open) $$("details[open]", group).forEach((d) => { if (d !== e.target) d.open = false; });
    }, true);
  });
})();
