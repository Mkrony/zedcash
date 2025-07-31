import TimelineModel from "../model/TimelineModel.js";
import userModel from "../model/UserModel.js";
import WithdrawalModel from "../model/withdrawalsModel.js";
import UserNotification from "../model/UserNotification.js";
import mongoose from "mongoose";
import CashoutModel from "../model/CashoutModel.js";
// withdrawal coin
export const WithdrawCoin = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.headers.user_id;
        const { amount, walletAddress, wallet } = req.body;
        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        if (!walletAddress || !wallet) {
            return res.status(400).json({ message: "Wallet information is required" });
        }
        // Find the user
        const user = await userModel.findOne({ _id: userId }).session(session);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // user ban check
        if (user.isBanned === true) {
            return res.status(403).json({ message: "User is banned" });
        }
        // Check cooldown period (5 minutes)
        const currentTime = Date.now();
        const lastWithdrawal = await WithdrawalModel.findOne({ userId })
            .sort({ createdAt: -1 })
            .session(session);
        if (lastWithdrawal) {
            const cooldownPeriod = 3 * 60 * 1000; // 3 minutes
            const timeSinceLastWithdrawal = currentTime - lastWithdrawal.createdAt.getTime();

            if (timeSinceLastWithdrawal < cooldownPeriod) {
                const timeLeft = Math.ceil((cooldownPeriod - timeSinceLastWithdrawal) / 1000 / 60);
                return res.status(400).json({
                    message: `You can make another withdrawal in ${timeLeft} minutes.`
                });
            }
        }
        // Check balance
        if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        //check minimum withdrawal amount
        const checkWalletMinAmount = await CashoutModel.findOne({
            methodName: wallet,
            minCoins: { $lte: amount }
        });
        if (!checkWalletMinAmount) { return res.status(400).json({ message: "Minimum withdrawal amount is not met" }); }
        // Deduct amount from user's balance
        user.balance -= amount;
        user.lastWithdrawalTime = currentTime;
        await user.save({ session });

        // Create withdrawal request
        const TransactionIdNum = Math.floor(100000000000000 + Math.random() * 900000000000000);
        const TransactionId = "Cashout-" + TransactionIdNum;

        const withdrawalRequest = await WithdrawalModel.create([{
            userId,
            userName: user.username,
            userAvatar: user.avatar,
            amount,
            walletAddress,
            walletName: wallet,
            transactionId: TransactionId,
        }], { session });
        if (!withdrawalRequest) {
            throw new Error("Failed to create withdrawal request");
        }

        // Create notification
        await UserNotification.create([{
            userID: userId,
            message: `Your withdrawal request for ${amount} coins is pending.`,
            type: "withdrawal",
            isRead: false,
            createdAt: new Date()
        }], { session });

        await session.commitTransaction();

        return res.status(200).json({
            status: "success",
            message: "Withdrawal request received",
            data: {
                transactionId: TransactionId,
                newBalance: user.balance
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Withdrawal error:", error);
        return res.status(500).json({
            message: error.message || "An error occurred during withdrawal"
        });
    } finally {
        session.endSession();
    }
};
// Users Withdrawals
export const UsersWithdrawals = async (req, res) => {
    try {
        // Extract user ID from headers or authenticated user object
        const userId = req.headers.user_id;
        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }
        // Fetch withdrawals for the user
        const withdrawals = await WithdrawalModel.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            message: withdrawals.length > 0
                ? "Withdrawals fetched successfully"
                : "No withdrawals found",
            withdrawals,
        });
    } catch (error) {
        console.error("Withdrawals error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error. Please try again later.",
        });
    }
};
// users all withdrawals by user id
export const GetUserWithdrawalByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const withdrawals = await WithdrawalModel.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            message: withdrawals.length > 0
                ? "Withdrawals fetched successfully"
                : "No withdrawals found",
            withdrawals,
        });
    } catch (error) {
        console.error("Withdrawals error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error. Please try again later.",
        });
    }
}
// view all users Withdrawals
export const AllWithdrawals = async (req, res) => {
    try {
        const allWithdrawals = await WithdrawalModel.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            message: allWithdrawals.length > 0
                ? "Withdrawals fetched successfully"
                : "No withdrawals found",
            allWithdrawals,
        });
    } catch (error) {
        console.error("Withdrawals error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error. Please try again later.",
        });
    }
};

