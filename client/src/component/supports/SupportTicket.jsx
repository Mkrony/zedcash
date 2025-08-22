import HeaderSection from "../HeaderSection.jsx";
import Footer from "../footer/Footer.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane, faUser, faUserShield} from "@fortawesome/free-solid-svg-icons";
import styles from "./SupportTicket.module.css";
import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import zedStore from "../zedstore/ZedStore.jsx";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import axios from "axios";

const SupportTicket = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTicketId, setActiveTicketId] = useState(null);

    const {userDetails, userDetailsRequested} = zedStore();

    useEffect(() => {
        if (!token) {
            navigate("/");
            toast.error("Login to continue");
            return;
        }

        userDetailsRequested();
        fetchUserTickets();
    }, [token, userDetailsRequested, navigate]);

    const fetchUserTickets = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/user-tickets`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success || response.data.status === "success") {
                const userTickets = response.data.data || response.data.tickets || [];
                setTickets(userTickets);

                // Set the first open ticket as active, or the most recent one
                const openTicket = userTickets.find(ticket => ticket.status === 'open') || userTickets[0];
                if (openTicket) {
                    setActiveTicketId(openTicket._id);
                }
            } else {
                toast.error("Failed to load tickets");
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast.error("Error fetching tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        try {
            setSending(true);

            if (activeTicketId) {
                // Reply to existing ticket
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user-reply-ticket`,
                    {
                        ticketId: activeTicketId,
                        message: message.trim()
                    },
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Reply sent successfully");
                    setMessage("");
                    fetchUserTickets();
                } else {
                    toast.error(response.data.message || "Failed to send reply");
                }
            } else {
                // Create new ticket
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/send-ticket-message/${userDetails.username}`,
                    { message: message.trim() },
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    toast.success("Ticket created successfully");
                    setMessage("");
                    fetchUserTickets();
                } else {
                    toast.error(response.data.message || "Failed to create ticket");
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error sending message");
            }
        } finally {
            setSending(false);
        }
    };

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

    // Function to combine original message with conversation replies
    const getFullConversation = (ticket) => {
        if (!ticket) return [];

        const fullConversation = [];

        // Add original message first
        fullConversation.push({
            sender: 'user',
            message: ticket.message,
            timestamp: ticket.createdAt,
            isOriginal: true
        });

        // Add all conversation replies
        if (ticket.conversation && ticket.conversation.length > 0) {
            ticket.conversation.forEach(reply => {
                fullConversation.push({
                    sender: reply.sender,
                    message: reply.message,
                    timestamp: reply.timestamp,
                    isOriginal: false
                });
            });
        }

        // Sort by timestamp to maintain chronological order
        return fullConversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    if (!token) {
        return null;
    }

    const activeTicket = tickets.find(ticket => ticket._id === activeTicketId);
    const fullConversation = activeTicket ? getFullConversation(activeTicket) : [];

    return (
        <>
            <HeaderSection/>
            <div className="container-fluid">
                <div className="row mt-5 ">
                    <div className="col-md-12">
                        <div className="page-title">
                            <h4>Support Ticket</h4>
                            <p className={'green'}>
                                Hey {userDetails?.username}, what's the problem you're facing?
                                Please describe it in the box below:
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ticket Selection */}
                {tickets.length > 0 && (
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className={styles.ticket_selector}>
                                <label className="me-2">Active Ticket:</label>
                                <select
                                    value={activeTicketId || ''}
                                    onChange={(e) => setActiveTicketId(e.target.value)}
                                    className={styles.ticket_select}
                                >
                                    {tickets.map(ticket => (
                                        <option key={ticket._id} value={ticket._id}>
                                            Ticket #{ticket._id.substring(0, 8)} - {ticket.status} - {formatDate(ticket.createdAt)}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className={styles.new_ticket_btn}
                                    onClick={() => setActiveTicketId(null)}
                                >
                                    + New Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-12">
                        <div className={styles.ticket_conversation}>
                            {loading && tickets.length === 0 ? (
                                <div className="text-center">Loading tickets...</div>
                            ) : !activeTicketId ? (
                                <div className="text-center text-info">
                                    Create a new support ticket by typing your message below.
                                </div>
                            ) : fullConversation.length === 0 ? (
                                <div className="text-center text-info">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                fullConversation.map((msg, index) => (
                                    <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.user_message : styles.admin_message}`}>
                                        <div className={styles.message_content}>
                                            <div className={styles.message_header}>
                                                <FontAwesomeIcon
                                                    icon={msg.sender === 'user' ? faUser : faUserShield}
                                                    className={styles.sender_icon}
                                                />
                                                <span className={styles.sender_name}>
                                                    {msg.sender === 'user' ? 'You' : 'Support Team'}
                                                    {msg.isOriginal && <span className={styles.original_badge}> (Original)</span>}
                                                </span>
                                                <span className={styles.message_time}>
                                                    {formatDate(msg.timestamp)}
                                                </span>
                                            </div>
                                            <p className={"m-0 p-0"}>{msg.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className={styles.form_body}>
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    name="message"
                                    placeholder={activeTicketId ? "Type your reply here..." : "Brief description of your issue"}
                                    rows="5"
                                    className="form-control"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={sending}
                                ></textarea>
                                <div className="form-submit text-center my-5">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={sending || !message.trim()}
                                    >
                                        {sending ? "Sending..." : (activeTicketId ? "Send Reply" : "Create Ticket")}
                                        <FontAwesomeIcon icon={faPaperPlane} className="ms-2" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default SupportTicket;