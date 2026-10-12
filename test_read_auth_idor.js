/**
 * READ ENDPOINT AUTHORIZATION + IDOR AUDIT
 * Tests every GET endpoint with: no token, user token, admin token
 * Also tests IDOR: User A vs. User B for consultations and chat history
 * Run: node test_read_auth_idor.js
 */

import dotenv from "dotenv";
dotenv.config({ quiet: true });

// Use native fetch (Node 18+)

const BASE = "http://localhost:9000";
let adminToken = "";
let userAToken = "";
let userBToken = "";
let userAId = "";
let userBId = "";
let sampleConsultationId = "";
let sampleRoomId = "";

// ── helpers ────────────────────────────────────────────────────────────────────
const get = async (path, token, extraHeaders = {}) => {
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, { headers });
  return r.status;
};

const post = async (path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
};

const fmt = (status, expected) => {
  const ok = Array.isArray(expected) ? expected.includes(status) : status === expected;
  return ok ? `✅ ${status}` : `❌ ${status} (expected ${Array.isArray(expected) ? expected.join('/') : expected})`;
};

// ── setup: obtain tokens and seed data ────────────────────────────────────────
async function setup() {
  console.log("\n=== SETUP: Obtaining tokens ===\n");

  // Admin login
  const adminRes = await post("/user/login", {
    email: process.env.TEST_ADMIN_EMAIL || "admin@eventify.com",
    password: process.env.TEST_ADMIN_PASS || "Password123!",
  });
  if (adminRes.json?.token) {
    adminToken = adminRes.json.token;
    console.log("✅ Admin token obtained");
  } else {
    console.error("❌ Admin login failed:", adminRes.json?.message);
  }

  // User A login (pre-existing test user)
  const userARes = await post("/user/login", {
    email: process.env.TEST_USER_EMAIL || "idor_user_a@test.eventify",
    password: process.env.TEST_USER_PASS || "TestPass123!",
  });
  if (userARes.json?.token) {
    userAToken = userARes.json.token;
    userAId = userARes.json.user?.id || userARes.json.user?._id || "";
    console.log("✅ User A token obtained, id:", userAId);
  } else {
    console.warn("⚠️  User A login failed:", userARes.json?.message);
  }

  // User B login (second test user)
  const userBRes = await post("/user/login", {
    email: process.env.TEST_USER2_EMAIL || "idor_user_b@test.eventify",
    password: process.env.TEST_USER2_PASS || "TestPass123!",
  });
  if (userBRes.json?.token) {
    userBToken = userBRes.json.token;
    userBId = userBRes.json.user?.id || userBRes.json.user?._id || "";
    console.log("✅ User B token obtained, id:", userBId);
  } else {
    console.warn("⚠️  User B login failed (IDOR test may be partial):", userBRes.json?.message);
  }

  // Fetch a consultation ID for IDOR testing (using admin)
  if (adminToken) {
    const cRes = await fetch(`${BASE}/admin/consultations?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const cJson = await cRes.json();
    sampleConsultationId = cJson?.data?.[0]?._id || "";
    console.log("Sample consultationId:", sampleConsultationId || "(none)");
  }

  // Fetch a chat roomId for IDOR testing (using admin)
  if (adminToken) {
    const chatRes = await fetch(`${BASE}/admin/chat/active`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const chatJson = await chatRes.json();
    sampleRoomId = chatJson?.data?.[0]?._id || "";
    console.log("Sample roomId:", sampleRoomId || "(none)");
  }
}

// ── audit matrix ──────────────────────────────────────────────────────────────
async function runAuthMatrix() {
  console.log("\n=== READ ENDPOINT AUTHORIZATION MATRIX ===\n");
  console.log("Legend: ✅ = Expected | ❌ = Unexpected\n");

  const rows = [];

  // Format: [label, path, noTokenExpected, userExpected, adminExpected]
  const adminEndpoints = [
    ["Admin: GET /admin/analytics",         "/admin/analytics",         401, 403, 200],
    ["Admin: GET /admin/audit-logs",        "/admin/audit-logs",        401, 403, 200],
    ["Admin: GET /admin/users",             "/admin/users",             401, 403, 200],
    ["Admin: GET /admin/categories",        "/admin/categories",        401, 403, 200],
    ["Admin: GET /admin/events",            "/admin/events",            401, 403, 200],
    ["Admin: GET /admin/chat/active",       "/admin/chat/active",       401, 403, 200],
    ["Admin: GET /admin/consultations",     "/admin/consultations",     401, 403, 200],
    ["Admin: GET /admin/reviews",           "/admin/reviews",           401, 403, 200],
    ["Admin: GET /admin/export/users",      "/admin/export/users",      401, 403, 200],
    ["Admin: GET /admin/export/consultations", "/admin/export/consultations", 401, 403, 200],
    ["Admin: GET /admin/export/events",     "/admin/export/events",     401, 403, 200],
    ["Admin: GET /admin/export/audit-log",  "/admin/export/audit-log",  401, 403, 200],
  ];

  const publicEndpoints = [
    // Public/semi-public – no token should work (200), user OK, admin OK
    ["Public: GET /user/events",     "/user/events",     200, 200, 200],
    ["Public: GET /user/categories", "/user/categories", 200, 200, 200],
    ["Public: GET /user/reviews",    "/user/reviews",    200, 200, 200],
  ];

  const protectedUserEndpoints = [
    // Requires user token (own data) or admin
    ["Protected: GET /user/consultations/me",    "/user/consultations/me",    401, 200, 200],
    ["Protected: GET /user/my-consultations",    "/user/my-consultations",    401, 200, 200],
    ["Protected: GET /user/notifications",       "/user/notifications",       401, 200, 200],
  ];

  // Admin-only endpoints
  for (const [label, path, noTok, userTok, adminTok] of adminEndpoints) {
    const noTokenStatus  = await get(path);
    const userStatus     = userAToken ? await get(path, userAToken)  : "N/A";
    const adminStatus    = adminToken ? await get(path, adminToken)   : "N/A";

    const row = {
      label,
      noToken:  fmt(noTokenStatus, noTok),
      user:     userAToken ? fmt(userStatus, userTok)  : "⚠️ N/A",
      admin:    adminToken ? fmt(adminStatus, adminTok) : "⚠️ N/A",
    };
    rows.push(row);
    console.log(`[${label}]`);
    console.log(`  No Token: ${row.noToken} | User: ${row.user} | Admin: ${row.admin}`);
  }

  // Public endpoints
  for (const [label, path, noTok, userTok, adminTok] of publicEndpoints) {
    const noTokenStatus  = await get(path);
    const userStatus     = userAToken ? await get(path, userAToken)  : "N/A";
    const adminStatus    = adminToken ? await get(path, adminToken)   : "N/A";

    const row = {
      label,
      noToken:  fmt(noTokenStatus, noTok),
      user:     userAToken ? fmt(userStatus, userTok)  : "⚠️ N/A",
      admin:    adminToken ? fmt(adminStatus, adminTok) : "⚠️ N/A",
    };
    rows.push(row);
    console.log(`[${label}]`);
    console.log(`  No Token: ${row.noToken} | User: ${row.user} | Admin: ${row.admin}`);
  }

  // Protected user endpoints
  for (const [label, path, noTok, userTok, adminTok] of protectedUserEndpoints) {
    const noTokenStatus  = await get(path);
    const userStatus     = userAToken ? await get(path, userAToken)  : "N/A";
    const adminStatus    = adminToken ? await get(path, adminToken)   : "N/A";

    const row = {
      label,
      noToken:  fmt(noTokenStatus, noTok),
      user:     userAToken ? fmt(userStatus, userTok)  : "⚠️ N/A",
      admin:    adminToken ? fmt(adminStatus, adminTok) : "⚠️ N/A",
    };
    rows.push(row);
    console.log(`[${label}]`);
    console.log(`  No Token: ${row.noToken} | User: ${row.user} | Admin: ${row.admin}`);
  }

  return rows;
}

// ── IDOR tests ────────────────────────────────────────────────────────────────
async function runIDORTests() {
  console.log("\n=== IDOR TESTS ===\n");

  // 1. User B tries to access User A's consultations/me
  // (getMyConsultations filters by req.user._id so this is inherently safe,
  //  but we verify the endpoint actually returns B's data, not A's)
  if (userAToken && userBToken) {
    console.log("--- Test 1: Consultations IDOR ---");
    const aRes = await fetch(`${BASE}/user/consultations/me`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const aJson = await aRes.json();
    const aCount = aJson?.data?.length ?? "N/A";

    const bRes = await fetch(`${BASE}/user/consultations/me`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const bJson = await bRes.json();
    const bCount = bJson?.data?.length ?? "N/A";

    // Check none of A's records appear in B's response
    const aIds = (aJson?.data || []).map(c => c._id?.toString());
    const bIds = (bJson?.data || []).map(c => c._id?.toString());
    const overlap = aIds.filter(id => bIds.includes(id));
    
    console.log(`  User A consultations: ${aCount} records`);
    console.log(`  User B consultations: ${bCount} records`);
    if (overlap.length === 0) {
      console.log(`  ✅ No data overlap between User A and User B consultation lists`);
    } else {
      console.log(`  ❌ Data LEAK: ${overlap.length} consultation(s) visible to both users!`);
    }
  } else {
    console.log("⚠️  Skipped: Need both User A and User B tokens");
  }

  // 2. User B tries to read User A's chat room by guessing roomId
  console.log("\n--- Test 2: Chat Room IDOR ---");
  if (userAId && userBToken) {
    // roomId = userId for authenticated users
    const roomIdOfA = userAId;
    const statusBAccessingA = await get(`/user/chat/${roomIdOfA}`, userBToken);
    if (statusBAccessingA === 403) {
      console.log(`  ✅ User B cannot access User A's chat room: ${statusBAccessingA} Forbidden`);
    } else {
      console.log(`  ❌ IDOR: User B accessed User A's chat room - status ${statusBAccessingA}`);
    }
  } else if (sampleRoomId && userBToken) {
    const statusBAccessingRoom = await get(`/user/chat/${sampleRoomId}`, userBToken);
    if (statusBAccessingRoom === 403) {
      console.log(`  ✅ User B cannot access another user's chat room: ${statusBAccessingRoom} Forbidden`);
    } else {
      console.log(`  ❌ IDOR: User B accessed a foreign chat room - status ${statusBAccessingRoom}`);
    }
  } else {
    console.log("  ⚠️  Skipped: Need User A ID and User B token");
  }

  // 3. Guest trying to read chat room of another user (guessing roomId)
  console.log("\n--- Test 3: Guest Chat Room Guess ---");
  if (sampleRoomId || userAId) {
    const targetRoom = userAId || sampleRoomId;
    // No auth, no x-guest-id header → should 403
    const guestNoHeaderStatus = await get(`/user/chat/${targetRoom}`);
    if (guestNoHeaderStatus === 403) {
      console.log(`  ✅ Unauthenticated guest cannot access a user chat room: ${guestNoHeaderStatus} Forbidden`);
    } else {
      console.log(`  ⚠️  Unauthenticated request returned ${guestNoHeaderStatus} (expected 403)`);
    }

    // Guest with wrong x-guest-id header → should 403
    const guestWrongIdStatus = await get(`/user/chat/${targetRoom}`, null, { "x-guest-id": "wrong-random-id-123" });
    if (guestWrongIdStatus === 403) {
      console.log(`  ✅ Guest with wrong x-guest-id cannot access room: ${guestWrongIdStatus} Forbidden`);
    } else {
      console.log(`  ⚠️  Guest with wrong id returned ${guestWrongIdStatus} (expected 403)`);
    }

    // Guest with correct x-guest-id header → should 200 (their own room)
    const guestCorrectIdStatus = await get(`/user/chat/${targetRoom}`, null, { "x-guest-id": targetRoom });
    if (guestCorrectIdStatus === 200) {
      console.log(`  ✅ Guest with correct x-guest-id can access their own room: ${guestCorrectIdStatus} OK`);
    } else {
      console.log(`  ℹ️  Guest with own id returned ${guestCorrectIdStatus}`);
    }
  } else {
    console.log("  ⚠️  Skipped: No room ID available");
  }

  // 4. Admin can read any chat room
  console.log("\n--- Test 4: Admin Cross-Room Access ---");
  if (sampleRoomId && adminToken) {
    const adminRoomStatus = await get(`/admin/chat/${sampleRoomId}`, adminToken);
    if (adminRoomStatus === 200) {
      console.log(`  ✅ Admin can access any chat room: ${adminRoomStatus} OK`);
    } else {
      console.log(`  ❌ Admin failed to access chat room: ${adminRoomStatus}`);
    }
  }
}

