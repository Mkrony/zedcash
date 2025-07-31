import React, { useState } from "react";
import styled from "./UserDetailsModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../Animations/NotFoundAnimation.jsx";

function WithdrawalsDetails({ isOpen, closeModal, type, withdrawals }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [withdrawalsPerPage] = useState(10);

    if (!isOpen) return null;

    // Filter withdrawals based on search query
    const filteredWithdrawals = withdrawals.filter((withdrawal) =>
        [
            withdrawal.amount,
            withdrawal.transactionId,
            withdrawal.status,
            withdrawal.walletAddress,
            withdrawal.walletName,
            new Date(withdrawal.createdAt).toLocaleString(),
        ]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
    const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
    const currentWithdrawals = filteredWithdrawals.slice(indexOfFirstWithdrawal, indexOfLastWithdrawal);
    const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page when searching
    };

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            <div className={`${styled.modal_content} overflow-hidden`}>
                <button title="Close" onClick={closeModal} className={styled.modal_close_btn}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_header}>
                    <h4>{type} Withdrawals</h4>
                </div>
                <div className={styled.modal_body}>
                    {/* Search Bar */}
                    <div className={`${styled.search_bar} my-3 mb-5`}>
                        <input
                            type="text"
                            placeholder="Search withdrawals..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control w-50 m-auto custom-input`}
                        />
                    </div>

                    {filteredWithdrawals.length === 0 ? (
                        <div className={`${styled.not_found} d-flex justify-content-center text-center`}>
                            <NotFoundAnimation className={"height-90"} />
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Amount</th>
                                        <th>Transaction Id</th>
                                        <th>Wallet Address</th>
                                        <th>Wallet Name</th>
                                        <th>Requested At</th>
                                        <th>Updated At</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentWithdrawals.map((w, index) => (
                                        <tr key={index}>
                                            <td>{indexOfFirstWithdrawal + index + 1}</td>
                                            <td>{w.amount || "0"}</td>
                                            <td>{w.transactionId || "0"}</td>
                                            <td>{w.walletAddress || "N/A"}</td>
                                            <td>{w.walletName || "N/A"}</td>
                                            <td>{new Date(w.createdAt).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) || "N/A"}</td>
                                            <td>{new Date(w.updatedAt).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) || "N/A"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WithdrawalsDetails;