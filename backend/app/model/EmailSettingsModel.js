import mongoose from "mongoose";

const emailSettingsSchema = new mongoose.Schema({
    host: {
        type: String,
        required: [true, "SMTP host is required"],
        trim: true
    },
    port: {
        type: Number,
        required: [true, "SMTP port is required"],
        min: [1, "Port must be between 1 and 65535"],
        max: [65535, "Port must be between 1 and 65535"]
    },
    username: {
        type: String,
        required: [true, "SMTP username is required"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "SMTP password is required"]
    },
    encryption: {
        type: String,
        enum: ["tls", "ssl", "none"],
        default: "tls"
    },
    fromEmail: {
        type: String,
        required: [true, "From email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Please enter a valid email address"
        }
    },
    fromName: {
        type: String,
        required: [true, "From name is required"],
        trim: true,
        maxlength: [100, "From name cannot exceed 100 characters"]
    }
}, {
    timestamps: true,
    versionKey: false
});

const EmailSettingsModel = mongoose.model("EmailSettings", emailSettingsSchema);
export default EmailSettingsModel;