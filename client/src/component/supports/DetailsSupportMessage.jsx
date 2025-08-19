import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faReply,
    faTrash,
    faEnvelope,
    faEnvelopeOpen,
    faUser,
    faClock
} from "@fortawesome/free-solid-svg-icons";
import styles from "./DetalsSupport.module.css";
import CirclecashAnimation from "../Animations/CirclecashAnimation.jsx";

const DetailsSupportMessage = ({
                                   message,
                                   onClose,
                                   onStatusChange,
                                   onDelete,
                                   isLoading = false
                               }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleStatusToggle = () => {
        const newStatus = message.status === "unread" ? "read" : "unread";
        onStatusChange(newStatus);
    };

    return (
        <div className={styles.modal_container}>
            {/* Background overlay - click to close */}
            <div
                className={styles.modal_outer_div}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal content */}
            <div className={styles.modal_content}>
                {/* Close button */}
                <button
                    title="Close"
                    onClick={onClose}
                    className={styles.modal_close_btn}
                    aria-label="Close message details"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                {isLoading ? (
                    <div className={styles.preloader}>
                        <CirclecashAnimation />
                        <h2 className="text-center">Loading Message...</h2>
                    </div>
                ) : (
                    <div className={styles.email_body}>
                        {/* Message header with subject and actions */}
                        <div className={styles.message_header}>
                            <h2>{message.subject}</h2>
                            <div className={styles.message_actions}>
                                <button
                                    className={styles.action_btn}
                                    onClick={handleStatusToggle}
                                    aria-label={message.status === "unread" ? "Mark as read" : "Mark as unread"}
                                >
                                    <FontAwesomeIcon
                                        icon={message.status === "unread" ? faEnvelopeOpen : faEnvelope}
                                    />
                                    {message.status === "unread" ? "Mark as Read" : "Mark as Unread"}
                                </button>
                                <button
                                    className={`${styles.action_btn} ${styles.delete_btn}`}
                                    onClick={onDelete}
                                    aria-label="Delete message"
                                >
                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                </button>
                            </div>
                        </div>

                        {/* Message metadata */}
                        <div className={styles.message_meta}>
                            <div className={styles.sender_info}>
                                <FontAwesomeIcon icon={faUser} />
                                <div>
                                    <strong>{message.name}</strong>
                                    <span>&lt;{message.email}&gt;</span>
                                </div>
                            </div>
                            <div className={styles.message_date}>
                                <FontAwesomeIcon icon={faClock} />
                                <span>{formatDate(message.createdAt)}</span>
                            </div>
                            <div className={styles.message_status}>
                <span className={`${styles.status_badge} ${styles[message.status]}`}>
                  {message.status}
                </span>
                            </div>
                        </div>

                        {/* Message content */}
                        <div className={styles.message_content}>
                            <p>{message.message}</p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsSupportMessage;