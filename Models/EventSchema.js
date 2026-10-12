import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        guests: {
            type: String,
            required: true,
        },
        // Legacy single tag kept for backwards compat; new tags array is the canonical field
        tag: {
            type: String,
            default: "Classic",
        },
        // New: array of descriptive tags for rich filtering
        tags: {
            type: [String],
            default: [],
        },
        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, '{PATH} must have at least 5 images']
        },
        // New Phase 3 fields
        slug: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true,
        },
        startTime: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        priceRange: {
            type: String,
            default: "",
        },
        capacity: {
            type: Number,
            default: 0,
        },
        coverImage: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["published", "draft", "cancelled", "Active", "Draft", "Archived"],
            default: "published",
        },
        featured: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Slug auto-generation pre-save if not set
eventSchema.pre("save", function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .concat("-", Date.now().toString(36));
    }
    // Backward compatibility: map legacy 'Active' to 'published'
    if (this.status === "Active") {
        this.status = "published";
    }
});

// Indexes for search and query performance (Phase 3 item 5)
eventSchema.index({ title: "text", description: "text", location: "text" });
eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ category: 1, status: 1, featured: 1 });

function arrayLimit(val) {
    return val.length >= 5;
}

const Event = mongoose.model("Event", eventSchema);

export default Event;
