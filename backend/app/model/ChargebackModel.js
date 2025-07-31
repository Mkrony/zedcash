import mongoose from 'mongoose';
const chargebackSchema = new mongoose.Schema({
    offerWallName: {
        type: String,
        required: [true, 'Offer wall name is required'],
        trim: true,
        maxlength: [100, 'Offer wall name cannot exceed 100 characters']
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        default: 'anonymous',
        maxlength: [100, 'User name cannot exceed 100 characters']
    },
    transactionID: {
        type: String,
        unique: true,
        required: [true, 'Transaction ID is required'],
        trim: true,
        index: true
    },
    offerName: {
        type: String,
        required: [true, 'Offer name is required'],
        trim: true,
        maxlength: [200, 'Offer name cannot exceed 200 characters']
    },
    offerID: {
        type: String,
        required: [true, 'Offer ID is required'],
        trim: true
    },
    revenue: {
        type: Number,
        required: [true, 'Revenue amount is required'],
        min: [0, 'Revenue cannot be negative']
    },
    currencyReward: {
        type: Number,
        required: [true, 'Currency reward is required'],
        min: [0, 'Currency reward cannot be negative']
    },
    ip: {
        type: String,
        required: [true, 'IP address is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'unknown',
        trim: true,
        maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster querying
chargebackSchema.index({ userID: 1, status: 1 });
chargebackSchema.index({ createdAt: -1 });
chargebackSchema.index({ offerWallName: 1, status: 1 });

// Virtual for formatted createdAt date
chargebackSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toISOString().split('T')[0];
});

// Middleware to update updatedAt on save
chargebackSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

chargebackSchema.statics.findByUserId = async function(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [chargebacks, total] = await Promise.all([
        this.find({ userID: userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean(),
        this.countDocuments({ userID: userId })
    ]);

    return {
        chargebacks,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
    };
};

const ChargebacksModel = mongoose.model('Chargeback', chargebackSchema);

export default ChargebacksModel;