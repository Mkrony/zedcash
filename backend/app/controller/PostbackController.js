import crypto from 'crypto';
import UserModel from "../model/UserModel.js";
import CompletededTasksModel from '../model/ComleteTaskModel.js';
import UserNotification from "../model/UserNotification.js";
import ChargebackModel from "../model/ChargebackModel.js";
import TimelineModel from "../model/TimelineModel.js";
import PendingSettingsModel from "../model/PendingSettingsModel.js";
import PendingTask from "../model/PendingTaskModel.js";
import mongoose from "mongoose";

// Helper function to verify hashes
const verifyOfferwallHash = (queryParams, secretKey, algorithm = 'sha256') => {
    try {
        const { hash, signature, ...otherParams } = queryParams;
        const paramString = Object.keys(otherParams)
            .sort()
            .map(key => `${key}=${otherParams[key]}`)
            .join('&');

        const calculatedHash = crypto
            .createHash(algorithm)
            .update(paramString + secretKey)
            .digest('hex');

        return calculatedHash === (hash || signature);
    } catch (error) {
        console.error('Error verifying hash:', error);
        return false;
    }
};

// Common function to handle pending tasks
const handlePendingTask = async (taskData, session) => {
    const pendingSettings = await PendingSettingsModel.findOne().session(session);
    if (!pendingSettings) {
        throw new Error('Pending settings not configured');
    }

    // Check if all tasks should be pending
    if (pendingSettings.allTasksPending) {
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + pendingSettings.allTasksDays);

        const pendingTask = {
            ...taskData,
            releaseDate,
            pendingDays: pendingSettings.allTasksDays,
            status: 'pending'
        };

        await PendingTask.create([pendingTask], { session });
        await UserModel.findByIdAndUpdate(
            taskData.userID,
            {
                $inc: {
                    pending_balance: taskData.currencyReward
                }
            },
            { new: true, session }
        );

        await UserNotification.create([{
            userID: taskData.userID,
            message: `You have pending ${taskData.currencyReward} coins from ${taskData.offerWallName}`,
            type: 'task_completed',
            createdAt: taskData.createdAt
        }], { session });

        return { isPending: true, releaseDate };
    }

    // Check for offer ID specific pending - decode URI component for proper comparison
    const decodedOfferId = decodeURIComponent(taskData.offerID || '');
    const offerPending = pendingSettings.pendingOfferIds.find(offer => {
        const storedOfferId = decodeURIComponent(offer.id);
        return storedOfferId === decodedOfferId;
    });

    if (offerPending) {
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + offerPending.days);

        const pendingTask = {
            ...taskData,
            releaseDate,
            pendingDays: offerPending.days,
            status: 'pending',
            pendingReason: `Offer ID: ${decodedOfferId}`
        };

        await PendingTask.create([pendingTask], { session });
        await UserModel.findByIdAndUpdate(
            taskData.userID,
            {
                $inc: {
                    pending_balance: taskData.currencyReward
                }
            },
            { new: true, session }
        );

        await UserNotification.create([{
            userID: taskData.userID,
            message: `You have pending ${taskData.currencyReward} coins from ${taskData.offerWallName} (Offer: ${taskData.offerName})`,
            type: 'task_completed',
            createdAt: taskData.createdAt
        }], { session });

        return { isPending: true, releaseDate };
    }

    // Default pending logic based on amount thresholds
    if (pendingSettings.maxCoinPerTask > 0 &&
        taskData.currencyReward >= pendingSettings.maxCoinPerTask &&
        pendingSettings.maxDays > 0) {

        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + pendingSettings.maxDays);

        const pendingTask = {
            ...taskData,
            releaseDate,
            pendingDays: pendingSettings.maxDays,
            status: 'pending',
            pendingReason: `Amount threshold: ${taskData.currencyReward} >= ${pendingSettings.maxCoinPerTask}`
        };

        await PendingTask.create([pendingTask], { session });
        await UserModel.findByIdAndUpdate(
            taskData.userID,
            {
                $inc: {
                    pending_balance: taskData.currencyReward,
                }
            },
            { new: true, session }
        );

        await UserNotification.create([{
            userID: taskData.userID,
            message: `You have pending ${taskData.currencyReward} coins from ${taskData.offerWallName}`,
            type: 'task_completed',
            createdAt: taskData.createdAt
        }], { session });

        return { isPending: true, releaseDate };
    }

    return { isPending: false };
};