// ── Rate limiting / in-memory lockout documentation ──────────────────────────
function docRateLimiting() {
  console.log("\n=== RATE LIMITING / LOCKOUT PERSISTENCE DOCUMENTATION ===\n");
  console.log("Current Implementation:");
  console.log("  • Login rate limit: 10 attempts per 15 min per IP (express-rate-limit)");
  console.log("  • Consultation rate limit: 50 per 10 min per IP");
  console.log("  • Account lockout store: In-memory Map (ipEmailLockouts in UserController.js)");
  console.log("  • Lockout keyed on: {email}:{clientIp} → prevents targeted lockout from other IPs");
  console.log("");
  console.log("Production Recommendation:");
  console.log("  ⚠️  In-memory store is NOT shared across multiple Node.js instances/processes.");
  console.log("  For multi-instance deployments (PM2 cluster, container replicas), migrate to:");
  console.log("  • Redis-backed express-rate-limit (rate-limit-redis package)");
  console.log("  • OR: ioredis-based lockout store with atomic INCR + EXPIRE operations");
  console.log("  Single-instance deployments (single PM2 process/container): current implementation is sufficient.");
  console.log("");
  console.log("Status: ACCEPTABLE for single-process launch. Document upgrade path for scale-out.");
}

// ── main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║       EVENTIFY READ AUTH + IDOR AUDIT (Phase 9 Completion)    ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  await setup();
  const matrixRows = await runAuthMatrix();
  await runIDORTests();
  docRateLimiting();

  const passes = matrixRows.filter(r =>
    r.noToken.startsWith("✅") && r.user.startsWith("✅") && r.admin.startsWith("✅")
  ).length;
  const total = matrixRows.length;

  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log(`║  MATRIX RESULT: ${passes}/${total} endpoints fully authorized correctly       ║`);
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
}

main().catch(console.error);
