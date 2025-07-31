import mongoose from "mongoose";
import ChargebackModel from "../model/ChargebackModel.js";
import CompletedTasksModel from "../model/ComleteTaskModel.js";
import UserModel from "../model/UserModel.js";
import NotificationsModel from "../model/UserNotification.js";
import PendingTaskModel from "../model/PendingTaskModel.js";
// All chargebacks
export const GetAllChargebacks = async (req, res) => {
    try {
        const chargebacks = await ChargebackModel.find();
        return res.status(200).json({
            success: true,
            chargebacks: chargebacks,
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};
// Move this offer to chargeback
export const SetChargeback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const taskId = req.params.taskId;
        // Validate taskId
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid task ID" });
        }
        const selectTask = await CompletedTasksModel.findById(taskId).session(session);
        // Check if task not exists
        if (!selectTask) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Task not found" });
        }
        // Check if task already exists in chargeback
        const alreadyExist = await ChargebackModel.findOne({ transactionID: selectTask.transactionID });
        if (alreadyExist) {
            return res.status(409).json({ message: "Chargeback already exists" });
        }

        // Create chargeback
        const setChargeback = await ChargebackModel.create([{
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
        }], { session });

        // Update user balance
        const user = await UserModel.findById(selectTask.userID).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }
        user.balance -= selectTask.currencyReward;
        await user.save();

        // Create notification
        await NotificationsModel.create([{
            userID: selectTask.userID,
            message: `You have chargedback ${selectTask.currencyReward} coins from ${selectTask.offerWallName}`,
            type: 'chargeback',
            createdAt: new Date()
        }], { session });

        // Delete completed task
        // await CompletedTasksModel.findByIdAndDelete(taskId).session(session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            data: selectTask,
            message: "Chargeback has been set successfully"
        });

    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};
//  chargeback by logedin users
export const UserChargeback = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const offers = await ChargebackModel.find({ userID: userId});
        return res.status(200).json({
            success: true,
            offers: offers
        });
    } catch (error) {
        return res.status(500).send(error);
    }
}
// chargeback by user id
export const GetUserChargebackByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const offers = await ChargebackModel.find({ userID: userId});
        return res.status(200).json({
            success: true,
            offers: offers
        });
    }
    catch (error) {
        return res.status(500).send(error);
    }
}
// Count Total Chargeback
export const TotalChargeback = async (req, res) => {
    try {
        const result = await ChargebackModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalChargeback: { $sum: "$revenue" }
                }
            }
        ]);
        const totalChargeback = result.length > 0 ? result[0].totalChargeback : 0;
        return res.status(200).json({
            success: true,
            totalChargeback: totalChargeback
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
// Today's Total Chargeback
export const TodayChargeback = async (req, res) => {
    try {
        // Get start and end of current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const result = await ChargebackModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    todayChargeback: { $sum: "$revenue" }
                }
            }
        ]);
        const todayChargeback = result.length > 0 ? result[0].todayChargeback : 0;
        return res.status(200).json({
            success: true,
            todayChargeback: todayChargeback
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}


