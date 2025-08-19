import LiveChatModel from "../model/LiveChatModel.js";
import SupportMessage from "../model/SupportMessageModel.js";

export const SendMessage = async (req, res)=>{
   try{
       const { content, senderUsername } = req.body;
       const storeMessage = await LiveChatModel.create({
           content:content,
           senderUsername:senderUsername,
       });
        if(!storeMessage){
            return res.status(500).json({
                status:"failed",
                message: "Sorry something went wrong!"
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Message sent successfully"
        })
   }
   catch (e) {
       return res.status(500).json({
           status:"failed",
           message: e.message.toLocaleString()
       })
   }
}

// show message to the chat box
export const ShowMessage = async (req, res)=>{
    try{
       const showAllMessage = await LiveChatModel.find();
        if(!showAllMessage){
            return res.status(500).json({
                status:"failed",
                message: "Sorry something went wrong!"
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Message sent successfully",
            content:showAllMessage
        })
    }
    catch (e) {
        return res.status(500).json({
            status:"failed",
            message: e.message.toLocaleString()
        })
    }
}

// Send Support Email
export const SendSupportMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Create new support message
        const newMessage = await SupportMessage.create({
            name,
            email,
            subject,
            message
        });

        return res.status(201).json({
            status: "success",
            message: "Support message sent successfully",
            data: newMessage
        });
    } catch (e) {
        return res.status(500).json({
            status: "failed",
            message: e.message
        });
    }
};

// Show Support Email with advanced filtering and sorting
export const ShowSupportMessage = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Sorting parameters
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        // Status filtering
        let statusFilter = {};
        if (req.query.status) {
            if (req.query.status === 'all') {
                statusFilter = { $in: ["unread", "read"] };
            } else {
                statusFilter = req.query.status;
            }
        } else {
            statusFilter = { $in: ["unread", "read"] };
        }

        // Date filtering
        let dateFilter = {};
        if (req.query.startDate && req.query.endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)
                }
            };
        } else if (req.query.startDate) {
            dateFilter = { createdAt: { $gte: new Date(req.query.startDate) } };
        } else if (req.query.endDate) {
            dateFilter = { createdAt: { $lte: new Date(req.query.endDate) } };
        }

        // Search query
        const searchQuery = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                    { subject: { $regex: req.query.search, $options: "i" } },
                    { message: { $regex: req.query.search, $options: "i" } }
                ]
            }
            : {};

        // Combine all filters
        const query = {
            ...searchQuery,
            status: statusFilter,
            ...dateFilter
        };

        // Get total count for pagination
        const total = await SupportMessage.countDocuments(query);

        // Get messages with additional metadata
        const messages = await SupportMessage.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()
            .transform((docs) => {
                return docs.map(doc => ({
                    ...doc,
                    isUnread: doc.status === 'unread',
                    isRead: doc.status === 'read'
                }));
            });

        // Calculate statistics
        const stats = await SupportMessage.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    unread: { $sum: { $cond: [{ $eq: ["$status", "unread"] }, 1, 0] } },
                    read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } }
                }
            }
        ]);

        const statistics = stats[0] || {
            total: 0,
            unread: 0,
            read: 0,
        };

        return res.status(200).json({
            status: "success",
            results: messages.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            statistics,
            data: messages,
            filters: {
                search: req.query.search || '',
                status: req.query.status || 'all',
                startDate: req.query.startDate || '',
                endDate: req.query.endDate || '',
                sortField,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }
        });
    } catch (e) {
        console.error("Error fetching support messages:", e);
        return res.status(500).json({
            status: "failed",
            message: "An error occurred while fetching support messages",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

// Count total Support Email (simplified for unread/read)
export const TotalSupportMessage = async (req, res) => {
    try {
        // Get counts by status
        const countsByStatus = await SupportMessage.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // Get total count
        const totalCount = await SupportMessage.countDocuments();

        // Convert array to object for easier access
        const statusCounts = countsByStatus.reduce((acc, curr) => {
            acc[curr.status] = curr.count;
            return acc;
        }, { unread: 0, read: 0 }); // Changed from pending/in_progress to unread/read

        return res.status(200).json({
            success: true,
            data: {
                total: totalCount,
                byStatus: statusCounts
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update Email status (unread/read)
export const UpdateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate input
        if (!id || !status) {
            return res.status(400).json({
                success: false,
                error: "Message ID and status are required"
            });
        }

        // Validate status value
        if (!["unread", "read"].includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status value. Must be either 'unread' or 'read'"
            });
        }

        // Find and update the message
        const updatedMessage = await SupportMessage.findByIdAndUpdate(
            id,
            {
                status: status === "unread" ? "unread" : "read",
                // You might want to track when it was read
                ...(status === "read" && { readAt: new Date() })
            },
            { new: true, runValidators: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: {
                id: updatedMessage._id,
                status: updatedMessage.status === "unread" ? "unread" : "read",
                readAt: updatedMessage.readAt
            }
        });

    } catch (error) {
        console.error("Error updating message status:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update message status",
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
};

// Bulk update/delete support messages
export const BulkSupportMessages = async (req, res) => {
    try {
        const { ids, action } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid message IDs"
            });
        }

        if (action === "delete") {
            await SupportMessage.deleteMany({ _id: { $in: ids } });
            return res.status(200).json({
                success: true,
                message: "Messages deleted successfully",
                count: ids.length
            });
        } else if (action === "read") {
            const result = await SupportMessage.updateMany(
                { _id: { $in: ids } },
                { $set: { status: "read", readAt: new Date() } }
            );
            return res.status(200).json({
                success: true,
                message: "Messages marked as read",
                count: result.modifiedCount
            });
        } else {
            return res.status(400).json({
                success: false,
                error: "Invalid action"
            });
        }
    } catch (error) {
        console.error("Bulk action error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to perform bulk action",
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
};

// Delete Support Message
export const DeleteSupportMessage = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Message ID is required"
            });
        }

        // Find and delete the message
        const deletedMessage = await SupportMessage.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
            data: {
                id: deletedMessage._id,
                subject: deletedMessage.subject,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete message",
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
};