// approve pending withdrawls
export const ApproveWithdrawal = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { withdrawalId } = req.params;
        // Validate withdrawalId
        if (!withdrawalId || !mongoose.Types.ObjectId.isValid(withdrawalId)) {
            return res.status(400).json({ message: "Invalid withdrawal ID" });
        }
        // Find and update the withdrawal status
        const withdrawal = await WithdrawalModel.findOneAndUpdate(
            { _id: withdrawalId, status: "pending" },
            { $set: { status: "completed", approvedAt: new Date() } },
            { new: true, session }
        );
        if (!withdrawal) {
            return res.status(404).json({ message: "Withdrawal not found or already processed" });
        }
        // Add to timeline
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        await TimelineModel.create([{
            offerWallName: capitalize(withdrawal.walletName || "Unknown Wallet"),
            userID: withdrawal.userId,
            userName: withdrawal.userName,
            userAvatar: withdrawal.userAvatar,
            currencyReward: withdrawal.amount,
            type: "withdrawal",
            createdAt: new Date()
        }], { session });

        // Send notification to user
        await UserNotification.create([{
            userID: withdrawal.userId,
            message: `Your withdrawal request for ${withdrawal.amount} coins has been approved. Please check your wallet.`,
            type: "withdrawal",
            isRead: false,
            createdAt: new Date()
        }], { session });
        await session.commitTransaction();
        return res.status(200).json({
            status: "success",
            message: "Withdrawal approved successfully"
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("ApproveWithdrawal Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

//refund withdrawals
export const RefundWithdrawalAmount = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { withdrawalId, withdrawalAmount } = req.params;

        // Validate withdrawalId
        if (!withdrawalId || !mongoose.Types.ObjectId.isValid(withdrawalId)) {
            return res.status(400).json({ message: "Invalid withdrawal ID" });
        }

        // Validate withdrawalAmount
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid refund amount" });
        }

        // Find and update the withdrawal
        const withdrawal = await WithdrawalModel.findOneAndUpdate(
            { _id: withdrawalId, status: "pending" },
            {
                $set: {
                    status: "refunded",
                    refundedAt: new Date(),
                    withdrawalAmount: amount
                }
            },
            { new: true, session }
        );

        if (!withdrawal) {
            return res.status(404).json({
                message: "Withdrawal not found or already processed"
            });
        }

        // Verify that the refund amount matches the original withdrawal amount
        if (amount !== withdrawal.amount) {
            return res.status(400).json({
                message: "Refund amount does not match original withdrawal"
            });
        }

        // Find and update the user's balance
        const user = await userModel.findByIdAndUpdate(
            withdrawal.userId,
            { $inc: { balance: amount } },
            { new: true, session }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send notification to the user
        await UserNotification.create([{
            userID: withdrawal.userId,
            message: `Your withdrawal of ${amount} coins has been refunded to your balance.`,
            type: "withdrawal",
            isRead: false,
            createdAt: new Date()
        }], { session });
        await session.commitTransaction();
        return res.status(200).json({
            status: "success",
            message: "Withdrawal refunded successfully",
            data: {
                withdrawalId: withdrawal._id,
                refundAmount: amount,
                newBalance: user.balance
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("RefundWithdrawalAmount Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};
// RejectWithdrawal
export const RejectWithdrawal = async (req, res) => {
    const { withdrawalId } = req.params;
    try {
        // Find and update the withdrawal
        const withdrawal = await WithdrawalModel.findByIdAndUpdate(
            { _id: withdrawalId, status: "pending" },
            { $set: { status: "rejected" } },
            { new: true }
        );
        if (!withdrawal) {
            return res.status(404).json({ message: "Withdrawal not found" });
        }
        // Send notification to the user
        await UserNotification.create([{
            userID: withdrawal.userId,
            message: `Your withdrawal for ${withdrawal.amount} coins request has been rejected.`,
            type: "withdrawal",
            isRead: false,
            createdAt: new Date()
        }]);


        return res.status(200).json({ message: "Withdrawal rejected successfully", withdrawal });
    } catch (error) {
        console.error("Error rejecting withdrawal:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};