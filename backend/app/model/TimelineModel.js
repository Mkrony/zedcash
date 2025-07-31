import mongoose from 'mongoose';

const timelineTaskSchema = new mongoose.Schema({
    offerWallName: {
        type: String
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String,
        default: 'anonymous'
    },
    userAvatar: {
        type: String,
        default: 'https://imgcdn.stablediffusionweb.com/2024/3/21/b6cb69f1-c2a5-47b1-ad44-44113883b911.jpg'
    },
    offerName: {
        type: String
    },
    type:{
        type: String,
        default: 'user'
    },
    currencyReward: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // Automatically delete after 7 days
    }
}, { timestamps: true, versionKey: false });

const TimelineModel = mongoose.model('timelines', timelineTaskSchema);

// Ensure TTL index is created (optional but recommended for safety)
TimelineModel.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default TimelineModel;
