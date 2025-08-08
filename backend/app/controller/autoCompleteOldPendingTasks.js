import mongoose from "mongoose";
import PendingTaskModel from "../model/PendingTaskModel.js";
import CompletedTasksModel from "../model/ComleteTaskModel.js";
import UserModel from "../model/UserModel.js";
import NotificationsModel from "../model/UserNotification.js";
import PendingSettingsModel from "../model/PendingSettingsModel.js"; // Adjust path

const movePendingTaskToCompleted = async (task, session) => {
    const alreadyCompleted = await CompletedTasksModel.findOne({
        transactionID: task.transactionID
    }).session(session);
    if (alreadyCompleted) return;

    const user = await UserModel.findById(task.userID).session(session);
    if (!user || user.pending_balance < task.currencyReward) return;

    await CompletedTasksModel.create([{
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
    }], { session });

    user.balance += task.currencyReward;
    user.pending_balance -= task.currencyReward;
    await user.save({ session });

    await NotificationsModel.create([{
        userID: task.userID,
        message: `🎉 Your pending task "${task.offerName}" is now completed. You received ${task.currencyReward} coins.`,
        type: 'pending',
        createdAt: new Date(),
        metadata: {
            taskId: task._id,
            amount: task.currencyReward
        }
    }], { session });

    await PendingTaskModel.findByIdAndDelete(task._id).session(session);
};

const processExpiredPendingTasks = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Get maxDays from settings model
        const settings = await PendingSettingsModel.findOne().session(session);
        const maxDays = settings?.maxDays || 30; // fallback to 30 if not set

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDays);

        // 2. Get expired pending tasks
        const expiredTasks = await PendingTaskModel.find({
            createdAt: { $lte: cutoffDate }
        }).session(session);

        console.log(`✅ Found ${expiredTasks.length} tasks older than ${maxDays} days`);

        for (const task of expiredTasks) {
            await movePendingTaskToCompleted(task, session);
        }

        await session.commitTransaction();
        session.endSession();
        console.log("✅ All expired tasks processed successfully.");
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Error processing expired tasks:", error.message);
    }
};

// Optional: CLI run
if (process.argv.includes("--run")) {
    import("../config/db.js").then(() => {
        processExpiredPendingTasks();
    });
}

export default processExpiredPendingTasks;
