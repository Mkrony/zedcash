import React, { useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import { NavLink } from "react-router-dom";
import OfferModal from "../modal/OfferModal.jsx";
import NotFoundAnimation from "../Animations/NotFoundAnimation.jsx";
import zedStore from "../zedstore/ZedStore.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "./Offersoffer.module.css";
import "./slider-css.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";

// Slider settings (moved outside component for better performance)
const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 10,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
       {
            breakpoint: 1400,
            settings: {
                slidesToShow: 8,
                slidesToScroll: 8,
            },
        },
        {
            breakpoint: 1367,
            settings: {
                slidesToShow: 7,
                slidesToScroll: 7,
            },
        },
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 6,
                slidesToScroll: 6,
            },
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
            },
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            },
        },
    ],
};

// Skeleton Loading Component
const OfferSkeleton = ({ count = 10 }) => {
    return (
        <Slider {...sliderSettings}>
            {Array(count).fill().map((_, index) => (
                <div key={index} className={`${styled.offer_box} skeleton-item`}>
                    <div className={`${styled.offer_img} skeleton-image`}></div>
                    <div className={styled.offer_title}>
                        <div className="skeleton-text" style={{ width: '80%', height: '16px', marginBottom: '8px', marginTop: '8px' }}></div>
                        <div className="skeleton-text" style={{ width: '60%', height: '12px', marginBottom: '8px' }}></div>
                    </div>
                </div>
            ))}
        </Slider>
    );
};

function OfferBoxes({ title, offers, error, isLoading }) {
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    const userDetails = zedStore((state) => state.userDetails);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

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

    const skeletonStyles = `
        .skeleton-item {
            position: relative;
            overflow: hidden;
            background-color: #222339;
            border-radius: 5px;
            box-shadow: 0 5px 20px #00000057;
            width: 130px;
            height: 170px;
            padding: 5px;
            margin: 0 5px;
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

        .view-all-btn {
            font-size: 0.9rem;
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s;
        }

        .view-all-btn:hover {
            color: #0056b3;
            text-decoration: underline;
        }
    `;

    return (
        <div className="offers-slider mb-3">
            <style>{skeletonStyles}</style>
            <div className={`${styled.offers_body}`}>
                <div className="card-body">
                    <div className="section-title mb-4 d-flex justify-content-between align-items-center">
                        <h4>{title}</h4>
                        <NavLink to="/all-offer" className="btn btn-danger btn-sm small-btn">
                            View All
                        </NavLink>
                    </div>

                    {isLoading ? (
                        <OfferSkeleton />
                    ) : error ? (
                        <div className="text-center w-100 loading-spinner offer-not-found">
                            <NotFoundAnimation />
                            <h4 className="fw-bold rounded">
                                {error.message || "No offers available at the moment"}
                            </h4>
                        </div>
                    ) : offers.length > 0 ? (
                        <Slider {...sliderSettings}>
                            {offers.map((offer, index) => (
                                <div
                                    key={index}
                                    className={`${styled.offer_box} cursor-pointer animate__animated animate__zoomIn`}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View details of ${offer.name || "offer"}`}
                                    onClick={userDetails ? () => openModal(offer) : () => toggleLoginPopup(true)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            userDetails ? openModal(offer) : toggleLoginPopup(true);
                                        }
                                    }}
                                >
                                    <div className={styled.offer_img}>
                                        <img
                                            src={offer.image_url || "https://via.placeholder.com/150"}
                                            alt={offer.name || "Offer Image"}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/150";
                                            }}
                                        />
                                    </div>
                                    <div className={`${styled.offer_title}`}>
                                        <h5 className="offer_name">
                                            {offer.name?.length > 15
                                                ? `${offer.name.slice(0, 15)}...`
                                                : offer.name || "No title available"}
                                        </h5>
                                        <div className={`${styled.offer_description}`}>
                                            <p>
                                                {offer.description1?.length > 15
                                                    ? `${offer.description1.slice(0, 15)}...`
                                                    : offer.description1 || "No description available"}
                                            </p>
                                        </div>
                                        <div className={`${styled.offer_payout}`}>
                                            <h4 className={`${styled.offer_payout}`}>
                                                <FontAwesomeIcon className={"gold"} icon={faCoins} /> {(offer.payout * 1000).toLocaleString() || "0"}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <div className="text-center w-100 loading-spinner offer-not-found">
                            <NotFoundAnimation />
                            <h4 className="fw-bold rounded">All offers are currently offline</h4>
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

OfferBoxes.propTypes = {
    title: PropTypes.string.isRequired,
    offers: PropTypes.arrayOf(
        PropTypes.shape({
            image_url: PropTypes.string,
            name: PropTypes.string,
            payout: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            description1: PropTypes.string,
        })
    ).isRequired,
    error: PropTypes.shape({
        message: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
};

OfferBoxes.defaultProps = {
    isLoading: false,
};

export default memo(OfferBoxes);
