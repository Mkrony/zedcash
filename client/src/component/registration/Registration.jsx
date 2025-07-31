import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
    faUser,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Registration.module.css";
import { toast } from "react-toastify";
import cookies from "js-cookie";
import axios from "axios";
import zedStore from "../zedstore/ZedStore.jsx";

function Registration() {
    const token = cookies.get("token");
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    const [showPassword, setShowPassword] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [ip, setIp] = useState("");
    const [country, setCountry] = useState("Unknown");
    const [deviceId, setDeviceId] = useState("");
    const [deviceUserAgent, setDeviceUserAgent] = useState("");
    const navigate = useNavigate();

    // Fetch IP and Country + Generate device ID
    useEffect(() => {
        const fetchIpAndCountry = async () => {
            try {
                const ipRes = await fetch("https://api.ipify.org?format=json");
                const ipData = await ipRes.json();
                setIp(ipData.ip);

                const countryRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
                const countryData = await countryRes.json();
                setCountry(countryData.country_name || "Unknown");
            } catch (error) {
                console.error("Error fetching IP or country", error);
            }
        };

        const userAgent = navigator.userAgent;
        const deviceId = btoa(userAgent + navigator.platform);
        setDeviceUserAgent(userAgent);
        setDeviceId(deviceId);
        fetchIpAndCountry();
        toggleLoginPopup(false);
    }, []);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    const registerSubmitted = async (event) => {
        event.preventDefault();
        setSignupLoading(true);

        const formData = new FormData(event.target);
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirm-password");
        const agree = document.getElementById("rememberMe").checked;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            toast.error("All fields are required.");
            setSignupLoading(false);
            return;
        }

        if (!agree) {
            toast.error("You must agree to the Terms and Privacy Policy.");
            setSignupLoading(false);
            return;
        }

        if (username.length > 16) {
            toast.error("Username should not be more than 16 characters.");
            setSignupLoading(false);
            return;
        }

        if (username.length < 4) {
            toast.error("Username should be at least 4 characters.");
            setSignupLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Password and confirm password do not match.");
            setSignupLoading(false);
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            toast.error("Please enter a valid email address.");
            setSignupLoading(false);
            return;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        if (!passwordPattern.test(password)) {
            toast.error(
                "Password must be 8–16 characters, include uppercase, lowercase, number, and special character."
            );
            setSignupLoading(false);
            return;
        }

        const userData = {
            username,
            email,
            password,
            ip_address: ip,
            country,
            device_id: deviceId,
            user_agent: deviceUserAgent,
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/registration`, userData,{
                withCredentials:true,
            });

            if (response.status === 200) {
                toast.success("Verification code sent to your email.");
                sessionStorage.setItem("email", email);
                navigate("/verify");
            } else {
                toast.error(response.data.message || "Registration failed.");
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                (error?.response?.data?.errors?.[0]?.msg ?? "Server error.");
            toast.error(message);
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className={`${styles.registration_body} card py-3 px-4`}>
            <h2 className="text-center">Sign up for free</h2>
            <p className="my-1 mb-3 text-center">
                Already have an account? <NavLink to="/signin">Login</NavLink>
            </p>
            <form onSubmit={registerSubmitted}>
                <div className="form-group">
                    <input
                        name="username"
                        type="text"
                        className="form-control ps-5"
                        placeholder="Username"
                        id="username"
                    />
                    <FontAwesomeIcon className={styles.username_icon} icon={faUser} />
                </div>

                <div className="form-group">
                    <input
                        name="email"
                        type="email"
                        className="form-control ps-5 mt-3"
                        placeholder="Email"
                        id="email"
                    />
                    <FontAwesomeIcon className={styles.username_icon} icon={faEnvelope} />
                </div>

                <div className="form-group mt-3 position-relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control ps-5"
                        placeholder="Password"
                        id="password"
                    />
                    <FontAwesomeIcon className={styles.username_icon} icon={faLock} />
                    <div className={styles.show_password} onClick={togglePasswordVisibility}>
                        <FontAwesomeIcon
                            className={`${styles.eye_icon} cursor-pointer`}
                            icon={showPassword ? faEyeSlash : faEye}
                        />
                    </div>
                </div>

                <div className="form-group mt-3 position-relative">
                    <input
                        name="confirm-password"
                        type={showPassword ? "text" : "password"}
                        className="form-control ps-5"
                        placeholder="Confirm password"
                        id="confirm-password"
                    />
                    <FontAwesomeIcon className={styles.username_icon} icon={faLock} />
                </div>

                <div className={`${styles.registration_remember} form-check ps-0 mt-3 d-flex justify-content-start`}>
                    <input
                        type="checkbox"
                        defaultChecked
                        className="form-check mt-3"
                        id="rememberMe"
                    />
                    <label className="ms-3" htmlFor="rememberMe">
                        By signing up, you agree to the Terms of Service and Privacy Policy,
                        including Cookie Use.
                    </label>
                </div>

                <button
                    type="submit"
                    className={`${styles.regi_btn} btn custom-btn mt-3 w-100 regi-btn py-2 fw-bold`}
                    disabled={signupLoading}
                >
                    {signupLoading ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin /> Signing up...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </button>
            </form>
        </div>
    );
}

export default Registration;
