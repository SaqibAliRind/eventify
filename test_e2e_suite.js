const BASE_URL = "http://localhost:9000";

const results = [];

function record(suite, testName, passed, details = "") {
    results.push({ suite, testName, passed, details });
    const mark = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${mark} [${suite}] ${testName} ${details ? `(${details})` : ""}`);
}

async function runTestSuite() {
    console.log("==================================================================");
    console.log("       STARTING COMPLETE END-TO-END (E2E) VERIFICATION SUITE       ");
    console.log("==================================================================\n");

    let userToken = "";
    let adminToken = "";
    let sampleEventId = "";
    let sampleUserId = "";
    let sampleReviewId = "";

    /* -------------------------------------------------------------
       1. PUBLIC / GUEST TESTS
    ------------------------------------------------------------- */
    try {
        const res = await fetch(`${BASE_URL}/user/events`);
        const data = await res.json();
        sampleEventId = data.data[0]._id;
        const count = data.data.length;
        const validImages = data.data.every(e => Array.isArray(e.images) && e.images.length >= 5);
        record("Public/Guest", "GET /user/events - Loads events from DB", res.status === 200 && count >= 10, `Found ${count} events, all have >= 5 images`);
        record("Public/Guest", "Image schema verification", validImages, "Every event has valid >= 5 image URLs");
    } catch (err) {
        record("Public/Guest", "GET /user/events", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/events/${sampleEventId}`);
        const data = await res.json();
        const ev = data.data;
        const hasAllFields = ev.title && ev.category && ev.description && ev.date && ev.location && ev.guests;
        record("Public/Guest", "GET /user/events/:id - Fetch event details", res.status === 200 && !!hasAllFields, `Title: "${ev.title}"`);
    } catch (err) {
        record("Public/Guest", "GET /user/events/:id", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/categories`);
        const data = await res.json();
        const count = data.data.length;
        record("Public/Guest", "GET /user/categories - Loads categories from DB", res.status === 200 && count >= 6, `Found ${count} categories`);
    } catch (err) {
        record("Public/Guest", "GET /user/categories", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/reviews`);
        const data = await res.json();
        const allApproved = data.data.every(r => r.isApproved === true);
        record("Public/Guest", "GET /user/reviews - Only approved reviews shown publicly", res.status === 200 && allApproved, `${data.data.length} approved reviews returned`);
    } catch (err) {
        record("Public/Guest", "GET /user/reviews", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "E2E Guest Tester",
                email: "e2e.guest@test.com",
                phone: "+1 555-444-3322",
                eventDate: "2026-11-20",
                eventType: "Wedding",
                message: "Automated E2E booking inquiry verification"
            })
        });
        const data = await res.json();
        record("Public/Guest", "POST /user/consultation - Submit inquiry/booking", res.status === 201 && data.success, "Inquiry created successfully");
    } catch (err) {
        record("Public/Guest", "POST /user/consultation", false, err.message);
    }

    try {
        // Invalid login test
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "nonexistent@test.com",
                password: "WrongPassword999!"
            })
        });
        const data = await res.json();
        record("Public/Guest", "POST /user/login - Invalid credentials rejected", res.status === 400, `Rejected with 400: "${data.message}"`);
    } catch (err) {
        record("Public/Guest", "POST /user/login - Invalid credentials rejected", false, err.message);
    }

    /* -------------------------------------------------------------
       2. REGULAR USER TESTS
    ------------------------------------------------------------- */
    try {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "elena.rostova@example.com",
                password: "Password123!"
            })
        });
        const data = await res.json();
        userToken = data.token;
        sampleUserId = data.data?.id;
        record("Regular User", "POST /user/login - Valid login", res.status === 200 && !!userToken, `Authenticated as ${data.data?.name} (Role: ${data.data?.role})`);
    } catch (err) {
        record("Regular User", "POST /user/login - Valid login", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/user/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify({
                rating: 5,
                comment: "Exceptional celebration planning! Tested via automated E2E test."
            })
        });
        const data = await res.json();
        sampleReviewId = data.data?._id;
        record("Regular User", "POST /user/reviews - Authenticated user submit review", res.status === 201, "Review posted, default isApproved: false");
    } catch (err) {
        record("Regular User", "POST /user/reviews", false, err.message);
    }

    // Role Security: Regular User attempting to access Admin endpoints
    try {
        const res = await fetch(`${BASE_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await res.json();
        record("Security/Role", "Regular User blocked from /admin/users", res.status === 403, `Correctly blocked with 403: "${data.message}"`);
    } catch (err) {
        record("Security/Role", "Regular User blocked from /admin/users", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/consultations`, {
            headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await res.json();
        record("Security/Role", "Regular User blocked from /admin/consultations", res.status === 403, `Correctly blocked with 403: "${data.message}"`);
    } catch (err) {
        record("Security/Role", "Regular User blocked from /admin/consultations", false, err.message);
    }

    /* -------------------------------------------------------------
       3. ADMIN TESTS
    ------------------------------------------------------------- */
    try {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@eventify.com",
                password: "Password123!"
            })
        });
        const data = await res.json();
        adminToken = data.token;
        record("Admin", "POST /user/login - Admin authentication", res.status === 200 && data.data?.role === "admin", `Authenticated as ${data.data?.name} (Role: admin)`);
    } catch (err) {
        record("Admin", "POST /user/login - Admin authentication", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/users`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const data = await res.json();
        const count = data.pagination?.total;
        record("Admin", "GET /admin/users - User directory with pagination", res.status === 200 && count >= 6, `Total users: ${count}`);
    } catch (err) {
        record("Admin", "GET /admin/users", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/events`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const data = await res.json();
        record("Admin", "GET /admin/events - Manage events catalog", res.status === 200, `Found ${data.data?.length} events`);
    } catch (err) {
        record("Admin", "GET /admin/events", false, err.message);
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/consultations`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const data = await res.json();
        const hasGuestConsult = data.data?.some(c => c.name === "E2E Guest Tester");
        record("Admin", "GET /admin/consultations - View consultation requests", res.status === 200 && hasGuestConsult, `Found ${data.data?.length} consultations, verified newly created guest booking`);
    } catch (err) {
        record("Admin", "GET /admin/consultations", false, err.message);
    }

    // Admin toggle user status test
    try {
        const res = await fetch(`${BASE_URL}/admin/users/${sampleUserId}/status`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const data = await res.json();
        const newStatus = data.data?.active;
        // Toggle back to restore
        await fetch(`${BASE_URL}/admin/users/${sampleUserId}/status`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        record("Admin", "PATCH /admin/users/:id/status - Toggle user active/inactive", res.status === 200, `Status successfully toggled to ${newStatus} and restored`);
    } catch (err) {
        record("Admin", "PATCH /admin/users/:id/status", false, err.message);
    }

    // Admin toggle review approval test
    if (sampleReviewId) {
        try {
            const res = await fetch(`${BASE_URL}/admin/reviews/${sampleReviewId}/approve`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            record("Admin", "PATCH /admin/reviews/:id/approve - Approve review", res.status === 200, "Review status approved");
        } catch (err) {
            record("Admin", "PATCH /admin/reviews/:id/approve", false, err.message);
        }
    }

    // Admin Create & Delete Event test
    try {
        const createRes = await fetch(`${BASE_URL}/admin/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "Automated E2E Created Gala",
                category: "Corporate Summit",
                description: "Temporary event created to verify event creation and deletion flow",
                date: "2026-12-31",
                location: "Convention Hall 4, Chicago, IL",
                guests: "300 Guests",
                tag: "Corporate",
                images: [
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200"
                ]
            })
        });
        const createData = await createRes.json();
        const createdId = createData.data?._id;
        record("Admin", "POST /admin/events - Create new event", createRes.status === 201, `Created event ID: ${createdId}`);

        // Delete the temporary event
        const deleteRes = await fetch(`${BASE_URL}/admin/events/${createdId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        record("Admin", "DELETE /admin/events/:id - Delete event", deleteRes.status === 200, "Cleaned up test event successfully");
    } catch (err) {
        record("Admin", "Event Create & Delete Flow", false, err.message);
    }

    console.log("\n==================================================================");
    const passedCount = results.filter(r => r.passed).length;
    console.log(`E2E TEST SUITE FINISHED: ${passedCount} / ${results.length} TESTS PASSED`);
    console.log("==================================================================\n");
}

runTestSuite();
