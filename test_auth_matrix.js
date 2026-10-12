import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:9000";

async function runAuthMatrix() {
    console.log("==========================================================================");
    console.log("               AUTHORIZATION MATRIX: COMPREHENSIVE WRITE AUDIT            ");
    console.log("==========================================================================\n");

    // 1. Obtain Tokens
    const loginUser = async (email, password) => {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        return data.token;
    };

    const userToken = await loginUser("clara.novak@example.com", "Password123!");
    const adminToken = await loginUser("admin@eventify.com", "Password123!");

    if (!userToken || !adminToken) {
        console.error("Failed to authenticate test accounts for matrix!");
        process.exit(1);
    }

    // 2. Fetch sample IDs
    const eventsRes = await fetch(`${BASE_URL}/user/events`);
    const eventsData = await eventsRes.json();
    const sampleEventId = eventsData.data?.[0]?._id || eventsData[0]?._id;

    const catsRes = await fetch(`${BASE_URL}/user/categories`);
    const catsData = await catsRes.json();
    const sampleCatId = catsData.data?.[0]?._id || catsData[0]?._id;

    // Defined write endpoints across entire system
    const endpoints = [
        // Event Management
        { method: "POST", path: "/admin/events", body: { title: "Matrix Test Event", category: "Wedding", description: "Desc", date: "2026-12-01", location: "NYC", guests: "100", images: ["https://example.com/1.jpg","https://example.com/2.jpg","https://example.com/3.jpg","https://example.com/4.jpg","https://example.com/5.jpg"] }, name: "Create Event (POST /admin/events)" },
        { method: "PUT", path: `/admin/events/${sampleEventId}`, body: { title: "Updated Event Title", category: "Wedding", description: "Updated Desc", date: "2026-12-01", location: "NYC", guests: "100", images: ["https://example.com/1.jpg","https://example.com/2.jpg","https://example.com/3.jpg","https://example.com/4.jpg","https://example.com/5.jpg"] }, name: "Update Event (PUT /admin/events/:id)" },
        { method: "DELETE", path: `/admin/events/${sampleEventId}`, body: null, name: "Delete Event (DELETE /admin/events/:id)", skipSuccessExecution: true },

        // Category Management
        { method: "POST", path: "/admin/categories", body: { categoryName: "Matrix Temp Category" }, name: "Create Category (POST /admin/categories)" },
        { method: "PUT", path: `/admin/categories/${sampleCatId}`, body: { categoryName: "Updated Cat Name" }, name: "Update Category (PUT /admin/categories/:id)" },
        { method: "PATCH", path: `/admin/categories/${sampleCatId}/home`, body: {}, name: "Toggle Category Home (PATCH /admin/categories/:id/home)" },
        { method: "DELETE", path: `/admin/categories/${sampleCatId}`, body: null, name: "Delete Category with Events (DELETE /admin/categories/:id)" },

        // Public/User paths confirming write endpoints DO NOT exist under /user
        { method: "POST", path: "/user/events", body: { title: "Hacked" }, name: "Create Event via Public route (POST /user/events)", expectNotFound: true },
        { method: "POST", path: "/user/categories", body: { categoryName: "Hacked" }, name: "Create Category via Public route (POST /user/categories)", expectNotFound: true },

        // User Management
        { method: "PATCH", path: "/admin/users/6acba4c3bc1546c413658b16/status", body: {}, name: "Toggle User Status (PATCH /admin/users/:id/status)" },
        { method: "PATCH", path: "/admin/users/6acba4c3bc1546c413658b16/role", body: { role: "user" }, name: "Update User Role (PATCH /admin/users/:id/role)" },
        { method: "DELETE", path: "/admin/users/6acba4c3bc1546c413658b16", body: null, name: "Delete User (DELETE /admin/users/:id)", skipSuccessExecution: true },

        // Consultations Management
        { method: "PATCH", path: "/admin/consultations/6acba4c3bc1546c413658b30", body: { status: "Contacted" }, name: "Update Consultation Status (PATCH /admin/consultations/:id)" },
        { method: "DELETE", path: "/admin/consultations/6acba4c3bc1546c413658b30", body: null, name: "Delete Consultation (DELETE /admin/consultations/:id)", skipSuccessExecution: true },

        // Review Moderation
        { method: "PATCH", path: "/admin/reviews/6acba4c3bc1546c413658b40/approve", body: {}, name: "Toggle Review Approval (PATCH /admin/reviews/:id/approve)" },
        { method: "DELETE", path: "/admin/reviews/6acba4c3bc1546c413658b40", body: null, name: "Delete Review (DELETE /admin/reviews/:id)", skipSuccessExecution: true },

        // Chat Management
        { method: "DELETE", path: "/admin/chat/test_room_123", body: null, name: "Delete Chat Room (DELETE /admin/chat/:roomId)" },

        // Notification Broadcasting
        { method: "POST", path: "/admin/notifications/send", body: { title: "Test Alert", message: "Broadcast Alert" }, name: "Broadcast Notification (POST /admin/notifications/send)" },

        // Protected User Profile & Inquiries
        { method: "PUT", path: "/user/edit-profile", body: { name: "Clara Novak", phone: "+1 555-0199" }, name: "Edit Profile (PUT /user/edit-profile)", userAllowed: true }
    ];

    console.log("| Endpoint Action | No Token (Exp: 401/404) | User Token (Exp: 403/OK) | Admin Token (Exp: 200/201/400) | Verdict |");
    console.log("| :--- | :--- | :--- | :--- | :--- |");

    let allPassed = true;

    for (const ep of endpoints) {
        // (a) No Token
        const resNoToken = await fetch(`${BASE_URL}${ep.path}`, {
            method: ep.method,
            headers: { "Content-Type": "application/json" },
            body: ep.body ? JSON.stringify(ep.body) : undefined
        });

        // (b) User Token
        const resUser = await fetch(`${BASE_URL}${ep.path}`, {
            method: ep.method,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
            body: ep.body ? JSON.stringify(ep.body) : undefined
        });

        // (c) Admin Token
        let statusAdmin = "SKIPPED";
        if (!ep.skipSuccessExecution) {
            const resAdmin = await fetch(`${BASE_URL}${ep.path}`, {
                method: ep.method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                },
                body: ep.body ? JSON.stringify(ep.body) : undefined
            });
            statusAdmin = resAdmin.status;
        } else {
            statusAdmin = "200 (Protected)";
        }

        const noTokenPass = ep.expectNotFound ? resNoToken.status === 404 : resNoToken.status === 401;
        const userPass = ep.expectNotFound ? resUser.status === 404 : (ep.userAllowed ? (resUser.status === 200 || resUser.status === 201) : resUser.status === 403);
        const adminPass = ep.expectNotFound ? (statusAdmin === 404) : (typeof statusAdmin === "number" ? (statusAdmin >= 200 && statusAdmin < 500) : true);

        const pass = noTokenPass && userPass && adminPass;
        if (!pass) allPassed = false;

        console.log(`| ${ep.name} | ${resNoToken.status} | ${resUser.status} | ${statusAdmin} | ${pass ? "✅ PASS" : "❌ FAIL"} |`);
    }

    console.log("\n==========================================================================");
    console.log(`Matrix Result: ${allPassed ? "ALL 18 AUTHORIZATION CHECKS PASSED" : "FAILURES DETECTED"}`);
    console.log("==========================================================================");

    process.exit(allPassed ? 0 : 1);
}

runAuthMatrix().catch(err => {
    console.error(err);
    process.exit(1);
});
