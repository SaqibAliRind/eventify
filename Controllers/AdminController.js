import User from "../Models/UserSchmea.js";
import { logAdminAction } from "../Utils/auditLogger.js";

/* ================= GET ALL USERS (with search, sort, filter, pagination) ================= */
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            role = "",
            status = "",
            sortField = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by status (active/inactive)
        if (status) {
            query.active = status === "active";
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sorting
        const sort = {};
        sort[sortField] = sortOrder === "desc" ? -1 : 1;

        const users = await User.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .select("-password"); // Exclude passwords

        const totalUsers = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                total: totalUsers,
                page: Number(page),
                pages: Math.ceil(totalUsers / limit),
            },
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= TOGGLE USER STATUS (Active/Inactive) ================= */
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Security: Prevent admin from deactivating their own account
        if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security violation: Administrators cannot deactivate their own account."
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle the active status
        user.active = !user.active;
        await user.save();

        // Audit log
        if (req.user) {
            await logAdminAction({
                adminId: req.user._id,
                adminName: req.user.name,
                action: user.active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                targetType: "User",
                targetId: user._id,
                details: `User ${user.email} status set to ${user.active ? "active" : "inactive"}`,
            });
        }

        res.json({
            success: true,
            message: `User ${user.active ? "activated" : "deactivated"} successfully`,
            data: { id: user._id, active: user.active },
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UPDATE USER ROLE (Admin/User) ================= */
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !["user", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified" });
        }

        // Security: Prevent admin from changing their own role (self-demotion)
        if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security violation: Administrators cannot alter their own administrative role."
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        if (req.user) {
            await logAdminAction({
                adminId: req.user._id,
                adminName: req.user.name,
                action: "CHANGE_USER_ROLE",
                targetType: "User",
                targetId: user._id,
                details: `Changed role of ${user.email} from ${oldRole} to ${role}`,
            });
        }

        res.json({
            success: true,
            message: `User role updated to ${role} successfully`,
            data: { id: user._id, role: user.role }
        });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= DELETE USER ================= */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Security: Prevent admin from deleting their own account
        if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security violation: Administrators cannot delete their own account."
            });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (req.user) {
            await logAdminAction({
                adminId: req.user._id,
                adminName: req.user.name,
                action: "DELETE_USER",
                targetType: "User",
                targetId: id,
                details: `Permanently deleted user ${user.name} (${user.email})`,
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
