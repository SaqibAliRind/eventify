import dotenv from "dotenv";
import { io as ioClient } from "socket.io-client";
import jwt from "jsonwebtoken";

dotenv.config({ quiet: true });

const BASE_URL = "http://localhost:9000";

function printResult(testNum, testName, passed, status, detail) {
    const mark = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`[TEST ${testNum}] ${mark} ${testName}`);
    console.log(`       Status: ${status} | Detail: ${detail}\n`);
}

import mongoose from "mongoose";

async function runNegativeSecuritySuite() {
    console.log("==========================================================================");
    console.log("         EVENTIFY COMPREHENSIVE NEGATIVE SECURITY TEST SUITE             ");
    console.log("==========================================================================\n");

    try {
        await mongoose.connect(process.env.DATABASE);
    } catch(e) {
        console.error("Mongoose connection in test error:", e.message);
    }

    let adminToken = "";
    let userToken = "";
    let adminId = "";
    let userId = "";

    // Login admin to obtain token
    try {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@eventify.com", password: "Password123!" })
        });
        const d = await res.json();
        adminToken = d.token;
        adminId = d.data?._id;
    } catch (e) {
        console.error("Admin login error:", e);
    }

    // Login user to obtain token
    try {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "clara.novak@example.com", password: "Password123!" })
        });
        const d = await res.json();
        userToken = d.token;
        userId = d.data?._id;
    } catch (e) {
        console.error("User login error:", e);
    }

    // ─── 1. NoSQL INJECTION TEST ──────────────────────────────────────────────
    {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: { "$ne": null },
                password: { "$ne": null }
            })
        });
        const d = await res.json();
        const passed = res.status === 400 && d.success === false;
        printResult("1.1", "NoSQL Injection: login with {$ne: null} rejected", passed, res.status, JSON.stringify(d));
    }

    // ─── 2. XSS SANITIZATION TESTS ───────────────────────────────────────────
    const xssPayloads = [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>"
    ];

    // 2a. Consultation message
    {
        const res = await fetch(`${BASE_URL}/user/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "XSS Tester",
                email: "xss.tester@example.com",
                phone: "+1 555-0199",
                eventType: "Wedding",
                message: "Inquiry message with <script>alert(1)</script> and <img src=x onerror=alert(1)>"
            })
        });
        const d = await res.json();
        const storedMessage = d.data?.message || "";
        const clean = !storedMessage.includes("<script>") && !storedMessage.includes("onerror=");
        printResult("2.1", "XSS Neutralization in Consultation Message", res.status === 201 && clean, res.status, `Stored: "${storedMessage}"`);
    }

    // 2b. Chat message
    {
        const res = await fetch(`${BASE_URL}/user/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomId: "xss_test_room",
                senderId: "test_user",
                senderName: "Tester",
                message: "Chat with <script>alert(1)</script> payload",
                isAdmin: false
            })
        });
        const d = await res.json();
        const storedMsg = d.data?.message || "";
        const clean = !storedMsg.includes("<script>");
        printResult("2.2", "XSS Neutralization in Chat Message", res.status === 201 && clean, res.status, `Stored: "${storedMsg}"`);
    }

    // 2c. Review comment
    if (userToken) {
        const res = await fetch(`${BASE_URL}/user/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({
                rating: 5,
                comment: "Great experience! <img src=x onerror=alert(1)> review test"
            })
        });
        const d = await res.json();
        const storedComment = d.data?.comment || "";
        const clean = !storedComment.includes("onerror=");
        printResult("2.3", "XSS Neutralization in User Review", res.status === 201 && clean, res.status, `Stored: "${storedComment}"`);
    }

    // 2d. Event title & description (Admin)
    if (adminToken) {
        const res = await fetch(`${BASE_URL}/admin/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "Galas <script>alert(1)</script>",
                category: "Wedding",
                description: "Luxury celebration with <img src=x onerror=alert(1)> styling",
                date: "2026-11-20",
                location: "Grand Ballroom",
                guests: "250",
                images: [
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
                    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800",
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
                    "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=800",
                    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800"
                ]
            })
        });
        const d = await res.json();
        const storedTitle = d.data?.title || "";
        const storedDesc = d.data?.description || "";
        const clean = !storedTitle.includes("<script>") && !storedDesc.includes("onerror=");
        printResult("2.4", "XSS Neutralization in Admin Event Creation", res.status === 201 && clean, res.status, `Title: "${storedTitle}", Desc: "${storedDesc}"`);
    }

    // ─── 3. REQUEST VALIDATION NEGATIVE TESTS (Zod on every route group) ──────
    // 3a. Auth invalid body (missing password)
    {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "invalid-email-format" })
        });
        const d = await res.json();
        printResult("3.1", "Zod Validation: Login missing password & invalid email", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3b. Events invalid body (fewer than 5 images)
    if (adminToken) {
        const res = await fetch(`${BASE_URL}/admin/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "Under-imaged Event",
                category: "Wedding",
                description: "Test description",
                date: "2026-12-01",
                location: "Plaza",
                guests: "100",
                images: ["https://example.com/1.jpg"] // Only 1 image, min 5 required
            })
        });
        const d = await res.json();
        printResult("3.2", "Zod Validation: Event with fewer than 5 images rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3c. Categories invalid body (empty category name)
    if (adminToken) {
        const res = await fetch(`${BASE_URL}/admin/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ categoryName: "" })
        });
        const d = await res.json();
        printResult("3.3", "Zod Validation: Category with empty name rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3d. Users invalid body (invalid role)
    if (adminToken && userId) {
        const res = await fetch(`${BASE_URL}/admin/users/${userId}/role`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ role: "super_hacker_role" })
        });
        const d = await res.json();
        printResult("3.4", "Validation: Invalid user role rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.message));
    }

    // 3e. Consultations invalid body (missing message and phone)
    {
        const res = await fetch(`${BASE_URL}/user/consultation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Incomplete Lead" })
        });
        const d = await res.json();
        printResult("3.5", "Zod Validation: Consultation missing required fields rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3f. Reviews invalid body (rating > 5)
    if (userToken) {
        const res = await fetch(`${BASE_URL}/user/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({ rating: 10, comment: "Out of range rating" })
        });
        const d = await res.json();
        printResult("3.6", "Zod Validation: Review rating > 5 rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3g. Chat invalid body (missing message)
    {
        const res = await fetch(`${BASE_URL}/user/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: "test" })
        });
        const d = await res.json();
        printResult("3.7", "Zod Validation: Chat missing message rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 3h. Profile invalid body (empty name)
    if (userToken) {
        const res = await fetch(`${BASE_URL}/user/edit-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({ name: "" })
        });
        const d = await res.json();
        printResult("3.8", "Zod Validation: Profile with empty name rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // ─── 4. FILE UPLOAD SECURITY TESTS ────────────────────────────────────────
    // 4a. Executable masquerading as image (.exe renamed to .jpg)
    {
        const fakeExeBytes = Buffer.from("MZ\x90\x00\x03\x00\x00\x00This is a fake Windows PE executable");
        const formData = new FormData();
        const blob = new Blob([fakeExeBytes], { type: "image/jpeg" });
        formData.append("image", blob, "malicious_payload.exe.jpg");
        formData.append("name", "Malicious Tester");
        formData.append("phone", "+1 555-0100");

        const res = await fetch(`${BASE_URL}/user/register`, {
            method: "POST",
            body: formData
        });
        const d = await res.json();
        printResult("4.1", "Upload Security: Executable renamed to .jpg rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.message));
    }

    // 4b. Oversized image (10MB)
    {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0);
        largeBuffer[0] = 0xff;
        largeBuffer[1] = 0xd8;
        largeBuffer[2] = 0xff;
        const formData = new FormData();
        const blob = new Blob([largeBuffer], { type: "image/jpeg" });
        formData.append("image", blob, "oversized_photo.jpg");
        formData.append("name", "Oversized Tester");

        const res = await fetch(`${BASE_URL}/user/edit-profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${userToken}` },
            body: formData
        });
        const d = await res.json();
        printResult("4.2", "Upload Security: 10MB image rejected by Multer limit (5MB max)", res.status === 400 && !d.success, res.status, JSON.stringify(d.message));
    }

    // 4c. Batch file limit: upload 20 files at once (limit is 5)
    {
        const formData = new FormData();
        const dummyJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
        for (let i = 0; i < 20; i++) {
            const blob = new Blob([dummyJpg], { type: "image/jpeg" });
            formData.append("image", blob, `photo_${i}.jpg`);
        }
        formData.append("name", "Batch Tester");

        const res = await fetch(`${BASE_URL}/user/edit-profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${userToken}` },
            body: formData
        });
        const d = await res.json();
        const rejected = res.status === 400 && (!d.success || (d.message && d.message.includes("files")));
        printResult("4.3", "Upload Security: 20 files batch rejected by Multer limit (5 max)", rejected, res.status, JSON.stringify(d.message));
    }

    // ─── 5. PASSWORD POLICY & ACCOUNT LOCKOUT TESTS ───────────────────────────
    // 5a. Weak password on register (no uppercase or digits)
    {
        const res = await fetch(`${BASE_URL}/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Weak Pass User",
                email: "weakpass@example.com",
                password: "weakpassword", // No uppercase, no number
                phone: "+1 555-0101"
            })
        });
        const d = await res.json();
        printResult("5.1", "Password Policy: Weak password on register rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 5b. Weak password on change password
    if (userToken) {
        const res = await fetch(`${BASE_URL}/user/edit-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({
                oldpassword: "Password123!",
                newpassword: "short"
            })
        });
        const d = await res.json();
        printResult("5.2", "Password Policy: Short password on change-password rejected", res.status === 400 && !d.success, res.status, JSON.stringify(d.errors || d.message));
    }

    // 5c. Account Lockout: 5 failed consecutive logins on a dedicated test account
    {
        // First register a test user for lockout testing
        const testLockoutEmail = `lockout_test_${Date.now()}@example.com`;
        await fetch(`${BASE_URL}/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Lockout Test User",
                email: testLockoutEmail,
                password: "CorrectPassword123!",
                phone: "+1 555-0199"
            })
        });

        // Verify account via direct mongo or mock
        const { default: User } = await import("./Models/UserSchmea.js");
        await User.updateOne({ email: testLockoutEmail }, { verifyuser: true });

        let lastStatus = 0;
        let lastMessage = "";
        for (let i = 1; i <= 5; i++) {
            const res = await fetch(`${BASE_URL}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: testLockoutEmail,
                    password: "WrongPassword999!"
                })
            });
            const d = await res.json();
            lastStatus = res.status;
            lastMessage = d.message;
        }

        printResult("5.3", "Account Lockout: 5th failed login triggers 429 Account Locked", lastStatus === 429, lastStatus, lastMessage);
    }

    // 5d. Rate limiting: Hit login 11 times in 15 minutes -> confirm 429
    {
        let hit429 = false;
        let lastStatus = 0;
        let lastMsg = "";
        for (let i = 1; i <= 12; i++) {
            const res = await fetch(`${BASE_URL}/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "rate_limit_test@example.com", password: "Password123!" })
            });
            const d = await res.json();
            lastStatus = res.status;
            lastMsg = d.message;
            if (res.status === 429) {
                hit429 = true;
                break;
            }
        }
        printResult("5.4", "Rate Limit: Hitting login 11+ times triggers 429 Too Many Requests", hit429, lastStatus, lastMsg);
    }

    // 5e. Rate limiting: Hit consultation 51 times in 10 minutes -> confirm 429
    {
        let hit429 = false;
        let lastStatus = 0;
        let lastMsg = "";
        for (let i = 1; i <= 55; i++) {
            const res = await fetch(`${BASE_URL}/user/consultation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `Flood Tester ${i}`,
                    email: `flood${i}@test.com`,
                    phone: "+1 555-0199",
                    eventType: "Wedding",
                    message: "Rate limit flood test"
                })
            });
            const d = await res.json().catch(() => ({ message: res.statusText }));
            lastStatus = res.status;
            lastMsg = d.message;
            if (res.status === 429) {
                hit429 = true;
                break;
            }
        }
        printResult("5.5", "Rate Limit: Hitting consultation 51+ times triggers 429 Too Many Requests", hit429, lastStatus, lastMsg);
    }

    // ─── 6. SOCKET.IO SECURITY TESTS ─────────────────────────────────────────
    await new Promise((resolve) => {
        let guestDenied = false;
        let userDenied = false;
        let invalidJwtRejected = false;

        // 6a. Client with expired/invalid JWT rejected
        const badSocket = ioClient(BASE_URL, {
            auth: { token: "invalid.or.expired.jwt.token" },
            transports: ["websocket"]
        });
        badSocket.on("connect_error", (err) => {
            invalidJwtRejected = true;
            printResult("6.1", "Socket.io: Invalid/expired JWT connection rejected", true, "connect_error", err.message);
            badSocket.disconnect();
        });

        // 6b. Guest tries to join 'admins' room
        const guestSocket = ioClient(BASE_URL, { transports: ["websocket"] });
        guestSocket.on("connect", () => {
            guestSocket.emit("join_room", "admins");
        });
        guestSocket.on("error_message", (msg) => {
            if (msg.includes("Forbidden") || msg.includes("Admin privilege required")) {
                guestDenied = true;
                printResult("6.2", "Socket.io: Guest denied from 'admins' channel", true, "error_message", msg);
                guestSocket.disconnect();
            }
        });

        // 6c. Authenticated regular user tries to join 'admins' room
        const userSocket = ioClient(BASE_URL, {
            auth: { token: userToken },
            transports: ["websocket"]
        });
        userSocket.on("connect", () => {
            userSocket.emit("join_room", "admins");
        });
        userSocket.on("error_message", (msg) => {
            if (msg.includes("Forbidden") || msg.includes("Admin privilege required")) {
                userDenied = true;
                printResult("6.3", "Socket.io: Normal user denied from 'admins' channel", true, "error_message", msg);
                userSocket.disconnect();
            }
        });

        setTimeout(() => {
            resolve();
        }, 4000);
    });

    // ─── 7. ADMIN SELF-PROTECTION (Demotion, Deactivation, Deletion) ───────────
    if (adminToken && adminId) {
        // 7a. Admin tries to deactivate themselves
        {
            const res = await fetch(`${BASE_URL}/admin/users/${adminId}/status`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const d = await res.json();
            printResult("7.1", "Admin Self-Protection: Deactivate self blocked", res.status === 400 && !d.success, res.status, d.message);
        }

        // 7b. Admin tries to demote themselves
        {
            const res = await fetch(`${BASE_URL}/admin/users/${adminId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`
                },
                body: JSON.stringify({ role: "user" })
            });
            const d = await res.json();
            printResult("7.2", "Admin Self-Protection: Demote self to user blocked", res.status === 400 && !d.success, res.status, d.message);
        }

        // 7c. Admin tries to delete themselves
        {
            const res = await fetch(`${BASE_URL}/admin/users/${adminId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const d = await res.json();
            printResult("7.3", "Admin Self-Protection: Delete self blocked", res.status === 400 && !d.success, res.status, d.message);
        }
    }

    console.log("==========================================================================");
    console.log("             NEGATIVE SECURITY TEST SUITE EXECUTION COMPLETE             ");
    console.log("==========================================================================\n");
    process.exit(0);
}

runNegativeSecuritySuite();