// Common function to complete task immediately
const completeTask = async (taskData, session) => {
    const [newTask] = await CompletededTasksModel.create([taskData], { session });

    // Update user balance
    await UserModel.findByIdAndUpdate(
        taskData.userID,
        {
            $inc: {
                balance: taskData.currencyReward,
                total_earnings: taskData.currencyReward
            }
        },
        { new: true, session }
    );

    // Create notification
    await UserNotification.create([{
        userID: taskData.userID,
        message: `You have received ${taskData.currencyReward} coins from ${taskData.offerWallName} for ${taskData.offerName}`,
        type: 'task_completed',
        createdAt: taskData.createdAt
    }], { session });

    // Add to timeline
    await TimelineModel.create([{
        offerWallName: taskData.offerWallName,
        userName: taskData.userName,
        userID: taskData.userID,
        currencyReward: taskData.currencyReward,
        offerName: taskData.offerName,
        type: "task",
        userAvatar: taskData.userAvatar,
        createdAt: taskData.createdAt
    }], { session });

    return newTask;
};

// Common function to handle chargeback
const handleChargeback = async (chargebackData, session) => {
    const chargebackAmount = Math.abs(chargebackData.currencyReward);
    const chargebackPayout = Math.abs(chargebackData.revenue);

    // Check if original transaction exists
    const originalTransaction = await CompletededTasksModel.findOne({
        transactionID: chargebackData.transactionID
    }).session(session);

    if (!originalTransaction) {
        throw new Error('Original transaction not found for chargeback');
    }

    // Check if chargeback already exists
    const existingChargeback = await ChargebackModel.findOne({
        transactionID: chargebackData.transactionID
    }).session(session);

    if (existingChargeback) {
        return { isDuplicate: true };
    }

    // Create chargeback record
    await ChargebackModel.create([{
        ...chargebackData,
        currencyReward: chargebackAmount,
        revenue: chargebackPayout
    }], { session });

    // Deduct from user balance
    await UserModel.findByIdAndUpdate(
        chargebackData.userID,
        { $inc:
                { balance: -chargebackAmount,
                    total_earnings:-chargebackAmount
                }
        },
        { new: true, session }
    );

    // Create notification
    await UserNotification.create([{
        userID: chargebackData.userID,
        message: `Chargeback of ${chargebackAmount} coins for offer: ${chargebackData.offerName}`,
        type: 'chargeback',
        createdAt: chargebackData.createdAt
    }], { session });

    return { success: true };
};

// Notik Postback Handler
export const NotikPostback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            user_id,
            amount,
            payout,
            offer_id,
            offer_name,
            txn_id,
            conversion_ip,
            date,
            country,
            hash,
            ...otherParams
        } = req.query;

        // Validate required fields
        if (!user_id || !amount || !txn_id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 0,
                message: 'Missing required parameters'
            });
        }

        // Verify hash (uncomment when ready)
        // if (!verifyOfferwallHash(req.query, process.env.NOTIK_SECRET_KEY)) {
        //     await session.abortTransaction();
        //     session.endSession();
        //     return res.status(403).json({
        //         status: 0,
        //         message: 'Invalid security hash'
        //     });
        // }

        const numericAmount = parseFloat(amount);
        const numericPayout = parseFloat(payout);
        const currentDate = date ? new Date(date) : new Date();

        // Fetch user with session
        const user = await UserModel.findOne({ _id: user_id }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: 0,
                message: 'User not found'
            });
        }

        // For positive amounts (completed tasks)
        if (numericAmount > 0) {
            // Check for duplicate transaction
            const existingTransaction = await CompletededTasksModel.findOne({
                transactionID: txn_id
            }).session(session);

            if (existingTransaction) {
                await session.abortTransaction();
                session.endSession();
                return res.status(202).json({
                    status: 1,
                    message: 'Duplicate transaction'
                });
            }

            const taskData = {
                offerWallName: "Notik",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: numericPayout,
                currencyReward: numericAmount,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: currentDate,
                userAvatar: user.avatar
            };

            const { isPending } = await handlePendingTask(taskData, session);

            if (!isPending) {
                await completeTask(taskData, session);
            }

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                status: 1,
                message: isPending ? 'Pending task created' : 'Task completed'
            });
        }
        // For negative amounts (chargebacks)
        else if (numericAmount < 0) {
            // Check if chargeback already exists
            const existingChargeback = await ChargebackModel.findOne({
                transactionID: txn_id
            }).session(session);

            if (existingChargeback) {
                await session.abortTransaction();
                session.endSession();
                return res.status(202).json({
                    status: 1,
                    message: 'Duplicate chargeback'
                });
            }

            // Check if original transaction exists
            const originalTransaction = await CompletededTasksModel.findOne({
                transactionID: txn_id
            }).session(session);

            if (!originalTransaction) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    status: 0,
                    message: 'Original transaction not found for chargeback'
                });
            }

            const chargebackData = {
                offerWallName: "Notik",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: numericPayout,
                currencyReward: numericAmount,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: currentDate
            };

            await handleChargeback(chargebackData, session);

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                status: 1,
                message: 'Chargeback processed'
            });
        }
        // For zero amount (shouldn't happen but handle it)
        else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 0,
                message: 'Invalid amount: zero'
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in NotikPostback:', error);
        return res.status(500).json({
            status: 0,
            message: error.message || 'Internal server error'
        });
    }
};

