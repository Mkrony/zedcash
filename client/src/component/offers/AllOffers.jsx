import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import OfferModal from "../modal/OfferModal.jsx";
import NotFoundAnimation from "../Animations/NotFoundAnimation.jsx";
import zedStore from "../zedstore/ZedStore.jsx";
import "./all-offer.css";
import styled from "./Offersoffer.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoins} from "@fortawesome/free-solid-svg-icons";

// Skeleton Loading Component
const OfferSkeleton = () => (
    <div className={`${styled.offer_box} skeleton-box`}>
        <div className={styled.offer_img}>
            <div className="skeleton-image"></div>
        </div>
        <div className={`${styled.offer_title}`}>
            <div className="skeleton-text" style={{ width: '80%', height: '20px', margin: '10px 0 10px' }}></div>
            <div className="skeleton-text" style={{ width: '60%', height: '16px', margin: '0 0 8px' }}></div>
            <div className="skeleton-text" style={{ width: '40%', height: '16px', margin: '5px 0 0' }}></div>
        </div>
    </div>
);

function AllOffers({ title, offers, error, isLoading, showPagination }) {
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    const userDetails = zedStore((state) => state.userDetails);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const offersPerPage = 60;
    const openModal = useCallback((offer) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    }, []);
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedOffer(null);
        document.body.style.overflow = "auto";
    }, []);
    // Calculate current offers for pagination
    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffers = offers.slice(indexOfFirstOffer, indexOfLastOffer);
    const totalPages = Math.ceil(offers.length / offersPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    // Pagination component with 5 visible pages at a time
    const Pagination = () => {
        if (totalPages <= 1) return null;
        const maxVisiblePages = 5;
        let startPage, endPage;
        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
            const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }
        const pageNumbers = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
        return (
            <div className="pagination-container mt-4">
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                            >
                                «
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>
                        </li>
                        {startPage > 1 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}
                        {pageNumbers.map(number => (
                            <li
                                key={number}
                                className={`page-item ${currentPage === number ? 'active' : ''}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                        {endPage < totalPages && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                »
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    };
    // Add this to your CSS or styled component
    const skeletonStyles = `
        .skeleton-box {
            position: relative;
            overflow: hidden;
            background-color: #222339;
            border-radius: 5px;
            box-shadow: 0 5px 20px #00000057;
            width: 130px;
            height: 170px;
        }
        
        .skeleton-image {
            width: 100%;
            height: 100px;
            background: linear-gradient(90deg, #1a1830 25%, #2a2840 50%, #1a1830 75%);
            background-size: 200% 100%;
            border-radius: 4px;
            animation: skeletonShimmer 1.5s infinite linear;
        }
        
        .skeleton-text {
            background: linear-gradient(90deg, #1a1830 25%, #2a2840 50%, #1a1830 75%);
            background-size: 200% 100%;
            border-radius: 4px;
            animation: skeletonShimmer 1.5s infinite linear;
        }
        
        @keyframes skeletonShimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }

        .pagination-container {
            margin-top: 20px;
        }

        .pagination {
            display: flex;
            justify-content: center;
        }

        .page-item {
            margin: 0 2px;
        }

        .page-link {
            padding: 5px 10px;
            border: 1px solid #2a2840;
            background: #1a1830;
            cursor: pointer;
            border-radius: 4px;
            color: #ddd;
        }

        .page-item.active .page-link {
            background-color: #01d676;
            border-color: #01d676;
            color: white;
        }

        .page-item.disabled .page-link {
            opacity: 0.6;
            cursor: not-allowed;
            color: #555;
        }
    `;

    return (
        <div className="offers-offer mb-5">
            <style>{skeletonStyles}</style>
            <div className={styled.offers_body}>
                <div className="card-body">
                    <div className="section-title mb-4">
                        <h4>{title}</h4>
                    </div>

                    {isLoading ? (
                        <div className="offer-boxes d-flex justify-content-md-start justify-content-center align-items-center flex-wrap row-gap-2 column-gap-2">
                            {Array.from({ length: offersPerPage }).map((_, index) => (
                                <OfferSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center w-100 loading-spinner offer-not-found">
                            <NotFoundAnimation />
                            <h4 className="fw-bold rounded">
                                {error.message || "No offers available at the moment"}
                            </h4>
                        </div>
                    ) : currentOffers.length > 0 ? (
                        <>
                            <div className="offer-boxes d-flex justify-content-md-start justify-content-center align-items-center flex-wrap row-gap-2 column-gap-2 ">
                                {currentOffers.map((offer, index) => (
                                    <div
                                        key={index}
                                        className={`${styled.offer_box} cursor-pointer animate__animated animate__zoomIn`}
                                        onClick={
                                            userDetails
                                                ? () => openModal(offer)
                                                : () => toggleLoginPopup(true)
                                        }
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View details of ${offer.name || "offer"}`}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                userDetails ? openModal(offer) : toggleLoginPopup(true);
                                            }
                                        }}
                                    >
                                        <div className={styled.offer_img}>
                                            <img
                                                src={offer.image_url}
                                                alt={offer.name || "Offer Image"}
                                                loading="lazy"
                                                onLoad={(e) => e.target.classList.add('loaded')}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'path/to/default-image.png';
                                                }}
                                            />
                                        </div>

                                        <div className={`${styled.offer_title}`}>
                                            <h5 className="offer_name">
                                                {offer.name?.length > 12
                                                    ? `${offer.name.slice(0, 12)}...`
                                                    : offer.name || "No title available"}
                                            </h5>
                                            <div className={`${styled.offer_description}`}>
                                                <p>
                                                    {offer.description1?.length > 20
                                                        ? `${offer.description1.slice(0, 20)}...`
                                                        : offer.description1 || "No description available"}
                                                </p>
                                            </div>
                                            <h4 className={`${styled.offer_payout}`}>
                                                <FontAwesomeIcon className={"gold"} icon={faCoins} /> {(offer.payout * 1000).toLocaleString() || "0"}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {showPagination && <Pagination />}
                        </>
                    ) : (
                        <div className="text-center w-100 loading-spinner offer-not-found">
                            <NotFoundAnimation />
                            <h4 className="fw-bold rounded">All offers are offline temporarily</h4>
                        </div>
                    )}
                </div>
            </div>

            {/* Offer Modal */}
            {isModalOpen && (
                <OfferModal
                    isModalOpen={isModalOpen}
                    selectedOffer={selectedOffer}
                    closeModal={closeModal}
                />
            )}
        </div>
    );
}

AllOffers.propTypes = {
    title: PropTypes.string.isRequired,
    offers: PropTypes.arrayOf(
        PropTypes.shape({
            image_url: PropTypes.string.isRequired,
            name: PropTypes.string,
            payout: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ).isRequired,
    error: PropTypes.shape({
        message: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
    showPagination: PropTypes.bool,
};

AllOffers.defaultProps = {
    showPagination: false,
};

export default React.memo(AllOffers);
