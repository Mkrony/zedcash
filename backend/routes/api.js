import express from 'express';
const router = express.Router();
// Import controllers
import * as ChargebackController from "../app/controller/ChargebackController.js";
import * as NotificationsController from "../app/controller/NotificationController.js";
import * as OffersControllers from "../app/controller/OffersControllers.js";
import * as PostbackControllers from '../app/controller/PostbackController.js';
import * as TimelineController from "../app/controller/TimelineController.js";
import * as UserController from "../app/controller/UserController.js";
import * as WithdrawalsController from "../app/controller/WithdrawalsController.js";
import * as PendingTaskController from "../app/controller/PendingTaskController.js";
import * as ApplicationSettings from "../app/controller/ApplicationSettingsController.js";
import * as CashoutMethod from "../app/controller/CashoutMethodController.js";
import * as OfferwallController from "../app/controller/OfferwallController.js";
import * as PendingSettings from "../app/controller/PendingSettingsController.js";
import * as SpinController from "../app/controller/SpinController.js";
import * as LiveChatController from "../app/controller/LivechatController.js";
import IpCheckMiddleWire from "../app/middleware/IpCheck.js";
import { AuthMiddleware } from "../app/middleware/AuthMiddleware.js";
import {ShowMessage} from "../app/controller/LivechatController.js";

