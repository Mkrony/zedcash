import React, { useState } from "react";
import styled from "./UserDetailsModal.module.css"; // Reuse the same styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../Animations/NotFoundAnimation.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import SpinnerAnimation from "../Animations/SpinnerAnimation.jsx";

function ChargebackDetails({ isOpen, closeModal, type, chargebacks }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedChargeback, setSelectedChargeback] = useState(null);
    const [loading, setLoading] = useState(false);
    const chargebacksPerPage = 10;

    if (!isOpen) return null;

    // Filter chargebacks based on search query
    const filteredChargebacks = chargebacks.filter((chargeback) =>
        [
            chargeback.taskName,
            chargeback.amount,
            chargeback.status,
            chargeback.userName,
            chargeback.offerWallName,
            chargeback.offerName,
            chargeback.offerID,
            chargeback.transactionID,
            chargeback.currencyReward,
            chargeback.revenue,
            chargeback.ip,
            chargeback.country,
            new Date(chargeback.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            }),
        ]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastChargeback = currentPage * chargebacksPerPage;
    const indexOfFirstChargeback = indexOfLastChargeback - chargebacksPerPage;
    const currentChargebacks = filteredChargebacks.slice(indexOfFirstChargeback, indexOfLastChargeback);
    const totalPages = Math.ceil(filteredChargebacks.length / chargebacksPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page when searching
    };

    // Close modal and reset states
    const handleCloseModal = () => {
        closeModal();
        setSearchQuery("");
        setCurrentPage(1);
        setSelectedChargeback(null);
    };

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={handleCloseModal}></div>
            <div className={`${styled.modal_content} overflow-hidden`}>
                <button
                    title="Close"
                    onClick={handleCloseModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">Chargeback Details</h2>
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search chargebacks..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control input-search w-50 m-auto custom-input`}
                        />
                    </div>
                    {filteredChargebacks.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center">
                            <NotFoundAnimation />
                        </div>
                    ) : (
                        <>
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Offerwall</th>
                                        <th>Task Name</th>
                                        <th>Task ID</th>
                                        <th>Transaction ID</th>
                                        <th>Coin</th>
                                        <th>USD</th>
                                        <th>IP</th>
                                        <th>Country</th>
                                        <th>Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentChargebacks.map((chargeback, index) => (
                                        <tr key={chargeback.id}>
                                            <td>{indexOfFirstChargeback + index + 1}</td>
                                            <td>{chargeback.offerWallName}</td>
                                            <td>{chargeback.offerName}</td>
                                            <td>{chargeback.offerID}</td>
                                            <td>{chargeback.transactionID}</td>
                                            <td>{chargeback.currencyReward.toLocaleString()}</td>
                                            <td>${(chargeback.currencyReward / 1000).toFixed(2)}</td>
                                            <td>{chargeback.ip}</td>
                                            <td>{chargeback.country}</td>
                                            <td>
                                                {new Date(chargeback.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Loading Animation */}
            {loading && (
                <div className="bike-load loading-spinner small-spinner text-center position-absolute">
                    <SpinnerAnimation />
                </div>
            )}
        </div>
    );
}

export default ChargebackDetails;