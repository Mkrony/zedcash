import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import React, {useEffect, useState} from "react";
import styles from "./Login.module.css";
import { faEye, faEyeSlash,faUser,faLock } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Cookies from "js-cookie";
import zedStore from "../../component/zedstore/ZedStore";
import GoogleLogin from "../googleLogin/GoogleLogin.jsx";
import {NavLink} from "react-router-dom";
function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [ip, setIp] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Fetch IP
    useEffect(() => {
        const fetchIpAndCountry = async () => {
            try {
                const ipRes = await fetch("https://api.ipify.org?format=json");
                const ipData = await ipRes.json();
                setIp(ipData.ip);
            } catch (error) {
                console.error("Error fetching IP", error);
            }
        };
        fetchIpAndCountry();
    }, []);




    const loginSubmitted = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        const formData = new FormData(e.target);
        const identifier = formData.get("identifier");
        const password = formData.get("password");

        // Validate fields
        if (!identifier || !password) {
            toast.error("All fields are required.");
            setLoginLoading(false);
            return;
        }
        const userData = { identifier, password ,ip_address: ip,};
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, userData,{
                withCredentials:true,
            });
            const result = response.data;
            // Check login status
            if (result.status !== "success") {
                toast.error(result.message);
                return;
            }
            // Store token in cookies
            Cookies.set("token", result.token);
            toast.success(result.message);
            // Update the token and fetch user details via zustand store
            const { setToken, userDetailsRequested, toggleLoginPopup } = zedStore.getState();
            setToken(result.token);
            await userDetailsRequested();
            // Close the login popup after successful login
            toggleLoginPopup(false);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="loginFormBox">
            <div className={`${styles.login_body} card py-3 px-4 box-shadow`}>
                <h2 className="text-center">Sign In</h2><div className="text-center mt-1">
                <p>Don't have an account? <NavLink className="" to="/registration">
                    Create an account
                </NavLink></p>
            </div>
                <form onSubmit={loginSubmitted}>
                    {/* Identifier Input */}
                    <div className="form-group">
                        {/*<label className="form-label" htmlFor="identifier">*/}
                        {/*    Email or Username:*/}
                        {/*</label>*/}
                        <input
                            name="identifier"
                            type="text"
                            className="form-control ps-5"
                            placeholder="Username or email"
                            id="identifier"
                        />
                        <FontAwesomeIcon className={styles.username_icon} icon={faUser} />
                    </div>

                    {/* Password Input */}
                    <div className="form-group mt-3 position-relative">
                        {/*<label className="form-label" htmlFor="password">*/}
                        {/*    Password:*/}
                        {/*</label>*/}
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="form-control ps-5"
                            id="password"
                            placeholder="Password"
                        />
                        <FontAwesomeIcon className={styles.username_icon} icon={faLock} />
                        <div
                            className={styles.show_password}
                            onClick={togglePasswordVisibility}
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            <FontAwesomeIcon
                                className={`${styles.eye_icon} cursor-pointer`}
                                icon={showPassword ? faEyeSlash : faEye}
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className="login-btn">
                        <button
                            type="submit"
                            className="btn custom-btn mt-3 w-100 fw-bold"
                            disabled={loginLoading}
                        >
                            {loginLoading ? "Singing In..." : "Sign In"}
                        </button>
                        {/*<GoogleLogin/>*/}
                       <div className="text-center mt-3">
                           <p>Forgot password? <NavLink className="" to="/forgot-password">
                               Reset now
                           </NavLink></p>
                       </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
