import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String,required:true,unique: true},
    email: {type: String,required: true,unique: true },
    password: { type: String, required: [true, "Password is required"],},
    role: {type: String,default: 'user'},
    otp: {type: String, default: 666666,},
    otp_expiry: {type: Date,default: () => Date.now() + 10 * 60 * 1000, },
    isVerified: {type: Boolean,default: false, },
    isBanned: {type: Boolean,default: false,},
    ban_message: { type: String, default: "Violation of terms and conditions"},
    ip_address: { type: String,default: "0.0.0.0",},
    device_id: { type: String, default: "Unknown",},
    user_agent: { type: String, default: "Unknown",},
    last_login: {type: Date, default: Date.now,},
    country: {type: String, default: "Unknown",},
    balance: {type: Number,default: 0,},
    pending_balance: {type: Number,default: 0,},
    total_earnings: { type: Number, default: 0 },
    level: {type: Number,default: 1,},
    avatar: {type: String,default: "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_items_boosted&w=740",},
    hasSpin:{type:Boolean,default:false},
    created_at: {type: Date,default: Date.now},
    updated_at: { type: Date,default: Date.now},
    },
    {
        timestamps: true,
        versionKey: false,
    });

const UserModel = mongoose.model('Users', userSchema);
export default UserModel;
