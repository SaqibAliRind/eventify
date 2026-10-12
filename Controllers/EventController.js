import mongoose from "mongoose";
import Event from "../Models/EventSchema.js";

/* ================= CREATE EVENT ================= */
export const createEvent = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            date,
            location,
            guests,
            tag,
            tags,
            images,
            coverImage,
            price,
            priceRange,
            capacity,
            startTime,
            slug,
            status,
            featured
        } = req.body;

        if (!title || !category || !description || !date || !location || !guests || !images) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        if (!Array.isArray(images) || images.length < 5) {
            return res.status(400).json({ success: false, message: "At least 5 images are required" });
        }

        const newEvent = await Event.create({
            title,
            category,
            description,
            date,
            location,
            guests,
            tag: tag || (Array.isArray(tags) && tags[0]) || "Classic",
            tags: Array.isArray(tags) ? tags : (tag ? [tag] : []),
            images,
            coverImage: coverImage || images[0] || "",
            price: price || 0,
            priceRange: priceRange || "",
            capacity: capacity || 0,
            startTime: startTime || "",
            slug: slug ? slug.toLowerCase().trim() : undefined,
            status: status || "published",
            featured: Boolean(featured),
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: newEvent,
        });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/* ================= GET ALL EVENTS (with advanced filtering & pagination) ================= */
export const getEvents = async (req, res) => {
    try {
        const {
            search,
            category,
            tag,
            status,
            featured,
            timeFilter, // 'upcoming' | 'past'
            minPrice,
            maxPrice,
            sort = "newest",
            page,
            limit,
        } = req.query;

        const query = {};

        // Only public-facing routes restrict to published status by default
        const isAdminPath = req.baseUrl && req.baseUrl.includes("/admin");
        if (!isAdminPath) {
            query.status = { $in: ["published", "Active"] };
        } else if (status && status !== "all") {
            query.status = status;
        }

        // Full-text search or title regex
        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
                { location: { $regex: search.trim(), $options: "i" } }
            ];
        }

        if (category && category !== "All") {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        if (tag) {
            query.$or = [
                { tag: { $regex: new RegExp(tag, "i") } },
                { tags: { $in: [new RegExp(tag, "i")] } }
            ];
        }

        if (featured === "true" || featured === true) {
            query.featured = true;
        }

        // Upcoming / Past date filtering
        if (timeFilter) {
            const todayStr = new Date().toISOString().split("T")[0];
            if (timeFilter === "upcoming") {
                query.date = { $gte: todayStr };
            } else if (timeFilter === "past") {
                query.date = { $lt: todayStr };
            }
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = Number(minPrice);
            if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };
        else if (sort === "price_asc") sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };
        else if (sort === "date_asc") sortOption = { date: 1 };
        else if (sort === "date_desc") sortOption = { date: -1 };
        else if (sort === "most_viewed") sortOption = { viewCount: -1 };
        else if (sort === "featured") sortOption = { featured: -1, createdAt: -1 };

        // Pagination if page or limit specified
        if (page || limit) {
            const currentPage = Math.max(1, Number(page) || 1);
            const pageSize = Math.max(1, Number(limit) || 9);
            const skip = (currentPage - 1) * pageSize;

            const [events, total] = await Promise.all([
                Event.find(query).sort(sortOption).skip(skip).limit(pageSize),
                Event.countDocuments(query),
            ]);

            return res.json({
                success: true,
                data: events,
                pagination: {
                    total,
                    page: currentPage,
                    pages: Math.ceil(total / pageSize),
                    limit: pageSize,
                },
            });
        }

        const events = await Event.find(query).sort(sortOption);
        res.json({ success: true, data: events });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET EVENT BY ID OR SLUG (increments viewCount) ================= */
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        let findCondition;
        if (mongoose.Types.ObjectId.isValid(id)) {
            findCondition = { _id: id };
        } else {
            findCondition = { slug: id };
        }

        // Atomically increment viewCount and return updated doc
        const event = await Event.findOneAndUpdate(
            findCondition,
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        console.error("Get event by ID/slug error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET RELATED EVENTS ================= */
export const getRelatedEvents = async (req, res) => {
    try {
        const { id } = req.params;
        let event;
        if (mongoose.Types.ObjectId.isValid(id)) {
            event = await Event.findById(id);
        } else {
            event = await Event.findOne({ slug: id });
        }

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Find same-category events, excluding current, max 4
        const related = await Event.find({
            _id: { $ne: event._id },
            category: event.category,
            status: { $in: ["published", "Active"] },
        })
            .sort({ featured: -1, createdAt: -1 })
            .limit(4);

        // If fewer than 4, pad with other events
        let result = related;
        if (result.length < 4) {
            const ids = result.map((e) => e._id.toString()).concat([event._id.toString()]);
            const extra = await Event.find({
                _id: { $nin: ids },
                status: { $in: ["published", "Active"] },
            })
                .sort({ viewCount: -1 })
                .limit(4 - result.length);
            result = [...result, ...extra];
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Get related events error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UPDATE EVENT ================= */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            category,
            description,
            date,
            location,
            guests,
            tag,
            tags,
            images,
            coverImage,
            price,
            priceRange,
            capacity,
            startTime,
            slug,
            status,
            featured
        } = req.body;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (images && (!Array.isArray(images) || images.length < 5)) {
            return res.status(400).json({ success: false, message: "At least 5 images are required" });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (date !== undefined) updateData.date = date;
        if (location !== undefined) updateData.location = location;
        if (guests !== undefined) updateData.guests = guests;
        if (images !== undefined) updateData.images = images;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        else if (images && images.length > 0 && !event.coverImage) updateData.coverImage = images[0];
        if (tag !== undefined) updateData.tag = tag;
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
        if (price !== undefined) updateData.price = Number(price);
        if (priceRange !== undefined) updateData.priceRange = priceRange;
        if (capacity !== undefined) updateData.capacity = Number(capacity);
        if (startTime !== undefined) updateData.startTime = startTime;
        if (slug !== undefined) updateData.slug = slug.toLowerCase().trim();
        if (status !== undefined) updateData.status = status;
        if (featured !== undefined) updateData.featured = Boolean(featured);

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent,
        });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};


/* ================= DELETE EVENT ================= */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
