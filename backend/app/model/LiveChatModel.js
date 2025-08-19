import mongoose from "mongoose";

const liveChatSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const LiveChatModel = mongoose.model('Message', liveChatSchema);
export default LiveChatModel;