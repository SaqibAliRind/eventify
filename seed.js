import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./Models/UserSchmea.js";
import Event from "./Models/EventSchema.js";
import Category from "./Models/CategorySchema.js";

dotenv.config();

const DB = process.env.DATABASE;

const seedDatabase = async () => {
    try {
        await mongoose.connect(DB);
        console.log("Connected to MongoDB for Seeding...");

        // 1. Clear existing data and drop old indexes
        await mongoose.connection.db.dropCollection('users').catch(() => {});
        await mongoose.connection.db.dropCollection('events').catch(() => {});
        await mongoose.connection.db.dropCollection('categories').catch(() => {});
        console.log("Cleared existing data and old indexes.");

        // 2. Add Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const users = [
            {
                name: "Admin User",
                email: "admin@example.com",
                password: hashedPassword,
                phone: "1234567890",
                role: "admin",
                verifyuser: true
            },
            {
                name: "Normal User",
                email: "user@example.com",
                password: hashedPassword,
                phone: "0987654321",
                role: "user",
                verifyuser: true
            }
        ];
        await User.insertMany(users);
        console.log("Added default users.");

        // 3. Add Categories
        const categories = [
            { categoryName: "Wedding", showOnHome: true },
            { categoryName: "Corporate Event", showOnHome: true },
            { categoryName: "Birthday Party", showOnHome: true },
            { categoryName: "Concert", showOnHome: false },
        ];
        await Category.insertMany(categories);
        console.log("Added default categories.");

        // 4. Add Events
        const defaultImages = [
            "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1000"
        ];

        const events = [
            {
                title: "Grand Royal Wedding",
                category: "Wedding",
                description: "A beautiful and luxurious royal wedding setup with premium decorations.",
                date: "2024-12-15",
                location: "Grand Palace Hotel, NYC",
                guests: "500",
                tag: "Premium",
                images: defaultImages
            },
            {
                title: "Tech Innovators Summit",
                category: "Corporate Event",
                description: "Annual tech conference featuring the latest in AI and software development.",
                date: "2025-01-20",
                location: "Silicon Valley Convention Center",
                guests: "2000",
                tag: "Corporate",
                images: defaultImages
            },
            {
                title: "Neon Birthday Bash",
                category: "Birthday Party",
                description: "An exciting neon-themed birthday party with live DJs.",
                date: "2024-11-10",
                location: "Downtown Club, LA",
                guests: "150",
                tag: "Party",
                images: defaultImages
            }
        ];
        await Event.insertMany(events);
        console.log("Added default events.");

        console.log("Seeding Completed Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error Seeding Database:", error);
        process.exit(1);
    }
};

seedDatabase();
