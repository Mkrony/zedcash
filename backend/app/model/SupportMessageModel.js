// models/SupportMessage.js
import mongoose from "mongoose";

const SupportEmailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
SupportEmailSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const SupportEmail = mongoose.model("SupportEmail", SupportEmailSchema);

export default SupportEmail;