import React, { useEffect, useState, useCallback, useMemo } from "react";
import HeaderSection from "../component/HeaderSection.jsx";
import zedStore from "../component/zedstore/ZedStore.jsx";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Footer from "../component/footer/Footer.jsx";
import "../assets/css/adminPage.css";

// Lazy-loaded components
const AllUsersPopUp = React.lazy(() => import("../component/admins/all-user/AllUsersPopUp.jsx"));
const AllCompletedTaskPopup = React.lazy(() => import("../component/admins/tasks/AllCompletedTaskPopup.jsx"));
const AllPendingTasksPopup = React.lazy(() => import("../component/admins/pending/AllPendingTasksPopup.jsx"));
const AllWithdrawalsPopUp = React.lazy(() => import("../component/admins/AllWithdraw/AllWithdrawalsPopUp.jsx"));
const PendingWithdrawalsPopUp = React.lazy(() => import("../component/admins/AllWithdraw/PendingWithdrawalsPopUp.jsx"));
const AllChargebacksPopUp = React.lazy(() => import("../component/admins/chargeback/AllChargebacksPopUp.jsx"));

// Constants
const ADMIN_CARDS = [
    { title: "All Users", key: "users" },
    { title: "Completed Task", key: "completedTasks" },
    { title: "Pending Tasks", key: "pendingTasks" },
    { title: "All Chargebacks", key: "chargebacks" },
    { title: "Pending Withdrawals", key: "pendingWithdrawals" },
    { title: "All Withdrawals", key: "withdrawals" }
];

const REVENUE_CARDS = [
    { title: "Today Revenue", key: "todayRevenue" },
    { title: "Total Revenue", key: "totalRevenue" },
    { title: "Today Pending Revenue", key: "todayPendingRevenue" },
    { title: "Total Pending Revenue", key: "totalPendingRevenue" },
    { title: "Today Chargeback", key: "todayChargeback" },
    { title: "Total Chargeback", key: "totalChargeback" }
];

// Skeleton Components
const AdminCardSkeleton = () => (
    <div className="profile-details-box card text-center py-2 px-3 box-shadow skeleton-item" aria-hidden="true">
        <div className="profile-details-box-title my-2">
            <div className="skeleton-text" style={{ width: '80%', height: '20px', margin: '0 auto' }}></div>
        </div>
        <div className="profile-details-box-balance">
            <div className="skeleton-text" style={{ width: '40%', height: '20px', margin: '0 auto' }}></div>
        </div>
    </div>
);

const RevenueCardSkeleton = () => (
    <div className="card box-shadow bordered-dark skeleton-item" aria-hidden="true">
        <div className="card-body text-center">
            <div className="skeleton-text" style={{ width: '30%', height: '30px', margin: '0 auto' }}></div>
            <div className="skeleton-text mt-3" style={{ width: '80%', height: '20px', margin: '0 auto' }}></div>
        </div>
    </div>
);

const SupportCardSkeleton = () => (
    <div className="profile-details-box card text-center py-3 box-shadow skeleton-item" aria-hidden="true">
        <div className="profile-details-box-title">
            <div className="skeleton-text" style={{ width: '70%', height: '20px', margin: '0 auto' }}></div>
        </div>
        <div className="profile-details-box-balance mt-2">
            <div className="skeleton-text" style={{ width: '30%', height: '25px', margin: '0 auto' }}></div>
        </div>
    </div>
);

