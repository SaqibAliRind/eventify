/**
 * Production Lighthouse audit runner
 * Targets: vite preview at http://localhost:4173
 * Pages: Home, Events, Event Details, Contact
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

const PREVIEW = "http://localhost:4173";
const OUT_DIR = "./lighthouse-reports/production";
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: "home",     url: `${PREVIEW}/` },
  { name: "events",   url: `${PREVIEW}/events` },
  { name: "contact",  url: `${PREVIEW}/contact` },
];

const commonFlags = [
  "--output=json",
  "--output=html",
  "--chrome-flags=\"--headless --no-sandbox --disable-gpu\"",
  "--only-categories=performance,accessibility,best-practices,seo",
  "--quiet",
];

const results = [];

for (const { name, url } of PAGES) {
  const outFile = `${OUT_DIR}/${name}`;
  console.log(`\n▶ Running Lighthouse (desktop) on ${name} (${url})...`);
  try {
    execSync(
      `npx lighthouse "${url}" ${commonFlags.join(" ")} --output-path="${outFile}" --preset=desktop`,
      { stdio: "pipe", timeout: 120000 }
    );

    const json = JSON.parse(
      (await import("fs")).default.readFileSync(outFile + ".report.json", "utf8")
    );
    const cats = json.categories;
    const row = {
      page:        name,
      perf:        Math.round(cats.performance.score * 100),
      a11y:        Math.round(cats.accessibility.score * 100),
      bestPrac:    Math.round(cats["best-practices"].score * 100),
      seo:         Math.round(cats.seo.score * 100),
    };
    results.push(row);
    console.log(`  Performance: ${row.perf} | Accessibility: ${row.a11y} | Best Practices: ${row.bestPrac} | SEO: ${row.seo}`);
  } catch (err) {
    console.error(`  ❌ Lighthouse failed on ${name}:`, err.message?.slice(0, 200));
  }
}

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║          PRODUCTION LIGHTHOUSE SCORES (desktop)          ║");
console.log("╠══════════════════════════════════════════════════════════╣");
console.log("║ Page       │ Performance │ Accessibility │ Best Practices │ SEO ║");
console.log("╠══════════════════════════════════════════════════════════╣");
for (const r of results) {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`║ ${pad(r.page, 11)}│ ${pad(r.perf, 12)}│ ${pad(r.a11y, 14)}│ ${pad(r.bestPrac, 15)}│ ${pad(r.seo, 4)} ║`);
}
console.log("╚══════════════════════════════════════════════════════════╝");
console.log(`\nHTML reports saved to: ${OUT_DIR}/`);
