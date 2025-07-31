import mongoose from 'mongoose';

const completedTaskSchema = new mongoose.Schema({
        offerWallName: {
                type: String,
                required: true
        },
        userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
        },
        userName: {
                type: String,
                required: true,
                default: 'anonymous'
        },
        transactionID: {
                type: String,
                unique: true,
                required: true
        },
        offerName: {
                type: String,
                required: true
        },
        offerID: {
                type: String,
                required: true
        },
        revenue: {
                type: Number,
                required: true
        },
        currencyReward: {
                type: Number,
                required: true
        },
        ip: {
                type: String,
                required: true,
        },
        country: {
                type: String,
                required: true,
                default: 'unknown'
        },
        createdAt: {
                type: Date,
                default: Date.now
        },
        updatedAt: {
                type: Date,
                default: Date.now
        }
}, { timestamps: true, versionKey: false });

const CompletededTasksModel = mongoose.model('completedtasks', completedTaskSchema);
export default CompletededTasksModel;
