import mongoose from 'mongoose';

const SmtpSchema = new mongoose.Schema({
    host: {
        type: String,
        required: [true, 'SMTP host is required'],
        trim: true
    },
    port: {
        type: Number,
        required: [true, 'SMTP port is required'],
        min: [1, 'Port must be at least 1'],
        max: [65535, 'Port cannot exceed 65535']
    },
    secure: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: [true, 'SMTP username is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'SMTP password is required']
    },
    fromEmail: {
        type: String,
        required: [true, 'From email is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    fromName: {
        type: String,
        required: [true, 'From name is required'],
        trim: true,
        maxlength: [100, 'From name cannot exceed 100 characters']
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password; // Never return password in responses
            return ret;
        }
    }
});

// Ensure only one SMTP configuration exists
SmtpSchema.statics.getSmtpConfig = function() {
    return this.findOne().sort({ createdAt: -1 }).limit(1);
};

const SmtpModel = mongoose.model('Smtp', SmtpSchema);

export default SmtpModel;