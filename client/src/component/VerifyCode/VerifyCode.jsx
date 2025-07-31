import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./VefrifyCode.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import ZedStore from "../zedstore/ZedStore.jsx";

const VerifyCode = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loginLoading, setLoginLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();

    const getEmailFromSession = () => sessionStorage.getItem("email");

    useEffect(() => {
        // Redirect if already verified
        if (sessionStorage.getItem("isVerified") === "true") {
            navigate("/");
            return;
        }

        // Redirect if no email in session
        if (!getEmailFromSession()) {
            toast.error("No verification session found");
            navigate("/");
            return;
        }

        // Set timeout for 10 minutes (600000 milliseconds)
        const sessionTimeout = setTimeout(() => {
            sessionStorage.removeItem("email");
            setSessionExpired(true);
            toast.error("Session timeout. Please register again.");
        }, 600000);

        // Start the initial countdown for resend OTP
        startCountdown();

        // Clear the timeout if component unmounts
        return () => {
            clearTimeout(sessionTimeout);
            clearInterval(countdownInterval);
        };
    }, [navigate]);

    let countdownInterval;

    const startCountdown = () => {
        setCanResend(false);
        setCountdown(60);
        countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleInputChange = (e, index) => {
        if (sessionExpired) return;

        const newCode = [...code];
        newCode[index] = e.target.value.slice(-1);
        setCode(newCode);
        if (e.target.value && index < 5) {
            document.getElementById(`input-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (sessionExpired) return;

        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`input-${index - 1}`).focus();
        }
    };

    const submittedData = async (e) => {
        e.preventDefault();
        if (sessionExpired) {
            toast.error("Session expired. Please register again.");
            return;
        }

        if (code.some((char) => char === "")) {
            toast.error("Please complete the verification code.");
            return;
        }
        const email = getEmailFromSession();
        if (!email) {
            toast.error("Session expired. Please register again.");
            navigate("/");
            return;
        }
        const verificationCode = code.join("");
        setLoginLoading(true);

        try {
            const { data: result } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/verify`, { email, otp: verificationCode },{
                withCredentials:true,
            });
            if (result.status === "success") {
                toast.success("Email verified successfully");
                sessionStorage.removeItem("email");
                sessionStorage.setItem("isVerified", "true");
                Cookies.set("token", result.token, { expires: 30, secure: true });
                await ZedStore.getState().setToken(result.token);
                await ZedStore.getState().userDetailsRequested();
                navigate("/profile");
            } else {
                toast.error(result.message || "Invalid verification code");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (sessionExpired) {
            toast.error("Session expired. Please register again.");
            return;
        }

        const email = getEmailFromSession();
        if (!email) {
            toast.error("No verification session found");
            navigate("/");
            return;
        }

        setResendLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/resend-otp`, { email },{
                withCredentials:true,
            });
            toast.success(response.data.message || "OTP has been resent successfully!");
            startCountdown(); // Restart the countdown after resending
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResendLoading(false);
        }
    };

    if (sessionExpired) {
        return (
            <div className="container">
                <div className="row">
                    <div className="offset-md-4 col-md-4">
                        <div className={styles.verify_code_container}>
                            <div className={styles.verify_code_box}>
                                <h2 className="text-center pb-3 fa-3x fw-semibold">Session Expired</h2>
                                <p className="text-center">Your verification session has expired.</p>
                                <p className="text-center">Please register again to continue.</p>
                                <button
                                    className="btn custom-btn mt-3 w-100"
                                    onClick={() => navigate("/register")}
                                >
                                    Go to Registration
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row">
                <div className="offset-md-4 col-md-4">
                    <div className={styles.verify_code_container}>
                        <div className={styles.verify_code_box}>
                            <h2 className="text-center pb-3 fa-3x fw-semibold">Verify Email</h2>
                            <p className="text-center">6 digit verification code sent to your email address</p>
                            <p className="text-center fw-bold green">{getEmailFromSession()}</p>
                            <form onSubmit={submittedData}>
                                <div className="d-flex justify-content-between">
                                    {code.map((_, index) => (
                                        <input
                                            key={index}
                                            id={`input-${index}`}
                                            type="text"
                                            maxLength="1"
                                            className={`${styles.code_input} form-control text-center mx-1`}
                                            value={code[index]}
                                            onChange={(e) => handleInputChange(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            required
                                            aria-label={`Enter OTP digit ${index + 1}`}
                                            placeholder="-"
                                            disabled={sessionExpired}
                                        />
                                    ))}
                                </div>
                                <div className="login-btn">
                                    <button
                                        type="submit"
                                        className="btn custom-btn mt-3 w-100"
                                        disabled={loginLoading || sessionExpired}
                                    >
                                        {loginLoading ? "Verifying..." : "Verify"}
                                    </button>
                                </div>
                            </form>
                            <p className="text-center mt-3">
                                {canResend ? (
                                    <>
                                        Didn't receive the code?{" "}
                                        <button
                                            type="button"
                                            className="btn btn-link"
                                            onClick={handleResendCode}
                                            disabled={resendLoading || sessionExpired}
                                        >
                                            {resendLoading ? "Resending..." : "Resend"}
                                        </button>
                                    </>
                                ) : (
                                    `Resend OTP in ${countdown}s`
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;