import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCoins,
    faWallet,
    faUsers,
    faQuestionCircle,
    faCog,
    faTachometerAlt,
    faEnvelope,
    faSignOutAlt,
    faCircleRight,
    faChevronDown,
    faChevronUp, faUser
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ReactCountryFlag from "react-country-flag";
import { byCountry } from "country-code-lookup";
import zedStore from "../zedstore/ZedStore.jsx";
import styled from "./Sidebar.module.css";

const DropdownMenu = ({ icon, label, items, isAdminMenu = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styled.dropdown} ${isAdminMenu ? styled.admin_dropdown : ''}`}>
            <button
                className={`${styled.dropdown_toggle} w-100 text-start d-flex justify-content-between align-items-center`}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={`${label} Menu`}
            >
                <span>
                    <FontAwesomeIcon icon={icon} className="me-2" />
                    {label}
                </span>
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
            </button>
            <ul className={`${styled.dropdown_menu} ${isOpen ? styled.show : ''}`}>
                {items.map((item, index) => (
                    <li key={index}>
                        <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                                `${styled.dropdown_item} ${isActive ? styled.active_nav : ''}`
                            }
                            end
                        >
                            <FontAwesomeIcon icon={item.icon} className="me-2" />
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Sidebar = () => {
    const token = Cookies.get("token");
    const { userDetails, userDetailsRequested, toggleLoginPopup } = zedStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            setLoading(true);
            userDetailsRequested()
                .then(() => setLoading(false))
                .catch((err) => {
                    setError(err.message || "An error occurred");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token, userDetailsRequested]);

    const handleNavigation = (e) => {
        if (!userDetails) {
            e.preventDefault();
            toggleLoginPopup(true);
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        navigate("/logout");
    };

    // Skeleton loading component
    const SidebarSkeleton = () => (
        <div className={styled.sidebar}>
            <div className={styled.skeleton_user_info}>
                <div className={styled.skeleton_flag}></div>
                <div className={styled.skeleton_username}></div>
                <div className={styled.skeleton_balance}></div>
            </div>

            <nav className={styled.nav_menu}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={styled.skeleton_nav_link}></div>
                ))}
            </nav>

            <div className={styled.skeleton_footer}>
                <div className={styled.skeleton_country}></div>
                <div className={styled.skeleton_logout}></div>
            </div>
        </div>
    );

    if (loading) {
        return <SidebarSkeleton />;
    }

    if (error) {
        return (
            <div className={`${styled.sidebar} ${styled.error_state}`}>
                <p className={styled.error_message}>{error}</p>
                <button
                    className={styled.retry_button}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    const { balance = 0, username = "Guest", country = "", role = "" } = userDetails || {};
    const isAdmin = role === "admin";
    const countryCode = country ? byCountry(country)?.iso2 || "Unknown" : "Unknown";

    return (
        <div className={styled.sidebar}>
            <div className={styled.user_info}>
                {countryCode && (
                    <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        className={styled.country_flag}
                        title={countryCode}
                    />
                )}
                <span className={styled.username}>{username} - {countryCode}</span>
                <span className={styled.balance}>
                    <FontAwesomeIcon icon={faCoins} /> {Number(balance).toLocaleString()}
                </span>
            </div>

            <nav className={styled.nav_menu}>
                <NavLink
                    to="/earn"
                    className={({ isActive }) =>
                        `${styled.nav_link} ${isActive ? styled.active_nav : ''}`
                    }
                    onClick={handleNavigation}
                >
                    <FontAwesomeIcon icon={faWallet} className="me-2" />
                    Earn
                </NavLink>
                <DropdownMenu
                    icon={faCoins}
                    label="Offers"
                    items={[
                        { to: "/all-offer", icon: faCircleRight, label: "All Offers" },
                        { to: "/game-offers", icon: faCircleRight, label: "Games" },
                    ]}
                />
                <NavLink
                    to="/cashout"
                    className={({ isActive }) =>
                        `${styled.nav_link} ${isActive ? styled.active_nav : ''}`
                    }
                    onClick={handleNavigation}
                >
                    <FontAwesomeIcon icon={faWallet} className="me-2" />
                    Cashout
                </NavLink>

                <NavLink
                    to="/top-earners"
                    className={({ isActive }) =>
                        `${styled.nav_link} ${isActive ? styled.active_nav : ''}`
                    }
                    onClick={handleNavigation}
                >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Top Earners
                </NavLink>

                <NavLink
                    to="/help-support"
                    className={({ isActive }) =>
                        `${styled.nav_link} ${isActive ? styled.active_nav : ''}`
                    }
                    onClick={handleNavigation}
                >
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                    Help & Support
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `${styled.nav_link} ${isActive ? styled.active_nav : ''}`
                    }
                    onClick={handleNavigation}
                >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                   Profile
                </NavLink>
                {isAdmin && (
                    <DropdownMenu
                        icon={faCog}
                        label="Admin"
                        items={[
                            { to: "/admin-panel", icon: faTachometerAlt, label: "Dashboard" },
                            { to: "/admin/website-settings", icon: faCog, label: "Website Settings" },
                            { to: "/admin/offerwall-settings", icon: faCoins, label: "Offerwall Settings" },
                            { to: "/admin/supports", icon: faQuestionCircle, label: "Supports" },
                            { to: "/admin/emails", icon: faEnvelope, label: "Emails" },
                        ]}
                        isAdminMenu={true}
                    />
                )}
            </nav>

            <div className={styled.sidebar_footer}>
                <button className={`${styled.country_button} btn bordered w-100 text-white mb-3`}>
                    {countryCode && (
                        <ReactCountryFlag
                            countryCode={countryCode}
                            svg
                            className={styled.country_flag}
                            title={countryCode}
                        />
                    )}
                    {country ? (
                        <span className={styled.country_name}>{country}</span>
                    ) : (
                        "Unknown"
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className={styled.logout_button}
                    aria-label="Logout"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;