// timeLine
router.get('/timeline',TimelineController.GetTimeline);
// Registration endpoint
router.post('/registration',IpCheckMiddleWire, UserController.Registration);
// OTP verification endpoint
router.post('/verify', UserController.OtpVerification);
router.post('/resend-otp', UserController.ResendOtp);
router.post('/login',IpCheckMiddleWire, UserController.Login);
router.post('/logout', UserController.Logout);
router.get('/profile',AuthMiddleware,UserController.profile);
router.post('/update-profile',AuthMiddleware,UserController.UpdateProfile);
router.post('/withdraw-coin',IpCheckMiddleWire,AuthMiddleware,WithdrawalsController.WithdrawCoin);
// show withdraw list to users dashboards
router.get('/user-withdrawals',AuthMiddleware,WithdrawalsController.UsersWithdrawals);
router.get('/userCompletedTask',AuthMiddleware,OffersControllers.UserCompletedTask);
router.get('/withdrawals',WithdrawalsController.AllWithdrawals);
router.get('/getuserwithdrawal/:userId',AuthMiddleware, WithdrawalsController.GetUserWithdrawalByUserId);
router.post('/approvewithdrawal/:withdrawalId',AuthMiddleware, WithdrawalsController.ApproveWithdrawal);
router.post('/refundwithdrawal/:withdrawalId/:withdrawalAmount',AuthMiddleware, WithdrawalsController.RefundWithdrawalAmount);
router.post('/rejectwithdrawal/:withdrawalId',AuthMiddleware, WithdrawalsController.RejectWithdrawal);
router.get('/userbyid/:userId',UserController.GetUserById);
router.get('/allusers',AuthMiddleware,UserController.AllUsers);
router.post('/updateuser/:userId',AuthMiddleware,UserController.UpdateUser);
router.post('/deleteuser/:userId',AuthMiddleware,UserController.DeleteUser);
router.post('/banuser/:userId',AuthMiddleware,UserController.BanUser);
router.post('/unbanuser/:userId',AuthMiddleware,UserController.UnBanUser);
router.post('/makeadmin/:userId',AuthMiddleware,UserController.MakeAdmin);
router.post('/makeuser/:userId',AuthMiddleware,UserController.MakeUser);
// Tasks API
router.get('/completed-offers',OffersControllers.CompletedOffers);
router.get('/getusercompletedtasks/:userId',AuthMiddleware, OffersControllers.GetUserCompletedTasksByUserId);
// Postbackj API
// notik postback
router.get('/notik', PostbackControllers.NotikPostback);
//wannads postback
router.get('/wannads', PostbackControllers.WannadsPostback);
//primewall postback
router.get('/primewall', PostbackControllers.PrimewallPostback);
//a users all notifications
router.get('/user-notifications/:userId',AuthMiddleware,NotificationsController.GetUserAllNotifications);
//a users unread notifications
router.get('/unread-notifications/:userId',NotificationsController.GetUserUnreadNotifications);
//a users unread notifications
router.post('/readed-notifications/:notificationId',NotificationsController.MarkNotificationAsRead);
//get all chargebacks
router.get('/chargebacks',AuthMiddleware,ChargebackController.GetAllChargebacks);
router.get('/userchargeback',AuthMiddleware,ChargebackController.UserChargeback);
router.get('/getuserchargeback/:userId',AuthMiddleware,ChargebackController.GetUserChargebackByUserId);
router.post('/setchargeback/:taskId',AuthMiddleware,ChargebackController.SetChargeback);
//pending task
router.get('/allPendingTasks', AuthMiddleware, PendingTaskController.GetAllPendingTasks);
router.get('/getuserpendingtask/:userId',AuthMiddleware,PendingTaskController.GetUserPendingTaskByUserId);
router.post('/setpendingtask/:taskId',AuthMiddleware,PendingTaskController.SetPendingTask);
router.post('/setendingtocompletedtask/:taskId',AuthMiddleware,PendingTaskController.SetPendingToCompletedTask);
router.post('/setendingtochargeback/:taskId',AuthMiddleware,PendingTaskController.SetPendingToChargeback);
//Delete Task
router.get('/delete-completed-task/:taskId',AuthMiddleware,OffersControllers.DeleteCompletedTask);
//All count api here
router.get('/totalEarningByUser',AuthMiddleware,OffersControllers.TotalRevenues);
router.get('/totalRevenue',AuthMiddleware,OffersControllers.TotalRevenues);
router.get('/todayRevenue',AuthMiddleware,OffersControllers.TodayTotalRevenue);
router.get('/totalPendingRevenue',AuthMiddleware,PendingTaskController.TotalPendingRevenues);
router.get('/todayPendingRevenue',AuthMiddleware,PendingTaskController.TodayPendingRevenue);
router.get('/totalChargeback',AuthMiddleware,ChargebackController.TotalChargeback);
router.get('/todayChargeback',AuthMiddleware,ChargebackController.TodayChargeback);
// Application settings api
router.get('/get-basic-settings', ApplicationSettings.getBasicSettings);
router.get('/get-smtp-settings', ApplicationSettings.GetSmtpSettings);
router.post('/smtp-settings', ApplicationSettings.SaveSmtpSettings);
router.post('/test-smtp', ApplicationSettings.TestSmtpConnection);
router.post('/basic-settings', AuthMiddleware, ApplicationSettings.saveBasicSettings);
// Cashout method
router.get('/get-cashout-methods', CashoutMethod.GetCashoutMethod);
router.post('/cashout-methods', AuthMiddleware, CashoutMethod.CashoutMethodAdd);
router.delete('/delete-cashout-methods/:id', AuthMiddleware, CashoutMethod.CashoutMethodDelete);
router.put('/update-cashout/:id', AuthMiddleware, CashoutMethod.CashoutMethodUpdate);
// offerwalls api
router.post('/add-offerwalls',AuthMiddleware, OfferwallController.AddNewOfferwall);
router.get('/get-offerwalls', OfferwallController.GetOfferwall);
router.get('/delete-offerwalls/:id', AuthMiddleware,OfferwallController.DeleteOfferwall);
router.put('/update-offerwalls/:id',AuthMiddleware, OfferwallController.UpdateOfferwall);
//pending settings
router.get('/get-pending-settings', AuthMiddleware,PendingSettings.GetPendingSettings);
router.post('/UpdatePendingSettings', AuthMiddleware,PendingSettings.UpdatePendingSettings);
router.delete('/delete-pending-offer/:id', AuthMiddleware,PendingSettings.DeletePendingOfferId);
//spin
// Public route - get wheel configuration
router.get("/spin/config", SpinController.GetConfig);
router.post("/spin", AuthMiddleware, SpinController.Spin);
//Live chat api
router.get("/show-message", LiveChatController.ShowMessage);
router.post("/send-message", AuthMiddleware, LiveChatController.SendMessage);
//email support api
router.get("/total-support-message", AuthMiddleware, LiveChatController.TotalSupportMessage);
router.get("/show-support-message", AuthMiddleware, LiveChatController.ShowSupportMessage);
router.post("/send-support-message", LiveChatController.SendSupportMessage);
router.patch("/update-support-message/:id", AuthMiddleware, LiveChatController.UpdateStatus);
router.post("/bulk-support-messages", AuthMiddleware, LiveChatController.BulkSupportMessages);
router.delete("/delete-support-message/:id", AuthMiddleware, LiveChatController.DeleteSupportMessage);
// Export the router

export default router;
