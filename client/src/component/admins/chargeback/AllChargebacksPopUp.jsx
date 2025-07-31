import { faEye, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import styled from "../tasks/allcompletedofferspopup.module.css";

const AllChargebacksPopUp = ({ showModal, closeModal, allChargebacks }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedChargeback, setSelectedChargeback] = useState(null);
    const [loading, setLoading] = useState(false);
    const chargebacksPerPage = 10;

    // Filter chargebacks based on search query
    const filteredChargebacks = useMemo(() => {
        // Sort chargebacks in descending order based on createdAt
        const sortedChargebacks = [...allChargebacks].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Filter sorted chargebacks based on search query
        return sortedChargebacks.filter((chargeback) =>
            [chargeback._id,chargeback.offerWallName, chargeback.userID, chargeback.transactionID, chargeback.offerName, chargeback.offerID ,chargeback.currencyReward, chargeback.ip, chargeback.userName, chargeback.country, chargeback.createdAt, chargeback.updatedAt]
                .map((field) => (field ? field.toString().toLowerCase() : ""))
                .some((value) => value.includes(searchQuery.toLowerCase()))
        );
    }, [allChargebacks, searchQuery]);

    // Pagination logic
    const indexOfLastChargeback = currentPage * chargebacksPerPage;
    const indexOfFirstChargeback = indexOfLastChargeback - chargebacksPerPage;
    const currentChargebacks = useMemo(() => filteredChargebacks.slice(indexOfFirstChargeback, indexOfLastChargeback), [
        filteredChargebacks,
        indexOfFirstChargeback,
        indexOfLastChargeback,
    ]);
    const totalPages = Math.ceil(filteredChargebacks.length / chargebacksPerPage);

    // Handle page change
    const handlePageChange = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }, []);

    // Close modal and reset states
    const handleCloseModal = useCallback(() => {
        closeModal();
        setSearchQuery("");
        setCurrentPage(1);
        setSelectedChargeback(null);
    }, [closeModal]);

    if (!showModal){
        document.body.style.overflow = "auto";
        return null
    }else{
        document.body.style.overflow = "hidden";
    };

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={handleCloseModal}></div>
            <div className={styled.modal_content}>
                <button
                    title="Close"
                    onClick={handleCloseModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">All Chargebacks</h2>
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
                        <div className={`${styled.not_found} d-flex flex-column justify-content-center align-items-center text-center`}>
                            <NotFoundAnimation />
                            <p className="mt-3">No chargebacks found.</p>
                        </div>
                    ) : (
                        <>
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Username</th>
                                        <th>Offerwall</th>
                                        <th>Offer Name</th>
                                        <th>Offer ID</th>
                                        <th>Transaction ID</th>
                                        <th>Coin</th>
                                        <th>Revenue</th>
                                        <th>Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentChargebacks.map((chargeback, index) => (
                                        <tr key={chargeback._id}>
                                            <td>{indexOfFirstChargeback + index + 1}</td>
                                            <td>{chargeback.userName}</td>
                                            <td>{chargeback.offerWallName}</td>
                                            <td>{chargeback.offerName}</td>
                                            <td>{chargeback.offerID}</td>
                                            <td>{chargeback.transactionID}</td>
                                            <td>{chargeback.currencyReward}</td>
                                            <td>{chargeback.revenue}</td>
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
                            {selectedChargeback && (
                                <ChargebackDetailsModal
                                    selectedChargeback={selectedChargeback}
                                    onClose={() => setSelectedChargeback(null)}
                                />
                            )}
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
            {loading && <SpinnerAnimation />}
        </div>
    );
};

// Reusable Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination-container mt-3">
            <ul className="pagination justify-content-center">
                {[...Array(totalPages)].map((_, pageIndex) => (
                    <li
                        key={pageIndex}
                        className={`page-item ${currentPage === pageIndex + 1 ? "active" : ""}`}
                    >
                        <button className="page-link" onClick={() => onPageChange(pageIndex + 1)}>
                            {pageIndex + 1}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Reusable Chargeback Details Modal Component
// const ChargebackDetailsModal = ({ selectedChargeback, onClose }) => {
//     return (
//         <div className={styled.modal_container}>
//             <div className={styled.modal_outer_div} onClick={onClose}></div>
//             <div className={styled.modal_half_content}>
//                 <button
//                     title="Close"
//                     onClick={onClose}
//                     className={styled.modal_close_btn}
//                     aria-label="Close Modal"
//                 >
//                     <FontAwesomeIcon icon={faXmark} />
//                 </button>
//                 <div className={`${styled.modal_body} p-3`}>
//                     <div className="popup-title mt-2 mb-5 text-center">
//                         <h3>{selectedChargeback.user?.name}'s Chargeback Details</h3>
//                     </div>
//                     <div className={styled.table_container}>
//                         <table className={`${styled.custom_table} custom_table table-bordered`}>
//                             <tbody>
//                             <tr>
//                                 <th>ID</th>
//                                 <td>{selectedChargeback._id}</td>
//                             </tr>
//                             <tr>
//                                 <th>User</th>
//                                 <td>{selectedChargeback.user?.name || "N/A"}</td>
//                             </tr>
//                             <tr>
//                                 <th>Amount</th>
//                                 <td>${selectedChargeback.amount?.toLocaleString() || "N/A"}</td>
//                             </tr>
//                             <tr>
//                                 <th>Status</th>
//                                 <td>
//                                         <span
//                                             className={`badge ${
//                                                 selectedChargeback.status === "pending"
//                                                     ? "bg-warning"
//                                                     : selectedChargeback.status === "resolved"
//                                                         ? "bg-success"
//                                                         : "bg-danger"
//                                             }`}
//                                         >
//                                             {selectedChargeback.status || "N/A"}
//                                         </span>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <th>Reason</th>
//                                 <td>{selectedChargeback.reason || "N/A"}</td>
//                             </tr>
//                             <tr>
//                                 <th>Created At</th>
//                                 <td>
//                                     {new Date(selectedChargeback.createdAt).toLocaleDateString("en-US", {
//                                         year: "numeric",
//                                         month: "long",
//                                         day: "numeric",
//                                     })}
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <th>Updated At</th>
//                                 <td>
//                                     {new Date(selectedChargeback.updatedAt).toLocaleDateString("en-US", {
//                                         year: "numeric",
//                                         month: "long",
//                                         day: "numeric",
//                                     })}
//                                 </td>
//                             </tr>
//                             </tbody>
//                         </table>
//                         <div className="text-center">
//                             <button className="btn btn-danger mt-3">
//                                 Resolve Chargeback
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// AllChargebacksPopUp.propTypes = {
//     showModal: PropTypes.bool.isRequired,
//     closeModal: PropTypes.func.isRequired,
//     allChargebacks: PropTypes.array.isRequired,
// };

export default React.memo(AllChargebacksPopUp);