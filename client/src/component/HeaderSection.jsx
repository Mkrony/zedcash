import {
    faBell,
    faCoins,
    faHandHoldingDollar,
    faMoneyBillTransfer,
    faUserPlus,
    faUser as faUserRegular
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../assets/css/headercss.css";
import LoginPopup from "./login/LoginPopup.jsx";
import zedStore from "./zedstore/ZedStore.jsx";

function HeaderSection() {
    const token = Cookies.get("token");
    const {
        userDetails,
        userDetailsRequested,
        toggleLoginPopup,
        userNotifications,
        fetchUserNotifications,
        markNotificationAsRead
    } = zedStore();

    const { avatar, username, balance, level } = userDetails || {};
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize user details
    useEffect(() => {
        if (token) {
            userDetailsRequested();
        }
    }, [token, userDetailsRequested]);

    // Update unread count when notifications change
    useEffect(() => {
        if (userNotifications) {
            const count = userNotifications.filter(n => !n.isRead).length;
            setUnreadCount(count);
        }
    }, [userNotifications]);

    const handleNavigation = (e) => {
        if (!userDetails) {
            e.preventDefault();
            toggleLoginPopup(true);
        }
    };

    const toggleNotificationPanel = async () => {
        const newState = !showNotifications;
        setShowNotifications(newState);

        if (newState) {
            setLoadingNotifications(true);
            try {
                await fetchUserNotifications();
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoadingNotifications(false);
            }
        }
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.notification-area')) {
            setShowNotifications(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const formatTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const sortedNotifications = [...(userNotifications || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification._id);
                const updatedNotifications = userNotifications.map(n =>
                    n._id === notification._id ? {...n, isRead: true} : n
                );
                zedStore.setState({ userNotifications: updatedNotifications });
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
    };

    return (
        <header className="header">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-md-3 col-3">
                        <Link to="/">
                            <img className="logo" src="/img/logo.png" alt="logo" />
                        </Link>
                    </div>
                    <div className="col-md-9 col-9">
                        {userDetails ? (
                            <div className="right-header">
                                <div className="right-navigation">
                                    <ul>
                                        <li>
                                            <NavLink
                                                className={({isActive}) => (isActive ? "active_nav" : "")}
                                                to="/earn"
                                                onClick={handleNavigation}
                                            >
                                                <span className="me-1">
                                                    <FontAwesomeIcon icon={faHandHoldingDollar} />
                                                </span>
                                                <span className="res-none">Earn</span>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                className={({isActive}) => (isActive ? "active_nav" : "")}
                                                to="/cashout"
                                                onClick={handleNavigation}
                                            >
                                                <span className="me-1">
                                                    <FontAwesomeIcon icon={faMoneyBillTransfer} />
                                                </span>
                                                <span className="res-none">Cashout</span>
                                            </NavLink>
                                        </li>
                                    </ul>
                                </div>
                                <div className="header-profile-nav">
                                    <div className="dropdown">
                                        <button
                                            className="btn text-white dropdown-toggle header-profile-btn p-1 px-md-3"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <span className="res-none">
                                                <FontAwesomeIcon className={'gold'} icon={faCoins} />
                                            </span>
                                            <span className="header-balance">
                                                <span className="big-none">
                                                    ${balance/1000}
                                                </span>
                                                <span className="res-none">
                                                    {balance.toLocaleString()}
                                                </span>
                                            </span>
                                            <span className="header-avatar">
                                                <img
                                                    className={"rounded-circle p-1 bordered"}
                                                    width={"30"}
                                                    height={"30"}
                                                    src={avatar || "/img/avatar.png"}
                                                    alt="User Avatar"
                                                />
                                            </span>
                                        </button>
                                        <ul className="dropdown-menu header-profile-nab-body">
                                            <li className={"text-center"}>
                                                <img
                                                    className={"rounded-circle p-2 bordered"}
                                                    src={avatar || "/img/avatar.png"}
                                                    alt="User Avatar"
                                                />
                                            </li>
                                            <li className={"text-center"}>
                                                <h5>{username}</h5>
                                            </li>
                                            <li>
                                                <NavLink to="/profile" className="dropdown-item">
                                                    Profile
                                                </NavLink>
                                            </li>
                                            {userDetails.role === "admin" && (
                                                <>
                                                    <li>
                                                        <NavLink to="/admin-panel" className="dropdown-item">
                                                            Admin Panel
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink to="/settings" className="dropdown-item">
                                                            Settings
                                                        </NavLink>
                                                    </li>
                                                </>
                                            )}
                                            <li>
                                                <NavLink to="/logout" className="dropdown-item">
                                                    Logout
                                                </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="notification-area">
                                    <div className="notification-icon" onClick={toggleNotificationPanel}>
                                        <FontAwesomeIcon icon={faBell} />
                                        {unreadCount > 0 && (
                                            <span className="notification-badge">{unreadCount}</span>
                                        )}
                                    </div>
                                    {showNotifications && (
                                        <div className="notification-dropdown">
                                            <div className="notification-header">
                                                <h5>
                                                    Notifications <FontAwesomeIcon className={"ms-2"} icon={faBell} /> {unreadCount > 0 && `(${unreadCount} new)`}
                                                </h5>
                                            </div>
                                            <div className="notification-list">
                                                {loadingNotifications ? (
                                                    <div className="notification-loading">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                                                ) : sortedNotifications.length > 0 ? (
                                                    sortedNotifications.map(notification => (
                                                        <div
                                                            key={notification._id}
                                                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <div className="notification-message">
                                                                {notification.type === "withdrawal" || notification.type === "task_completed" ?
                                                                    <FontAwesomeIcon className={"me-2 gold"} icon={faCoins} /> :
                                                                    <FontAwesomeIcon className={"me-2 green"} icon={faBell} />}
                                                               <span> {notification.message}</span>
                                                            </div>
                                                            <div className="notification-time">
                                                                <span>{formatTime(notification.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="notification-empty">
                                                        <p>You have no notifications</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="right-navigation">
                                <ul>
                                    <li>
                                        <NavLink
                                            className={({isActive}) => (isActive ? "active_nav" : "")}
                                            to="/signin"
                                        >
                                            <span className="me-1">
                                                <FontAwesomeIcon icon={faUserRegular} />
                                            </span>
                                            <span className="res-none">Sign In</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            className={({isActive}) => (isActive ? "active_nav" : "")}
                                            to="/registration"
                                        >
                                            <span className="me-1">
                                                <FontAwesomeIcon icon={faUserPlus} />
                                            </span>
                                            <span className="res-none">Sign Up</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <LoginPopup />
        </header>
    );
}

export default HeaderSection;