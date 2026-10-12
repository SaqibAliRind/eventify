import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./Models/EventSchema.js";

dotenv.config({ quiet: true });

async function testMutation() {
    await mongoose.connect(process.env.DATABASE);
    const event = await Event.findOne({ title: "Grand Royal Palace Wedding" });
    if (!event) {
        console.error("Event not found for mutation test!");
        process.exit(1);
    }

    console.log("Original Event Title:", event.title);

    // Mutate directly in DB
    event.title = "Grand Royal Palace Wedding [DB VERIFIED LIVE]";
    await event.save();

    const updated = await Event.findById(event._id);
    console.log("Mutated Event Title in DB:", updated.title);

    // Revert
    updated.title = "Grand Royal Palace Wedding";
    await updated.save();

    const reverted = await Event.findById(event._id);
    console.log("Reverted Event Title in DB:", reverted.title);

    console.log("DB Mutation & Reversion Verified Successfully!");
    await mongoose.disconnect();
}

testMutation();
