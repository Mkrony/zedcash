import styles from "./SupportEmail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPaperPlane, faUser, faEnvelope, faHeading } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import LoveAnimation from "../Animations/LoveAnimation.jsx";

const SupportEmail = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.message.trim()) newErrors.message = "Message is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/send-support-message`,
                formData,
                {withCredentials: true}
            );

            if (response.data.status !== "success") {
                toast.error(response.data.message || "Failed to send message");
                return;
            }

            toast.success("Message sent successfully!");
            setIsSubmitted(true);
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "An error occurred while sending your message"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modal_container}>
            <div className={styles.modal_outer_div} onClick={onClose}></div>
            <div className={styles.modal_content}>
                <button
                    title="Close"
                    onClick={onClose}
                    className={styles.modal_close_btn}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                {isLoading ? (
                    <div className={styles.loader}>
                        <LoveAnimation />
                        <h2 className="text-center">Sending your message...</h2>
                    </div>
                ) : isSubmitted ? (
                    <div className={styles.success_message}>
                        <div className={styles.success_icon}>
                            <FontAwesomeIcon icon={faPaperPlane} size="3x" />
                        </div>
                        <h2>Message Sent Successfully!</h2>
                        <p>Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                ) : (
                    <div className={styles.email_body}>
                        <div className={styles.form_header}>
                            <h2>Email To Admin</h2>
                            <p>Have questions? Fill out the form below and we'll get back to you.</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.email_form}>
                            <div className={styles.form_group}>
                                <label htmlFor="name">
                                    <FontAwesomeIcon icon={faUser} className={styles.input_icon} />
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className={`${styles.form_input} ${errors.name ? styles.input_error : ''} custom-input w-100`}
                                />
                                {errors.name && <span className={styles.error_message}>{errors.name}</span>}
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="email">
                                    <FontAwesomeIcon icon={faEnvelope} className={styles.input_icon} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={`${styles.form_input} ${errors.email ? styles.input_error : ''} custom-input w-100`}
                                />
                                {errors.email && <span className={styles.error_message}>{errors.email}</span>}
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="subject">
                                    <FontAwesomeIcon icon={faHeading} className={styles.input_icon} />
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="What's this about?"
                                    className={`${styles.form_input} ${errors.subject ? styles.input_error : ''} custom-input w-100`}
                                />
                                {errors.subject && <span className={styles.error_message}>{errors.subject}</span>}
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="message">Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we help you?"
                                    rows="5"
                                    className={`${styles.form_textarea} ${errors.message ? styles.input_error : ''} custom-input w-100`}
                                ></textarea>
                                {errors.message && <span className={styles.error_message}>{errors.message}</span>}
                            </div>

                            <button type="submit" className={styles.submit_btn} disabled={isLoading}>
                                <FontAwesomeIcon icon={faPaperPlane} className={styles.btn_icon} />
                                {isLoading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportEmail;