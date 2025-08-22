import { useEffect, useState } from "react";
import Preloader from "./component/Preloader.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./assets/css/main.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import all components directly
import HomePage from "./page/HomePage.jsx";
import EarnPage from "./page/EarnPage.jsx";
import CashoutPage from "./page/CashoutPage.jsx";
import ProfilePage from "./page/ProfilePage.jsx";
import RegistrationPage from "./page/RegistrationPage.jsx";
import LoginPage from "./page/LoginPage.jsx";
import HowtoearnPage from "./page/HowtoearnPage.jsx";
import VerifyCode from "./component/VerifyCode/VerifyCode.jsx";
import Logout from "./component/logout/Logout.jsx";
import AdminPanel from "./page/AdminPanel.jsx";
import NotfoundPage from "./page/NotfoundPage.jsx";
import CoinSound from "./assets/sounds/sounds.wav";
import NotificationSound from "./assets/sounds/notification.wav";
import ZedStore from "./component/zedstore/ZedStore.jsx";
import Offerwalls from "./page/offerwalls.jsx";
import Games from "./page/Games.jsx";
import AllOffer from "./page/AllOffer.jsx";
import SettingsPage from "./page/admin/SettingsPage.jsx";
import SpinWheel from "./component/spin/SpinWheel.jsx";
import AllOfferwallList from "./page/AllOfferwallList.jsx";
import TermsOfService from "./page/TermsOfService.jsx";
import PrivacyPolicy from "./page/PrivacyPolicy.jsx";
import AdminSupportEmail from "./page/admin/AdminSupportEmails.jsx";
import SupportTicket from "./component/supports/SupportTicket.jsx";
import AdminSupportTicket from "./page/admin/AdminSupportTicket.jsx";
const App = () => {
    const [pageLoading, setPageLoading] = useState(true);
    const { startAllPolling, stopAllPolling, fetchUnreadNotifications, unreadNotifications, getUserTasks, userDetailsRequested,getTodayRevenues,getTotalRevenues } = ZedStore();
    const audio = new Audio(CoinSound);
    const notifySound = new Audio(NotificationSound);
    useEffect(() => {
        fetchUnreadNotifications();
    }, []);
    useEffect(() => {
        if (unreadNotifications?.length > 0) {
            unreadNotifications.forEach((notification) => {
                // Check for specific notification type
                if (notification.type === "task_completed") {
                    setTimeout(() => {
                        audio.play();
                    }, 300);
                    getUserTasks();
                    userDetailsRequested();
                    getTodayRevenues();
                    getTotalRevenues();
                }
                if (notification.type === "pending" || notification.type === "withdrawal" || notification.type === "user_banned" || notification.type === "chargeback") {
                    setTimeout(() => {
                        notifySound.play();
                    }, 300);
                    userDetailsRequested();
                }
                else{
                    setTimeout(() => {
                        notifySound.play();
                    }, 300);
                }
                // Show toast notification
                toast.success(notification.message, {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                });
            });
        }
    }, [unreadNotifications, userDetailsRequested]);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPageLoading(false); // Fallback
            document.body.style.overflow = "auto";
        }, 2000);
        const handleLoad = () => {
            clearTimeout(timeout);
            setPageLoading(false);
        };
        window.addEventListener("load", handleLoad);
        return () => {
            window.removeEventListener("load", handleLoad);
            clearTimeout(timeout);
        };
    }, []);
    useEffect(() => {
        startAllPolling();
        return () => {
            stopAllPolling(); // Clean up on unmount
        };
    }, [startAllPolling, stopAllPolling]);

    return (
        <>
            {pageLoading && <Preloader />}
            <div className="toaster">
                <ToastContainer
                    position="top-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover={false}
                    theme="light"
                    transition: Zoom
                />
            </div>
            <BrowserRouter>
                <Routes>
                    <Route exact path="/" element={<HomePage />} />
                    <Route exact path="/earn" element={<EarnPage />} />
                    <Route exact path="/offerwalls" element={<Offerwalls />} />
                    <Route exact path="/game-offers" element={<Games/>} />
                    <Route exact path="/all-offer" element={<AllOffer/>} />
                    <Route exact path="/cashout" element={<CashoutPage />} />
                    <Route exact path="/profile" element={<ProfilePage />} />
                    <Route exact path="/registration" element={<RegistrationPage />} />
                    <Route exact path="/signin" element={<LoginPage />} />
                    <Route exact path="/howtoearn" element={<HowtoearnPage />} />
                    <Route exact path="/spin" element={<SpinWheel/>} />
                    <Route exact path="/verify" element={<VerifyCode />} />
                    <Route exact path="/logout" element={<Logout />} />
                    <Route exact path="/admin-panel" element={<AdminPanel />} />
                    <Route exact path="/support-emails" element={<AdminSupportEmail/>} />
                    <Route exact path="/support-ticket" element={<AdminSupportTicket/>} />
                    <Route exact path="/ticket" element={<SupportTicket/>} />
                    <Route exact path="/settings" element={<SettingsPage />} />
                    <Route exact path="/offerwall-list" element={<AllOfferwallList />} />
                    <Route exact path="/terms" element={<TermsOfService />} />
                    <Route exact path="/privacy" element={<PrivacyPolicy />} />
                    <Route exact path="*" element={<NotfoundPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;