import mongoose from "mongoose";
import PendingTask from "../model/PendingTaskModel.js";
import CompletedTasksModel from "../model/ComleteTaskModel.js";
import UserModel from "../model/UserModel.js";
import NotificationsModel from "../model/UserNotification.js";
import PendingTaskModel from "../model/PendingTaskModel.js";
import ChargebackModel from "../model/ChargebackModel.js";

/**
 * @desc    Get all pending tasks
 * @route   GET /api/pending-tasks
 * @access  Admin
 */
// all users pending task
export const GetAllPendingTasks = async (req, res) => {
    try {
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [pendingTasks, total] = await Promise.all([
            PendingTask.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            PendingTask.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            count: pendingTasks.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            pendingTasks,
        });
    } catch (error) {
        console.error('Error getting pending tasks:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching pending tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @desc    Move a completed task to pending status
 * @route   PUT /api/pending-tasks/:taskId
 * @access  Admin
 */
// set completed task to pending task
export const SetPendingTask = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const taskId = req.params.taskId;

        // Validate taskId
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Invalid task ID format"
            });
        }

        const selectTask = await CompletedTasksModel.findById(taskId).session(session);

        if (!selectTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check if task is already pending
        const existingPendingTask = await PendingTaskModel.findOne({
            transactionID: selectTask.transactionID
        }).session(session);
        if (existingPendingTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                success: false,
                message: "This task is already in pending status"
            });
        }
        // Check if task is already in chargeback
        const existInChargeback = await ChargebackModel.findOne({
            transactionID: selectTask.transactionID
        }).session(session);

        if(existInChargeback) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                success: false,
                message: "This task is already got chargeback"
            })
        }
        // Create pending task
        const pendingTaskData = {
            offerWallName: selectTask.offerWallName,
            userID: selectTask.userID,
            userName: selectTask.userName,
            transactionID: selectTask.transactionID,
            offerName: selectTask.offerName,
            offerID: selectTask.offerID,
            revenue: selectTask.revenue,
            currencyReward: selectTask.currencyReward,
            country: selectTask.country,
            ip: selectTask.ip,
            originalTask: taskId, // Reference to original task
            status: 'pending'
        };

        const [setPendingTask] = await PendingTask.create([pendingTaskData], { session });

        // Update user balance
        const user = await UserModel.findById(selectTask.userID).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.balance -= selectTask.currencyReward;
        user.pending_balance += selectTask.currencyReward;
        await user.save({ session });

        // Create notification
        await NotificationsModel.create([{
            userID: selectTask.userID,
            message: `You have pending ${selectTask.currencyReward} coins from ${selectTask.offerWallName}`,
            type: 'pending',
            createdAt: new Date(),
            metadata: {
                taskId: setPendingTask._id,
                amount: selectTask.currencyReward
            }
        }], { session });

        // Delete completed task
        await CompletedTasksModel.findByIdAndDelete(taskId).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            data: setPendingTask,
            message: "Task moved to pending status successfully",
            balance: user.balance
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error setting pending task:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to set task as pending",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @desc    Get pending tasks for logged-in user
 * @route   GET /api/pending-tasks/user
 * @access  Private
 */
// export const UserPending = async (req, res) => {
//     try {
//         const userId = req.user._id; // Assuming authenticated user
//         if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid user ID"
//             });
//         }
//
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//
//         const [offers, total] = await Promise.all([
//             PendingTaskModel.find({ userID: userId })
//                 .skip(skip)
//                 .limit(limit)
//                 .sort({ createdAt: -1 }),
//             PendingTaskModel.countDocuments({ userID: userId })
//         ]);
//
//         return res.status(200).json({
//             success: true,
//             count: offers.length,
//             total,
//             pages: Math.ceil(total / limit),
//             currentPage: page,
//             offers
//         });
//     } catch (error) {
//         console.error('Error getting user pending tasks:', error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch user pending tasks",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// }

/**
 * @desc    Get pending tasks by user ID
 * @route   GET /api/pending-tasks/user/:userId
 * @access  Admin
 */
