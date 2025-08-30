import mongoose from "mongoose";
import PendingTaskModel from "../model/PendingTaskModel.js";
import CompletedTasksModel from "../model/ComleteTaskModel.js";
import UserModel from "../model/UserModel.js";
import NotificationsModel from "../model/UserNotification.js";
import PendingSettingsModel from "../model/PendingSettingsModel.js";

// Helper: move one pending task → completed
const movePendingTaskToCompleted = async (task, session) => {
    // 1. Prevent duplicates
    const alreadyCompleted = await CompletedTasksModel.findOne({
        transactionID: task.transactionID,
    }).session(session);
    if (alreadyCompleted) return;

    // 2. Load user and validate
    const user = await UserModel.findById(task.userID).session(session);
    if (!user || user.pending_balance < task.currencyReward) return;

    // 3. Insert into completed tasks
    await CompletedTasksModel.create(
        [{
            offerWallName: task.offerWallName,
            userID: task.userID,
            userName: task.userName,
            transactionID: task.transactionID,
            offerName: task.offerName,
            offerID: task.offerID,
            revenue: task.revenue,
            currencyReward: task.currencyReward,
            country: task.country,
            ip: task.ip,
            originalTask: task._id,
        }],
        { session }
    );

    // 4. Update user balances
    user.balance += task.currencyReward;
    user.total_earnings += task.currencyReward;
    user.pending_balance -= task.currencyReward;
    await user.save({ session });

    // 5. Create notification
    await NotificationsModel.create(
        [{
            userID: task.userID,
            message: `🎉 Your pending task "${task.offerName}" is now completed. You received ${task.currencyReward} coins.`,
            type: "pending",
            createdAt: new Date(),
            metadata: {
                taskId: task._id,
                amount: task.currencyReward,
            },
        }],
        { session }
    );

    // 6. Remove from pending
    await PendingTaskModel.findByIdAndDelete(task._id).session(session);
};

// Main processor: finds & processes all expired tasks
const processExpiredPendingTasks = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Get maxDays from settings (default 30)
        const settings = await PendingSettingsModel.findOne().session(session);
        const maxDays = settings?.maxDays || 30;

        // 2. Compute cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDays);

        // 3. Find expired tasks
        const expiredTasks = await PendingTaskModel.find({
            createdAt: { $lte: cutoffDate },
        }).session(session);

        console.log(`✅ Found ${expiredTasks.length} tasks older than ${maxDays} days`);

        // 4. Process each task
        for (const task of expiredTasks) {
            await movePendingTaskToCompleted(task, session);
        }

        // 5. Commit transaction
        await session.commitTransaction();
        console.log("✅ All expired tasks processed successfully.");
    } catch (error) {
        // Rollback if any error
        await session.abortTransaction();
        console.error("❌ Error processing expired tasks:", error);
    } finally {
        // Always clean up
        session.endSession();
    }
};

// Optional: Run directly from CLI
if (process.argv.includes("--run")) {
    import("../config/db.js").then(() => {
        processExpiredPendingTasks();
    });
}

export default processExpiredPendingTasks;
