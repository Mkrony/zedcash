import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import LiveCashoutAnimation from "../Animations/LiveCashoutAnimation.jsx";
import MoneyRingAnimation from "../Animations/MoneyRingAnimation.jsx";
import zedStore from "../zedstore/ZedStore.jsx";
import styles from "./Livecashout.module.css";

// Helper function for relative time
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${seconds < 120 ? '' : 's'} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${seconds < 7200 ? '' : 's'} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${seconds < 172800 ? '' : 's'} ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} week${seconds < 1209600 ? '' : 's'} ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} month${seconds < 5184000 ? '' : 's'} ago`;
    return `${Math.floor(seconds / 31536000)} year${seconds < 63072000 ? '' : 's'} ago`;
};

const WithdrawalSkeleton = ({ count = 5 }) => (
    <div className={styles.cashout_box_live}>
        {Array(count).fill().map((_, index) => (
            <div key={index} className={`${styles.every_users_box_cashout} skeleton-item`}>
                <div className="d-flex align-items-center w-100">
                    <div className={`${styles.live_cashout_user_img} skeleton-avatar`}></div>
                    <div className={`${styles.live_cashout_user_name} ms-5 flex-grow-1`}>
                        <div className="skeleton-text" style={{ width: '60%', height: '20px' }}></div>
                        <div className="skeleton-text" style={{ width: '40%', height: '16px', marginTop: '8px' }}></div>
                    </div>
                    <div className={`${styles.live_cashout_user_amount} skeleton-text`} style={{ width: '80px', height: '24px' }}></div>
                </div>
            </div>
        ))}
    </div>
);

function LiveCashout() {
    const { allUserWithdrawals, getAllWithdrawals } = zedStore((state) => state);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

    const fetchWithdrawals = useCallback(async () => {
        try {
            setWithdrawalsLoading(true);
            await getAllWithdrawals();
        } catch (error) {
            console.error(error.message);
        } finally {
            setWithdrawalsLoading(false);
        }
    }, [getAllWithdrawals]);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletedWithdrawals = allUserWithdrawals
        ?.filter(w => w.status === "completed" && new Date(w.updatedAt) > thirtyDaysAgo)
        ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) || [];

    const skeletonStyles = `
        .skeleton-item {
            background-color: #222339;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .skeleton-avatar, .skeleton-text, .skeleton-cell {
            background: linear-gradient(90deg, #1a1830 25%, #2a2840 50%, #1a1830 75%);
            background-size: 200% 100%;
            animation: skeletonShimmer 1.5s infinite linear;
        }
        .skeleton-avatar { width: 50px; height: 50px; border-radius: 50%; }
        .skeleton-text { border-radius: 4px; }
        @keyframes skeletonShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;

    return (
        <>
            <style>{skeletonStyles}</style>
            <div className="row">
                <div className="col-md-6 col-12">
                    <div className={`${styles.live_chashout_box} mt-5`}>
                        <h2>Recent Withdrawals</h2>
                        {withdrawalsLoading ? (
                            <WithdrawalSkeleton />
                        ) : recentCompletedWithdrawals.length > 0 ? (
                            <div className={styles.cashout_box_live}>
                                {recentCompletedWithdrawals.map((withdrawal, index) => (
                                    <div
                                        key={withdrawal.transactionId || index}
                                        className={`${styles.every_users_box_cashout}`}
                                    >
                                        <div className="d-flex align-items-center w-100">
                                            <div className={styles.live_cashout_user_img}>
                                                <img
                                                    src={withdrawal.userAvatar || "img/avatar.png"}
                                                    alt="user profile"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "img/avatar.png";
                                                    }}
                                                />
                                            </div>
                                            <div className={`${styles.live_cashout_user_name} ms-3 flex-grow-1`}>
                                                <h3 className={"fw-semibold"}>
                                                    {withdrawal.userName || "Unknown User"}
                                                    <span className="ms-3 gray">{formatRelativeTime(withdrawal.updatedAt)}</span>
                                                </h3>
                                            </div>
                                            <div className={styles.live_cashout_user_amount}>
                                                <h4>🪙 {withdrawal.amount || "0"}</h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`${styles.cashout_box_live} d-flex flex-column justify-content-center align-items-center text-center`}>
                                <MoneyRingAnimation />
                                <h4 className={"fw-semibold m-0 p-0"}>No withdrawals in the last 30 days.</h4>
                            </div>
                        )}
                    </div>
                </div>
                <div className="offset-md-1 col-md-5 col-12 mt-md-5">
                    <div className={styles.animation_img_cashout_box}>
                        <LiveCashoutAnimation />
                    </div>
                </div>
            </div>
        </>
    );
}

export default React.memo(LiveCashout);
