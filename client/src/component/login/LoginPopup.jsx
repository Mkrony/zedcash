import LoginForm from "./LoginForm.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styled from "./LoginPopup.module.css";
import zedStore from "../zedstore/ZedStore.jsx";
import { useEffect } from "react";
import { toast } from 'react-toastify';
const LoginPopup = () => {
    const { loginPopup, toggleLoginPopup } = zedStore();

    // Close the popup when the escape key is pressed
    const handleKeyDown = (event) => {
        if (event.key === "Escape" && loginPopup) {
            toggleLoginPopup(false);
        }
    };

    useEffect(() => {
        if (loginPopup) {
            toast.error("Please login to continue");
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent scrolling when popup is open
        }

        return () => {
            // Clean up event listener and restore scrolling
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [loginPopup]);
    if (!loginPopup) return null; // Don't render if popup is not visible
    const closeLoginPopup = () => {
        toggleLoginPopup(false);
    };
    return (
        <div className={styled.modal_container}>
            <div
                className={styled.modal_outer_div}
                onClick={closeLoginPopup} // Close popup when clicking outside content
            ></div>
            <div className={styled.modal_content}>
                <button
                    title="Close"
                    onClick={closeLoginPopup}
                    className={styled.modal_close_btn}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_body}>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;
