import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import styles from './ForgotPass.module.css';
import { useNavigate } from "react-router-dom";
import HeaderSection from "../HeaderSection.jsx";
import Footer from "../footer/Footer.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/request-password-reset`,
                { email },
                { withCredentials: true }
            );

            if(response.data.status === "success"){
                toast.success("OTP sent to your email!");
                // Store email in localStorage for the next step
                localStorage.setItem('resetEmail', email);
                // Redirect to OTP verification page
                navigate("/confirm-otp");
            }
        } catch(err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <HeaderSection/>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <i className={`fas fa-key ${styles.icon}`}></i>
                        <h2 className={styles.title}>Reset Password</h2>
                        <p className={styles.subtitle}>
                            Enter your email to receive a verification code
                        </p>
                    </div>

                    <form onSubmit={submit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <FontAwesomeIcon className={styles.inputIcon} icon={faEnvelope}/>
                            <input
                                type="email"
                                required
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${styles.input} custom-input`}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${styles.button}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    Send OTP
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.footerNote}>
                        <p>Check your email for the verification code</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}