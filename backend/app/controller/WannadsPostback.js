import crypto from 'crypto';

export const WannadsPostback = async (req, res) => {
    try {
        // Check if the request is coming from the allowed IP
        const clientIp = req.ip || req.connection.remoteAddress;
        if (clientIp !== '3.22.177.178') {
            return res.status(403).send('Forbidden');
        }

        const { user_id, reward, status, offer_id, offer_name, transaction_id, ip, payout, country, date, signature } = req.query;

        // Fetch user
        const user = await UserModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check for duplicate transaction
        const existingTransaction = await CompletededTasksModel.findOne({ transactionID: transaction_id });
        if (existingTransaction) {
            return res.status(200).send('1'); // Already processed
        }

        // Validate the signature
        const secret = 'YOUR_SECRET'; // Replace with your app's secret
        const generatedSignature = crypto.createHash('md5').update(`${user_id}${transaction_id}${reward}${secret}`).digest('hex');

        if (generatedSignature !== signature) {
            return res.status(400).send('Invalid signature');
        }

        if (status === 'credited') {
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

                return res.status(200).send('1'); // Success
            }
        } else if (status === 'rejected') {
            // Handle chargeback
            const newTask = await ChargebackModel.create({
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
                // Deduct chargeback amount from user balance
                const chargebackAmount = Math.abs(reward); // Ensure positive deduction
                user.balance -= chargebackAmount;
                await user.save();

                // Create notification
                await UserNotification.create({
                    userID: user_id,
                    message: `You have charged back ${chargebackAmount} coins from Wannads`,
                    type: 'task_chargeback',
                    createdAt: new Date()
                });
            }
            return res.status(200).send('1');
        }
    } catch (error) {
        console.error('Error in WannadsPostback:', error);
        return res.status(500).send('0'); // Internal server error
    }
};