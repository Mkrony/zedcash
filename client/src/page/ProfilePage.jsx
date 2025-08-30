import React, { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import ZedStore from "../component/zedstore/ZedStore.jsx";
import HeaderSection from "../component/HeaderSection.jsx";
import {NavLink, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faCoins,
    faChartLine,
    faEye,
    faComputer,
} from "@fortawesome/free-solid-svg-icons";
import UserDetailsModal from "../component/profile-details/UserDetailsModal.jsx";
import ReactCountryFlag from "react-country-flag";
import { byCountry } from "country-code-lookup";
import Footer from "../component/footer/Footer.jsx";
import { Tab, Tabs, Table, Pagination, Badge, Spinner } from "react-bootstrap";
import "../assets/css/profile.css";
import axios from "axios";
import SpinnerAnimation from "../component/Animations/SpinnerAnimation.jsx";
import SpinWheel from "../component/spin/SpinWheel.jsx";
import WheelAnnimation from "../component/Animations/WheelAnnimation.jsx";

// Skeleton Loading Components
const AvatarSkeleton = () => (
    <div className="skeleton-avatar rounded-circle"></div>
);

const TextSkeleton = ({ width = "100%", height = "1rem" }) => (
    <div className="skeleton-text" style={{ width, height }}></div>
);

const CardSkeleton = () => (
    <div className="card skeleton-card p-3 box-shadow">
        <div className="skeleton-icon rounded-circle"></div>
        <TextSkeleton width="80%" height="1.5rem" className="mt-2" />
        <TextSkeleton width="60%" height="1rem" className="mt-1" />
    </div>
);

// Card Component
const ProfileCard = ({ title, value, icon, color = "primary" }) => (
    <div className={`profile-details-box card text-center p-2 box-shadow ${color}`}>
        <div className="profile-details-box-icon text-white my-1">
            <FontAwesomeIcon icon={icon} size="sm" />
        </div>
        <div className="profile-details-box-balance">
            <h4 className="fw-semibold">{value.toLocaleString()}</h4>
        </div>
        <div className="profile-details-box-title my-2">
            <h6>{title}</h6>
        </div>
    </div>
);

// Helper function to sort by date (newest first)
const sortByNewestFirst = (data) => {
    return [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

function ProfilePage() {
    const [avatarLoading, setAvatarLoading] = useState(true);
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("tasks");
    const [currentPage, setCurrentPage] = useState(1);
    const [userTasks, setUserTasks] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [userWithdrawals, setUserWithdrawals] = useState([]);
    const [userChargebacks, setUserChargebacks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingPendingTasks, setLoadingPendingTasks] = useState(false);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
    const [loadingChargebacks, setLoadingChargebacks] = useState(false);
    const itemsPerPage = 5;

    const { userDetails, userDetailsRequested } = ZedStore();

    // Format date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }, []);

    // Get country code
    const getCountryCode = useCallback((countryName) => {
        const countryData = byCountry(countryName);
        return countryData ? countryData.iso2 : null;
    }, []);

    // Fetch user tasks (sorted newest first)
    const fetchUserTasks = useCallback(async (userId) => {
        if (!userId) return;
        setLoadingTasks(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getusercompletedtasks/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            const sortedTasks = sortByNewestFirst(response.data.offers || []);
            setUserTasks(sortedTasks);
        } catch (error) {
            toast.error("Failed to load tasks");
            console.error("Error fetching tasks:", error);
        } finally {
            setLoadingTasks(false);
        }
    }, [token]);

    // Fetch pending tasks (sorted newest first)
    const fetchPendingTasks = useCallback(async (userId) => {
        if (!userId) return;
        setLoadingPendingTasks(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getuserpendingtask/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            const sortedTasks = sortByNewestFirst(response.data.offers || []);
            setPendingTasks(sortedTasks);
        } catch (error) {
            toast.error("Failed to load pending tasks");
            console.error("Error fetching pending tasks:", error);
        } finally {
            setLoadingPendingTasks(false);
        }
    }, [token]);

    // Fetch user withdrawals (sorted newest first)
    const fetchUserWithdrawals = useCallback(async (userId) => {
        if (!userId) return;
        setLoadingWithdrawals(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getuserwithdrawal/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            const sortedWithdrawals = sortByNewestFirst(response.data.withdrawals || []);
            setUserWithdrawals(sortedWithdrawals);
        } catch (error) {
            toast.error("Failed to load withdrawals data");
            console.error("Error fetching withdrawals:", error);
        } finally {
            setLoadingWithdrawals(false);
        }
    }, [token]);

    // Fetch user chargebacks (sorted newest first)
    const fetchUserChargebacks = useCallback(async (userId) => {
        if (!userId) return;
        setLoadingChargebacks(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getuserchargeback/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            const sortedChargebacks = sortByNewestFirst(response.data.offers || []);
            setUserChargebacks(sortedChargebacks);
        } catch (error) {
            toast.error("Failed to load chargebacks data");
            console.error("Error fetching chargebacks:", error);
        } finally {
            setLoadingChargebacks(false);
        }
    }, [token]);

    // Get current items for pagination (already sorted)
    const getCurrentItems = useCallback(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        switch (activeTab) {
            case "tasks":
                return userTasks.slice(startIndex, endIndex);
            case "pendingtasks":
                return pendingTasks.slice(startIndex, endIndex);
            case "withdrawals":
                return userWithdrawals.slice(startIndex, endIndex);
            case "chargebacks":
                return userChargebacks.slice(startIndex, endIndex);
            default:
                return [];
        }
    }, [activeTab, currentPage, userTasks, pendingTasks, userWithdrawals, userChargebacks]);

    // Get total pages
    const getTotalPages = useCallback(() => {
        let totalItems = 0;
        switch (activeTab) {
            case "tasks":
                totalItems = userTasks.length;
                break;
            case "pendingtasks":
                totalItems = pendingTasks.length;
                break;
            case "withdrawals":
                totalItems = userWithdrawals.length;
                break;
            case "chargebacks":
                totalItems = userChargebacks.length;
                break;
            default:
                totalItems = 0;
        }
        return Math.ceil(totalItems / itemsPerPage);
    }, [activeTab, userTasks.length, pendingTasks.length, userWithdrawals.length, userChargebacks.length]);

    const handleUnauthorized = useCallback(() => {
        toast.error("Please Login First");
        Cookies.remove("token");
        sessionStorage.removeItem("token");
        navigate("/");
    }, [navigate]);

    const toggleUserModal = useCallback(() => {
        setIsUserModalOpen(prev => !prev);
    }, []);

    const handleSaveUserDetails = useCallback(() => {
        userDetailsRequested();
        toast.success("Profile updated successfully!");
    }, [userDetailsRequested]);

    const copyRefferal = useCallback((e) => {
        e.preventDefault();
        if (!userDetails?.username) {
            toast.error("Username is not available.");
            return;
        }
        const referralLink = `${window.location.origin}/registration?ref=${userDetails.username}`;
        navigator.clipboard.writeText(referralLink)
            .then(() => toast.success("Referral link copied to clipboard!"))
            .catch(() => toast.error("Failed to copy to clipboard."));
    }, [userDetails]);

    useEffect(() => {
        document.body.style.overflow = isUserModalOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isUserModalOpen]);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchData = async () => {
            if (!token) {
                handleUnauthorized();
                return;
            }

            try {
                await userDetailsRequested({ signal: abortController.signal });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    toast.error(error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => abortController.abort();
    }, [token, userDetailsRequested, handleUnauthorized]);

    useEffect(() => {
        if (userDetails?._id) {
            fetchUserTasks(userDetails._id);
            fetchPendingTasks(userDetails._id);
            fetchUserWithdrawals(userDetails._id);
            fetchUserChargebacks(userDetails._id);
        }
    }, [userDetails, fetchUserTasks, fetchPendingTasks, fetchUserWithdrawals, fetchUserChargebacks]);

    if (loading) {
        return (
            <>
                <HeaderSection />
                <div className="profile-container">
                    <div className="container">
                        <div className="row m-0 p-0">
                            <div className="col-md-12 col-12">
                                <div className="earn-content-container">
                                    {/* Profile Header Skeleton */}
                                    <div className="profile-header-section bordered-dark rounded box-shadow mb-5">
                                        <div className="row align-items-center justify-content-center mt-md-2 my-md-0">
                                            <div className="col-md-2 col-12">
                                                <div className="text-center m-md-0 mx-auto my-5">
                                                    <AvatarSkeleton />
                                                </div>
                                            </div>
                                            <div className="col-md-5 col-12">
                                                <div className="card p-4 skeleton-profile-info box-shadow">
                                                    <div className="d-flex justify-content-between mb-3">
                                                        <TextSkeleton width="150px" height="2rem" />
                                                        <div className="skeleton-button"></div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <TextSkeleton width="100px" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <TextSkeleton width="100%" height="1.5rem" />
                                                        <TextSkeleton width="80px" />
                                                    </div>
                                                    <div>
                                                        <TextSkeleton width="100px" />
                                                        <div className="input-group mt-2">
                                                            <div className="skeleton-input"></div>
                                                            <div className="skeleton-button"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="financial-overview mb-5">
                                        <div className="row">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="col-md-3 col-6 mb-3">
                                                    <CardSkeleton />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!userDetails) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <p className="text-danger">Failed to load user details</p>
                <button
                    className="btn custom-btn mt-3 fw-bold bordered"
                    onClick={() => window.location.reload()}
                >
                    <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                    Reload
                </button>
            </div>
        );
    }

    const {
        avatar,
        username,
        email,
        balance = 0,
        pending_balance = 0,
        total_earnings = 0,
        country,
        isVerified,
        isBanned,
        hasSpin,
        level,
        referralCount = 0
    } = userDetails;

    const countryCode = country ? getCountryCode(country) : null;

    // count userTasks
    const completed_task = userTasks.length;
    const pending_task = pendingTasks.length;
    const profileCards = [
        {
            title: "Completed Tasks",
            value: completed_task,
            icon: faComputer,
            color: "success"
        },{
            title: "Account Balance",
            value: balance,
            icon: faCoins,
            color: "success"
        },
        {
            title: "Pending Balance",
            value: pending_balance,
            icon: faCoins,
            color: "primary"
        },
        {
            title: "Total Earnings",
            value: total_earnings,
            icon: faChartLine,
            color: "info"
        },

    ];

    if (isBanned) {
        Cookies.remove("token");
        toast.error("Your account has been banned");
        setTimeout(() => navigate("/"), 3000);
        return null;
    }

    // Table headers for different tabs
    const tableHeaders = {
        tasks: ['#', 'Offer Wall', 'Offer Name', 'Transaction ID', 'IP', 'Country', 'Amount', 'Date'],
        pendingtasks: ['#', 'Offer Wall', 'Offer Name', 'Transaction ID', 'IP', 'Country', 'Amount', 'Date', 'Release Date'],
        withdrawals: ['#', 'Wallet Name', 'Wallet Address', 'Transaction ID', 'Amount', 'Status', 'Date'],
        chargebacks: ['#', 'Offer Wall', 'Offer Name', 'Transaction ID', 'IP', 'Country', 'Amount','Date']
    };

    return (
        <>
            <HeaderSection />
            <div className="profile-container mt-5 mb-5">
                <div className="container">
                    <div className="row m-0 p-0">
                        <div className="col-md-12 col-12">
                            <div className="earn-content-container">
                                <div className="profile-header-section bordered-dark rounded box-shadow mb-4 py-md-4">
                                    <div className="row align-items-center p-3">
                                        <div className="col-xl-2 col-md-3 col-lg-3 col-12">
                                            <div className="profile-avatar text-md-start text-center m-md-0 mx-auto my-3">
                                                <div className="avatar-container position-relative">
                                                    {avatarLoading && (
                                                        <div className="skeleton-avatar rounded-circle"></div>
                                                    )}
                                                    <img
                                                        src={avatar || "../img/avatar.png"}
                                                        className={`rounded-circle profile-avatar ${avatarLoading ? "d-none" : ""}`}
                                                        alt="User Avatar"
                                                        onLoad={() => setAvatarLoading(false)}
                                                        onError={(e) => {
                                                            e.target.src = "../img/default-avatar.png";
                                                            setAvatarLoading(false);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-xl-10 col-md-9 col-lg-9 col-12">
                                            <div className="profile-info">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h3 className="text-capitalize fw-semibold">
                                                        {username || "N/A"}
                                                        <span className="verified-badge ms-2" title={isVerified ? "Verified User" : "Not Verified"}>
                                                            <FontAwesomeIcon
                                                                icon={faCircleCheck}
                                                                className={isVerified ? "text-success" : "text-muted"}
                                                            />
                                                        </span>
                                                    </h3>
                                                </div>
                                                <div className="email-info">
                                                    <h3>{email}</h3>
                                                </div>
                                                <div className="email-info">
                                                    <h3>Level - {level}</h3>
                                                </div>
                                                <div className="country-info my-3">
                                                    {countryCode ? (
                                                        <div className="d-flex align-items-center">
                                                            <ReactCountryFlag
                                                                countryCode={countryCode}
                                                                svg
                                                                style={{
                                                                    width: "1.5em",
                                                                    height: "1.5em",
                                                                    marginRight: "0.5em",
                                                                    borderRadius: "20%",
                                                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)"
                                                                }}
                                                                title={countryCode}
                                                            />
                                                            <span className="fw-semibold">{country}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Country not specified</span>
                                                    )}
                                                </div>
                                                <div className="balance-display mb-3">
                                                    <h4 className="fw-bold">
                                                        <FontAwesomeIcon className={'gold'} icon={faCoins} /> {balance.toLocaleString()}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="view-btn">
                                            <button
                                                onClick={toggleUserModal}
                                                className="btn custom-btn btn-sm"
                                                title="Edit Profile"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {!hasSpin && (
                                    <div className="spinner-section">
                                            <div className="spin-box text-center my-5 bordered-dark p-3 rounded box-shadow">
                                                <h4 className="gold fw-bold ">
                                                    Lets try a reward spin
                                                </h4>
                                                <div className="spin_image">
                                                   <WheelAnnimation/>
                                                </div>
                                                <NavLink
                                                    to="/spin" className="btn btn-sm custom-btn mt-5">Try Your Luck </NavLink>
                                            </div>
                                    </div>
                                )}
                                <div className="financial-overview">
                                    <div className="row">
                                        {profileCards.map((card, index) => (
                                            <div key={index} className="col-md-3 col-6 mb-3">
                                                <ProfileCard {...card} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Transaction History Section */}
                                <div className="profiles-transection-tab mt-4">
                                    <div className="card box-shadow">
                                        <div className="card-body">
                                            <Tabs
                                                activeKey={activeTab}
                                                onSelect={(k) => {
                                                    setActiveTab(k);
                                                    setCurrentPage(1);
                                                }}
                                                className="mb-4"
                                            >
                                                <Tab eventKey="tasks" title="Completed Tasks" />
                                                <Tab eventKey="pendingtasks" title="Pending Tasks" />
                                                <Tab eventKey="withdrawals" title="Withdrawals" />
                                                <Tab eventKey="chargebacks" title="Chargebacks" />
                                            </Tabs>

                                            <div className="table-responsive">
                                                <Table borderless className="mb-0">
                                                    <thead>
                                                    <tr>
                                                        {tableHeaders[activeTab]?.map((header, index) => (
                                                            <th key={index} className="text-nowrap">{header}</th>
                                                        ))}
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {activeTab === "tasks" && (
                                                        <>
                                                            {loadingTasks ? (
                                                                <tr>
                                                                    <td colSpan={8} className="text-center py-4">
                                                                        <Spinner animation="border" variant="primary" />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                <>
                                                                    {getCurrentItems().length > 0 ? (
                                                                        getCurrentItems().map((task, index) => (
                                                                            <tr key={index} className="hover-row">
                                                                                <td data-label="#">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                                <td data-label="Offer Wall">{task.offerWallName || 'N/A'}</td>
                                                                                <td data-label="Offer Name">{task.offerName || 'N/A'}</td>
                                                                                <td data-label="Transaction ID">{task.transactionID || 'N/A'}</td>
                                                                                <td data-label="IP">{task.ip || 'N/A'}</td>
                                                                                <td data-label="Country">{task.country || 'N/A'}</td>
                                                                                <td data-label="Amount" className="fw-bold">
                                                                                    <FontAwesomeIcon className={'me-1 gold'} icon={faCoins}/>
                                                                                    {task.currencyReward?.toFixed(2) || '0.00'}
                                                                                </td>
                                                                                <td data-label="Date">{formatDate(task.updatedAt)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={8} className="text-center py-4">
                                                                                <h3>No completed tasks</h3>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {activeTab === "pendingtasks" && (
                                                        <>
                                                            {loadingPendingTasks ? (
                                                                <tr>
                                                                    <td colSpan={8} className="text-center py-4">
                                                                        <Spinner animation="border" variant="primary" />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                <>
                                                                    {getCurrentItems().length > 0 ? (
                                                                        getCurrentItems().map((task, index) => (
                                                                            <tr key={index} className="hover-row">
                                                                                <td data-label="#">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                                <td data-label="Offer Wall">{task.offerWallName || 'N/A'}</td>
                                                                                <td data-label="Offer Name">{task.offerName || 'N/A'}</td>
                                                                                <td data-label="Transaction ID">{task.transactionID || 'N/A'}</td>
                                                                                <td data-label="IP">{task.ip || 'N/A'}</td>
                                                                                <td data-label="Country">{task.country || 'N/A'}</td>
                                                                                <td data-label="Amount" className="text-warning fw-bold">
                                                                                    <FontAwesomeIcon className={'me-1 gold'} icon={faCoins}/>
                                                                                    {task.currencyReward?.toFixed(2) || '0.00'}
                                                                                </td>
                                                                                <td data-label="Date">{formatDate(task.updatedAt)}</td>
                                                                                <td data-label="Date">{formatDate(task.releaseDate)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={9} className="text-center py-4">
                                                                                <h3>No pending tasks</h3>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {activeTab === "withdrawals" && (
                                                        <>
                                                            {loadingWithdrawals ? (
                                                                <tr>
                                                                    <td colSpan={7} className="text-center py-4">
                                                                        <Spinner animation="border" variant="primary" />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                <>
                                                                    {getCurrentItems().length > 0 ? (
                                                                        getCurrentItems().map((withdrawal, index) => (
                                                                            <tr key={index} className="hover-row">
                                                                                <td data-label="#">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                                <td data-label="Wallet Name">{withdrawal.walletName || 'N/A'}</td>
                                                                                <td data-label="Wallet Address" className="text-truncate" style={{maxWidth: '150px'}}>
                                                                                    {withdrawal.walletAddress || 'N/A'}
                                                                                </td>
                                                                                <td data-label="Transaction ID">{withdrawal.transactionId || 'N/A'}</td>
                                                                                <td data-label="Amount" className="fw-bold">
                                                                                    <FontAwesomeIcon className={'me-1 gold'} icon={faCoins}/>
                                                                                    {withdrawal.amount?.toFixed(2) || '0.00'}
                                                                                </td>
                                                                                <td data-label="Status">
                                                                                    {withdrawal.status === "pending" ? (
                                                                                        <Badge bg="warning" className="text-dark py-2 px-3 rounded-1">{withdrawal.status}</Badge>
                                                                                    ) : withdrawal.status === "completed" ? (
                                                                                        <Badge bg="success" className={"py-2 px-3 rounded-1"}>{withdrawal.status}</Badge>
                                                                                    ) : withdrawal.status === "refunded" ? (
                                                                                        <Badge bg="danger" className={"py-2 px-3 rounded-1"}>{withdrawal.status}</Badge>
                                                                                    ) : (
                                                                                        <Badge bg="dark" className={"py-2 px-3 rounded-1"}>{withdrawal.status}</Badge>
                                                                                    )}
                                                                                </td>
                                                                                <td data-label="Date">{formatDate(withdrawal.updatedAt)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={7} className="text-center py-4">
                                                                                <h3>No withdrawals</h3>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {activeTab === "chargebacks" && (
                                                        <>
                                                            {loadingChargebacks ? (
                                                                <tr>
                                                                    <td colSpan={7} className="text-center py-4">
                                                                        <Spinner animation="border" variant="primary" />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                <>
                                                                    {getCurrentItems().length > 0 ? (
                                                                        getCurrentItems().map((chargeback, index) => (
                                                                            <tr key={index} className="hover-row">
                                                                                <td data-label="#">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                                <td data-label="Offer Wall">{chargeback.offerWallName || 'N/A'}</td>
                                                                                <td data-label="Offer Name">{chargeback.offerName || 'N/A'}</td>
                                                                                <td data-label="Transaction ID">{chargeback.transactionID || 'N/A'}</td>
                                                                                <td data-label="IP">{chargeback.ip || 'N/A'}</td>
                                                                                <td data-label="Country">{chargeback.country || 'N/A'}</td>
                                                                                <td data-label="Amount" className="fw-bold">
                                                                                    <FontAwesomeIcon className={'me-1 gold'} icon={faCoins}/>
                                                                                    {chargeback.currencyReward?.toFixed(2) || '0.00'}
                                                                                </td>
                                                                                <td data-label="Date">{formatDate(chargeback.updatedAt)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={8} className="text-center py-4">
                                                                                <h3>No chargebacks</h3>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    </tbody>
                                                </Table>
                                            </div>

                                            {getTotalPages() > 1 && (
                                                <div className="d-flex justify-content-center mt-4">
                                                    <Pagination>
                                                        <Pagination.Prev
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                        />
                                                        {Array.from({ length: getTotalPages() }, (_, i) => (
                                                            <Pagination.Item
                                                                key={i + 1}
                                                                active={i + 1 === currentPage}
                                                                onClick={() => setCurrentPage(i + 1)}
                                                            >
                                                                {i + 1}
                                                            </Pagination.Item>
                                                        ))}
                                                        <Pagination.Next
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                                                            disabled={currentPage === getTotalPages()}
                                                        />
                                                    </Pagination>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <UserDetailsModal
                isModalOpen={isUserModalOpen}
                userDetails={userDetails}
                closeModal={toggleUserModal}
                onSave={handleSaveUserDetails}
            />
            <Footer />
        </>
    );
}

export default ProfilePage;