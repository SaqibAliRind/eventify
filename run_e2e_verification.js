import dotenv from "dotenv";
import { io as ioClient } from "socket.io-client";

dotenv.config({ quiet: true });

const BASE_URL = "http://localhost:9000";
const results = [];

function record(suite, testName, passed, details = "") {
    results.push({ suite, testName, passed, details });
    const mark = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${mark} [${suite}] ${testName} ${details ? `(${details})` : ""}`);
}

async function runAllTests() {
    console.log("==================================================================");
    console.log("     EVENTIFY PRE-LAUNCH COMPREHENSIVE E2E VERIFICATION SUITE     ");
    console.log("==================================================================\n");

    let adminToken = "";
    let userToken = "";
    let testEventId = "";
    let testCategoryId = "";
    let testReviewId = "";
    let testConsultationId = "";

    // ─── 1. Health & Operations ──────────────────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();
        record("Operations", "GET /health - System health status", res.status === 200 && data.status === "UP", `Database: ${data.database}`);
    } catch (e) {
        record("Operations", "GET /health", false, e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/sitemap.xml`);
        const text = await res.text();
        const validSitemap = res.status === 200 && text.includes("<urlset") && text.includes("</urlset>");
        record("Operations", "GET /sitemap.xml - Dynamic XML sitemap", validSitemap, `Length: ${text.length} chars`);
    } catch (e) {
        record("Operations", "GET /sitemap.xml", false, e.message);
    }

    // ─── 2. Guest Browse & Consultation Submit ───────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/user/events?limit=6&page=1`);
        const data = await res.json();
        const hasEvents = res.status === 200 && data.data && data.data.length > 0;
        const allPublished = data.data.every(e => e.status === "published" || e.status === "Active");
        record("Guest Flow", "GET /user/events - Paginated published events", hasEvents && allPublished, `Received ${data.data.length} events, all published`);
        if (hasEvents) testEventId = data.data[0]._id;
    } catch (e) {
        record("Guest Flow", "GET /user/events", false, e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/events/${testEventId}`);
        const data = await res.json();
        const valid = res.status === 200 && data.data && data.data.title;
        record("Guest Flow", "GET /user/events/:id - Fetch event details", valid, `Title: "${data.data?.title}"`);
    } catch (e) {
        record("Guest Flow", "GET /user/events/:id", false, e.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Pre-Launch Verification Guest",
                email: "guest.prelaunch@eventify.com",
                phone: "+1 555-0199",
                eventType: "Luxury Gala",
                eventDate: "2026-12-15",
                message: "Looking for an exclusive winter celebration."
            })
        });
        const data = await res.json();
        testConsultationId = data.data?._id;
        record("Guest Flow", "POST /user/consultation - Guest consultation submission", res.status === 201 && data.success, `Consultation ID: ${testConsultationId}`);
    } catch (e) {
        record("Guest Flow", "POST /user/consultation", false, e.message);
    }

    // ─── 3. Auth & Role Verification ─────────────────────────────────────
    try {
        // Admin login
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@eventify.com", password: "Password123!" })
        });
        const data = await res.json();
        adminToken = data.token;
        record("Auth Flow", "POST /user/login - Admin authentication", res.status === 200 && !!adminToken, `Role: ${data.data?.role}`);
    } catch (e) {
        record("Auth Flow", "POST /user/login (Admin)", false, e.message);
    }

    try {
        // Regular user login (Clara Novak)
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "clara.novak@example.com", password: "Password123!" })
        });
        const data = await res.json();
        userToken = data.token;
        record("Auth Flow", "POST /user/login - User authentication", res.status === 200 && !!userToken, `Role: ${data.data?.role}`);
    } catch (e) {
        record("Auth Flow", "POST /user/login (User)", false, e.message);
    }

    // ─── 4. Role-based Access Denial (Security) ──────────────────────────
    try {
        // Unauthenticated access blocked
        const resNoAuth = await fetch(`${BASE_URL}/admin/users`);
        record("Security", "GET /admin/users - 401 Unauthorized without token", resNoAuth.status === 401, `Status: ${resNoAuth.status}`);

        // Regular user blocked from admin endpoint
        const resForbidden = await fetch(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        record("Security", "GET /admin/users - 403 Forbidden with user token", resForbidden.status === 403, `Status: ${resForbidden.status}`);
    } catch (e) {
        record("Security", "Role-based access denial", false, e.message);
    }

    // ─── 5. User Features: My Inquiries ──────────────────────────────────
    try {
        const res = await fetch(`${BASE_URL}/user/consultations/me`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        const data = await res.json();
        record("User Portal", "GET /user/consultations/me - My Inquiries endpoint", res.status === 200 && Array.isArray(data.data), `Found ${data.data?.length || 0} user inquiries`);
    } catch (e) {
        record("User Portal", "GET /user/consultations/me", false, e.message);
    }

    // ─── 6. Admin Management CRUD ────────────────────────────────────────
    try {
        // Admin Audit Log
        const resAudit = await fetch(`${BASE_URL}/admin/audit-logs?page=1&limit=5`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const dataAudit = await resAudit.json();
        record("Admin Panel", "GET /admin/audit-logs - Audit trail listing", resAudit.status === 200 && dataAudit.success, `Total logs: ${dataAudit.pagination?.total || 0}`);

        // Admin Consultations & Update status
        if (testConsultationId) {
            const resUpdateConsult = await fetch(`${BASE_URL}/admin/consultations/${testConsultationId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    status: "Contacted",
                    adminNotes: "Contacted via executive concierge desk."
                })
            });
            const dataUpdate = await resUpdateConsult.json();
            record("Admin Panel", "PATCH /admin/consultations/:id/status - Update consultation lead", resUpdateConsult.status === 200 && dataUpdate.data?.status === "Contacted", "Status updated to Contacted with internal note");
        }

        // Admin CSV Export
        const resExport = await fetch(`${BASE_URL}/admin/export/consultations`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const csvText = await resExport.text();
        record("Admin Panel", "GET /admin/export/consultations - Download CSV export", resExport.status === 200 && csvText.toLowerCase().includes("name,email"), `CSV size: ${csvText.length} bytes`);

        // Admin Reviews moderation
        const resReviews = await fetch(`${BASE_URL}/admin/reviews?status=all`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const dataReviews = await resReviews.json();
        record("Admin Panel", "GET /admin/reviews - Reviews moderation listing", resReviews.status === 200 && Array.isArray(dataReviews.data), `Total reviews: ${dataReviews.data?.length || 0}`);
    } catch (e) {
        record("Admin Panel", "Admin CRUD operations", false, e.message);
    }

    // ─── 7. Real-Time Live Chat between User and Admin ────────────────────
    await new Promise((resolve) => {
        try {
            console.log("\n--- Testing Socket.io Live Chat in 2 concurrent sessions ---");

            const adminSocket = ioClient(BASE_URL, {
                auth: { token: adminToken },
                transports: ["websocket"]
            });

            const userSocket = ioClient(BASE_URL, {
                auth: { token: userToken },
                transports: ["websocket"]
            });

            let adminReceivedMessage = false;
            let userReceivedReply = false;
            let userSessionId = "";

            userSocket.on("session_info", (info) => {
                userSessionId = info.sessionId;
                userSocket.emit("join_room", userSessionId);

                // Admin joins 'admins' broadcast room
                adminSocket.emit("join_room", "admins");

                setTimeout(() => {
                    // User sends live chat message
                    userSocket.emit("send_message", {
                        roomId: userSessionId,
                        message: "Hello concierge, I would like to inquire about event catering options!"
                    });
                }, 400);
            });

            adminSocket.on("receive_message", (msg) => {
                if (msg.message.includes("catering options")) {
                    adminReceivedMessage = true;

                    // Admin replies to user's room
                    adminSocket.emit("send_message", {
                        roomId: userSessionId,
                        message: "Greetings! Our executive chef has curated bespoke menus available."
                    });
                }
            });

            userSocket.on("receive_message", (msg) => {
                if (msg.message.includes("executive chef")) {
                    userReceivedReply = true;
                    record("Live Chat", "Bi-directional Socket.io live chat between User and Admin", true, "User sent message -> Admin received -> Admin replied -> User received reply");

                    adminSocket.disconnect();
                    userSocket.disconnect();
                    resolve();
                }
            });

            setTimeout(() => {
                if (!userReceivedReply) {
                    record("Live Chat", "Bi-directional Socket.io live chat", false, `Admin received: ${adminReceivedMessage}, User received reply: ${userReceivedReply}`);
                    adminSocket.disconnect();
                    userSocket.disconnect();
                    resolve();
                }
            }, 5000);
        } catch (err) {
            record("Live Chat", "Socket.io session error", false, err.message);
            resolve();
        }
    });

    // ─── Summary ─────────────────────────────────────────────────────────
    console.log("\n==================================================================");
    console.log("                      TEST RESULTS SUMMARY                        ");
    console.log("==================================================================");
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Verdict: ${failed === 0 ? "🎉 ALL CHECKS PASSED (100% SUCCESS)" : "❌ SOME CHECKS FAILED"}\n`);

    if (failed > 0) process.exit(1);
    else process.exit(0);
}

runAllTests();
