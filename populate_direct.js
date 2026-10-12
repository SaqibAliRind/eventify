import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './Models/EventSchema.js';

dotenv.config();

const DB = process.env.DATABASE;

const events = [
  {
    title: "Vibrant Dholki Night",
    category: "dholki",
    description: "A night of traditional music, dance, and celebration. Experience the soulful beats and joyful atmosphere of a classic Dholki ceremony.",
    date: "March 20, 2026",
    location: "Royal Orchid Hall, Karachi",
    guests: "150+",
    tag: "Traditional",
    images: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Musical Dholki Evening",
    category: "dholki",
    description: "Gather for an evening of acoustic melodies and percussive rhythms. A perfect blend of heritage and celebration for the bride-to-be.",
    date: "March 22, 2026",
    location: "Crystal Garden, Lahore",
    guests: "100+",
    tag: "Classic",
    images: [
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Traditional Beats & Sweets",
    category: "dholki",
    description: "Celebrate the upcoming nuptials with traditional dholak beats and an array of festive sweets in an intimate setting.",
    date: "March 25, 2026",
    location: "Private Residence, Islamabad",
    guests: "80+",
    tag: "Intimate",
    images: [
      "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Floral Mhendi Fiesta",
    category: "mhendi",
    description: "A colorful extravaganza featuring intricate henna designs and floral decor. Celebrate the art of Mhendi with music and joy.",
    date: "April 05, 2026",
    location: "Bloom Fest Grounds, Karachi",
    guests: "250+",
    tag: "Festive",
    images: [
      "https://images.unsplash.com/photo-1603984362497-0a878f60a02c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Henna & Harvest Festival",
    category: "mhendi",
    description: "An earthy, harvest-themed Mhendi celebration with focus on natural dyes and organic decor. A unique take on a classic tradition.",
    date: "April 10, 2026",
    location: "Oak Tree Estate, Lahore",
    guests: "200+",
    tag: "Organic",
    images: [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603984362497-0a878f60a02c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Golden Hour Mhendi",
    category: "mhendi",
    description: "Watch the sunset as the henna dries. An elegant evening affair with glowing lights and soulful Sufi performances.",
    date: "April 15, 2026",
    location: "Sunset Terrace, Lahore",
    guests: "180+",
    tag: "Elegant",
    images: [
      "https://images.unsplash.com/photo-1595981267035-7b04ec82355b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603984362497-0a878f60a02c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop"
    ]
  },
  {
    title: "Ethereal Garden Gala",
    category: "wedding",
    description: "Step into a dream with our garden-themed wedding gala. Surrounded by blooming flowers and twinkling lights, it's a celebration of love in its purest form.",
    date: "May 20, 2026",
    location: "Silver Leaf Gardens, Islamabad",
    guests: "300+",
    tag: "Ethereal",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1465495910483-0d6749ee9f4a?q=80&w=2070&auto=format&fit=crop"
    ]
  }
];

async function run() {
  try {
    await mongoose.connect(DB);
    console.log("Connected to MongoDB for direct population");
    
    for (const event of events) {
      console.log(`Inserting event: ${event.title}`);
      await Event.create(event);
    }
    
    console.log("All events inserted successfully.");
  } catch (err) {
    console.error("Population error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
