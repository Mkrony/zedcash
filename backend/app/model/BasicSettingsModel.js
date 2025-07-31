// models/BasicSettingsModel.js
import mongoose from "mongoose";

const basicSettingsSchema = new mongoose.Schema({
    registrationEmailConfirmation: {
        type: Boolean,
        default: false
    },
    allowMultipleAccountsSameIP: {
        type: Boolean,
        default: false
    },
    ipChangeProtection: {
        type: Boolean,
        default: false
    },
    sendWithdrawEmail: {
        type: Boolean,
        default: false
    },
    ipQualityCheck: {
        type: Boolean,
        default: false
    },
    ipQualityApiKey: {
        type: String,
        default: ''
    },
    proxyDetection: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,
    versionKey: false
});

const BasicSettingsModel = mongoose.model("BasicSettings", basicSettingsSchema);
export default BasicSettingsModel;