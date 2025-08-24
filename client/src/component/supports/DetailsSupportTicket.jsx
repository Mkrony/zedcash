import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faTrash,
    faTicketAlt,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faUser,
    faCalendar,
    faSyncAlt,
    faPaperPlane,
    faReply
} from "@fortawesome/free-solid-svg-icons";
import styles from "./DetailsTicket.module.css";
import CirclecashAnimation from "../Animations/CirclecashAnimation.jsx";

const DetailsSupportTicket = ({
                                  ticket,
                                  onClose,
                                  onStatusChange,
                                  onDelete,
                                  onRefresh,
                                  onAdminReply,
                                  isLoading = false
                              }) => {
    const [replyMessage, setReplyMessage] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open':
                return <FontAwesomeIcon icon={faTicketAlt} className={styles.statusOpen} />;
            case 'in_progress':
                return <FontAwesomeIcon icon={faClock} className={styles.statusInProgress} />;
            case 'resolved':
                return <FontAwesomeIcon icon={faCheckCircle} className={styles.statusResolved} />;
            case 'closed':
                return <FontAwesomeIcon icon={faTimesCircle} className={styles.statusClosed} />;
            default:
                return <FontAwesomeIcon icon={faTicketAlt} />;
        }
    };

    const getStatusOptions = (currentStatus) => {
        const allStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    const handleStatusChange = (newStatus) => {
        onStatusChange(newStatus);
    };

    const handleAdminReply = async () => {
        if (!replyMessage.trim()) {
            alert("Please enter a reply message");
            return;
        }

        setIsReplying(true);
        try {
            await onAdminReply(ticket._id, replyMessage.trim());
            setReplyMessage("");
            // The parent component will handle updating the ticket data
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdminReply();
        }
    };

    // Combine original message and conversation into a single conversation array
    const getFullConversation = () => {
        const conversation = [];

        // Add the original user message as the first item
        conversation.push({
            sender: 'user',
            message: ticket.message,
            timestamp: ticket.createdAt,
            isOriginal: true
        });

        // Add all conversation replies
        if (ticket.conversation && ticket.conversation.length > 0) {
            conversation.push(...ticket.conversation.map(reply => ({
                ...reply,
                isOriginal: false
            })));
        }

        return conversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    const fullConversation = getFullConversation();

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
                    aria-label="Close ticket details"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                {isLoading ? (
                    <div className={styles.preloader}>
                        <CirclecashAnimation />
                        <h2 className="text-center">Loading Ticket...</h2>
                    </div>
                ) : (
                    <div className={styles.ticket_body}>
                        {/* Ticket header with actions */}
                        <div className={styles.ticket_header}>
                            <h2>Support Ticket #{ticket._id?.substring(0, 8)}</h2>
                            <div className={styles.user_info}>
                                <FontAwesomeIcon icon={faUser} />
                                <div>
                                    <strong>{ticket.username || 'Unknown User'}</strong>
                                    {ticket.userId && (
                                        <span className={styles.user_id}>User ID: {ticket.userId}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.current_status}>
                                {/*<span className={styles.status_label}>Current Status:</span>*/}
                                <span className={`${styles.status_badge} ${styles[ticket.status]}`}>
                                   {getStatusIcon(ticket.status)}
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className={styles.ticket_dates}>
                                <div className={styles.date_item}>
                                    <FontAwesomeIcon icon={faCalendar} />
                                    <span>Created: {formatDate(ticket.createdAt)}</span>
                                </div>
                                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                                    <div className={styles.date_item}>
                                        <FontAwesomeIcon icon={faSyncAlt} />
                                        <span>Updated: {formatDate(ticket.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.ticket_actions}>
                                <div className={styles.status_selector}>
                                    <label htmlFor="status-select">Change Status:</label>
                                    <select
                                        id="status-select"
                                        value=""
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className={styles.status_select}
                                    >
                                        <option value="">Select new status...</option>
                                        {getStatusOptions(ticket.status).map(status => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    className={`${styles.action_btn} ${styles.delete_btn}`}
                                    onClick={onDelete}
                                    aria-label="Delete ticket"
                                    title="Delete"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                        {/* Conversation History - Now includes original message and replies */}
                        <div className={styles.conversation_history}>
                            <div className={styles.conversation_container}>
                                {fullConversation.map((message, index) => (
                                    <div key={index} className={`${styles.message_bubble} ${message.sender === 'admin' ? styles.admin_message : styles.user_message}`}>
                                        <div className={styles.message_content}>
                                            <span className={styles.message_sender}>
                                                {message.sender === 'admin' ? 'Admin' : (ticket.username || 'User')}
                                                {message.isOriginal && <span className={styles.original_label}> (Original Message)</span>}
                                            </span>
                                            <p className={"m-0 p-0"}>{message.message}</p>
                                        </div>
                                        <div className={styles.message_header}>
                                            <span className={`{styles.message_time} ms-2`}>
                                                {formatDate(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Reply Section */}
                        <div className={styles.admin_reply_section}>
                            {/*<h3>*/}
                            {/*    <FontAwesomeIcon icon={faReply} className="me-2" />*/}
                            {/*    Admin Reply*/}
                            {/*</h3>*/}
                            <div className={styles.reply_input_container}>
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your reply here..."
                                    className={styles.reply_textarea}
                                    rows="3"
                                    disabled={isReplying}
                                />
                                <button
                                    onClick={handleAdminReply}
                                    disabled={isReplying || !replyMessage.trim()}
                                    className={styles.reply_button}
                                >
                                    {isReplying ? (
                                        <FontAwesomeIcon icon={faSyncAlt} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    )}
                                    {isReplying ? " Sending..." : " Send Reply"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsSupportTicket;