import crypto from 'crypto';
import UserModel from "../model/UserModel.js";
import CompletededTasksModel from '../model/ComleteTaskModel.js';
import UserNotification from "../model/UserNotification.js";
import ChargebackModel from "../model/ChargebackModel.js";
import TimelineModel from "../model/TimelineModel.js";

export const NotikPostback = async (req, res) => {
    try {
        const { user_id, amount, payout, offer_id, offer_name, txn_id, conversion_ip, date, country, hash, ...otherParams } = req.query;
        // Fetch user
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check for duplicate transaction
        const existingTransaction = await CompletededTasksModel.findOne({ transactionID: txn_id });
        if (existingTransaction) {
            return res.status(200).send('1'); // Already processed
        }

        if (amount > 0) {
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
                await UserModel.findByIdAndUpdate(user_id, { $inc: { balance: amount } }, { new: true });

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have received ${amount} coins from Notik`,
                    type: 'task_completed',
                    createdAt: new Date()
                });
                // insert to timeline too
                await TimelineModel.create({
                    offerWallName: "Notik",
                    userName: user.username,
                    userID: user_id,
                    currencyReward: amount,
                    offerName: offer_name,
                    createdAt: date
                });
                return res.status(200).send('1'); // Success
            }
        } else {
            // Handle chargeback
            const newTask = await ChargebackModel.create({
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
                // Deduct chargeback amount from user balance
                const chargebackAmount = Math.abs(amount); // Ensure positive deduction
                user.balance -= chargebackAmount;
                await user.save();

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have charged back ${chargebackAmount} coins from Notik`,
                    type: 'task_chargeback',
                    createdAt: new Date()
                });

                return res.status(200).send('1'); // Success
            }
        }
    } catch (error) {
        console.error('Error in NotikPostback:', error);
        return res.status(500).send('0'); // Internal server error
    }
};