// Generates public/sitemap.xml at predev/prebuild.
// Pulls published blog posts, active products, published pages, and active
// categories from Supabase so search engines see every indexable URL.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://wonderfuldragonfruit.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://vygqzgchomarcyuikozb.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Z3F6Z2Nob21hcmN5dWlrb3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk4NjQsImV4cCI6MjA4NDU2NTg2NH0.amFdTNPCrxR6RsNKFQIaoiKgb9Hxcx9jl4Vtiu2iJ1A";

interface Entry {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const staticRoutes: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/consultations", changefreq: "monthly", priority: "0.8" },
  { path: "/rooting-services", changefreq: "monthly", priority: "0.8" },
  { path: "/association", changefreq: "monthly", priority: "0.7" },
  { path: "/directory", changefreq: "weekly", priority: "0.7" },
  { path: "/directory/register", changefreq: "monthly", priority: "0.5" },
  { path: "/business-resources", changefreq: "monthly", priority: "0.6" },
  { path: "/education", changefreq: "monthly", priority: "0.7" },
  { path: "/education/commercial-orders", changefreq: "monthly", priority: "0.7" },
  { path: "/dragon-fruit-botswana", changefreq: "monthly", priority: "0.7" },
  { path: "/dragon-fruit-zimbabwe", changefreq: "monthly", priority: "0.7" },
  { path: "/dragon-fruit-namibia", changefreq: "monthly", priority: "0.7" },
  { path: "/history-of-dragon-fruit", changefreq: "monthly", priority: "0.6" },
  { path: "/dragon-fruit-global-production", changefreq: "monthly", priority: "0.6" },
  { path: "/largest-dragon-fruit-record", changefreq: "monthly", priority: "0.5" },
  { path: "/dragon-fruit-research-benefits", changefreq: "monthly", priority: "0.6" },
  { path: "/dragon-fruit-environmental-benefits", changefreq: "monthly", priority: "0.6" },
  { path: "/dragon-fruit-carbon-and-radiation-claims", changefreq: "monthly", priority: "0.5" },
  { path: "/dragon-fruit-industry-growth", changefreq: "monthly", priority: "0.6" },
  { path: "/africa-fruit-and-vegetable-markets", changefreq: "monthly", priority: "0.6" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function render(entries: Entry[]) {
  const urls = entries
    .map((e) =>
      [
        `  <url>`,
        `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const entries: Entry[] = [...staticRoutes];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const [{ data: blogs }, { data: products }, { data: pages }, { data: cats }] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, published_at").eq("is_published", true),
      supabase.from("products").select("slug, updated_at").eq("is_active", true),
      supabase.from("pages").select("slug, updated_at").eq("is_published", true),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true),
    ]);

    for (const b of blogs ?? []) {
      entries.push({
        path: `/blog/${b.slug}`,
        lastmod: (b.updated_at || b.published_at || new Date().toISOString()).split("T")[0],
        changefreq: "monthly",
        priority: "0.7",
      });
    }
    for (const p of products ?? []) {
      entries.push({
        path: `/product/${p.slug}`,
        lastmod: (p.updated_at || new Date().toISOString()).split("T")[0],
        changefreq: "weekly",
        priority: "0.8",
      });
    }
    for (const c of cats ?? []) {
      entries.push({
        path: `/category/${c.slug}`,
        lastmod: (c.updated_at || new Date().toISOString()).split("T")[0],
        changefreq: "weekly",
        priority: "0.7",
      });
    }
    for (const pg of pages ?? []) {
      entries.push({
        path: `/page/${pg.slug}`,
        lastmod: (pg.updated_at || new Date().toISOString()).split("T")[0],
        changefreq: "monthly",
        priority: "0.6",
      });
    }
  } catch (err) {
    console.warn("sitemap: dynamic fetch failed, writing static routes only:", err);
  }

  writeFileSync(resolve("public/sitemap.xml"), render(entries));
  console.log(`sitemap.xml written (${entries.length} URLs)`);
}

main();
