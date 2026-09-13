import { defineConfig } from "vitepress";
import { sidebar_content } from "./sidebar.mjs";

// Define base path once
const BASE_PATH = "/spice/"; // This should be your repo name.
const websiteURL = `https://abhiguptaio.github.io`;

// Footer social links.
const linkedInURL = "https://www.linkedin.com/in/abhiguptaio/";
const youTubeURL = "https://www.youtube.com/@abhiguptaio";

// Copyright range: collapses to a single year until the current year moves on.
const startYear = 2025;
const currentYear = new Date().getFullYear();
const copyrightYears =
  currentYear > startYear ? `${startYear}\u2013${currentYear}` : `${startYear}`;

export default defineConfig({
  base: BASE_PATH,

  title: "Adaptive Phase-Field Fracture",
  description:
    "Adaptive phase-field fracture: notes, examples, and research-grade implementations.",

  lastUpdated: false,

  markdown: {
    math: true,
  },

  head: [
    // Fonts
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
      },
    ],

    // Basic metadata
    [
      "meta",
      {
        name: "description",
        content:
          "Adaptive phase-field fracture methods with notes, examples, and reproducible research workflows.",
      },
    ],
    ["meta", { name: "author", content: "Abhinav Gupta" }],

    // Open Graph
    [
      "meta",
      { property: "og:title", content: "Adaptive Phase-Field Fracture" },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Research notes and examples on adaptive phase-field fracture, adaptivity, and HPC.",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:url",
        content: `${websiteURL}${BASE_PATH}`,
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: `${BASE_PATH}logos/og-image.png`,
      },
    ],

    // Twitter cards
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:title",
        content: "Adaptive Phase-Field Fracture",
      },
    ],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Notes and examples on adaptive phase-field fracture and large-scale simulations.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: `${BASE_PATH}logos/og-image.png`,
      },
    ],

    // Favicons
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "196x196",
        href: `${BASE_PATH}logos/favicon-196x196.png`,
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: `${BASE_PATH}logos/favicon-32x32.png`,
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: `${BASE_PATH}logos/favicon-16x16.png`,
      },
    ],
  ],

  themeConfig: {
    logo: {
      dark: `/logos/logo-dark.svg`,
      light: `/logos/logo-light.svg`,
    },

    siteTitle: false,

    search: {
      provider: "local",
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Notes", link: `/notes/` },
      { text: "Examples", link: `/examples/` },
    ],

    sidebar: sidebar_content,

    footer: {
      copyright: `<span class="footer-bar">
        <span class="footer-copy">Copyright © ${copyrightYears} <a href="https://abhigupta.io" target="_blank" rel="noreferrer">abhigupta.io</a></span>
        <span class="footer-social">
          <a class="footer-social-link" href="${linkedInURL || "#"}" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a class="footer-social-link" href="${youTubeURL || "#"}" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
        </span>
      </span>`,
    },
  },
});
