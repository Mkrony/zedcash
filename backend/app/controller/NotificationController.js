import UserNotification from "../model/UserNotification.js";
// read notifications
export const GetUserAllNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await UserNotification.find({ userID:userId }).lean();
        if (!notifications) {
            return res.status(404).json({ message: "User notifications not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "User notifications fetched successfully",
            notifications
        });
    } catch (error) {
        console.error("Notification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// unread notifications
export const GetUserUnreadNotifications = async (req, res) => {
    try {
        const userId = req.params.userId; // Or use req.user.id if authentication exists
        const notifications = await UserNotification.find({ userID:userId, isRead: false }).lean();
        return res.status(200).json({
            status: "success",
            message: notifications.length > 0
                ? "User notifications fetched successfully"
                : "No unread notifications",
            notifications
        });
    } catch (error) {
        console.error("Notification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const MarkNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await UserNotification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: false }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ message: "Notification marked as read successfully" });
    } catch (error) {
        console.error("Notification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