// Wannads Postback Handler
export const WannadsPostback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            user_id,
            reward,
            status,
            offer_id,
            offer_name,
            transaction_id,
            ip,
            payout,
            country,
            date,
            signature
        } = req.query;

        // Validate required fields
        if (!user_id || !reward || !transaction_id || !status) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send('Missing required parameters');
        }

        // Verify signature (uncomment when ready)
        // if (!verifyOfferwallHash(req.query, process.env.WANNADS_SECRET_KEY)) {
        //     await session.abortTransaction();
        //     session.endSession();
        //     return res.status(403).send('Invalid signature');
        // }

        const numericReward = parseFloat(reward);
        const numericPayout = parseFloat(payout || 0);
        const currentDate = date ? new Date(date) : new Date();

        // Fetch user with session
        const user = await UserModel.findOne({ _id: user_id }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send('User not found');
        }

        if (status === 'credited') {
            // Check for duplicate transaction
            const existingTransaction = await CompletededTasksModel.findOne({
                transactionID: transaction_id
            }).session(session);

            if (existingTransaction) {
                await session.abortTransaction();
                session.endSession();
                return res.status(200).send('1');
            }

            const taskData = {
                offerWallName: "Wannads",
                userName: user.username,
                userID: user_id,
                transactionID: transaction_id,
                ip: ip,
                country: country,
                revenue: numericPayout,
                currencyReward: numericReward,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: currentDate,
                userAvatar: user.avatar
            };

            const { isPending } = await handlePendingTask(taskData, session);

            if (!isPending) {
                await completeTask(taskData, session);
            }

            await session.commitTransaction();
            session.endSession();
            return res.status(200).send('1');
        } else if (status === 'rejected') {
            const chargebackData = {
                offerWallName: "Wannads",
                userName: user.username,
                userID: user_id,
                transactionID: transaction_id,
                ip: ip,
                country: country,
                revenue: numericPayout,
                currencyReward: -numericReward, // Negative for chargeback
                offerName: offer_name,
                offerID: offer_id,
                createdAt: currentDate
            };

            const { isDuplicate } = await handleChargeback(chargebackData, session);

            await session.commitTransaction();
            session.endSession();
            return res.status(isDuplicate ? 200 : 200).send('1');
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send('Invalid status');
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in WannadsPostback:', error);
        return res.status(500).send('0');
    }
};

// Primewall Postback Handler
export const PrimewallPostback = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            subId: user_id,
            transId: txn_id,
            reward: amount,
            payout,
            signature,
            status,
            userIp: conversion_ip,
            offerName: offer_name,
            country,
            uuid: offer_id,
            event_name,
            event_id
        } = req.query;

        // Validate required fields
        if (!user_id || !txn_id || !amount || !status) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send('ERROR: Missing parameters');
        }

        // Verify signature (uncomment when ready)
        // if (!verifyOfferwallHash(req.query, process.env.PRIMEWALL_SECRET_KEY, 'md5')) {
        //     await session.abortTransaction();
        //     session.endSession();
        //     return res.status(403).send('ERROR: Invalid signature');
        // }

        const numericAmount = parseFloat(amount);
        const numericPayout = parseFloat(payout || 0);
        const currentDate = new Date();

        // Fetch user with session
        const user = await UserModel.findOne({ _id: user_id }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send('ERROR: User not found');
        }

        if (status === '1') {
            // Check for duplicate transaction
            const existingTransaction = await CompletededTasksModel.findOne({
                transactionID: txn_id
            }).session(session);

            if (existingTransaction) {
                await session.abortTransaction();
                session.endSession();
                return res.status(200).send('DUP');
            }

            const taskData = {
                offerWallName: "Primewall",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: numericPayout,
                currencyReward: numericAmount,
                offerName: offer_name || event_name,
                offerID: offer_id || event_id,
                createdAt: currentDate,
                userAvatar: user.avatar
            };

            const { isPending } = await handlePendingTask(taskData, session);

            if (!isPending) {
                await completeTask(taskData, session);
            }

            await session.commitTransaction();
            session.endSession();
            return res.status(200).send('OK');
        } else if (status === '2') {
            const chargebackData = {
                offerWallName: "Primewall",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: numericPayout,
                currencyReward: -numericAmount, // Negative for chargeback
                offerName: offer_name || event_name,
                offerID: offer_id || event_id,
                createdAt: currentDate
            };

            const { isDuplicate } = await handleChargeback(chargebackData, session);

            await session.commitTransaction();
            session.endSession();
            return res.status(isDuplicate ? 200 : 200).send('OK');
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send('ERROR: Invalid status');
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in PrimewallPostback:', error);
        return res.status(500).send('ERROR: Internal error');
    }
};