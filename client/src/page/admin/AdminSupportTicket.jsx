import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTicketAlt,
    faTicket,
    faTrash,
    faChevronLeft,
    faChevronRight,
    faSearch,
    faRedo,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import DetailsSupportTicket from "../../component/supports/DetailsSupportTicket.jsx";
import HeaderSection from "../../component/HeaderSection.jsx";
import Footer from "../../component/footer/Footer.jsx";
import '../../assets/css/supportTicket.css';

const AdminSupportTicket = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/show-all-ticket-message`,
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
                const ticketsData = response.data.data || [];

                // Sort tickets: open first, then by creation date (newest first)
                const sortedTickets = ticketsData.sort((a, b) => {
                    if (a.status === 'open' && b.status !== 'open') return -1;
                    if (a.status !== 'open' && b.status === 'open') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setTickets(sortedTickets);
                setTotalPages(response.data.pages || 1);

                // Handle statistics - both response formats
                const responseStats = response.data.statistics || {};
                setStats({
                    total: responseStats.total || response.data.total || 0,
                    open: responseStats.open || 0,
                    in_progress: responseStats.in_progress || 0,
                    resolved: responseStats.resolved || 0,
                    closed: responseStats.closed || 0
                });
            } else {
                throw new Error(response.data?.message || "Failed to fetch tickets");
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to load tickets");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [currentPage, filter, searchQuery]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTickets();
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const updateTicketStatus = async (id, status) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/update-ticket-status/${id}`,
                { status },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                toast.success("Ticket status updated successfully");
                fetchTickets();
                if (selectedTicket?._id === id) {
                    setSelectedTicket(prev => ({
                        ...prev,
                        status: status
                    }));
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Failed to update ticket status");
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/delete-ticket/${id}`,
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                toast.success("Ticket deleted successfully");
                if (selectedTicket?._id === id) {
                    setSelectedTicket(null);
                }
                fetchTickets();
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.error || "Failed to delete ticket");
        }
    };

    // Add this function for admin replies
    // In your AdminSupportTicket component, modify the handleAdminReply function:
    const handleAdminReply = async (ticketId, message) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin-reply-ticket`,
                {
                    ticketId,
                    message
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

                // Update the tickets state with the updated ticket
                setTickets(prevTickets =>
                    prevTickets.map(ticket =>
                        ticket._id === ticketId
                            ? response.data.ticket // Use the updated ticket from backend
                            : ticket
                    )
                );

                // Also update the selectedTicket if it's the one being replied to
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(response.data.ticket);
                }

                return response.data;
            } else {
                throw new Error(response.data.message || "Failed to send reply");
            }
        } catch (error) {
            console.error("Error sending admin reply:", error);
            toast.error(error.response?.data?.message || "Failed to send reply");
            throw error;
        }
    };

    const toggleSelectTicket = (id, e) => {
        e.stopPropagation();
        setSelectedTickets(prev =>
            prev.includes(id)
                ? prev.filter(ticketId => ticketId !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedTickets.length === 0) {
            toast.warning("No tickets selected");
            return;
        }

        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/bulk-tickets-action`,
                {
                    ids: selectedTickets,
                    action: action
                },
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                toast.success(response.data.message || "Bulk action completed successfully");
                fetchTickets(); // Refresh the tickets list
                setSelectedTickets([]); // Clear selection
            } else {
                throw new Error(response.data.message || "Action failed");
            }
        } catch (error) {
            console.error("Bulk action error:", error);
            toast.error(error.response?.data?.message || "Failed to complete bulk action");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open':
                return <FontAwesomeIcon icon={faTicketAlt} className="status-open" />;
            case 'in_progress':
                return <FontAwesomeIcon icon={faClock} className="status-in-progress" />;
            case 'resolved':
                return <FontAwesomeIcon icon={faCheckCircle} className="status-resolved" />;
            case 'closed':
                return <FontAwesomeIcon icon={faTimesCircle} className="status-closed" />;
            default:
                return <FontAwesomeIcon icon={faTicket} />;
        }
    };

    const getStatusClass = (status) => {
        return `status-${status.replace('_', '-')}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <>
            <HeaderSection />
            <div className="container-fluid">
                <div className="row">
                    <div className="page-title my-4 mx-3">
                        <h4>
                            Support Tickets - <span className="total-count">{stats.total}</span>
                        </h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="support-tickets-container">
                            <div className={`tickets-list ${selectedTicket ? "with-details" : ""}`}>
                                <div className="tickets-header">
                                    <div className="search-bar">
                                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search tickets..."
                                            value={searchQuery}
                                            className="custom-input"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="actions-bar">
                                        <div className="left-actions">
                                            <button
                                                className={`action-btn ${selectedTickets.length > 0 ? "active" : ""}`}
                                                onClick={() => handleBulkAction("delete")}
                                                disabled={selectedTickets.length === 0}
                                                title="Delete selected"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={handleRefresh}
                                                title="Refresh"
                                                disabled={refreshing}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faRedo}
                                                    className={refreshing ? "spinning" : ""}
                                                />
                                            </button>
                                        </div>
                                        <div className="right-actions">
                                            <select
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="filter-select"
                                            >
                                                <option value="all">All ({stats.total})</option>
                                                <option value="open">Open ({stats.open})</option>
                                                <option value="in_progress">In Progress ({stats.in_progress})</option>
                                                <option value="resolved">Resolved ({stats.resolved})</option>
                                                <option value="closed">Closed ({stats.closed})</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="loading-tickets">
                                        {Array(tickets.length).fill().map((_, i) => (
                                            <div key={`skeleton-${i}`} className="ticket-item-skeleton">
                                                <div className="skeleton-checkbox"></div>
                                                <div className="skeleton-content">
                                                    <div className="skeleton-line" style={{ width: "60%" }}></div>
                                                    <div className="skeleton-line" style={{ width: "80%" }}></div>
                                                    <div className="skeleton-line" style={{ width: "40%" }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : tickets.length === 0 ? (
                                    <div className="no-tickets">
                                        <FontAwesomeIcon icon={faTicketAlt} size="3x" />
                                        <p>No tickets found</p>
                                        <button
                                            className="btn btn-primary mt-2"
                                            onClick={handleRefresh}
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                ) : (
                                    <div className="tickets-content">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket._id}
                                                className={`ticket-item ${getStatusClass(ticket.status)} ${selectedTicket?._id === ticket._id ? "active" : ""}`}
                                            >
                                                <div className="ticket-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTickets.includes(ticket._id)}
                                                        onChange={(e) => toggleSelectTicket(ticket._id, e)}
                                                    />
                                                </div>
                                                <div
                                                    className="ticket-item-content"
                                                    onClick={() => handleTicketClick(ticket)}
                                                    role="button"
                                                    tabIndex="0"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTicketClick(ticket)}
                                                >
                                                    <div className="ticket-header">
                                                        <div className="ticket-status">
                                                            {getStatusIcon(ticket.status)}
                                                            <span className="status-badge">{ticket.status.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ticket-user">
                                                        <FontAwesomeIcon icon={faUser} className="me-2" />
                                                        <strong>{ticket.username || 'Unknown User'}</strong>
                                                    </div>
                                                    <div className="ticket-preview">
                                                        <div className="ticket-message">
                                                            {ticket.message?.substring(0, 120)}...
                                                        </div>
                                                    </div>
                                                    <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {tickets.length > 0 && (
                                    <div className="tickets-footer text-center mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark me-2"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                        </button>
                                        <span className="mx-3">Page {currentPage} of {totalPages}</span>
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark ms-2"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            aria-label="Next page"
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {selectedTicket && (
                                <DetailsSupportTicket
                                    ticket={selectedTicket}
                                    onClose={() => setSelectedTicket(null)}
                                    onStatusChange={(newStatus) => updateTicketStatus(selectedTicket._id, newStatus)}
                                    onDelete={() => handleDelete(selectedTicket._id)}
                                    onRefresh={fetchTickets}
                                    onAdminReply={handleAdminReply}
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

export default AdminSupportTicket;