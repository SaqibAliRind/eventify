import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function auditDB() {
    await mongoose.connect(process.env.DATABASE);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("==========================================================================");
    console.log("            DATABASE AUDIT: COLLECTIONS & RECORD COUNTS                  ");
    console.log("==========================================================================");

    for (const c of collections) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`- ${c.name.padEnd(20)}: ${count} records`);
    }

    console.log("\n==========================================================================");
    console.log("            DEMO & SEED ACCOUNTS DETECTED IN THIS DATABASE               ");
    console.log("==========================================================================");
    const users = await db.collection("users").find({}).toArray();
    for (const u of users) {
        const isDemo = /example\.com|test|demo/i.test(u.email);
        console.log(`- Email: ${u.email.padEnd(30)} | Role: ${u.role.padEnd(8)} | Verified: ${u.verifyuser} | Flag: ${isDemo ? "⚠️ DEMO/SEED" : "VALID"}`);
    }

    await mongoose.disconnect();
}

auditDB().catch(console.error);
