import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Event from "./Models/EventSchema.js";

async function migrateEvents() {
    try {
        console.log("Connecting to MongoDB for Phase 3 Migration...");
        const dbUri = process.env.DATABASE || process.env.DB_URL;
        await mongoose.connect(dbUri);
        console.log("Connected to MongoDB.");

        const events = await Event.find({});
        console.log(`Found ${events.length} events to verify/migrate.`);

        let updated = 0;
        for (const ev of events) {
            let needsSave = false;

            // Generate slug if missing
            if (!ev.slug && ev.title) {
                const baseSlug = ev.title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                ev.slug = `${baseSlug}-${ev._id.toString().slice(-6)}`;
                needsSave = true;
            }

            // Normalise status
            if (!ev.status || ev.status === "Active") {
                ev.status = "published";
                needsSave = true;
            }

            // Set cover image if missing
            if (!ev.coverImage && Array.isArray(ev.images) && ev.images.length > 0) {
                ev.coverImage = ev.images[0];
                needsSave = true;
            }

            // Set featured default
            if (ev.featured === undefined) {
                ev.featured = false;
                needsSave = true;
            }

            if (needsSave) {
                await ev.save();
                updated++;
            }
        }

        console.log(`✅ Phase 3 Migration Completed: ${updated}/${events.length} events updated with slugs, published status, and coverImage.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrateEvents();
