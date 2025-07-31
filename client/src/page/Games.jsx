import React, { useEffect, useState } from "react";
import HeaderSection from "../component/HeaderSection.jsx";
import "../assets/css/earnPage.css";
import NotFoundAnimation from "../component/Animations/NotFoundAnimation.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import {NavLink, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../component/sidebar/Sidebar.jsx";
import TimeLine from "../component/Timeline/TimeLine.jsx";
import AllOffers from "../component/offers/AllOffers.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWallet} from "@fortawesome/free-solid-svg-icons";

const Games = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    if (!token) {
        navigate("/");
        toast.error("Login to continue");
        return null;
    }

    const [allOffers, setAllOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unlockedBadges, setUnlockedBadges] = useState(['gamesLoaded']);

    // Animation settings
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const fetchOffers = async () => {
            const API_KEY = "6wfvXNHicQEn9Z30of3IOg1n5ppblxDj";
            const PUB_ID = "vRzPiG";
            const APP_ID = "XO8QDH0Jqm";

            try {
                const [response] = await Promise.all([
                    axios.get(
                        `https://notik.me/api/v2/get-offers/all?api_key=${API_KEY}&pub_id=${PUB_ID}&app_id=${APP_ID}`
                    ),
                    new Promise(resolve => setTimeout(resolve, 800)) // Minimum loading time
                ]);

                if (!isCancelled) {
                    const data = response.data.offers.data || [];
                    setAllOffers(data);
                    setUnlockedBadges(prev => [...prev, 'premiumGames']);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError("We're having trouble loading games. Please refresh or try again later.");
                    console.error("Error fetching offers:", err);
                }
            } finally {
                if (!isCancelled) {
                    setTimeout(() => setLoading(false), 200);
                }
            }
        };
        fetchOffers();
        return () => {
            isCancelled = true;
        };
    }, []);
    // Filter and sort offers
    const androidOffers = [...allOffers]
        .filter(offer => offer.os && offer.os.includes("android"))
        .sort((a, b) => b.payout - a.payout);

    return (
        <>
            <HeaderSection />

            <div className="container-fluid">
                <div className="row">
                    <TimeLine/>
                </div>
            </div>
            <section className="earnpage hero-section">
                <div className="container-fluid">
                    <div className="row m-0 p-0">
                        {/*<div className="col-md-2 ps-0">*/}
                        {/*    <Sidebar />*/}
                        {/*</div>*/}
                        <div className="col-md-12 col-12">
                        <div className="earn-content-container">
                            <div className="menus d-flex  my-3">
                                <NavLink
                                    to="/offerwalls"
                                    className={"btn custom-btn"}
                                >
                                    <FontAwesomeIcon icon={faWallet} className="me-2" />
                                    Offerwalls
                                </NavLink>
                                <NavLink
                                    to="/all-offer"
                                    className={"ms-3 btn custom-btn"}
                                >
                                    <FontAwesomeIcon icon={faWallet} className="me-2" />
                                    View all offers
                                </NavLink>
                                <NavLink
                                    to="/game-offers"
                                    className={"ms-3 btn custom-btn"}
                                >
                                    <FontAwesomeIcon icon={faWallet} className="me-2" />
                                    Games
                                </NavLink>
                            </div>
                            <AnimatePresence mode="wait">
                                {error ? (
                                    <motion.div
                                        key="error"
                                        className="text-center w-100 loading-spinner offer-not-found"
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <NotFoundAnimation />
                                        <h4 className="fw-bold rounded">{error}</h4>
                                        <button
                                            className="btn btn-primary mt-3 pulse-hover"
                                            onClick={() => window.location.reload()}
                                        >
                                            ↻ Refresh Games
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <AllOffers
                                                title="📱 All Android Games"
                                                offers={androidOffers}
                                                error={error}
                                                isLoading={loading}
                                                glowEffect={true}
                                                badge={unlockedBadges.includes('allGames') ? '📊' : null}
                                                showPagination={true}
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                    </div>
            </section>
        </>
    );
};

export default Games;