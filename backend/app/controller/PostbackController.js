import crypto from 'crypto';
import UserModel from "../model/UserModel.js";
import CompletededTasksModel from '../model/ComleteTaskModel.js';
import UserNotification from "../model/UserNotification.js";
import ChargebackModel from "../model/ChargebackModel.js";
import TimelineModel from "../model/TimelineModel.js";

//Notik Postback
export const NotikPostback = async (req, res) => {
    try {
        const { user_id, amount, payout, offer_id, offer_name, txn_id, conversion_ip, date, country, hash, ...otherParams } = req.query;

        // Fetch user
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (amount > 0) {
            // Check for duplicate transaction only for positive amounts (credits)
            const existingTransaction = await CompletededTasksModel.findOne({ transactionID: txn_id });
            if (existingTransaction) {
                return res.status(202).send('1');
            }

            // Create a new completed task
            const newTask = await CompletededTasksModel.create({
                offerWallName: "Notik",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: payout,
                currencyReward: amount,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: date
            });

            if (newTask) {
                // Update user balance
                await UserModel.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: amount, total_earnings: amount } },
                    { new: true }
                );

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have received ${amount} coins from Notik`,
                    type: 'task_completed',
                    createdAt: new Date()
                });

                await TimelineModel.create({
                    offerWallName: "Notik",
                    userName: user.username,
                    userID: user_id,
                    currencyReward: amount,
                    offerName: offer_name,
                    type: "task",
                    userAvatar: user.avatar,
                    createdAt: date
                });

                return res.status(200).send('1');
            }
        } else {
            // Handle chargeback
            const chargebackAmount = Math.abs(amount);
            const chargebackPayout = Math.abs(payout);

            // Check if original transaction exists
            const originalTransaction = await CompletededTasksModel.findOne({ transactionID: txn_id });
            if (!originalTransaction) {
                return res.status(404).send('Original transaction not found for chargeback');
            }

            // Check if chargeback already exists
            const existingChargeback = await ChargebackModel.findOne({ transactionID: txn_id });
            if (existingChargeback) {
                return res.status(202).send('1');
            }

            const newChargeback = await ChargebackModel.create({
                offerWallName: "Notik",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: chargebackPayout,
                currencyReward: chargebackAmount,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: date
            });

            if (newChargeback) {
                // Deduct chargeback amount from user balance
                await UserModel.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: -chargebackAmount } },
                    { new: true }
                );

                await UserNotification.create({
                    userID: user_id,
                    message: `You have charged back ${chargebackAmount} coins from Notik`,
                    type: 'chargeback',
                    createdAt: new Date()
                });

                return res.status(200).send('1');
            }
        }
    } catch (error) {
        console.error('Error in NotikPostback:', error);
        return res.status(500).send('0');
    }
};

// Wannads postback
export const WannadsPostback = async (req, res) => {
    try {
        const { user_id, reward, status, offer_id, offer_name, transaction_id, ip, payout, country, date, signature } = req.query;

        // Fetch user
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (status === 'credited') {
            // Check for duplicate transaction only for credited status
            const existingTransaction = await CompletededTasksModel.findOne({ transactionID: transaction_id });
            if (existingTransaction) {
                return res.status(200).send('1');
            }

            // Create a new completed task
            const newTask = await CompletededTasksModel.create({
                offerWallName: "Wannads",
                userName: user.username,
                userID: user_id,
                transactionID: transaction_id,
                ip: ip,
                country: country,
                revenue: payout,
                currencyReward: reward,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: date
            });

            if (newTask) {
                // Update user balance
                await UserModel.findByIdAndUpdate(user_id, { $inc: { balance: reward } }, { new: true });

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have received ${reward} coins from Wannads`,
                    type: 'task_completed',
                    createdAt: new Date()
                });

                await TimelineModel.create({
                    offerWallName: "Wannads",
                    userName: user.username,
                    userID: user_id,
                    currencyReward: reward,
                    type: "task",
                    offerName: offer_name,
                    userAvatar: user.avatar,
                    createdAt: date
                });

                return res.status(200).send('1');
            }
        } else if (status === 'rejected') {
            // Handle chargeback
            const chargebackAmount = Math.abs(reward);

            // Check if original transaction exists
            const originalTransaction = await CompletededTasksModel.findOne({ transactionID: transaction_id });
            if (!originalTransaction) {
                return res.status(404).send('Original transaction not found for chargeback');
            }

            // Check if chargeback already exists
            const existingChargeback = await ChargebackModel.findOne({ transactionID: transaction_id });
            if (existingChargeback) {
                return res.status(200).send('1');
            }

            const newChargeback = await ChargebackModel.create({
                offerWallName: "Wannads",
                userName: user.username,
                userID: user_id,
                transactionID: transaction_id,
                ip: ip,
                country: country,
                revenue: payout,
                currencyReward: chargebackAmount,
                offerName: offer_name,
                offerID: offer_id,
                createdAt: date
            });

            if (newChargeback) {
                // Deduct chargeback amount from user balance
                await UserModel.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: -chargebackAmount } },
                    { new: true }
                );

                await UserNotification.create({
                    userID: user_id,
                    message: `You have charged back ${chargebackAmount} coins from Wannads`,
                    type: 'task_chargeback',
                    createdAt: new Date()
                });

                return res.status(200).send('1');
            }
        }
    } catch (error) {
        console.error('Error in WannadsPostback:', error);
        return res.status(500).send('0');
    }
};

//Primewall postback
export const PrimewallPostback = async (req, res) => {
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

        // Fetch user
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check for duplicate transaction only if it's a credit (status=1)
        if (status === '1') {
            const existingTransaction = await CompletededTasksModel.findOne({ transactionID: txn_id });
            if (existingTransaction) {
                return res.status(200).send('DUP');
            }
        }

        // For chargeback (status=2), check if the original transaction exists
        if (status === '2') {
            const originalTransaction = await CompletededTasksModel.findOne({ transactionID: txn_id });
            if (!originalTransaction) {
                return res.status(404).send('Original transaction not found for chargeback');
            }
        }

        // Validate the signature (uncomment when ready)
        // const secret = 'YOUR_PRIMEWALL_SECRET_KEY';
        // const generatedSignature = crypto.createHash('md5')
        //     .update(`${user_id}${txn_id}${amount}${secret}`)
        //     .digest('hex');
        //
        // if (generatedSignature !== signature) {
        //     return res.status(400).send('ERROR: Signature doesn\'t match');
        // }

        if (status === '1') {
            // Create a new completed task
            const newTask = await CompletededTasksModel.create({
                offerWallName: "Primewall",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: payout,
                currencyReward: amount,
                offerName: offer_name || event_name,
                offerID: offer_id || event_id,
                createdAt: new Date()
            });

            if (newTask) {
                // Update user balance
                await UserModel.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: amount, total_earnings: amount } },
                    { new: true }
                );

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have received ${amount} coins from Primewall`,
                    type: 'task_completed',
                    createdAt: new Date()
                });

                // Add to timeline
                await TimelineModel.create({
                    offerWallName: "Primewall",
                    userName: user.username,
                    userID: user_id,
                    currencyReward: amount,
                    offerName: offer_name || event_name,
                    type: "task",
                    userAvatar: user.avatar,
                    createdAt: new Date()
                });

                return res.status(200).send('OK');
            }

        } else if (status === '2') {
            // Handle chargeback
            const chargebackAmount = Math.abs(amount);
            const chargebackPayout = Math.abs(payout);

            // Check if chargeback already exists for this transaction
            const existingChargeback = await ChargebackModel.findOne({ transactionID: txn_id });
            if (existingChargeback) {
                return res.status(200).send('DUP');
            }

            const newChargeback = await ChargebackModel.create({
                offerWallName: "Primewall",
                userName: user.username,
                userID: user_id,
                transactionID: txn_id,
                ip: conversion_ip,
                country: country,
                revenue: chargebackPayout,
                currencyReward: chargebackAmount,
                offerName: offer_name || event_name,
                offerID: offer_id || event_id,
                createdAt: new Date()
            });

            if (newChargeback) {
                // Deduct chargeback amount from user balance
                await UserModel.findByIdAndUpdate(
                    user_id,
                    { $inc: { balance: -chargebackAmount } },
                    { new: true }
                );

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have charged back ${chargebackAmount} coins from Primewall`,
                    type: 'chargeback',
                    createdAt: new Date()
                });

                return res.status(200).send('OK');
            }
        } else {
            return res.status(400).send('ERROR: Invalid status');
        }
    } catch (error) {
        console.error('Error in PrimewallPostback:', error);
        return res.status(500).send('ERROR: Internal server error');
    }
};