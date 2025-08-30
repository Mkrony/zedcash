import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import styles from './PassResetPage.module.css';
import { useNavigate } from "react-router-dom";
import HeaderSection from "../HeaderSection.jsx";
import Footer from "../footer/Footer.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function PassResetPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Check if user has permission to access this page
    useEffect(() => {
        const resetEmail = localStorage.getItem('resetEmail');
        if (!resetEmail) {
            toast.error("You need to verify OTP first");
            navigate("/confirm-otp");
            return;
        }
        setEmail(resetEmail);
    }, [navigate]);

    const submit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        // Check for password complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(password)) {
            toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/reset-password`,
                { email, password },
                { withCredentials: true }
            );

            if(response.data.status === "success"){
                toast.success("Password reset successfully!");
                localStorage.removeItem('resetEmail');
                navigate("/signin");
            }
        } catch(err) {
            toast.error(err.response?.data?.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <>
                <HeaderSection/>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <p>Redirecting...</p>
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
                        <FontAwesomeIcon className={styles.icon} icon={faLock} />
                        <h2 className={styles.title}>Set New Password</h2>
                        <p className={styles.subtitle}>
                            Create a new password for your account
                        </p>
                    </div>

                    <form onSubmit={submit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <FontAwesomeIcon className={styles.inputIcon} icon={faLock} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} custom-input`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon
                                    className={`${styles.eye_icon} cursor-pointer`}
                                    icon={showPassword ? faEyeSlash : faEye}
                                />
                            </button>
                        </div>

                        <div className={styles.inputGroup}>
                            <FontAwesomeIcon className={styles.inputIcon} icon={faLock} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`${styles.input} custom-input`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <FontAwesomeIcon
                                    className={`${styles.eye_icon} cursor-pointer`}
                                    icon={showConfirmPassword ? faEyeSlash : faEye}
                                />
                            </button>
                        </div>

                        <div className={styles.passwordRequirements}>
                            <p>Password must:</p>
                            <ul>
                                <li className={password.length >= 8 ? styles.valid : ''}>Be at least 8 characters long</li>
                                <li className={/(?=.*[a-z])/.test(password) ? styles.valid : ''}>Contain a lowercase letter</li>
                                <li className={/(?=.*[A-Z])/.test(password) ? styles.valid : ''}>Contain an uppercase letter</li>
                                <li className={/(?=.*\d)/.test(password) ? styles.valid : ''}>Contain a number</li>
                                <li className={/(?=.*[@$!%*?&])/.test(password) ? styles.valid : ''}>Contain a special character</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.button} ${isLoading ? styles.loading : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Resetting Password...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheckCircle} /> Reset Password
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.footerNote}>
                        <p>Make sure your password is strong and unique.</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}
