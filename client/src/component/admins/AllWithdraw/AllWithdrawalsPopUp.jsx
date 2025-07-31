import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEye, faXmark} from "@fortawesome/free-solid-svg-icons";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import styled from "./allwithdrawalspopup.module.css";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";

const AllWithdrawalsPopUp = ({ showModal, closeModal, allWithdrawals }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [withdrawalsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    if (!showModal) return null;
    const filteredWithdrawals = allWithdrawals.filter((withdrawal) =>
        [withdrawal.userId,withdrawal.userName, withdrawal.amount, withdrawal.status, withdrawal.walletName, withdrawal.walletAddress, withdrawal.transactionId]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );
    const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
    const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
    const currentWithdrawals = filteredWithdrawals.slice(
        indexOfFirstWithdrawal,
        indexOfLastWithdrawal
    );
    const totalPages = Math.ceil(filteredWithdrawals.length / withdrawalsPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
const approve = (withdrawalId) => {
    alert(withdrawalId);
}
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
                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">All Withdrawals</h2>

                    {/* Search Bar */}
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search withdrawals..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control input-search w-50 m-auto custom-input`}
                        />
                    </div>
                    {filteredWithdrawals.length === 0 ? (
                        <div className={`${styled.not_found} d-flex flex-column justify-content-center align-items-center text-center`}>
                            <NotFoundAnimation/>
                        </div>
                    ) : (
                        <div>
                            {/* Table */}
                            <div className={styled.table_container}>
                                <table className={styled.custom_table}>
                                    <thead>
                                    <tr>
                                    <th>S.N</th>
                                        <th>Username</th>
                                        <th>Coin</th>
                                        <th>Amount</th>
                                        <th>Wallet</th>
                                        <th>Wallet Address</th>
                                        <th>Transaction Id</th>
                                        <th>Status</th>
                                        <th>Withdrawal Date</th>
                                        <th>Withdrawal Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentWithdrawals.map((withdrawal, index) => (
                                        <tr key={withdrawal.id}>
                                            <td>{indexOfFirstWithdrawal + index + 1}</td>
                                            <td>{withdrawal.userName}</td>
                                            <td>{withdrawal.amount.toLocaleString()}</td>
                                            <td>${withdrawal.amount / 1000}</td>
                                            <td>{withdrawal.walletName}</td>
                                            <td>{withdrawal.walletAddress}</td>
                                            <td>{withdrawal.transactionId}</td>
                                            <td>
                                                {withdrawal.status === "Completed" ? (
                                                    <span className="text-success">Completed</span>
                                                ) : (
                                                    <span className="text-warning">{withdrawal.status}</span>
                                                )}
                                            </td>
                                            <td>
                                                {new Date(withdrawal.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                {new Date(withdrawal.updatedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <button
                                                    title="View Details"
                                                    className="btn btn-sm btn-info mx-1"
                                                    onClick={() => setSelectedWithdrawal(withdrawal)}
                                                >
                                                    <FontAwesomeIcon icon={faEye}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedWithdrawal && (
                                <div className={styled.modal_container}>
                                    {/* Overlay */}
                                    <div className={styled.modal_outer_div} onClick={() => setSelectedWithdrawal(null)}></div>
                                    {/* Modal Content */}
                                    <div className={styled.modal_half_content}>
                                        {/* Close Button */}
                                        <button
                                            title="Close"
                                            onClick={() => setSelectedWithdrawal(null)}
                                            className={styled.modal_close_btn}
                                            aria-label="Close Modal"
                                        >
                                            <FontAwesomeIcon icon={faXmark}/>
                                        </button>
                                        {/* Modal Body */}
                                        <div className={`${styled.modal_body} p-3`}>
                                            <div className="popup-title mt-2 mb-5 text-center">
                                                <h3 className="">{selectedWithdrawal.userName}'s withdrawal</h3>
                                            </div>
                                            <div className="withdrawls_details_popup">
                                                <div className={styled.table_container}>
                                                    <table className={`${styled.custom_table} custom_table table-bordered`}>
                                                        <tbody>
                                                        <tr>
                                                            <th> Amount </th>
                                                            <th>${selectedWithdrawal.amount / 1000} </th>
                                                        </tr>
                                                        <tr>
                                                            <th> Wallet </th>
                                                            <th> {selectedWithdrawal.walletName} </th>
                                                        </tr>
                                                        <tr>
                                                            <th> Wallet Address</th>
                                                            <th> {selectedWithdrawal.walletAddress} </th>
                                                        </tr>
                                                        <tr>
                                                            <th> Transaction Id</th>
                                                            <th> {selectedWithdrawal.transactionId} </th>
                                                        </tr>
                                                        <tr>
                                                            <th> Withdrawl Date </th>
                                                            <th>
                                                                {
                                                                    new Date(selectedWithdrawal.createdAt).toLocaleDateString("en-US", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: "true",
                                                                    })
                                                                }
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <th> Withdrawl Updated </th>
                                                            <th>
                                                                {
                                                                    new Date(selectedWithdrawal.updatedAt).toLocaleDateString("en-US", {
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: "true",
                                                                    })
                                                                }
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <th className={"text-capitalize text-center"} colSpan={"2"} > {selectedWithdrawal.status} </th>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>


                                        </div>

                                    </div>
                                </div>

                            )}

                            {/* Pagination */}
                            {filteredWithdrawals.length > withdrawalsPerPage && (
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
                    )}
                </div>
            </div>
            {/* Loading Spinner */}
            {loading && (
                <div className="bike-load flex-column small-spinner text-center position-absolute">
                    <SpinnerAnimation/>
                    <h4 className="text-center mt-3 fa-2xl fw-semibold"> Withdrawals updating...</h4>
                </div>
            )}
        </div>
    );
};

AllWithdrawalsPopUp.propTypes = {
    showModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    allWithdrawals: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            userId: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default AllWithdrawalsPopUp;
