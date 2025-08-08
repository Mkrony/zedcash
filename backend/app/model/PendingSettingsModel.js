// models/BasicSettingsModel.js
import mongoose from "mongoose";

const PendingOfferIdSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    days: {
        type: Number,
        required: true,
        min: 1
    }
});

const PendingSettingsSchema = new mongoose.Schema({
    maxCoinPerTask: {
        type: Number,
        default: 0,
    },
    maxDays: {
        type: Number,
        default: 0,
    },
    minCoinPerTask: {
        type: Number,
        default: 0,
    },
    minDays: {
        type: Number,
        default: 0,
    },
    pendingOfferIds: {
        type: [PendingOfferIdSchema],
        default: []
    },
    allTasksPending: {
        type: Boolean,
        default: false
    },
    allTasksDays: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

const PendingSettingsModel = mongoose.model("PendingSettings", PendingSettingsSchema);
export default PendingSettingsModel;