import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ConfirmOtpPage.module.css";
import axios from "axios";
import HeaderSection from "../HeaderSection.jsx";
import Footer from "../footer/Footer.jsx";

const ConfirmOtpPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has permission to access this page
        const resetEmail = localStorage.getItem('resetEmail');
        if (!resetEmail) {
            toast.error("You need to request a password reset first");
            navigate("/forgot-password");
            return;
        }
        setEmail(resetEmail);

        // Set timeout for 10 minutes (600000 milliseconds)
        const sessionTimeout = setTimeout(() => {
            localStorage.removeItem('resetEmail');
            setSessionExpired(true);
            toast.error("Session expired. Please request a new password reset.");
        }, 600000);

        // Start the initial countdown for resend OTP
        startCountdown();

        // Clear the timeout if component unmounts
        return () => {
            clearTimeout(sessionTimeout);
            if (countdownInterval) clearInterval(countdownInterval);
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
            toast.error("Session expired. Please request a new password reset.");
            return;
        }

        if (code.some((char) => char === "")) {
            toast.error("Please complete the verification code.");
            return;
        }

        if (!email) {
            toast.error("Session expired. Please request a new password reset.");
            navigate("/forgot-password");
            return;
        }

        const verificationCode = code.join("");
        setVerifyLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`,
                { email, otp: verificationCode },
                { withCredentials: true }
            );

            if (response.data.status === "success") {
                toast.success("OTP verified successfully");
                // Navigate to password reset page
                navigate("/reset-password");
            } else {
                toast.error(response.data.message || "Invalid verification code");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed. Please try again.");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (sessionExpired) {
            toast.error("Session expired. Please request a new password reset.");
            return;
        }

        if (!email) {
            toast.error("No reset session found");
            navigate("/forgot-password");
            return;
        }

        setResendLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/resend-reset-otp`,
                { email },
                { withCredentials: true }
            );

            if (response.data.status === "success") {
                toast.success(response.data.message || "New OTP has been sent to your email!");
                startCountdown(); // Restart the countdown after resending
            } else {
                toast.error(response.data.message || "Failed to resend OTP");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResendLoading(false);
        }
    };

    if (sessionExpired) {
        return (
            <>
                <HeaderSection/>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <h2 className={styles.title}>Session Expired</h2>
                        <p>Your verification session has expired.</p>
                        <p>Please request a new password reset to continue.</p>
                        <button
                            className={styles.button}
                            onClick={() => navigate("/forgot-password")}
                        >
                            Go to Password Reset
                        </button>
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <HeaderSection/>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <i className={`fas fa-shield-alt ${styles.icon}`}></i>
                        <h2 className={styles.title}>Verify OTP</h2>
                        <p className={styles.subtitle}>
                            6 digit verification code sent to your email address
                        </p>
                        <p className={styles.emailText}>{email}</p>
                    </div>

                    <form onSubmit={submittedData} className={styles.form}>
                        <div className={styles.otpContainer}>
                            {code.map((_, index) => (
                                <input
                                    key={index}
                                    id={`input-${index}`}
                                    type="text"
                                    maxLength="1"
                                    className={styles.otpInput}
                                    value={code[index]}
                                    onChange={(e) => handleInputChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    required
                                    aria-label={`Enter OTP digit ${index + 1}`}
                                    placeholder="-"
                                    disabled={sessionExpired || verifyLoading}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className={`${styles.button} ${verifyLoading ? styles.loading : ''}`}
                            disabled={verifyLoading || sessionExpired}
                        >
                            {verifyLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Verifying...
                                </>
                            ) : (
                                "Verify OTP"
                            )}
                        </button>
                    </form>

                    <div className={styles.resendContainer}>
                        {canResend ? (
                            <p>
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    className={styles.resendButton}
                                    onClick={handleResendCode}
                                    disabled={resendLoading || sessionExpired}
                                >
                                    {resendLoading ? (
                                        <>
                                            <span className={styles.smallSpinner}></span>
                                            Resending...
                                        </>
                                    ) : (
                                        "Resend"
                                    )}
                                </button>
                            </p>
                        ) : (
                            <p>Resend OTP in {countdown}s</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default ConfirmOtpPage;