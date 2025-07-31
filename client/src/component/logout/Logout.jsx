import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import CirclecashAnimation from "../Animations/CirclecashAnimation.jsx";
import Cookies from "js-cookie";
const Logout = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // Call the backend logout route to clear the cookie
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, {}, {
                    withCredentials: true,
                });

                // Just in case: clear local/session storage
                Cookies.remove("token");
                sessionStorage.clear();
                localStorage.clear();
            } catch (error) {
                console.error("Logout failed", error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    navigate('/');
                }, 1000);
            }
        };

        handleLogout();
    }, [navigate]);

    if (loading) {
        return (
            <div className="logout-loading">
                <div className="d-flex flex-row justify-content-center align-items-center vh-100">
                    <div className="preloader d-flex flex-column justify-content-center align-items-center">
                        <CirclecashAnimation />
                        <h4>Logging you out...</h4>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Logout;
