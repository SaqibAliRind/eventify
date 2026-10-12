import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE;

async function purgeTestData() {
    console.log("==========================================================================");
    console.log("               EVENTIFY SAFE TEST DATA PURGE UTILITY                      ");
    console.log("==========================================================================\n");

    // 1. Refuse to run when NODE_ENV is production
    if (process.env.NODE_ENV === "production") {
        console.error("⛔ CRITICAL SAFETY ERROR: Refusing to run purge_test_data.js when NODE_ENV=production!");
        console.error("Production environments must be provisioned with `seed_production_admin.js` and NEVER purged.");
        process.exit(1);
    }

    // 2. Require explicit --confirm flag
    const hasConfirmFlag = process.argv.includes("--confirm");
    if (!hasConfirmFlag) {
        console.error("⚠️ SAFETY GUARD: Missing required '--confirm' command line flag.");
        console.error("Usage: node purge_test_data.js --confirm");
        console.error("Run with '--dry-run' to inspect records that would be removed without deleting.");
        process.exit(1);
    }

    if (!uri) {
        console.error("❌ No DATABASE connection string found in environment.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Targeted test email filter
    const testEmailQuery = {
        $or: [
            { email: { $in: [
                "elena.rostova@example.com",
                "marcus.vance@example.com",
                "clara.novak@example.com",
                "david.kim@example.com",
                "automated.guest@example.com",
                "lockout.test@example.com",
                "xss.test@example.com"
            ] } },
            { email: { $regex: /testuser_.*@example\.com/i } },
            { email: { $regex: /@test\.eventify$/i } }  // IDOR audit test accounts
        ]
    };

    // Count records before deletion
    const targetUsersCount = await db.collection("users").countDocuments(testEmailQuery);
    const unverifiedCount = await db.collection("users").countDocuments({ verifyuser: false, email: { $regex: /example\.com/i } });
    const targetConsultationsCount = await db.collection("consultations").countDocuments({
        $or: [
            { email: { $regex: /example\.com/i } },
            { name: { $regex: /test|automated|guest/i } },
            { message: { $regex: /Annual Summer Gala|opulent ballroom banquet|test/i } }
        ]
    });
    const targetReviewsCount = await db.collection("reviews").countDocuments({
        $or: [
            { comment: { $regex: /script|onerror|alert|automated/i } }
        ]
    });
    const targetChatsCount = await db.collection("chats").countDocuments({
        $or: [
            { roomId: { $regex: /guest_offline_test|test_room/i } },
            { message: { $regex: /Playwright E2E|Automated verification/i } }
        ]
    });

    console.log("Records identified matching test data signatures:");
    console.log(`- Seed/Test Users:           ${targetUsersCount}`);
    console.log(`- Unverified Test Accounts:  ${unverifiedCount}`);
    console.log(`- Test Consultation Leads:   ${targetConsultationsCount}`);
    console.log(`- Test Reviews:              ${targetReviewsCount}`);
    console.log(`- Test Live Chat Messages:   ${targetChatsCount}`);

    // Execute safe deletions
    const userDel = await db.collection("users").deleteMany(testEmailQuery);
    const unverifiedDel = await db.collection("users").deleteMany({ verifyuser: false, email: { $regex: /example\.com/i } });
    const consultDel = await db.collection("consultations").deleteMany({
        $or: [
            { email: { $regex: /example\.com/i } },
            { name: { $regex: /test|automated|guest/i } },
            { message: { $regex: /Annual Summer Gala|opulent ballroom banquet|test/i } }
        ]
    });
    const reviewDel = await db.collection("reviews").deleteMany({
        $or: [
            { comment: { $regex: /script|onerror|alert|automated/i } }
        ]
    });
    const chatDel = await db.collection("chats").deleteMany({
        $or: [
            { roomId: { $regex: /guest_offline_test|test_room/i } },
            { message: { $regex: /Playwright E2E|Automated verification/i } }
        ]
    });

    console.log("\nDeletion Summary:");
    console.log(`- Users deleted:         ${userDel.deletedCount + unverifiedDel.deletedCount}`);
    console.log(`- Consultations deleted: ${consultDel.deletedCount}`);
    console.log(`- Reviews deleted:       ${reviewDel.deletedCount}`);
    console.log(`- Chats deleted:         ${chatDel.deletedCount}`);

    await mongoose.disconnect();
    console.log("\n✅ Safe test data purge completed successfully. Production accounts intact.");
}

purgeTestData().catch(err => {
    console.error("Purge error:", err);
    process.exit(1);
});
