// Shared page shell for Property Sauce. Site facts live here once.
// Anything marked [to be confirmed] must be confirmed by Damian before launch;
// it never reaches structured data.

export const site = {
  name: "Property Sauce",
  legalName: "Sure Lets and Manage Limited",
  domain: "propertysauce.co",
  url: "https://propertysauce.co",
  phone: "+44 (0)20 8988 8434",
  phoneHref: "tel:+442089888434",
  phoneE164: "+442089888434",
  email: "contact@propertysauce.co",
  address: "Top Floor, 55 Coopers Lane, Leyton, London E10 5DG",
  addressParts: { street: "Top Floor, 55 Coopers Lane", locality: "London", postcode: "E10 5DG" },
  registeredOffice: "Lancaster House, Brownrigg Drive, Cramlington NE23 6UN",
  companyNumber: "16613860",
  prs: "PRS058008",
  ico: "ZC027659",
  hours: "Monday to Friday, 9am to 6pm",
  description:
    "Property Sauce lets, manages and acquires residential property across England: lettings and management for landlords, block and portfolio management for corporate and institutional owners, and direct purchase of blocks of flats, including distressed stock.",
  sameAs: [],
};

export const nav = [
  ["/landlords/", "Landlords"],
  ["/investors/", "Investors"],
  ["/block-management/", "Block management"],
  ["/sell/", "Sell to us"],
  ["/tenants/", "Tenants"],
  ["/about/", "About"],
  ["/contact/", "Contact"],
];

export const icon = (name, cls = "") =>
  `<svg class="ic ${cls}" width="20" height="20" aria-hidden="true"><use href="/assets/icons.svg#${name}"/></svg>`;

// The brand lockup, in HTML so it inherits colour: the PS monogram with its
// gold hairline (CSS text-stroke), a gold rule, the name and the descriptor.
export const brand = () =>
  `<span class="mono" aria-hidden="true">P<span>S</span></span><span class="brand-text"><span class="brand-word">Property Sauce</span><span class="brand-tag">Portfolios · Block management · Acquisitions</span></span>`;
export const mark = brand;

