import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faEnvelopeOpen,
    faTrash,
    faChevronLeft,
    faChevronRight,
    faSearch,
    faRedo
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import DetailsSupportMessage from "../../component/supports/DetailsSupportMessage.jsx";
import HeaderSection from "../../component/HeaderSection.jsx";
import Footer from "../../component/footer/Footer.jsx";
import '../../assets/css/supportMessages.css';

const AdminSupportEmails = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        read: 0
    });

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/show-support-message`,
                {
                    withCredentials: true,
                    params: {
                        page: currentPage,
                        status: filter === "all" ? undefined : filter,
                        search: searchQuery || undefined
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data?.status === "success") {
                setMessages(response.data.data);
                setTotalPages(response.data.pages || 1);
                setStats(response.data.statistics || {
                    total: 0,
                    unread: 0,
                    read: 0
                });
            } else {
                throw new Error(response.data?.message || "Failed to fetch messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [currentPage, filter, searchQuery]);

    const handleMessageClick = (message) => {
        setSelectedMessage(message);
        if (message.status === "unread") {
            updateMessageStatus(message._id, "read");
        }
    };

    const updateMessageStatus = async (id, status) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/update-support-message/${id}`,
                { status },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                fetchMessages();
                if (selectedMessage?._id === id) {
                    setSelectedMessage(prev => ({
                        ...prev,
                        status: status,
                        readAt: status === "read" ? new Date() : null
                    }));
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Failed to update message status");
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/delete-support-message/${id}`,
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                toast.success(response.data.message || "Message deleted successfully");
                if (selectedMessage?._id === id) {
                    setSelectedMessage(null);
                }
                fetchMessages(); // Refresh the message list
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.error);
        }
    };

    const toggleSelectMessage = (id, e) => {
        e.stopPropagation();
        setSelectedMessages(prev =>
            prev.includes(id)
                ? prev.filter(msgId => msgId !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedMessages.length === 0) {
            toast.warning("No messages selected");
            return;
        }

        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/bulk-support-messages`,
                {
                    ids: selectedMessages,
                    action: action === "mark_as_read" ? "read" : action
                },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                toast.success(response.data.message || "Action completed successfully");
                setSelectedMessages([]);
                fetchMessages();
            } else {
                throw new Error(response.data.message || "Action failed");
            }
        } catch (error) {
            console.error("Bulk action error:", error);
            toast.error(error.response?.data?.message || "Failed to complete bulk action");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <>
            <HeaderSection />
            <div className="container-fluid">
                <div className="row">
                    <div className="page-title my-4 mx-3">
                        <h4>
                            Inbox - <span className="total-count-email">{stats.total}</span>
                        </h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="support-messages-container">
                            <div className={`messages-list ${selectedMessage ? "with-details" : ""}`}>
                                <div className="messages-header">
                                    <div className="search-bar">
                                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search messages..."
                                            value={searchQuery}
                                            className="custom-input"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="actions-bar">
                                        <div className="left-actions">
                                            <button
                                                className={`action-btn ${selectedMessages.length > 0 ? "active" : ""}`}
                                                onClick={() => handleBulkAction("delete")}
                                                disabled={selectedMessages.length === 0}
                                                title="Delete selected"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button
                                                className={`action-btn ${selectedMessages.length > 0 ? "active" : ""}`}
                                                onClick={() => handleBulkAction("mark_as_read")}
                                                disabled={selectedMessages.length === 0}
                                                title="Mark as read"
                                            >
                                                <FontAwesomeIcon icon={faEnvelopeOpen} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={fetchMessages}
                                                title="Refresh"
                                            >
                                                <FontAwesomeIcon icon={faRedo} />
                                            </button>
                                        </div>
                                        <div className="right-actions">
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="filter-select"
                                            >
                                                <option value="all">All ({stats.total})</option>
                                                <option value="unread">Unread ({stats.unread})</option>
                                                <option value="read">Read ({stats.read})</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="loading-messages">
                                        {Array(messages.length).fill().map((_, i) => (
                                            <div key={`skeleton-${i}`} className="message-item-skeleton">
                                                <div className="skeleton-checkbox"></div>
                                                <div className="skeleton-content">
                                                    <div className="skeleton-line" style={{ width: "70%" }}></div>
                                                    <div className="skeleton-line" style={{ width: "90%" }}></div>
                                                    <div className="skeleton-line" style={{ width: "60%" }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="no-messages">
                                        <FontAwesomeIcon icon={faEnvelope} size="3x" />
                                        <p>No messages found</p>
                                    </div>
                                ) : (
                                    <div className="messages-content">
                                        {messages.map((message) => (
                                            <div
                                                key={message._id}
                                                className={`message-item ${message.status} ${selectedMessage?._id === message._id ? "active" : ""}`}
                                            >
                                                <div className="message-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMessages.includes(message._id)}
                                                        onChange={(e) => toggleSelectMessage(message._id, e)}
                                                    />
                                                </div>
                                                <div
                                                    className="message-item-content"
                                                    onClick={() => handleMessageClick(message)}
                                                    role="button"
                                                    tabIndex="0"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleMessageClick(message)}
                                                >
                                                    <div className="message-sender">
                                                        {message.status === "unread" ? (
                                                            <FontAwesomeIcon icon={faEnvelope} className="unread-icon" />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faEnvelopeOpen} className="read-icon" />
                                                        )}
                                                        <span>{message.name}</span>
                                                    </div>
                                                    <div className="message-preview">
                                                        <div className="message-subject">{message.subject}</div>
                                                        <div className="message-excerpt">
                                                            {message.message.substring(0, 100)}...
                                                        </div>
                                                    </div>
                                                    <div className="message-date">{formatDate(message.createdAt)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="messages-footer">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        aria-label="Previous page"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next page"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            </div>

                            {selectedMessage && (
                                <DetailsSupportMessage
                                    message={selectedMessage}
                                    onClose={() => setSelectedMessage(null)}
                                    onStatusChange={(newStatus) => updateMessageStatus(selectedMessage._id, newStatus)}
                                    onDelete={() => handleDelete(selectedMessage._id)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdminSupportEmails;