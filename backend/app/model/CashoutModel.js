import mongoose from 'mongoose';

const CashoutSchema = new mongoose.Schema({
    methodName: {
        type: String,
        required: [true, 'Method name is required'],
        trim: true,
        maxlength: [50, 'Method name cannot exceed 50 characters'],
        unique: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        validate: {
            validator: function(v) {
                // Enhanced URL validation with security checks
                try {
                    const url = new URL(v);

                    // Verify protocol is HTTPS (or HTTP for development)
                    if (!['https:', 'http:'].includes(url.protocol)) {
                        return false;
                    }

                    // Check for valid image extensions
                    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
                    const extension = url.pathname.toLowerCase().substring(
                        url.pathname.lastIndexOf('.')
                    );

                    return validExtensions.includes(extension);

                } catch (e) {
                    return false; // Invalid URL format
                }
            },
            message: props => `"${props.value}" is not a valid image URL! Must be HTTPS with .jpg, .jpeg, .png, .gif, .svg, or .webp extension.`
        },
        set: function(v) {
            // Normalize URL by removing query parameters and fragments
            try {
                const url = new URL(v);
                url.search = '';
                url.hash = '';
                return url.toString();
            } catch (e) {
                return v; // Return original if normalization fails
            }
        }
    },
    minCoins: {
        type: Number,
        required: [true, 'Minimum withdrawal amount is required'],
        min: [1, 'Minimum withdrawal amount must be at least 1'],
        max: [1000000, 'Maximum withdrawal amount cannot exceed 1,000,000']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    processingTime: {
        type: String,
        enum: ['Instant', '1-2 Hours', '24 Hours', '3-5 Days'],
        default: '24 Hours'
    },
    feePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret._id;     // Remove _id
            delete ret.__v;    // Remove version key
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
// Indexes
CashoutSchema.index({ methodName: 1, isActive: 1 });
CashoutSchema.index({ minWithdrawAmount: 1 });
// Pre-save hooks
CashoutSchema.pre('save', function(next) {
    this.methodName = this.methodName.trim();
    if (process.env.NODE_ENV === 'production' && this.imageUrl.startsWith('http:')) {
        this.imageUrl = this.imageUrl.replace('http:', 'https:');
    }
    next();
});
// Static methods
CashoutSchema.statics.findActiveMethods = function() {
    return this.find({ isActive: true }).sort({ minWithdrawAmount: 1 });
};
CashoutSchema.statics.findByWithdrawalRange = function(min, max) {
    return this.find({
        isActive: true,
        minWithdrawAmount: { $gte: min, $lte: max }
    });
};
// Virtuals
CashoutSchema.virtual('displayName').get(function() {
    return `${this.methodName} (Min: ${this.minWithdrawAmount})`;
});
CashoutSchema.virtual('formattedFee').get(function() {
    return `${this.feePercentage}%${this.feePercentage === 0 ? ' (No fee)' : ''}`;
});
const CashoutModel = mongoose.model('Cashout', CashoutSchema);
export default CashoutModel;