export function layout(meta, body) {
  const title = meta.title ? `${meta.title} | ${site.name}` : `${site.name} | Lettings, block management and property acquisition across England`;
  const desc = meta.description || site.description;
  const canonical = `${site.url}${meta.path}`;
  const dark = meta.header === "dark";
  const ogImage = `${site.url}/assets/og.png`;

  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "RealEstateAgent"],
        "@id": `${site.url}/#organization`,
        name: site.name,
        legalName: site.legalName,
        alternateName: "Property Sauce (a trading name of Sure Lets and Manage Limited)",
        url: site.url,
        logo: `${site.url}/brand/logo-primary-on-paper.png`,
        image: ogImage,
        telephone: site.phoneE164,
        email: site.email,
        description: site.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.addressParts.street,
          addressLocality: site.addressParts.locality,
          postalCode: site.addressParts.postcode,
          addressCountry: "GB",
        },
        areaServed: { "@type": "Country", name: "England" },
        memberOf: { "@type": "Organization", name: "Property Redress Scheme" },
        knowsAbout: ["Residential lettings", "Block management", "Portfolio management", "Property acquisition", "Distressed property"],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en-GB",
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description: desc,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
        inLanguage: "en-GB",
      },
    ],
  };
  if (meta.path !== "/") {
    org["@graph"].push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: meta.title, item: canonical },
      ],
    });
  }
  const extraLd = meta.jsonld ? `\n<script type="application/ld+json">${meta.jsonld}</script>` : "";

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${meta.noindex === "true" ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#0f2a22">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/cormorant-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
${meta.preload ? `<link rel="preload" href="${meta.preload}" as="image" fetchpriority="high">` : ""}
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/main.css">
<script type="application/ld+json">${JSON.stringify(org)}</script>${extraLd}
</head>
<body class="${dark ? "header-dark" : ""}" data-page="${meta.slug}">
<a class="skip" href="#main">Skip to content</a>

<header class="site-header" id="top">
  <div class="header-inner">
    <a class="brand" href="/" aria-label="${site.name} home">
      ${brand()}
    </a>
    <nav class="nav" aria-label="Primary">
      ${nav
        .map(([href, label]) => `<a href="${href}"${meta.path === href ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("\n      ")}
    </nav>
    <a class="btn btn-primary btn-sm header-cta" href="/contact/">Talk to us ${icon("arrow-up-right", "btn-ic")}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
      <span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <nav aria-label="Mobile">
      ${nav.map(([href, label], i) => `<a href="${href}" style="--i:${i}">${label}</a>`).join("\n      ")}
      <a href="/contact/" class="btn btn-primary" style="--i:${nav.length}">Talk to us ${icon("arrow-up-right", "btn-ic")}</a>
    </nav>
    <p class="mobile-nav-foot"><a href="${site.phoneHref}">${site.phone}</a><br><a href="mailto:${site.email}">${site.email}</a></p>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a class="brand" href="/">${brand()}</a>
      <p class="footer-tag">Lettings, block and portfolio management, and direct acquisition of residential blocks across England.</p>
      <p class="footer-contact">
        <a href="${site.phoneHref}">${site.phone}</a><br>
        <a href="mailto:${site.email}">${site.email}</a><br>
        ${site.address}
      </p>
    </div>
    <div class="footer-col">
      <h2>Services</h2>
      <a href="/landlords/">Landlords</a>
      <a href="/landlord-portal/">Landlord portal</a>
      <a href="/investors/">Corporate and institutional</a>
      <a href="/block-management/">Block management</a>
      <a href="/investors/#portfolio">Portfolio management</a>
      <a href="/sell/">Sell a property or block</a>
    </div>
    <div class="footer-col">
      <h2>Company</h2>
      <a href="/about/">About</a>
      <a href="/tenants/">Tenants</a>
      <a href="/my-tenancy/">My tenancy scorecard</a>
      <a href="/contact/">Contact</a>
      <a href="/complaints/">Complaints</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
    </div>
    <div class="footer-col">
      <h2>Calculators</h2>
      <a href="/leasehold-calculator/">Lease extension calculator</a>
      <a href="/capital-gains-tax-calculator/">Capital gains tax calculator</a>
    </div>
    <div class="footer-col">
      <h2>Accreditation</h2>
      <p>Property Redress Scheme member ${site.prs}</p>
      <p>ICO registered ${site.ico}</p>
      <p>Professional indemnity insured</p>
    </div>
  </div>
  <div class="footer-legal">
    <p>Property Sauce is a trading name of ${site.legalName}, registered in England and Wales, company number ${site.companyNumber}. Registered office: ${site.registeredOffice}. Sure Lets &amp; Manage and Luxe Stay are trading names of the same company.</p>
    <p>&copy; ${new Date().getFullYear()} ${site.legalName}. <a href="/credits/">Photography credits</a>. <a href="/brand/">Brand</a>.</p>
  </div>
</footer>

<div class="chat" id="chat" hidden role="dialog" aria-label="Property Sauce assistant">
  <div class="chat-head">
    <div>
      <strong>Property Sauce assistant</strong>
      <span id="chat-status">Repairs, tenancies and enquiries</span>
    </div>
    <button type="button" class="chat-close" aria-label="Close assistant">${icon("x")}</button>
  </div>
  <div class="chat-log" id="chat-log" aria-live="polite"></div>
  <div class="chat-actions" id="chat-actions"></div>
  <p class="chat-foot">Emergency? Ring <a href="${site.phoneHref}">${site.phone}</a>. Smell gas: 0800 111 999.</p>
</div>
<button type="button" class="chat-launch" id="chat-launch" aria-controls="chat" aria-expanded="false">
  ${icon("chat-circle-dots")} <span>Report a repair or ask a question</span>
</button>

<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/assistant.js" defer></script>
</body>
</html>
`;
}

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
