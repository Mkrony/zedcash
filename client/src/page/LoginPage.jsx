import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderSection from "../component/HeaderSection.jsx";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import styles from "../component/login/Login.module.css";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Cookies from "js-cookie";
import zedStore from "../component/zedstore/ZedStore.jsx";
import GoogleLogin from "../component/googleLogin/GoogleLogin.jsx";
import ReCAPTCHA from "react-google-recaptcha";

function LoginPage() {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    if (token) {
        navigate("/");
    }

    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const loginSubmitted = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        const formData = new FormData(e.target);
        const identifier = formData.get("identifier");
        const password = formData.get("password");

        // Validate fields
        if (!identifier || !password) {
            toast.error("Please fill in all fields.");
            setLoginLoading(false);
            return;
        }

        // Validate reCAPTCHA
        if (!recaptchaToken) {
            toast.error("Please complete the reCAPTCHA.");
            setLoginLoading(false);
            return;
        }

        const userData = { identifier, password, recaptchaToken };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/login`,
                userData,
                { withCredentials: true }
            );
            const result = response.data;

            if (result.status !== "success") {
                toast.error(result.message || "Login failed.");
                return;
            }

            toast.success("Login successful!");
            Cookies.set("token", result.token, { expires: 30, secure: true });

            const { setToken, userDetailsRequested } = zedStore.getState();
            setToken(result.token);
            await userDetailsRequested();

            navigate("/profile");
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div>
            <HeaderSection />
            <div className="login-area d-flex align-items-center justify-content-center vh-90 animated-background">
                <div className="container">
                    <div className="row">
                        <div className="offset-md-4 col-md-4 content">
                            <div className="loginFormBox">
                                <div className={`${styles.login_body} card py-3 px-4 box-shadow`}>
                                    <h2 className="text-center">Sign In</h2>
                                    <p className="my-1 mb-3 text-center">
                                        Don't have an account?{" "}
                                        <NavLink className="" to="/registration">
                                            Create an account
                                        </NavLink>
                                    </p>
                                    <form onSubmit={loginSubmitted}>
                                        {/* Identifier Input */}
                                        <div className="form-group">
                                            <input
                                                name="identifier"
                                                type="text"
                                                className="form-control ps-5 my-3"
                                                placeholder="Username or email"
                                                id="identifier"
                                            />
                                            <FontAwesomeIcon className={styles.username_icon} icon={faUser} />
                                        </div>

                                        {/* Password Input */}
                                        <div className="form-group mt-3 position-relative">
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                className="form-control ps-5 my-3"
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

                                        {/* reCAPTCHA */}
                                        <div className="form-group mt-3 text-center">
                                            <ReCAPTCHA
                                                sitekey="6Lff1bkrAAAAAC6mqpoLInch1ThYiihe6kOnhZTy"
                                                onChange={(token) => setRecaptchaToken(token)}
                                            />
                                        </div>

                                        {/* Login Button */}
                                        <div className="login-btn">
                                            <button
                                                type="submit"
                                                className="btn custom-btn mt-4 w-100 fw-bold"
                                                disabled={loginLoading}
                                            >
                                                {loginLoading ? "Signing In..." : "Sign In"}
                                            </button>
                                            {/*<GoogleLogin/>*/}
                                            <div className="text-center mt-3">
                                                <p>
                                                    Forgot password?{" "}
                                                    <NavLink className="" to="/forgot-password">
                                                        Reset now
                                                    </NavLink>
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
