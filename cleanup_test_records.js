import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE || process.env.MONGODB_URI;

async function cleanup() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const userRes = await db.collection("users").deleteMany({
        email: { 
            $in: [
                "automated.guest@example.com",
                "lockout.test@example.com",
                "xss.test@example.com"
            ] 
        }
    });

    const consultRes = await db.collection("consultations").deleteMany({
        $or: [
            { name: { $regex: /automated/i } },
            { email: "automated.guest@example.com" },
            { message: { $regex: /Annual Summer Gala/i } },
            { message: { $regex: /script|onerror/i } }
        ]
    });

    const reviewRes = await db.collection("reviews").deleteMany({
        comment: { $regex: /script|onerror|alert/i }
    });

    console.log("Cleanup Report:");
    console.log(`- Deleted users: ${userRes.deletedCount}`);
    console.log(`- Deleted consultations: ${consultRes.deletedCount}`);
    console.log(`- Deleted reviews: ${reviewRes.deletedCount}`);

    await mongoose.disconnect();
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
