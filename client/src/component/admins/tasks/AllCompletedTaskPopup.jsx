import {faClock, faEye, faRotateLeft, faTrash, faXmark} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";
import styled from "./allcompletedofferspopup.module.css";
import axios from "axios";
import {toast} from "react-toastify";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import zedStore from "../../zedstore/ZedStore.jsx";
const AllCompletedTaskPopup = ({ showModal, closeModal, allCompletedOffers }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [loading, setLoading] = useState(false);
    const offersPerPage = 10;
    const {getAllChargeback, getAllCompletedOffers, getAllPendingTasks,getTodayChargeback,getTotalChargeback,getTotalPendingRevenues,gettodayPendingRevenues } = zedStore();

    // Filter offers based on search query
    const filteredOffers = useMemo(() => {
        // Sort offers in descending order based on createdAt
        const sortedOffers = [...allCompletedOffers].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        // Filter sorted offers based on search query
        return sortedOffers.filter((offer) =>
            [offer._id ,offer.userId, offer.userName, offer.offerName,offer.offerID,offer.ip,offer.updatedAt,offer.transactionID, offer.currencyReward, offer.status, offer.completedAt]
                .map((field) => (field ? field.toString().toLowerCase() : ""))
                .some((value) => value.includes(searchQuery.toLowerCase()))
        );
    }, [allCompletedOffers, searchQuery]);

    // Pagination logic
    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffers = useMemo(() => filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer), [
        filteredOffers,
        indexOfFirstOffer,
        indexOfLastOffer,
    ]);
    const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

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
        setSelectedOffer(null);
    }, [closeModal]);
    if (!showModal){
        document.body.style.overflow = "auto";
        return null
    }else{
        document.body.style.overflow = "hidden";
    }
    const setChargeback = async (taskId) => {
        setLoading(true);
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/setchargeback/${taskId}`,{},{
                withCredentials:true,
            });
                setLoading(false);
                toast.success(response.data.message);
                // api call to update all list
                getAllChargeback();
                getTotalChargeback();
                getTodayChargeback();
                getAllPendingTasks();
                getAllCompletedOffers();
                gettodayPendingRevenues();
                getTotalPendingRevenues();

        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
        finally {
            setSelectedOffer(null);
        }
    };
    //set pending
    const setPendingTask =async (taskId)=>{
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/setpendingtask/${taskId}`,{},{
                withCredentials:true,
            });
            setLoading(false);
            // api call to update all list
            getAllChargeback();
            getTotalChargeback();
            getTodayChargeback();
            getAllPendingTasks();
            getAllCompletedOffers();
            gettodayPendingRevenues();
            getTotalPendingRevenues();
            toast.success(response.data.message);
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
        finally {
            setSelectedOffer(null);
        }
    }
    const deleteTask =async (taskId)=>{
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delete-completed-task/${taskId}`,{
                withCredentials:true,
            });
            setLoading(false);
            // api call to update all list
            getAllChargeback();
            getTotalChargeback();
            getTodayChargeback();
            getAllPendingTasks();
            getAllCompletedOffers();
            gettodayPendingRevenues();
            getTotalPendingRevenues();
            toast.success(response.data.message);
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
        }
        finally {
            setSelectedOffer(null);
        }
    }

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
                    <h2 className="text-center my-3">All Completed Offers</h2>
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search completed offers..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control input-search w-50 m-auto custom-input`}
                        />
                    </div>
                    {filteredOffers.length === 0 ? (
                        <div className={`${styled.not_found} d-flex flex-column justify-content-center align-items-center text-center`}>
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
                                            <th>Offerwall</th>
                                            <th>Offer Name</th>
                                            <th>Coin</th>
                                            <th>Revenue</th>
                                            <th>IP</th>
                                            <th>Country</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentOffers.map((offer, index) => (
                                            <tr key={offer.id}>
                                                <td>{indexOfFirstOffer + index + 1}</td>
                                                <td>{offer.userName}</td>
                                                <td>{offer.offerWallName}</td>
                                                <td>{offer.offerName}</td>
                                                <td>{offer.currencyReward.toLocaleString()}</td>
                                                <td>${offer.revenue.toLocaleString()}</td>
                                                <td>{offer.ip}</td>
                                                <td>{offer.country}</td>
                                                <td>
                                                    {new Date(offer.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </td>
                                                <td>
                                                    <button
                                                        title="View Details"
                                                        className="btn btn-sm btn-info mx-1"
                                                        onClick={() => setSelectedOffer(offer)}
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    <button
                                                        title="Set to chargeback"
                                                        className="btn btn-sm btn-danger mx-1"
                                                        onClick={() => setChargeback(offer._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faRotateLeft} />
                                                    </button>
                                                    <button
                                                        title="Set to pending"
                                                        className="btn btn-sm btn-warning mx-1"
                                                        onClick={() => setPendingTask(offer._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faClock} />
                                                    </button>
                                                    <button
                                                        title="Delete Task"
                                                        className="btn btn-sm btn-danger mx-1"
                                                        onClick={() => deleteTask(offer._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedOffer && (
                                <OfferDetailsModal
                                    selectedOffer={selectedOffer}
                                    onClose={() => setSelectedOffer(null)}
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
            {/* Loading Animation */}
            {loading && (
                <div className="bike-load small-spinner text-center position-absolute">
                    <SpinnerAnimation />
                </div>
            )}
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
// Reusable Offer Details Modal Component
const OfferDetailsModal = ({ selectedOffer, onClose }) => {
    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={onClose}></div>
            <div className={styled.modal_half_content}>
                <button
                    title="Close"
                    onClick={onClose}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={`${styled.modal_body} p-3`}>
                    <div className="popup-title mt-2 mb-5 text-center">
                        <h3>{selectedOffer.userName}'s Offer Details</h3>
                    </div>
                    <div className={styled.table_container}>
                        <table className={`${styled.custom_table} custom_table table-bordered`}>
                            <tbody>
                            <tr>
                                <th>ID</th>
                                <td>{selectedOffer._id}</td>
                            </tr>
                            <tr>
                                <th>User ID</th>
                                <td>{selectedOffer.userID}</td>
                            </tr>
                            <tr>
                                <th>Username</th>
                                <td>{selectedOffer.userName}</td>
                            </tr>

                            <tr>
                                <th>Offerwall Name</th>
                                <td>{selectedOffer.offerWallName}</td>
                            </tr>
                                <tr>
                                    <th>Offer Name</th>
                                    <td>{selectedOffer.offerName}</td>
                                </tr>
                            <tr>
                                <th>Offer ID</th>
                                <td>{selectedOffer.offerID}</td>
                            </tr>
                                <tr>
                                    <th>Amount Earned</th>
                                    <td>{selectedOffer.currencyReward}</td>
                                </tr>
                            <tr>
                                <th>Revenue</th>
                                <td>${selectedOffer.revenue}</td>
                            </tr>
                            <tr>
                                <th>Transaction ID</th>
                                <td>{selectedOffer.transactionID}</td>
                            </tr>
                            <tr>
                                <th>IP</th>
                                <td>{selectedOffer.ip}</td>
                            </tr>
                            <tr>
                                <th>Country</th>
                                <td>{selectedOffer.country}</td>
                            </tr>
                                <tr>
                                    <th>Completed Date</th>
                                    <td>
                                        {new Date(selectedOffer.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </td>
                                </tr>
                            <tr>
                                <th>Updated At</th>
                                <td>
                                    {new Date(selectedOffer.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

AllCompletedTaskPopup.propTypes = {
    showModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    allCompletedOffers: PropTypes.array.isRequired,
};

export default React.memo(AllCompletedTaskPopup);