import userModel from '../model/UserModel.js';
import UserNotification from "../model/UserNotification.js";
import CompletededTasksModel from "../model/ComleteTaskModel.js";


const REWARDS = [50, 0, 0, 80, 100, 0, 0, 250, 0, 10, 0, 0, 0, 90, 0, 150, 0, 0, 0, 70];

export const GetConfig = async (req, res) => {
    try {
        const user = req.user ? await userModel.findById(req.user._id) : null;

        return res.status(200).json({
            rewards: REWARDS,
            hasSpun: user ? user.hasSpin : false
        });
    } catch (error) {
        console.error("GetConfig error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to get wheel configuration"
        });
    }
};

export const Spin = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        if (user.hasSpin) {
            return res.status(400).json({
                status: false,
                message: "You've already used your spin"
            });
        }

        // Determine prize
        const prizeIndex = Math.floor(Math.random() * REWARDS.length);
        const prizeAmount = REWARDS[prizeIndex];

        // Update user
        user.hasSpin = true;
        user.balance += prizeAmount;
        user.total_earnings +=prizeAmount;
        await user.save();
        if (prizeAmount > 0) {
            // create new completed task
            const transactionId = Math.floor(1000000000000000 + Math.random() * 9999999999999999);
            await CompletededTasksModel.create({
                offerWallName: "Reward",
                userName: user.username,
                userID: userId,
                transactionID: transactionId,
                ip: user.ip_address,
                country: user.country,
                revenue: 0,
                currencyReward: prizeAmount,
                offerName: 'Spin Reward',
                offerID: 0,
                createdAt: new Date()
            });
            // Create notification if won
            await UserNotification.create({
                userID: userId,
                message: `🎉 You won ${prizeAmount} coins from the spin wheel!`,
                type: "task_completed",
                isRead: true
            });
        }

        return res.status(200).json({
            status: true,
            prizeIndex,
            prizeAmount
        });
    } catch (error) {
        console.error("Spin error:", error);
        return res.status(500).json({
            status: false,
            message: "Spin failed"
        });
    }
};