//pending task by user id
export const GetUserPendingTaskByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [offers, total] = await Promise.all([
            PendingTaskModel.find({ userID: userId })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            PendingTaskModel.countDocuments({ userID: userId })
        ]);

        return res.status(200).json({
            success: true,
            count: offers.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            offers
        });
    } catch (error) {
        console.error('Error getting pending tasks by user ID:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending tasks",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// set pending task to completed task
export const SetPendingToCompletedTask = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const taskId = req.params.taskId;

        // Validate taskId
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Invalid task ID format"
            });
        }

        const selectTask = await PendingTaskModel.findById(taskId).session(session);

        if (!selectTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check if task is already completed
        const existingCompletedTask = await CompletedTasksModel.findOne({
            transactionID: selectTask.transactionID
        }).session(session);

        if (existingCompletedTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                success: false,
                message: "This task is already in completed status"
            });
        }

        // Create Completed task
        const completedTaskData = {
            offerWallName: selectTask.offerWallName,
            userID: selectTask.userID,
            userName: selectTask.userName,
            transactionID: selectTask.transactionID,
            offerName: selectTask.offerName,
            offerID: selectTask.offerID,
            revenue: selectTask.revenue,
            currencyReward: selectTask.currencyReward,
            country: selectTask.country,
            ip: selectTask.ip,
            originalTask: taskId,
        };

        const setCompletedTask = await CompletedTasksModel.create([completedTaskData], { session });

        // Update user balance
        const user = await UserModel.findById(selectTask.userID).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Ensure we don't go negative on pending balance
        if (user.pending_balance < selectTask.currencyReward) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "User pending balance is insufficient"
            });
        }

        user.balance += selectTask.currencyReward;
        user.pending_balance -= selectTask.currencyReward;
        await user.save({ session });

        // Create notification
        await NotificationsModel.create([{
            userID: selectTask.userID,
            message: `Your pending task "${selectTask.offerName}" has been marked as completed and ${selectTask.currencyReward} coins have been added to your balance`,
            type: 'pending',
            createdAt: new Date(),
            metadata: {
                taskId: setCompletedTask[0]._id,  // Fixed: Access first element of array
                amount: selectTask.currencyReward
            }
        }], { session });

        // Delete pending task
        await PendingTaskModel.findByIdAndDelete(taskId).session(session);
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            success: true,
            message: "Task marked as completed",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error setting pending task:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark task as completed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// set pending task to chargeback
export const SetPendingToChargeback = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { taskId } = req.params;

            // Validate taskId
            if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
                throw new ErrorResponse(400, "Invalid task ID format");
            }

            // Find the pending task
            const pendingTask = await PendingTaskModel.findById(taskId).session(session);
            if (!pendingTask) {
                throw new ErrorResponse(404, "Task not found");
            }

            // Check if task is already a chargeback
            const existingChargeback = await ChargebackModel.findOne({
                transactionID: pendingTask.transactionID
            }).session(session);

            if (existingChargeback) {
                // Delete the pending task if chargeback already exists
                await PendingTaskModel.findByIdAndDelete(taskId).session(session);
                throw new ErrorResponse(409, "This task is already marked as chargeback");
            }

            // Prepare chargeback data
            const chargebackData = {
                offerWallName: pendingTask.offerWallName,
                userID: pendingTask.userID,
                userName: pendingTask.userName,
                transactionID: pendingTask.transactionID,
                offerName: pendingTask.offerName,
                offerID: pendingTask.offerID,
                revenue: pendingTask.revenue,
                currencyReward: pendingTask.currencyReward,
                country: pendingTask.country,
                ip: pendingTask.ip,
                originalTask: taskId,
            };

            // Create chargeback
            const [createdChargeback] = await ChargebackModel.create([chargebackData], { session });

            // Update user balance
            const user = await UserModel.findById(pendingTask.userID).session(session);
            if (!user) {
                throw new ErrorResponse(404, "User not found");
            }

            if (user.pending_balance < pendingTask.currencyReward) {
                throw new ErrorResponse(400, "Insufficient pending balance");
            }

            user.pending_balance = Number((user.pending_balance - pendingTask.currencyReward).toFixed(2));
            await user.save({ session });

            // Create notification
            await NotificationsModel.create([{
                userID: pendingTask.userID,
                message: `Your pending task "${pendingTask.offerName}" has been marked as chargeback and ${pendingTask.currencyReward} coins have been removed from your pending balance`,
                type: 'pending',
                createdAt: new Date(),
                metadata: {
                    taskId: createdChargeback._id,
                    amount: pendingTask.currencyReward
                }
            }], { session });

            // Delete the pending task
            await PendingTaskModel.findByIdAndDelete(taskId).session(session);

            return res.status(200).json({
                success: true,
                message: "Task successfully marked as chargeback",
                data: {
                    chargebackId: createdChargeback._id,
                    amountDeducted: pendingTask.currencyReward,
                    newpending_balance: user.pending_balance
                }
            });
        });
    } catch (error) {
        console.error('Error in SetPendingToChargeback:', error);

        const statusCode = error.statusCode || 500;
        const message = error.message || "Failed to process chargeback";

        return res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        session.endSession();
    }
};

// Helper class for consistent error responses
class ErrorResponse extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Total Revenue Count
export const TotalPendingRevenues = async (req, res) => {
    try {
        const result = await PendingTaskModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" }
                }
            }
        ]);
        const totalPendingRevenue = result.length > 0 ? result[0].totalRevenue : 0;
        return res.status(200).json({
            success: true,
            totalPendingRevenue: totalPendingRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
// Today's Total Revenue
export const TodayPendingRevenue = async (req, res) => {
    try {
        // Get start and end of current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const result = await PendingTaskModel.aggregate([
            {
                $match: {
                    createdAt: { // assuming you have createdAt field
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" }
                }
            }
        ]);

        const todayPendingRevenue = result.length > 0 ? result[0].totalRevenue : 0;

        return res.status(200).json({
            success: true,
            todayPendingRevenue: todayPendingRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}






