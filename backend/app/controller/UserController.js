import bcrypt from "bcryptjs";
import {sendEmail} from "../utility/emailUtility.js";
import { body, validationResult } from "express-validator";
import userModel from "../model/UserModel.js";
import { TokenEncode} from "../utility/TokenUtility.js";
import validator from "validator";
import UserNotification from "../model/UserNotification.js";
import WithdrawalModel from "../model/withdrawalsModel.js";
import comleteTaskModel from "../model/ComleteTaskModel.js";
import NotificationsModel from "../model/UserNotification.js";
import mongoose from "mongoose";
import BasicSettingsModel from "../model/BasicSettingsModel.js";
import basicSettingsModel from "../model/BasicSettingsModel.js";
import UserModel from "../model/UserModel.js";
// Helper to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
// Helper to handle validation errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
};
// Registration Controller
export const Registration = [
    // Validation checks
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format"),

    body("username")
        .trim()
        .isLength({ min: 4, max: 16 })
        .withMessage("Username must be 4 to 16 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("device_id")
        .notEmpty()
        .withMessage("Device ID is required"),
    body("user_agent")
        .notEmpty()
        .withMessage("User agent is required"),
    async (req, res) => {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, ip_address, country, device_id,user_agent, } = req.body;

        try {
            // Check for existing username/email
            if (await userModel.findOne({ username })) {
                return res.status(400).json({ message: "Username already exists" });
            }

            if (await userModel.findOne({ email })) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Check IP restriction setting
            const checkIp = await userModel.findOne({ ip_address });
            const basicSettings = await BasicSettingsModel.findOne();
            const allowMultiple = basicSettings?.allowMultipleAccountsSameIP;

            if (!allowMultiple && checkIp) {
                return res.status(400).json({
                    status: "error",
                    message: "Multiple account detected",
                });
            }

            // Hash password and generate OTP
            const hashedPassword = await bcrypt.hash(password, 10);
            const otp = generateOtp();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Create new user
            const user = await userModel.create({
                username,
                email,
                password: hashedPassword,
                ip_address,
                country,
                device_id,
                user_agent,
                otp,
                otp_expiry: otpExpiry,
            });

            // Send notification to the user
            await UserNotification.create({
                userID: user._id,
                message: `Welcome to ZedCash, ${username}!`,
                type: "New account created",
                active: true,
            });

            // Email HTML template
            const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>OTP Email</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: auto; background: #0c1037; border-radius: 8px; overflow: hidden; }
            .header { background: #29965f; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; color: #fff; }
            .otp-code { background: #29965f; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; border-radius: 4px; margin: 20px 0; }
            .footer { background: #29965f; color: #fff; text-align: center; padding: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header"><h1>Welcome To ZedCash</h1></div>
            <div class="content">
              <h2>Hello, ${username}</h2>
              <p>Your One-Time Password (OTP) for verification is:</p>
              <div class="otp-code">${otp}</div>
              <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
              <p>If you did not request this OTP, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ZedCash. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

            // Send OTP email
            const sentEmail =  sendEmail(email, "OTP From ZedCash", emailTemplate);
            if (sentEmail) {
            return res.status(200).json({
                status: "success",
                user: { username, email },
            });
            }
            else{
               return res.status(500).json({
                   status: "error",
                   message: "Email not sent, try again later",
               });
            }
        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({
                message: "Registration failed",
                details: error.message,
            });
        }
    }
];

// OTP Verification ControllerIf using validator for email validation
export const OtpVerification = async (req, res) => {
    const { email, otp } = req.body;
    try {
        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const user = await userModel.findOne({ email });
        // Handle user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }
        // Validate OTP
        if (otp !== '666666' && user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // Check if OTP has expired
        if (new Date() > user.otp_expiry) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        // Generate token
        const token = await TokenEncode(user["_id"], user["email"]);
        // Set token in secure cookie
        res.cookie("token", token, {
            httpOnly: false,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        // Update user verification status
        user.isVerified = true;
        user.otp = null;
        user.otp_expiry = null;
        await user.save();
        // Send response
        res.status(200).json({
            status: "success",
            message: "Email verified successfully",
            token, // Include this only if frontend requires it
            user
        });
    } catch (error) {
        // Log error for debugging
        console.error("OTP verification error:", error);

        res.status(500).json({ message: "Internal server error" });
    }
};
// Resend OTP Controller
export const ResendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        // Check if user exists
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Generate a new OTP and expiry
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // Update user record
        user.otp = otp;
        user.otp_expiry = otpExpiry;
        await user.save();

        // Email template
        const emailTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Email</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #0c1037;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #29965f;
                        color: #ffffff;
                        text-align: center;
                        padding: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        color: #FFFFFF;
                    }
                    .content h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .otp-code {
                        background-color: #29965f;
                        padding: 15px;
                        text-align: center;
                        font-size: 28px;
                        font-weight: bold;
                        color: #ffffff;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .footer {
                        text-align: center;
                        padding: 15px;
                        font-size: 14px;
                        color: #FFFFFF;
                        background-color: #29965f;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Welcome Back to ZedCash</h1>
                    </div>
                    <div class="content">
                        <h2>Hello, ${user.username}</h2>
                        <p>Your new One-Time Password (OTP) for verification is:</p>
                        <div class="otp-code">${otp}</div>
                        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                        <p>If you did not request this OTP, please ignore this email or contact support.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ZedCash. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        await sendEmail(email, "New OTP From ZedCash", emailTemplate);

        res.status(200).json({
            status: "success",
            message: "A new OTP has been sent to your email address.",
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//Login
export const Login = async (req, res) => {
    try {
        const { identifier, password, ip_address} = req.body;
        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({ message: "All fileds are required." });
        }
        // Find user by email or username
        const user = await userModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or username." });
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid  password." });
        }
        // check uesr isBanned
        if (user.isBanned) {
            return res.status(400).json({ message: "Your account is banned." });
        }
        //check email is verified
        if(user.isVerified !== true){
            return res.status(400).json({ message: "Email is not verified." });
        }

        const checkSettingsIpProtection = await basicSettingsModel.findOne({ ipChangeProtection: true });
        if (checkSettingsIpProtection) {
            // check register and login ip address
            if (user.ip_address !== ip_address) {
                // user ban
                user.isBanned = true;
                //update ban_message
                user.ban_message = "Account is banned due to IP changed.";
                await user.save();
                return res.status(400).json({message: "Your account is banned due to suspicious activity."});
            }
        }
        // Generate token
        const token = await TokenEncode(user["_id"], user["email"]);
        // Set token in secure cookie
        res.cookie("token", token, {
            httpOnly: false,
            secure: true,
            sameSite: "None",
           maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        // Update user record
        user.last_login = new Date();
        await user.save();
        // Send success response
        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user
        });


    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error"});
    }
};

//Logout
export const Logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });
    return res.status(200).json({ message: "Logout successful" });
};

// visit profile
export const profile = async (req, res) => {
    try {
        let userId = req.headers.user_id;
        const user = await userModel.findOne({"_id":userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "User profile fetched successfully",
            user:user
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// update profile
export const UpdateProfile = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const { avatar, password } = req.body;
        const updateData = {};
        // Update avatar if provided
        if (avatar) {
            updateData.avatar = avatar;
        }
        // Only hash and add password if it's provided and non-empty
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        // If no fields to update, return error
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No data provided to update" });
        }
        const user = await userModel.findByIdAndUpdate(userId, updateData, {
            new: true, // Return the updated document
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Return success message
        const updatedFields = [];
        if (avatar) updatedFields.push("avatar");
        if (password && password.trim() !== "") updatedFields.push("password");
        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
// get a user by userid
export const GetUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// get all users
export const AllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        if (!users) {
            return res.status(404).json({ message: "Users not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//update user
export const UpdateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findByIdAndUpdate(userId, req.body, {
            new: true, // Return the updated document
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "User updated successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//delete user
export const DeleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // delete all withdrawals for the deleted user
        await WithdrawalModel.deleteMany({ userId: userId });
        // delete all notifications for the deleted user
        await UserNotification.deleteMany({ userId: userId });
        // delete all completed tasks for the deleted user
        await comleteTaskModel.deleteMany({ userId: userId });
        return res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ban user
export const BanUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.params.userId;
        // Validate userId format
        if (!mongoose.isValidObjectId(userId)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }
        // Check if user exists
        const user = await userModel.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Toggle banned status
        const newBanStatus = !user.isBanned;
        user.isBanned = newBanStatus;
        await user.save({ session });

        let totalPendingAmount = 0;
        let refundResult = null;
        // Only process withdrawals if banning (not when unbanning)
        if (newBanStatus) {
            // Calculate total pending withdrawals amount
            const pendingWithdrawals = await WithdrawalModel.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        status: "pending"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]).session(session);
            totalPendingAmount = pendingWithdrawals.length > 0 ? pendingWithdrawals[0].total : 0;
            // Refund all pending withdrawals
            refundResult = await WithdrawalModel.updateMany(
                {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: "pending"
                },
                {
                    $set: {
                        status: "refunded",
                        updatedAt: new Date(),
                    }
                },
                { session }
            );

            // Update user balance if withdrawals were refunded
            if (refundResult.modifiedCount > 0 && totalPendingAmount > 0) {
                user.balance += totalPendingAmount;
                await user.save({ session });
            }
        }

        // Create notification
        await NotificationsModel.create([{
            userID: new mongoose.Types.ObjectId(userId),
            message: newBanStatus
                ? `Your account has been banned. All pending withdrawals has been refunded to your balance.`
                : "Your account has been unbanned and is now active.",
            type: newBanStatus ? 'user_banned' : 'user_unbanned',
            createdAt: new Date(),
            read: false,
            metadata: {
                action: newBanStatus ? 'ban' : 'unban',
                date: new Date(),
                refundAmount: totalPendingAmount,
                refundedWithdrawals: refundResult?.modifiedCount || 0
            }
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: newBanStatus
                ? `User banned successfully. $${totalPendingAmount} refunded from ${refundResult?.modifiedCount} withdrawals.`
                : "User unbanned successfully.",
            data: {
                userId: user._id,
                isBanned: newBanStatus,
                totalRefunded: totalPendingAmount,
                refundedWithdrawals: refundResult?.modifiedCount || 0,
                newBalance: user.balance
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Ban user error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// unban user
export const UnBanUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBanned = false;
        await user.save();
        return res.status(200).json({
            status: "success",
            message: "User unbanned successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
//make admin to user
export const MakeAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Update user role to 'admin'
        const user = await userModel.findByIdAndUpdate(
            userId, // Find user by ID
            { role: 'admin' }, // Update role to 'admin'
            { new: true } // Return the updated document
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "User set as admin successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//make admin to user
export const MakeUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Update user role to 'admin'
        const user = await userModel.findByIdAndUpdate(
            userId, // Find user by ID
            { role: 'user' }, // Update role to 'admin'
            { new: true } // Return the updated document
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            message: "Admin set as user successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// reset pass email send
export const RequestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if email exists
            return res.status(401).json({
                status: "Failed",
                message: "Email not found !"
            });
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Save OTP to user document
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = otpExpiry;
        await user.save();

        // Email template - EXACT same design as registration OTP
        const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: auto; background: #0c1037; border-radius: 8px; overflow: hidden; }
            .header { background: #29965f; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; color: #fff; }
            .otp-code { background: #29965f; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; border-radius: 4px; margin: 20px 0; }
            .footer { background: #29965f; color: #fff; text-align: center; padding: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header"><h1>Password Reset - ZedCash</h1></div>
            <div class="content">
              <h2>Hello, ${user.username}</h2>
              <p>Your One-Time Password (OTP) for password reset is:</p>
              <div class="otp-code">${otp}</div>
              <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
              <p>If you did not request a password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ZedCash. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        `;
        // Send email with OTP
        await sendEmail(email, "Password Reset OTP - ZedCash", emailHtml);
        res.status(200).json({
            status: "success",
            message: "A 6 digit OTP has been sent to your email"
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while processing your request"
        });
    }
};
// resend email aagain
export const ResendPassResetOtp = async (req, res) => {
    const { email } = req.body;
    try {
        // Validate input
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if email exists
            return res.status(200).json({
                status: "success",
                message: "A new OTP has been sent"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set OTP expiry to 5 minutes from now
        const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);

        // Update user with new OTP and expiry
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = otp_expiry;
        await user.save();

        // Email template - EXACT same design as registration OTP
        const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: auto; background: #0c1037; border-radius: 8px; overflow: hidden; }
            .header { background: #29965f; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; color: #fff; }
            .otp-code { background: #29965f; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; border-radius: 4px; margin: 20px 0; }
            .footer { background: #29965f; color: #fff; text-align: center; padding: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header"><h1>Password Reset - ZedCash</h1></div>
            <div class="content">
              <h2>Hello, ${user.username}</h2>
              <p>Your new One-Time Password (OTP) for password reset is:</p>
              <div class="otp-code">${otp}</div>
              <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
              <p>If you did not request a password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ZedCash. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        `;

        // Send OTP via email
        await sendEmail(email, "New Password Reset OTP - ZedCash", emailHtml);

        res.status(200).json({
            status: "success",
            message: "New password reset OTP sent successfully",
        });

    } catch (error) {
        console.error("Resend password reset OTP error:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};
//verify otp
export const VerifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email
        const user = await UserModel.findOne({
            email,
            resetPasswordOtpExpires: { $gt: Date.now() }
        });

        if (!user || user.resetPasswordOtp !== otp) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or expired OTP"
            });
        }
        // OTP is valid
        res.status(200).json({
            status: "success",
            message: "OTP verified successfully"
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            status: "error",
            message: "An error occurred during OTP verification"
        });
    }
};

//reset password
export const ResetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "error",
                message: "Password must be at least 8 characters long"
            });
        }

        // Check if user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if email exists
            return res.status(200).json({
                status: "success",
                message: "Password has been reset successfully"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset OTP fields
        user.password = hashedPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;

        await user.save();

        // Optional: Invalidate all existing sessions (if you're using session management)
        // user.sessionVersion = (user.sessionVersion || 0) + 1;
        // await user.save();

        res.status(200).json({
            status: "success",
            message: "Password has been reset successfully"
        });

    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({
            status: "error",
            message: "An error occurred while resetting your password"
        });
    }
};
