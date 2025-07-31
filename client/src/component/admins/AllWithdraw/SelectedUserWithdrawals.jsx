import React, { useState } from "react";
import styled from "./allwithdrawalspopup.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";

const SelectedUserWithdrawals = ({ selectedUserWithdrawals, userName, closeModal }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const withdrawalsPerPage = 10; // Number of withdrawals per page

    const totalWithdrawals = selectedUserWithdrawals.length;
    const totalPages = Math.ceil(totalWithdrawals / withdrawalsPerPage);

    // Calculate the displayed withdrawals
    const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
    const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
    const currentWithdrawals = selectedUserWithdrawals.slice(indexOfFirstWithdrawal, indexOfLastWithdrawal);

    // Pagination controls
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={styled.modal_container}>
            {/* Overlay */}
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            {/* Modal Content */}
            <div className={styled.modal_content}>
                {/* Close Button */}
                <button
                    title="Close"
                    onClick={closeModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                {/* Modal Body */}
                <div className={`${styled.modal_body} p-3`}>
                    <div className="popup-title mt-2 mb-5 text-center text-capitalize">
                        <h3>{userName}'s Withdrawals</h3>
                        <h4 className="green mt-3 fw-semibold text-capitalize">
                            {userName} has {totalWithdrawals} withdrawals
                        </h4>
                    </div>
                    {totalWithdrawals === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center">
                            <NotFoundAnimation />
                            <p>No withdrawals found for {userName}.</p>
                        </div>
                    ) : (
                        <div className="withdrawls_details_popup">
                            <div className={styled.table_container}>
                                <table
                                    className={`${styled.custom_table} custom_table text-center`}
                                >
                                    <thead>
                                    <tr>
                                        <th>Amount</th>
                                        <th>Wallet</th>
                                        <th>Wallet Address</th>
                                        <th>Transaction Id</th>
                                        <th>Withdrawal Time</th>
                                        <th>Withdrawal Updated</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentWithdrawals.map((withdrawal, index) => (
                                        <tr key={index}>
                                            <td>${withdrawal.amount / 1000}</td>
                                            <td>{withdrawal.walletName}</td>
                                            <td>{withdrawal.walletAddress}</td>
                                            <td>{withdrawal.transactionId}</td>
                                            <td>
                                                {new Date(withdrawal.createdAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </td>
                                            <td>
                                                {new Date(withdrawal.updatedAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </td>
                                            <td className="text-capitalize text-center">
                                                {withdrawal.status}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination-container mt-3">
                            <ul className="pagination justify-content-center">
                                {[...Array(totalPages)].map((_, pageIndex) => (
                                    <li
                                        key={pageIndex}
                                        className={`page-item ${
                                            currentPage === pageIndex + 1 ? "active" : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pageIndex + 1)}
                                        >
                                            {pageIndex + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectedUserWithdrawals;
