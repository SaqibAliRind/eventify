import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./Models/UserSchmea.js";
import Event from "./Models/EventSchema.js";
import Category from "./Models/CategorySchema.js";
import Consultation from "./Models/ConsultationSchema.js";
import Review from "./Models/ReviewSchema.js";
import Chat from "./Models/ChatSchema.js";

dotenv.config({ quiet: true });

const DB = process.env.DATABASE;

export const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB for E2E Seed...");
        await mongoose.connect(DB);
        console.log("Connected successfully.");

        // Clear existing data for clean idempotent state
        console.log("Resetting collections...");
        await User.deleteMany({});
        await Event.deleteMany({});
        await Category.deleteMany({});
        await Consultation.deleteMany({});
        await Review.deleteMany({});
        await Chat.deleteMany({});
        console.log("Collections cleared.");

        // 1. Password setup
        const TEST_PASSWORD = "Password123!";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

        // 2. Users (5-6 covering every role + edge cases)
        const usersData = [
            {
                name: "Alexander Wright (Head Admin)",
                email: "admin@eventify.com",
                password: hashedPassword,
                phone: "+1 (555) 234-5678",
                role: "admin",
                verifyuser: true,
                active: true,
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Sarah Jenkins (Event Director)",
                email: "organizer.sarah@eventify.com",
                password: hashedPassword,
                phone: "+1 (555) 345-6789",
                role: "admin",
                verifyuser: true,
                active: true,
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Elena Rostova",
                email: "elena.rostova@example.com",
                password: hashedPassword,
                phone: "+1 (555) 456-7890",
                role: "user",
                verifyuser: true,
                active: true,
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Marcus Vance",
                email: "marcus.vance@example.com",
                password: hashedPassword,
                phone: "+1 (555) 567-8901",
                role: "user",
                verifyuser: true,
                active: true,
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "Clara Novak (New User - Zero Bookings)",
                email: "clara.novak@example.com",
                password: hashedPassword,
                phone: "+1 (555) 678-9012",
                role: "user",
                verifyuser: true,
                active: true,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400"
            },
            {
                name: "David Kim (Deactivated Account)",
                email: "david.kim@example.com",
                password: hashedPassword,
                phone: "+1 (555) 789-0123",
                role: "user",
                verifyuser: true,
                active: false,
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
            }
        ];

        const createdUsers = await User.insertMany(usersData);
        console.log(`Created ${createdUsers.length} users across roles & edge cases.`);

        // 3. Categories
        const categoriesData = [
            { categoryName: "Wedding", showOnHome: true },
            { categoryName: "Corporate Summit", showOnHome: true },
            { categoryName: "Birthday Gala", showOnHome: true },
            { categoryName: "Music Festival", showOnHome: false },
            { categoryName: "Tech Conference", showOnHome: false },
            { categoryName: "Charity & Galas", showOnHome: false } // Edge case: empty category
        ];

        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`Created ${createdCategories.length} categories.`);

        // 4. Events (10 diverse events with 5+ valid high quality images each)
        const eventsData = [
            {
                title: "Grand Royal Palace Wedding",
                category: "Wedding",
                description: "An opulent fairytale wedding banquet hosted in a crystal chandelier ballroom with customized floral archways, 7-course gourmet dining, and live symphony orchestra.",
                date: "2026-11-20",
                location: "Grand Palace Ballroom, Manhattan, New York",
                guests: "450 Guests",
                tag: "Luxury",
                images: [
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Global AI & Cloud Executive Summit",
                category: "Corporate Summit",
                description: "Premier annual summit uniting C-level technology visionaries, keynote presentations on frontier generative AI, interactive roundtables, and VIP networking lounge.",
                date: "2026-12-05",
                location: "Moscone Center Hall B, San Francisco, California",
                guests: "1200 Delegates",
                tag: "Corporate",
                images: [
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Neon Electric 30th Birthday Bash",
                category: "Birthday Gala",
                description: "An electrifying neon & ultraviolet immersive nightclub experience featuring international guest DJs, laser light choreography, signature cocktail bars, and photo booths.",
                date: "2026-10-31",
                location: "Skyline Rooftop Lounge, Miami, Florida",
                guests: "250 Guests",
                tag: "Party",
                images: [
                    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Sunset Horizons Indie Music Festival",
                category: "Music Festival",
                description: "3 days of non-stop open-air indie, folk, and electronic performances along the Pacific coast with artisanal food markets, art installations, and campfire acoustic sessions.",
                date: "2026-10-15",
                location: "Golden Gate Park Meadow, San Francisco, CA",
                guests: "3000 (Sold Out)",
                tag: "Festival",
                images: [
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Silicon Valley Web3 Developers Forum",
                category: "Tech Conference",
                description: "A fast-paced developer hackathon and keynote conference discussing decentralized architectures, cryptographic security, and enterprise smart contracts.",
                date: "2026-11-12",
                location: "Tech Innovation Hub, Palo Alto, CA",
                guests: "500 Developers",
                tag: "Tech",
                images: [
                    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Emerald Coastal Beachfront Nuptials",
                category: "Wedding",
                description: "Romantic barefoot ceremony on soft white sands followed by a seaside marquee dinner under twinkling string lanterns with panoramic ocean sunset views.",
                date: "2026-09-18",
                location: "Emerald Bay Resort, Laguna Beach, CA",
                guests: "180 Guests",
                tag: "Romantic",
                images: [
                    "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Annual Fortune 500 Leadership Retreat",
                category: "Corporate Summit",
                description: "Executive strategy sessions, leadership masterclasses, golf networking tourney, and private gala dinner at a historic mountain lodge.",
                date: "2026-10-11", // Today's date!
                location: "St. Regis Mountain Resort, Aspen, Colorado",
                guests: "120 Executives",
                tag: "VIP",
                images: [
                    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Vintage Botanical Golden Anniversary",
                category: "Birthday Gala",
                description: "A golden botanical greenhouse celebration surrounded by exotic orchids, artisan cheese pairing stations, and a timeless string quartet.",
                date: "2026-08-14", // Past date
                location: "Royal Conservatory, Chicago, Illinois",
                guests: "85 Guests",
                tag: "Classic",
                images: [
                    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Acoustic Sunset Harbor Cruise",
                category: "Music Festival",
                description: "An intimate evening cruise aboard a tri-deck luxury yacht featuring live acoustic indie artists, twilight harbor views, and complimentary champagne.",
                date: "2026-11-08",
                location: "Pier 39 Marina, San Francisco, CA",
                guests: "120 Guests",
                tag: "Trending",
                images: [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200"
                ]
            },
            {
                title: "Global FinTech Architecture Expo",
                category: "Tech Conference",
                description: "Deep dive workshops on high frequency trading engines, digital currencies, regulatory automation, and microservices resilience.",
                date: "2027-01-15", // Future date
                location: "Javits Center, New York City, NY",
                guests: "1800 Attendees",
                tag: "Corporate",
                images: [
                    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
                    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200"
                ]
            }
        ];

        const createdEvents = await Event.insertMany(eventsData);
        console.log(`Created ${createdEvents.length} events across varied categories and dates.`);

        // 5. Consultations / Bookings (Linked to users and events)
        const consultationsData = [
            {
                name: "Elena Rostova",
                email: "elena.rostova@example.com",
                phone: "+1 (555) 456-7890",
                eventDate: new Date("2026-11-20"),
                eventType: "Wedding",
                message: "Inquiry regarding event: 'Grand Royal Palace Wedding'. Please share premium floral package details and bridal suite reservation.",
                status: "Pending"
            },
            {
                name: "Marcus Vance",
                email: "marcus.vance@example.com",
                phone: "+1 (555) 567-8901",
                eventDate: new Date("2026-12-05"),
                eventType: "Corporate Summit",
                message: "Inquiry regarding event: 'Global AI & Cloud Executive Summit'. Requesting reserved VIP front-row seating for our 12-member engineering board.",
                status: "Contacted"
            },
            {
                name: "Elena Rostova",
                email: "elena.rostova@example.com",
                phone: "+1 (555) 456-7890",
                eventDate: new Date("2026-10-31"),
                eventType: "Birthday Gala",
                message: "Inquiry regarding event: 'Neon Electric 30th Birthday Bash'. Looking to reserve two VIP booth tables with custom bottle service.",
                status: "Resolved"
            },
            {
                name: "Julian Sterling",
                email: "julian.sterling@techcorp.io",
                phone: "+1 (555) 890-1234",
                eventDate: new Date("2027-01-15"),
                eventType: "Tech Conference",
                message: "Interested in corporate booth sponsorship package for the Global FinTech Architecture Expo.",
                status: "Pending"
            },
            {
                name: "Sophia Martinez",
                email: "sophia.m@gmail.com",
                phone: "+1 (555) 901-2345",
                eventDate: new Date("2026-09-18"),
                eventType: "Wedding",
                message: "Requesting full catering menu options and beach sunset timing for Emerald Coastal Beachfront Nuptials.",
                status: "Contacted"
            }
        ];

        const createdConsultations = await Consultation.insertMany(consultationsData);
        console.log(`Created ${createdConsultations.length} consultations/booking records.`);

        // 6. Testimonials & Reviews
        const reviewsData = [
            {
                userName: "Elena Rostova",
                userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                rating: 5,
                comment: "Eventify planned our dream wedding down to the exact flower petal! Flawless coordination, exceptional decor, and absolute peace of mind.",
                isApproved: true
            },
            {
                userName: "Marcus Vance",
                userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                rating: 5,
                comment: "The AI summit was seamlessly produced. Sound, lighting, schedule pacing, and attendee satisfaction were all world-class.",
                isApproved: true
            },
            {
                userName: "Genevieve Dubois",
                userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                rating: 5,
                comment: "Top tier event planning team. They made our 30th birthday gala unforgettable. Every guest was mesmerized by the neon aesthetic!",
                isApproved: true
            },
            {
                userName: "Liam O'Connor",
                userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                rating: 4,
                comment: "Great sound system and festival vibe. Highly recommend for large music gatherings.",
                isApproved: false // Pending approval test case
            }
        ];

        const createdReviews = await Review.insertMany(reviewsData);
        console.log(`Created ${createdReviews.length} client reviews/testimonials.`);

        // 7. Live Chat Messages
        const chatData = [
            {
                roomId: "room_elena",
                senderId: createdUsers[2]._id.toString(),
                senderName: "Elena Rostova",
                message: "Hello! I sent a consultation inquiry for the Royal Wedding. When can we schedule a walkthrough?",
                isAdmin: false,
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                roomId: "room_elena",
                senderId: createdUsers[0]._id.toString(),
                senderName: "Alexander Wright (Head Admin)",
                message: "Hi Elena! We have received your inquiry. We would love to host a walkthrough this Thursday at 2 PM.",
                isAdmin: true,
                timestamp: new Date(Date.now() - 1800000)
            }
        ];

        const createdChats = await Chat.insertMany(chatData);
        console.log(`Created ${createdChats.length} initial chat messages.`);

        console.log("\n=======================================================");
        console.log("            DATABASE SEED COMPLETED SUCCESSFULLY        ");
        console.log("=======================================================");
        console.log("TEST CREDENTIALS (PASSWORD FOR ALL USERS: Password123!)");
        console.log("-------------------------------------------------------");
        console.log("1. Admin / Organizer 1: admin@eventify.com (Role: admin)");
        console.log("2. Organizer 2: organizer.sarah@eventify.com (Role: admin)");
        console.log("3. User 1 (Active bookings): elena.rostova@example.com (Role: user)");
        console.log("4. User 2 (Inquiries): marcus.vance@example.com (Role: user)");
        console.log("5. User 3 (Edge Case - Zero bookings): clara.novak@example.com (Role: user)");
        console.log("6. User 4 (Edge Case - Deactivated): david.kim@example.com (Active: false)");
        console.log("=======================================================\n");

        await mongoose.disconnect();
        return {
            users: createdUsers.length,
            categories: createdCategories.length,
            events: createdEvents.length,
            consultations: createdConsultations.length,
            reviews: createdReviews.length,
            chats: createdChats.length
        };
    } catch (error) {
        console.error("Error Seeding Database:", error);
        throw error;
    }
};

// If run directly via node seed_e2e.js
if (process.argv[1]?.endsWith("seed_e2e.js")) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
