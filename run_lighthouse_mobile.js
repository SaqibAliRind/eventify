import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const targetPages = [
    { name: "Home", url: "http://localhost:5173/" },
    { name: "Events", url: "http://localhost:5173/events" },
    { name: "Event Details", url: "http://localhost:5173/events/grand-royal-palace-wedding-658b23" },
    { name: "Contact", url: "http://localhost:5173/contact" }
];

const results = [];
const outDir = "./lighthouse-reports";
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

console.log("==========================================================================");
console.log("                 LIGHTHOUSE MOBILE AUDIT RUNNER (MOBILE FORM FACTOR)      ");
console.log("==========================================================================\n");

for (const p of targetPages) {
    const reportPath = path.join(outDir, `${p.name.toLowerCase().replace(/ /g, "_")}.json`);
    console.log(`Running Lighthouse Mobile audit for ${p.name} (${p.url})...`);
    
    try {
        const cmd = `npx lighthouse ${p.url} --output=json --output-path="${reportPath}" --chrome-flags="--headless --no-sandbox" --form-factor=mobile --screenEmulation.mobile=true --quiet`;
        execSync(cmd, { stdio: "inherit" });

        if (fs.existsSync(reportPath)) {
            const raw = fs.readFileSync(reportPath, "utf-8");
            const data = JSON.parse(raw);
            const cats = data.categories;

            const scores = {
                page: p.name,
                performance: Math.round((cats.performance?.score || 0) * 100),
                accessibility: Math.round((cats.accessibility?.score || 0) * 100),
                bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
                seo: Math.round((cats.seo?.score || 0) * 100)
            };

            results.push(scores);
            console.log(`\nScores for ${p.name}:`);
            console.log(`  Performance:    ${scores.performance}`);
            console.log(`  Accessibility:  ${scores.accessibility}`);
            console.log(`  Best Practices: ${scores.bestPractices}`);
            console.log(`  SEO:            ${scores.seo}\n`);
        }
    } catch (err) {
        console.error(`Error running Lighthouse on ${p.name}:`, err.message);
    }
}

console.log("==========================================================================");
console.log("                       FINAL LIGHTHOUSE MOBILE SUMMARY                    ");
console.log("==========================================================================");
console.table(results);
