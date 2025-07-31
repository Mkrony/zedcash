import mongoose from "mongoose";
const userNotificationSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // auto delete after 72 hour
    expireAt: {
        type: Date,
        default: Date.now() + 72 * 60 * 60 * 1000,
    },

},{
    timestamps: true,
    versionKey: false,
});
const UserNotification = mongoose.model("notifications", userNotificationSchema);
export default UserNotification;
