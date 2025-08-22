import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    conversation: [{
        sender: {
            type: String,
            enum: ['user', 'admin'],
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient querying
ticketMessageSchema.index({ userId: 1, createdAt: -1 });
const TicketMessage = mongoose.model('TicketMessage', ticketMessageSchema);
export default TicketMessage;