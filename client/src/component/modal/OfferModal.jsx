import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faXmark, faPlay, faStar, faCoins} from "@fortawesome/free-solid-svg-icons";
import styled from '../offers/Offersoffer.module.css';
import QRCode from 'react-qr-code';
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import CirclecashAnimation from "../Animations/CirclecashAnimation.jsx";
import { Link } from "react-router-dom";

function OfferModal({ isModalOpen, selectedOffer, closeModal }) {
    const [isLoading, setIsLoading] = useState(true);
    const [clickUrl, setClickUrl] = useState("");

    // Reset loading state whenever a new offer is selected
    useEffect(() => {
        if (selectedOffer) {
            setIsLoading(true);
            // Generate a unique Click ID or Session ID (for example purposes, using a simple timestamp)
            const clickId = Date.now().toString();

            // Get the user ID from the token or set it to "guest"
            const token = Cookies.get("token");
            let userId = "";
            if(token) {
                const decodedToken = jwtDecode(token);
                userId = decodedToken.id;
            } else {
                userId = "guest";
            }

            // Replace [user_id] in the click_url with the actual user ID
            let updatedClickUrl = selectedOffer.click_url.replace("[user_id]", userId);

            // Append the Click ID or Session ID using the &s1= parameter
            updatedClickUrl += `&s1=${clickId}`;

            // Set the updated click URL
            setClickUrl(updatedClickUrl);
        }
    }, [selectedOffer]);

    // Return null if modal is not open
    if (!isModalOpen || !selectedOffer) return null;

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            <div className={styled.modal_content}>
                <button title="Close" onClick={closeModal} className={styled.modal_close_btn}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                {isLoading && (
                    <div className={styled.preloader}>
                        <CirclecashAnimation />
                        <h4 className="text-center">{selectedOffer.name} Is Loading...</h4>
                    </div>
                )}
                <img
                    src={selectedOffer.image_url}
                    alt=""
                    onLoad={() => setIsLoading(false)}
                    className={isLoading ? styled.hidden : "d-none"}
                />
                {!isLoading && (
                    <>
                        <div className={`${styled.modal_logo} logo text-center m-0 py-2`}>
                            <img className="m-0 p-0" src="img/logo.png" alt="" />
                        </div>
                        <div className={styled.modal_inner_div}>
                            <div className={`${styled.offers_title} fa-2x`}><h3>{selectedOffer.name}</h3></div>
                            <div className={styled.offers_flex}>
                                <img src={selectedOffer.image_url} alt={selectedOffer.name} />
                                <div className={styled.offers_payout}>
                                    <p className="fa-2x m-0 p-0">
                                        <strong> <FontAwesomeIcon className={"gold"} icon={faCoins}/> {((selectedOffer.payout)*1000).toLocaleString("en-US") || "N/A"}</strong>
                                    </p>
                                    <p className={`${styled.offers_model_review} gold`}>
                                        <FontAwesomeIcon icon={faStar} />
                                        <FontAwesomeIcon icon={faStar} />
                                        <FontAwesomeIcon icon={faStar} />
                                        <FontAwesomeIcon icon={faStar} />
                                        <FontAwesomeIcon icon={faStar} />
                                    </p>
                                </div>
                            </div>
                            <div className={styled.offers_country}><p><strong>Country:</strong> {selectedOffer.country_code.join(', ') || "N/A"}</p></div>
                            <div className={styled.offers_device}><p><strong>Device:</strong> {selectedOffer.devices.join(", ")}</p></div>
                            <div className={styled.offers_os}>
                                <p><strong>OS:</strong> {selectedOffer.platforms.join(", ")}</p>
                            </div>
                            <h5 className="my-3 ms-1"><strong>Descriptions:</strong></h5>
                            <div className={styled.offers_descriptions}>
                                <p>{selectedOffer.description1 || "No description available"}</p>
                                {selectedOffer.description2 && <p>{selectedOffer.description2}</p>}
                                {selectedOffer.description3 && <p>{selectedOffer.description3}</p>}
                            </div>
                            {selectedOffer.events && (
                                <div className={styled.offers_events}>
                                    <h5 className="my-3 ms-1"><strong>Rewards:</strong></h5>
                                    {selectedOffer.events.map((event, index) => (
                                        <p key={index}>
                                            <span className={`${styled.bg_off_green} me-4 green`}>
                                                ${parseFloat(event.payout) .toLocaleString("en-US", {
                                                minimumIntegerDigits: 2,
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                            </span>
                                            {event.name}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <h5 className="my-3 ms-1"><strong>QR Code:</strong></h5>
                            <div className={`${styled.qr_code_generator} text-center my-4`}>
                                <QRCode value={clickUrl} size={250} />
                            </div>
                        </div>
                        <div className={styled.offer_btn}>
                            <Link to={clickUrl} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon className={"mx-2"} icon={faPlay} /> Complete & Earn <FontAwesomeIcon className={"mx-2 gold"}  icon={faCoins}/>{((selectedOffer.payout)*1000).toLocaleString("en-US")}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default OfferModal;