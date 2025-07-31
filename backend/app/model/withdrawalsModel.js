import mongoose from 'mongoose';
const withdrawalsSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    userName: {type: String, required: true},
    userAvatar: {type: String ,  default: 'https://imgcdn.stablediffusionweb.com/2024/3/21/b6cb69f1-c2a5-47b1-ad44-44113883b911.jpg'},
    walletAddress: {type: String, required: true},
    walletName: {type: String, required: true},
    amount: {type: Number, required: true},
    transactionId: {type: String, required: true, unique: true},
    status: {type: String, enum: ['pending', 'completed', 'failed'], default: 'pending'},
}, {
    timestamps: true,
    versionKey: false});

const WithdrawalModel = mongoose.model('Withdrawals', withdrawalsSchema);
export default WithdrawalModel;
