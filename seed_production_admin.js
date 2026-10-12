import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

import User from "./Models/UserSchmea.js";

async function seedProductionAdmin() {
    try {
        console.log("=== Eventify Production Admin Provisioning ===");

        const dbUri = process.env.DATABASE || process.env.DB_URL;
        if (!dbUri) {
            console.error("❌ DATABASE environment variable is not defined.");
            process.exit(1);
        }

        await mongoose.connect(dbUri);
        console.log("Connected to MongoDB.");

        const adminEmail = (process.env.ADMIN_EMAIL || "admin@eventify.com").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!";
        const adminName = process.env.ADMIN_NAME || "System Administrator";
        const adminPhone = process.env.ADMIN_PHONE || "+1 555-0199";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`ℹ️ Admin account (${adminEmail}) already exists. Ensuring admin role & active status...`);
            existingAdmin.role = "admin";
            existingAdmin.verifyuser = true;
            existingAdmin.isActive = true;
            existingAdmin.failedLoginAttempts = 0;
            existingAdmin.lockUntil = null;
            await existingAdmin.save();
            console.log("✅ Existing admin account verified and updated to active admin.");
            process.exit(0);
        }

        // Validate password against policy
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(adminPassword)) {
            console.error("❌ ADMIN_PASSWORD must be at least 8 characters long and contain uppercase, lowercase, and numbers.");
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const newAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            phone: adminPhone,
            role: "admin",
            verifyuser: true,
            isActive: true,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        });

        console.log("✅ Production Admin successfully provisioned:");
        console.log(`   ID:    ${newAdmin._id}`);
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Role:  ${newAdmin.role}`);
        console.log("ℹ️ No demo users were created.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to provision production admin:", err);
        process.exit(1);
    }
}

seedProductionAdmin();
