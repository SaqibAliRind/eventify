import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const SCREENSHOT_DIR = path.resolve("./e2e-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:9000";

async function runCompleteResponsiveAudit() {
    console.log("==========================================================================");
    console.log("            COMPREHENSIVE RESPONSIVE AUDIT (375, 768, 1280)               ");
    console.log("==========================================================================\n");

    const browser = await chromium.launch({ headless: true, channel: 'chrome' });

    // Login Admin to get token
    const adminRes = await fetch(`${BACKEND_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@eventify.com", password: "Password123!" })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    const adminUser = adminData.data;

    // Login Clara Novak to get user token
    const userRes = await fetch(`${BACKEND_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "clara.novak@example.com", password: "Password123!" })
    });
    const userData = await userRes.json();
    const userToken = userData.token;
    const userObj = userData.data;

    // Fetch one event id for details page
    const eventsRes = await fetch(`${BACKEND_URL}/user/events`);
    const eventsData = await eventsRes.json();
    const eventSlugOrId = eventsData.data?.[0]?.slug || eventsData.data?.[0]?._id || "grand-royal-palace-wedding-658b23";

    const viewports = [
        { width: 375, height: 667, name: "375_mobile" },
        { width: 768, height: 1024, name: "768_tablet" },
        { width: 1280, height: 800, name: "1280_desktop" }
    ];

    // Admin pages to test
    const adminRoutes = [
        { route: "/admin", filePrefix: "admin_dashboard" },
        { route: "/admin/events", filePrefix: "admin_events" },
        { route: "/admin/categories", filePrefix: "admin_categories" },
        { route: "/admin/users", filePrefix: "admin_users" },
        { route: "/admin/consultations", filePrefix: "admin_consultations" },
        { route: "/admin/reviews", filePrefix: "admin_reviews" },
        { route: "/admin/audit-log", filePrefix: "admin_audit_log" },
        { route: "/admin/chat", filePrefix: "admin_chat" }
    ];

    // User & Public pages
    const clientRoutes = [
        { route: `/events/${eventSlugOrId}`, filePrefix: "client_event_details", auth: null },
        { route: "/profile", filePrefix: "client_profile", auth: "user" },
        { route: "/my-inquiries", filePrefix: "client_my_inquiries", auth: "user" },
        { route: "/auth", filePrefix: "client_auth", auth: null },
        { route: "/404-not-found-page", filePrefix: "client_404", auth: null },
        { route: "/contact", filePrefix: "client_contact", auth: null },
        { route: "/faq", filePrefix: "client_faq", auth: null },
        { route: "/privacy", filePrefix: "client_privacy", auth: null },
        { route: "/terms", filePrefix: "client_terms", auth: null }
    ];

    let totalOverflows = 0;
    const auditResults = [];

    for (const vp of viewports) {
        console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

        // Audit Admin Routes
        for (const item of adminRoutes) {
            const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
            const page = await context.newPage();

            await page.goto(`${FRONTEND_URL}/auth`, { waitUntil: "networkidle" });
            await page.evaluate(({ token, user }) => {
                localStorage.setItem("eventify_token", token);
                localStorage.setItem("eventify_user", JSON.stringify(user));
            }, { token: adminToken, user: adminUser });

            await page.goto(`${FRONTEND_URL}${item.route}`, { waitUntil: "networkidle" });
            await page.waitForTimeout(600);

            const filename = `audit_${item.filePrefix}_${vp.name}.png`;
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });

            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
            if (overflow) totalOverflows++;

            auditResults.push({ name: `${item.filePrefix} (${vp.name})`, overflow, file: filename });
            console.log(`[Admin] ${item.filePrefix} (${vp.name}): ${overflow ? "❌ OVERFLOW" : "✅ OK"} -> ${filename}`);

            await context.close();
        }

        // Audit Client & Public Routes
        for (const item of clientRoutes) {
            const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
            const page = await context.newPage();

            if (item.auth === "user") {
                await page.goto(`${FRONTEND_URL}/auth`, { waitUntil: "networkidle" });
                await page.evaluate(({ token, user }) => {
                    localStorage.setItem("eventify_token", token);
                    localStorage.setItem("eventify_user", JSON.stringify(user));
                }, { token: userToken, user: userObj });
            }

            await page.goto(`${FRONTEND_URL}${item.route}`, { waitUntil: "networkidle" });
            await page.waitForTimeout(600);

            // On Event Details, click booking/consultation button to check modal render
            if (item.filePrefix === "client_event_details") {
                const bookBtn = await page.$("button:has-text('Inquire'), button:has-text('Book'), .book-event-btn");
                if (bookBtn) {
                    await bookBtn.click();
                    await page.waitForTimeout(400);
                    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `audit_client_event_details_modal_${vp.name}.png`) });
                }
            }

            const filename = `audit_${item.filePrefix}_${vp.name}.png`;
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });

            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
            if (overflow) totalOverflows++;

            auditResults.push({ name: `${item.filePrefix} (${vp.name})`, overflow, file: filename });
            console.log(`[Client] ${item.filePrefix} (${vp.name}): ${overflow ? "❌ OVERFLOW" : "✅ OK"} -> ${filename}`);

            await context.close();
        }
    }

    await browser.close();

    console.log("\n==========================================================================");
    console.log(`RESPONSIVE AUDIT COMPLETE: ${auditResults.length} views tested | Overflows: ${totalOverflows}`);
    console.log("==========================================================================");

    process.exit(totalOverflows === 0 ? 0 : 1);
}

runCompleteResponsiveAudit().catch(err => {
    console.error(err);
    process.exit(1);
});