const AdminPanel = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const {
        allUsers,
        getAllUsers,
        allCompletedOffers,
        getAllCompletedOffers,
        allPendingTasks,
        getAllPendingTasks,
        allUserWithdrawals,
        getAllWithdrawals,
        allChargebacks,
        getAllChargeback,
        totalRevenues,
        todayRevenues,
        getTotalRevenues,
        getTodayRevenues,
        todayPendingRevenues,
        totalPendingRevenues,
        getTotalPendingRevenues,
        gettodayPendingRevenues,
        todayChargeback,
        totalChargeback,
        getTodayChargeback,
        getTotalChargeback,
        totalSupportEmail,
        getTotalSupportEmail,
        loading: storeLoading,
        error: storeError
    } = zedStore();

    const [loading, setLoading] = useState({
        users: true,
        offers: true,
        pendingTasks: true,
        withdrawals: true,
        chargebacks: true,
        revenue: true,
        todayStats: true,
        support: true
    });

    const [error, setError] = useState(null);
    const [modalStates, setModalStates] = useState({
        users: false,
        completedTasks: false,
        pendingTasks: false,
        withdrawals: false,
        pendingWithdrawals: false,
        chargebacks: false
    });

    // Memoized calculations
    const pendingWithdrawals = useMemo(() =>
            allUserWithdrawals?.filter(withdrawal => withdrawal.status === "pending") || [],
        [allUserWithdrawals]
    );

    const adminCardData = useMemo(() => ({
        users: allUsers?.length || 0,
        completedTasks: allCompletedOffers?.length || 0,
        pendingTasks: allPendingTasks?.length || 0,
        chargebacks: allChargebacks?.length || 0,
        pendingWithdrawals: pendingWithdrawals.length,
        withdrawals: allUserWithdrawals?.length || 0
    }), [allUsers, allCompletedOffers, allPendingTasks, allChargebacks, pendingWithdrawals, allUserWithdrawals]);

    const revenueData = useMemo(() => ({
        totalRevenue: totalRevenues,
        todayRevenue: todayRevenues,
        totalPendingRevenue: totalPendingRevenues,
        todayPendingRevenue: todayPendingRevenues,
        todayChargeback: todayChargeback,
        totalChargeback: totalChargeback
    }), [totalRevenues, todayRevenues, totalPendingRevenues, todayPendingRevenues, todayChargeback, totalChargeback]);

    // Authentication check
    useEffect(() => {
        const confirmAdmin = async () => {
            if (!token) {
                toast.error("You must be logged in");
                navigate("/signin");
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    toast.error("Session expired. Please log in again.");
                    navigate("/signin");
                    return;
                }
                const userId = decodedToken.id;
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userbyid/${userId}`, {
                    withCredentials: true,
                });
                const role = response.data.user.role;

                if (role !== "admin") {
                    toast.error("You must be an admin");
                    navigate("/");
                }
            } catch (err) {
                console.error("Admin validation error:", err.message);
                toast.error("Failed to validate user. Please log in again.");
                Cookies.remove("token");
                navigate("/signin");
            }
        };

        confirmAdmin();
    }, [token, navigate]);

    // Data fetching functions with error handling
    const fetchDataWithRetry = async (fetchFunction, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                await fetchFunction();
                return;
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    };

    // Data fetching with prioritized loading
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, users: true, revenue: true, todayStats: true, support: true }));

            // Load critical data first
            await Promise.all([
                fetchDataWithRetry(getAllUsers),
                fetchDataWithRetry(getTodayRevenues),
            ]);

            // Load secondary data
            await Promise.all([
                fetchDataWithRetry(getAllCompletedOffers),
                fetchDataWithRetry(getAllPendingTasks),
                fetchDataWithRetry(getAllWithdrawals),
                fetchDataWithRetry(getAllChargeback),
                fetchDataWithRetry(getTotalRevenues),
                fetchDataWithRetry(getTotalPendingRevenues),
                fetchDataWithRetry(gettodayPendingRevenues),
                fetchDataWithRetry(getTodayChargeback),
                fetchDataWithRetry(getTotalChargeback),
                fetchDataWithRetry(getTotalSupportEmail),
            ]);

            setLoading({
                users: false,
                offers: false,
                pendingTasks: false,
                withdrawals: false,
                chargebacks: false,
                revenue: false,
                todayStats: false,
                support: false
            });
        } catch (err) {
            console.error("Data loading error:", err);
            setError("Failed to load data. Please try again later.");
            toast.error("Failed to load data");
            setLoading({
                users: false,
                offers: false,
                pendingTasks: false,
                withdrawals: false,
                chargebacks: false,
                revenue: false,
                todayStats: false,
                support: false
            });
        }
    }, [
        getAllUsers,
        getAllCompletedOffers,
        getAllPendingTasks,
        getAllWithdrawals,
        getAllChargeback,
        getTotalRevenues,
        getTodayRevenues,
        getTotalPendingRevenues,
        gettodayPendingRevenues,
        getTodayChargeback,
        getTotalChargeback,
        getTotalSupportEmail
    ]);

    useEffect(() => {
        if (token) {
            fetchAllData();
        }
    }, [token, fetchAllData]);

    const toggleModal = (modalName) => {
        setModalStates(prev => ({
            ...prev,
            [modalName]: !prev[modalName]
        }));
    };

    const isLoading = Object.values(loading).some(status => status);

    if (error) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-50">
                <h4 className="text-danger">{error}</h4>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => window.location.reload()}
                    aria-label="Retry loading data"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <HeaderSection />
            <div className="admin-section pb-md-5">
                <div className="container-fluid">
                    {/* Admin Cards Section */}
                    <div className="row m-0 py-5">
                        <div className="col-md-12 col-12">
                            <div className="page-title">
                                <h2 className="mb-4">Admin Dashboard</h2>
                            </div>
                            <div className="admin-boxes">
                                <div className="mt-3 row flex-row flex-wrap row-gap-4 justify-content-start">
                                    {isLoading ? (
                                        Array(ADMIN_CARDS.length).fill().map((_, index) => (
                                            <div key={`admin-skeleton-${index}`} className="col-md-4 col-lg-3 col-12">
                                                <AdminCardSkeleton />
                                            </div>
                                        ))
                                    ) : (
                                        ADMIN_CARDS.map((card) => (
                                            <div key={card.key} className="col-md-4 col-lg-3 col-12">
                                                <div
                                                    className="profile-details-box card text-center py-3 box-shadow cursor-pointer"
                                                    onClick={() => toggleModal(card.key)}
                                                    role="button"
                                                    tabIndex="0"
                                                    aria-label={`View ${card.title}`}
                                                    onKeyDown={(e) => e.key === 'Enter' && toggleModal(card.key)}
                                                >
                                                    <div className="profile-details-box-balance my-2">
                                                        <h5 className="fw-bold">{adminCardData[card.key].toLocaleString()}</h5>
                                                    </div>
                                                    <div className="profile-details-box-title">
                                                        <h5 className="fw-bold">{card.title}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Revenue Cards Section */}
                    <div className="row pt-5 ms-1">
                        <div className="page-title">
                            <h3 className="mb-4">Revenue Overview</h3>
                        </div>
                        {isLoading ? (
                            Array(REVENUE_CARDS.length).fill().map((_, index) => (
                                <div key={`revenue-skeleton-${index}`} className="col-12 col-md-4 col-lg-2 mt-4">
                                    <RevenueCardSkeleton />
                                </div>
                            ))
                        ) : (
                            REVENUE_CARDS.map((card) => (
                                <div key={card.key} className="col-12 col-md-4 col-lg-2 mt-4">
                                    <div className="card box-shadow bordered-dark h-100">
                                        <div className="card-body text-center d-flex flex-column">
                                            <h2 className="mb-auto">${revenueData[card.key]?.toLocaleString() || '0'}</h2>
                                            <h5 className="mt-3">{card.title}</h5>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Support Messages Section - Separate at the bottom */}
                    <div className="row pt-5 ms-1">
                        <div className="page-title">
                            <h3 className="mb-4">Support Center</h3>
                        </div>
                        <div className="col-md-4 col-lg-3 col-12">
                            {loading.support ? (
                                <SupportCardSkeleton />
                            ) : (
                                <NavLink
                                    to="/support-emails"
                                    className="profile-details-box card text-center py-3 box-shadow text-decoration-none"
                                >
                                    <div className="profile-details-box-title">
                                        <h5 className="fw-bold">Support Email</h5>
                                    </div>
                                    <div className="profile-details-box-balance mt-2">
                                        <h5 className="fw-bold text-danger">{totalSupportEmail}</h5>
                                    </div>
                                </NavLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lazy-loaded Modals with Suspense fallback */}
            <React.Suspense fallback={<div className="loading-modal">Loading...</div>}>
                <AllUsersPopUp
                    showModal={modalStates.users}
                    closeModal={() => toggleModal("users")}
                    allUsers={allUsers}
                    getAllUsers={getAllUsers}
                />
                <AllCompletedTaskPopup
                    showModal={modalStates.completedTasks}
                    closeModal={() => toggleModal("completedTasks")}
                    allCompletedOffers={allCompletedOffers}
                />
                <AllPendingTasksPopup
                    showModal={modalStates.pendingTasks}
                    closeModal={() => toggleModal("pendingTasks")}
                    allPendingTasks={allPendingTasks}
                    fetchPendingTasks={getAllPendingTasks}
                    fetchCompletedOffers={getAllCompletedOffers}
                />
                <AllWithdrawalsPopUp
                    showModal={modalStates.withdrawals}
                    closeModal={() => toggleModal("withdrawals")}
                    allWithdrawals={allUserWithdrawals}
                />
                <PendingWithdrawalsPopUp
                    showModal={modalStates.pendingWithdrawals}
                    closeModal={() => toggleModal("pendingWithdrawals")}
                    pendingWithdrawals={pendingWithdrawals}
                    fetchAllWithdrawals={getAllWithdrawals}
                />
                <AllChargebacksPopUp
                    showModal={modalStates.chargebacks}
                    closeModal={() => toggleModal("chargebacks")}
                    allChargebacks={allChargebacks}
                />
            </React.Suspense>

            <Footer />
        </>
    );
};

export default AdminPanel;