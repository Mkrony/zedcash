import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCheck, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";
import styled from "./allwithdrawalspopup.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import SelectedUserWithdrawals from "./SelectedUserWithdrawals.jsx";
import SelectedUserCompletedTasks from "../tasks/SelectedUserCompletedTasks.jsx";
import CashoutAnimation from "../../Animations/CashoutAnimation.jsx";
import zedStore from "../../zedstore/ZedStore.jsx";

const PendingWithdrawalsPopUp = ({ showModal, closeModal, pendingWithdrawals, fetchAllWithdrawals }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [withdrawalsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [smallloading, setSmallLoading] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [selectedUserWithdrawals, setSelectedUserWithdrawals] = useState(null);
    const [selectedUserCompletedTasks, setSelectedUserCompletedTasks] = useState(null);
    const [userStatuses, setUserStatuses] = useState({});

    const {
        getTodayChargeback,
        getTotalChargeback,
        getTotalRevenues,
        getTodayRevenues,
        getTotalPendingRevenues,
        gettodayPendingRevenues,
        getAllChargeback,
        getUserChargeback,
        getAllPendingTasks,
        getAllCompletedOffers,
        getAllUsers,
    } = zedStore();

    useEffect(() => {
        const fetchUserStatuses = async () => {
            const statusPromises = pendingWithdrawals.map(async (withdrawal) => {
                try {
                    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userbyid/${withdrawal.userId}`,{
                        withCredentials:true,
                    });
                    return { userId: withdrawal.userId, status: data.user.isBanned ? "banned" : "active" };
                } catch {
                    return { userId: withdrawal.userId, status: "unknown" };
                }
            });

            const statusesArray = await Promise.all(statusPromises);
            const statuses = Object.fromEntries(statusesArray.map(({ userId, status }) => [userId, status]));
            setUserStatuses(statuses);
        };

        if (pendingWithdrawals.length > 0) fetchUserStatuses();
    }, [pendingWithdrawals]);

    useEffect(() => {
        if (!showModal) {
            setSelectedWithdrawal(null);
            setSelectedUserWithdrawals(null);
            setSelectedUserCompletedTasks(null);
            document.body.style.overflow = "auto";
        } else {
            document.body.style.overflow = "hidden";
        }
    }, [showModal]);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const filteredWithdrawals = pendingWithdrawals.filter((withdrawal) =>
        [withdrawal.userName, withdrawal.userId, withdrawal.amount, withdrawal.status, withdrawal.walletName, withdrawal.walletAddress, withdrawal.transactionId]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );

    const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
    const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
    const currentWithdrawals = filteredWithdrawals.slice(indexOfFirstWithdrawal, indexOfLastWithdrawal);
    const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const updateAdminStats = async () => {
        await Promise.all([
            getTodayChargeback(),
            getTotalChargeback(),
            getTotalRevenues(),
            getTodayRevenues(),
            getTotalPendingRevenues(),
            gettodayPendingRevenues(),
            getAllChargeback(),
            getUserChargeback(),
            getAllPendingTasks(),
            getAllCompletedOffers(),
            getAllUsers(),
        ]);
    };

    const approve = async (withdrawalId) => {
        try {
            setLoading(true);
            const approved = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/approvewithdrawal/${withdrawalId}`,{},{
                withCredentials:true,
            });
            if (approved.status === 200) {
                toast.success("Withdrawal approved!");
                await fetchAllWithdrawals();
                await updateAdminStats();
            }
        } catch (error) {
            toast.error("Error approving withdrawal.");
        } finally {
            setLoading(false);
        }
    };

    const refund = async (withdrawalId, withdrawalAmount) => {
        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refundwithdrawal/${withdrawalId}/${withdrawalAmount}`,{},{
                withCredentials:true,
            });
            toast.success("Withdrawal refunded!");
            await fetchAllWithdrawals();
            await updateAdminStats();
        } catch (error) {
            toast.error("Error refunding withdrawal.");
        } finally {
            setLoading(false);
        }
    };

    const reject = async (withdrawalId) => {
        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rejectwithdrawal/${withdrawalId}`,{},{
                withCredentials:true,
            });
            toast.success("Withdrawal rejected!");
            await fetchAllWithdrawals();
            await updateAdminStats();
        } catch (error) {
            toast.error("Error rejecting withdrawal.");
        } finally {
            setLoading(false);
        }
    };

    const cardRefund = async (withdrawalId, withdrawalAmount) => {
        try {
            setSmallLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refundwithdrawal/${withdrawalId}/${withdrawalAmount}`,{},{
                withCredentials:true,
            });
            toast.success("Withdrawal refunded!");
        } catch (error) {
            toast.error("Error refunding withdrawal.");
        } finally {
            setSmallLoading(false);
            setSelectedWithdrawal(null);
        }
    };

    const cardApprove = async (withdrawalId) => {
        try {
            setSmallLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/approvewithdrawal/${withdrawalId}`,{},{
                withCredentials:true,
            });
            toast.success("Withdrawal approved!");
            await fetchAllWithdrawals();
        } catch (error) {
            toast.error("Error approving withdrawal.");
        } finally {
            setSmallLoading(false);
            setSelectedWithdrawal(null);
        }
    };

    const cardReject = async (withdrawalId) => {
        try {
            setSmallLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rejectwithdrawal/${withdrawalId}`,{},{
                withCredentials:true,
            });
            toast.success("Withdrawal rejected!");
        } catch (error) {
            toast.error("Error rejecting withdrawal.");
        } finally {
            setSmallLoading(false);
            setSelectedWithdrawal(null);
        }
    };

    const cardBanUser = async (userId) => {
        const confirmBan = window.confirm("Are you sure you want to ban this user?");
        if (!confirmBan) return;

        try {
            setSmallLoading(true);
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/banuser/${userId}`,{},{withCredentials:true,});
            toast.success("User banned!");
        } catch (error) {
            toast.error("Error banning user.");
        } finally {
            setSmallLoading(false);
            setSelectedWithdrawal(null);
        }
    };

    const cardSelectedUserAllWithdraw = async (userId) => {
        try {
            setSmallLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getuserwithdrawal/${userId}`,{
                withCredentials:true,
            });
            setSelectedUserWithdrawals(response.data.withdrawals);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSmallLoading(false);
        }
    };

    const cardSelectedUserAllCompletedTasks = async (userId) => {
        try {
            setSmallLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getusercompletedtasks/${userId}`,{
                withCredentials:true,
            });
            setSelectedUserCompletedTasks(response.data.offers);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSmallLoading(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            <div className={styled.modal_content}>
                <button title="Close" onClick={closeModal} className={styled.modal_close_btn}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">Pending Withdrawals</h2>
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search withdrawals..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control w-50 m-auto custom-input`}
                        />
                    </div>

                    {filteredWithdrawals.length === 0 ? (
                        <div className={`${styled.not_found} d-flex justify-content-center align-items-center text-center`}>
                            <NotFoundAnimation />
                        </div>
                    ) : (
                        <>
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Username</th>
                                        <th>User Status</th>
                                        <th>Amount</th>
                                        <th>Wallet</th>
                                        <th>Wallet Address</th>
                                        <th>Transaction Id</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentWithdrawals.map((withdrawal, index) => (
                                        <tr key={withdrawal._id}>
                                            <td>{indexOfFirstWithdrawal + index + 1}</td>
                                            <td>{withdrawal.userName}</td>
                                            <td>{userStatuses[withdrawal.userId] || "unknown"}</td>
                                            <td>$ {(withdrawal.amount / 1000).toLocaleString()}</td>
                                            <td>{withdrawal.walletName}</td>
                                            <td>{withdrawal.walletAddress}</td>
                                            <td>{withdrawal.transactionId}</td>
                                            <td>{formatDate(withdrawal.createdAt)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center">
                                                    <button className="btn btn-sm btn-info mx-1" title="View Details" onClick={() => setSelectedWithdrawal(withdrawal)}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    <button className="btn btn-sm btn-success mx-1" title="Approve" disabled={loading} onClick={() => approve(withdrawal._id)}>
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>
                                                    <button className="btn btn-sm btn-warning mx-1" title="Refund" disabled={loading} onClick={() => refund(withdrawal._id, withdrawal.amount)}>
                                                        <FontAwesomeIcon icon={faRotateLeft} />
                                                    </button>
                                                    <button className="btn btn-sm btn-danger mx-1" title="Reject" disabled={loading} onClick={() => reject(withdrawal._id)}>
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedWithdrawal && (
                                <div className={styled.modal_container}>
                                    <div className={styled.modal_outer_div} onClick={() => setSelectedWithdrawal(null)}></div>
                                    <div className={styled.modal_half_content}>
                                        <button className={styled.modal_close_btn} onClick={() => setSelectedWithdrawal(null)}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                        <div className={`${styled.modal_body} p-3`}>
                                            <h3 className="text-center mb-4">{selectedWithdrawal.userName}'s Withdrawal</h3>
                                            <table className={`${styled.custom_table} table-bordered`}>
                                                <tbody>
                                                <tr><th>User ID</th><td>{selectedWithdrawal.userId}</td></tr>
                                                <tr><th>User Status</th><td>{userStatuses[selectedWithdrawal.userId] || "unknown"}</td></tr>
                                                <tr><th>Amount</th><td>${(selectedWithdrawal.amount / 1000).toLocaleString()}</td></tr>
                                                <tr><th>Wallet</th><td>{selectedWithdrawal.walletName}</td></tr>
                                                <tr><th>Wallet Address</th><td>{selectedWithdrawal.walletAddress}</td></tr>
                                                <tr><th>Transaction Id</th><td>{selectedWithdrawal.transactionId}</td></tr>
                                                <tr><th>Date</th><td>{formatDate(selectedWithdrawal.createdAt)}</td></tr>
                                                <tr><th colSpan="2" className="text-center text-capitalize">{selectedWithdrawal.status}</th></tr>
                                                </tbody>
                                            </table>

                                            <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
                                                <button className="btn btn-success" onClick={() => cardApprove(selectedWithdrawal._id)}>Approve</button>
                                                <button className="btn btn-warning" onClick={() => cardRefund(selectedWithdrawal._id, selectedWithdrawal.amount)}>Refund</button>
                                                <button className="btn btn-danger" onClick={() => cardReject(selectedWithdrawal._id)}>Reject</button>
                                                <button className="btn btn-info" onClick={() => cardBanUser(selectedWithdrawal.userId)}>Ban User</button>
                                                <button className="btn btn-secondary" onClick={() => cardSelectedUserAllWithdraw(selectedWithdrawal.userId)}>All Withdrawals</button>
                                                <button className="btn btn-primary" onClick={() => cardSelectedUserAllCompletedTasks(selectedWithdrawal.userId)}>All Completed Tasks</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedUserWithdrawals && (
                                <SelectedUserWithdrawals
                                    selectedUserWithdrawals={selectedUserWithdrawals}
                                    userName={selectedUserWithdrawals[0]?.userName}
                                    closeModal={() => setSelectedUserWithdrawals(null)}
                                />
                            )}

                            {selectedUserCompletedTasks && (
                                <SelectedUserCompletedTasks
                                    selectedUserCompletedTasks={selectedUserCompletedTasks}
                                    userName={selectedUserCompletedTasks[0]?.userName}
                                    closeModal={() => setSelectedUserCompletedTasks(null)}
                                />
                            )}

                            {totalPages > 1 && (
                                <div className="pagination-container mt-3">
                                    <ul className="pagination justify-content-center">
                                        {[...Array(totalPages)].map((_, pageIndex) => (
                                            <li key={pageIndex} className={`page-item ${currentPage === pageIndex + 1 ? "active" : ""}`}>
                                                <button className="page-link" onClick={() => handlePageChange(pageIndex + 1)}>
                                                    {pageIndex + 1}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {loading && (
                <div className="bike-load flex-column large-spinner text-center position-absolute">
                    <CashoutAnimation />
                </div>
            )}
            {smallloading && (
                <div className="small-load flex-column medium-spinner text-center position-absolute">
                    <CashoutAnimation />
                </div>
            )}
        </div>
    );
};

PendingWithdrawalsPopUp.propTypes = {
    showModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    pendingWithdrawals: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            userId: PropTypes.string.isRequired,
            userName: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
            walletName: PropTypes.string.isRequired,
            walletAddress: PropTypes.string.isRequired,
            transactionId: PropTypes.string,
            createdAt: PropTypes.string.isRequired,
        })
    ).isRequired,
    fetchAllWithdrawals: PropTypes.func.isRequired,
};

export default PendingWithdrawalsPopUp;
