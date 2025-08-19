import React, {useEffect, useState, useCallback, useRef} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import styles from "./LiveChat.module.css";
import ZedStore from "../zedstore/ZedStore.jsx";
import axios from "axios";
import Cookies from "js-cookie";

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const toggleLoginPopup = ZedStore((state) => state.toggleLoginPopup);
    const { userDetails, userDetailsRequested } = ZedStore();
    const token = Cookies.get("token");

    useEffect(() => {
        userDetailsRequested();
    }, [userDetailsRequested]);

    const { username } = userDetails || {};

    const fetchMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/show-message`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === "success") {
                const formattedMessages = response.data.content.map(msg => ({
                    id: msg._id,
                    sender: msg.senderUsername === username ? "You" : msg.senderUsername,
                    senderUsername: msg.senderUsername,
                    text: msg.content,
                    time: msg.createdAt,
                    isCurrentUser: msg.senderUsername === username
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    }, [token, username]);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen, fetchMessages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async () => {
        if (input.trim() === "" || !userDetails || isSending) return;

        try {
            setIsSending(true);
            setError(null);
            const tempId = Date.now().toString();

            // Optimistic update
            setMessages(prev => [...prev, {
                id: tempId,
                sender: "You",
                senderUsername: username,
                text: input,
                time: new Date(),
                isCurrentUser: true
            }]);
            setInput("");

            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/send-message`,
                {
                    content: input,
                    senderUsername: username
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.slice(0, -1));
            setError("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
                <FontAwesomeIcon icon={faMessage} />
            </button>

            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
            )}

            <div className={`${styles.chatPanel} ${isOpen ? styles.open : ""}`}>
                <div className={styles.header}>
                    <h4> Chat Box</h4>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        ✕
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.messages}>
                    {isLoading ? (
                        <div className="text-center">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="d-flex align-items-center justify-content-center h-100">
                            No messages yet
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${styles.message} ${
                                        msg.isCurrentUser ? styles.sent : styles.received
                                    } bordered-dark`}
                                >
                                    <div className="d-flex align-items-center justify-content-start">
                                        <small className={styles.sender}>{msg.sender} - </small>
                                        <p className={"ms-2 mb-0"}>{msg.text}</p>
                                    </div>
                                    <p className={styles.chat_time}>
                                        {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {!userDetails ? (
                    <button
                        className="text-white text-decoration-none bg-danger rounded home-profile-btn mt-4 w-100"
                        onClick={() => toggleLoginPopup(true)}
                    >
                        Login to send message
                    </button>
                ) : (
                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={isSending}
                            maxLength={500}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isSending || input.trim() === ""}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}