import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Models/UserSchmea.js";
import Event from "./Models/EventSchema.js";
import Category from "./Models/CategorySchema.js";
import Consultation from "./Models/ConsultationSchema.js";
import Review from "./Models/ReviewSchema.js";
import Chat from "./Models/ChatSchema.js";

dotenv.config({ quiet: true });

async function verify() {
    await mongoose.connect(process.env.DATABASE);
    const counts = {
        users: await User.countDocuments(),
        events: await Event.countDocuments(),
        categories: await Category.countDocuments(),
        consultations: await Consultation.countDocuments(),
        reviews: await Review.countDocuments(),
        chats: await Chat.countDocuments(),
    };
    console.log("DATABASE_COUNTS:", JSON.stringify(counts, null, 2));
    await mongoose.disconnect();
}
verify();
