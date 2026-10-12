// Final comprehensive validation - no rate-limited endpoints
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const BASE_URL = "http://localhost:9000";

async function runFinalValidation() {
    console.log("=== FINAL PRE-LAUNCH VALIDATION SUITE ===\n");

    // ── 1. CORS behaviour verification (server-side) ──────────────────────────
    // Node fetch bypasses CORS (CORS is browser-enforced). Instead, verify the
    // server returns a CORS error when origin doesn't match.
    const corsRes = await fetch(`${BASE_URL}/user/events`, {
        headers: { Origin: "https://evil-attacker.com" }
    });
    const allowOriginHeader = corsRes.headers.get("access-control-allow-origin");
    // The evil origin should NOT be in the allow-origin header
    const corsCorrect = !allowOriginHeader || (!allowOriginHeader.includes("evil-attacker.com"));
    console.log(`${corsCorrect ? "✅ PASS" : "❌ FAIL"} CORS: allow-origin header = "${allowOriginHeader}" (evil origin NOT reflected)`);
    console.log("       Note: CORS enforcement is browser-enforced; server correctly does not whitelist evil origin.\n");

    // ── 2. Helmet headers present ─────────────────────────────────────────────
    const helmRes = await fetch(`${BASE_URL}/user/events`);
    const xFrame = helmRes.headers.get("x-frame-options");
    const xContent = helmRes.headers.get("x-content-type-options");
    const contentSec = helmRes.headers.get("content-security-policy");
    console.log(`${xFrame ? "✅ PASS" : "❌ FAIL"} Helmet: X-Frame-Options = "${xFrame}"`);
    console.log(`${xContent ? "✅ PASS" : "❌ FAIL"} Helmet: X-Content-Type-Options = "${xContent}"`);
    console.log(`${contentSec ? "✅ PASS" : "⚠️  WARN"} Helmet: Content-Security-Policy ${contentSec ? "present" : "absent"}\n`);

    // ── 3. Admin endpoint without token ───────────────────────────────────────
    const noAuthRes = await fetch(`${BASE_URL}/admin/users`);
    console.log(`${noAuthRes.status === 401 ? "✅ PASS" : "❌ FAIL"} /admin/users without token returns ${noAuthRes.status}\n`);

    // ── 4. Admin endpoint with user token (403) ───────────────────────────────
    // Need a user token - use consultation endpoint to get one via a different flow
    // Actually login as clara who is a user and not been rate-limited yet  
    const claraRes = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "clara.novak@example.com", password: "Password123!" })
    });
    const claraData = await claraRes.json();
    
    if (claraData.token) {
        console.log(`✅ Clara login: ${claraRes.status} - role: ${claraData.data.role}`);
        
        // Try admin endpoint with user token
        const forbiddenRes = await fetch(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${claraData.token}` }
        });
        console.log(`${forbiddenRes.status === 403 ? "✅ PASS" : "❌ FAIL"} User token blocked from /admin/users - status ${forbiddenRes.status}`);
        
        // Verify password not in login response
        const fields = Object.keys(claraData.data);
        console.log(`\nLogin response fields: [${fields.join(", ")}]`);
        console.log(`${!fields.includes("password") ? "✅ PASS" : "❌ FAIL"} No password hash in login response`);
        console.log(`${!fields.includes("verifycode") ? "✅ PASS" : "❌ FAIL"} No verifycode in login response`);
        console.log(`${!fields.includes("verifyuser") ? "✅ PASS" : "❌ FAIL"} No verifyuser in login response`);

        // Inactive user check
        const inactiveRes = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "david.kim@example.com", password: "Password123!" })
        });
        const inactiveData = await inactiveRes.json();
        const blocked = inactiveRes.status === 403 && inactiveData.message?.includes("deactivated");
        console.log(`\n${blocked ? "✅ PASS" : "❌ FAIL"} Inactive user (David Kim) blocked - status ${inactiveRes.status}, message: "${inactiveData.message}"`);

        // Admin endpoints field check
        const adminRes = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@eventify.com", password: "Password123!" })
        });
        const adminData = await adminRes.json();
        if (adminData.token) {
            const usersRes = await fetch(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${adminData.token}` }
            });
            const usersData = await usersRes.json();
            const firstUserFields = Object.keys(usersData.data[0] || {});
            console.log(`\nAdmin /users fields: [${firstUserFields.join(", ")}]`);
            console.log(`${!firstUserFields.includes("password") ? "✅ PASS" : "❌ FAIL"} Password NOT exposed in admin users listing`);
            console.log(`${!firstUserFields.includes("verifycode") ? "✅ PASS" : "❌ FAIL"} verifycode NOT exposed in admin users listing`);
        }
    } else {
        console.log(`⚠️  Clara login: rate limited or issue - ${JSON.stringify(claraData)}`);
    }

    // ── 5. JWT_SECRET check ───────────────────────────────────────────────────
    const jwtSecret = process.env.JWT_SECRET;
    console.log(`\n${(!jwtSecret || jwtSecret === "mySuperSecretKey123") ? "❌ FAIL" : "✅ PASS"} JWT_SECRET loaded from env, length: ${jwtSecret?.length || 0}, not weak default`);

    // ── 6. NoSQL injection (not rate-limited path) ────────────────────────────
    const nosqlConsultRes = await fetch(`${BASE_URL}/user/consultation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: { $ne: null },
            email: "test@injection.com",
            phone: "+1555000000",
            eventType: "Test",
            message: "injection test"
        })
    });
    const nosqlConsultData = await nosqlConsultRes.json();
    // The name field should fail validation or be rejected since name is an object not a string
    const nosqlConsultBlocked = !nosqlConsultData.success || nosqlConsultRes.status >= 400;
    console.log(`${nosqlConsultBlocked ? "✅ PASS" : "⚠️  WARN"} NoSQL injection in consultation name field: status ${nosqlConsultRes.status} - "${nosqlConsultData.message}"`);

    // ── 7. Rate limiting on consultation endpoint ─────────────────────────────
    console.log("\nTesting rate limit on /user/consultation (51 rapid requests)...");
    let rateLimitHit = false;
    for (let i = 0; i < 51; i++) {
        const r = await fetch(`${BASE_URL}/user/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Rate Test", email: "rt@test.com", phone: "+1555", eventType: "Test", message: "rate" })
        });
        if (r.status === 429) {
            console.log(`✅ PASS Rate limit hit on consultation endpoint at request #${i + 1} (429)`);
            rateLimitHit = true;
            break;
        }
    }
    if (!rateLimitHit) console.log("❌ FAIL Rate limit NOT triggered on consultation endpoint");

    console.log("\n=== FINAL VALIDATION COMPLETE ===");
}

runFinalValidation().catch(console.error);
