import React, { useEffect, useState } from "react";
import HeaderSection from "../component/HeaderSection.jsx";
import OfferWalls from "../component/offerwalls/OfferWalls.jsx";
import "../assets/css/earnPage.css";
import OffersOffer from "../component/offers/OffersOffer.jsx";
import Footer from "../component/footer/Footer.jsx";
import NotFoundAnimation from "../component/Animations/NotFoundAnimation.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import {NavLink, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import TimeLine from "../component/Timeline/TimeLine.jsx";
import { motion, AnimatePresence } from "framer-motion";
function EarnPage() {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const [notikTrendingOffers, setNotikTrendingOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [unlockedBadges, setUnlockedBadges] = useState(['highPayout']);
    // Redirect if not logged in
    if (!token) {
        navigate("/");
        toast.error("Login to continue");
        return null;
    }

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
        setIsMounted(true);
        let isCancelled = false;
        const fetchOffers = async () => {
            const API_KEY = "6wfvXNHicQEn9Z30of3IOg1n5ppblxDj";
            const PUB_ID = "vRzPiG";
            const APP_ID = "XO8QDH0Jqm";
            try {
                const [response] = await Promise.all([
                    axios.get(
                        `https://notik.me/api/v2/get-offers/all?api_key=${API_KEY}&pub_id=${PUB_ID}&app_id=${APP_ID}&limit=100`
                    ),
                    new Promise(resolve => setTimeout(resolve, 800)) // Minimum loading time for skeleton
                ]);

                if (!isCancelled) {
                    const data = response.data.offers.data || [];
                    setNotikTrendingOffers(data);
                    setUnlockedBadges(prev => [...prev, 'offerLoaded']);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError("We're having trouble loading offers. Please refresh or try again later.");
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
    // Filter offers by category with limits
    const allOffers = notikTrendingOffers
        .filter(offer => offer.categories?.includes("Offers"))
        .slice(0, 100);
    const highestPayoutOffers = [...allOffers]
        .sort((a, b) => b.payout - a.payout)

    if (!isMounted) return null;
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
                    <div className="col-md-12 col-12">
                        <div className="earn-content-container">
                           <div className="menus d-md-flex my-3">
                            <NavLink
                                to="/offerwalls"
                                className={"btn custom-btn"}
                            >
                                Offerwalls
                            </NavLink>
                            <NavLink
                                to="/all-offer"
                                className={"ms-3 btn custom-btn"}
                            >
                                All offers
                            </NavLink>
                            <NavLink
                                to="/game-offers"
                                className={"ms-3 btn custom-btn"}
                            >
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
                                            ↻ Refresh Offers
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <div className="offers-section">
                                            <motion.div variants={itemVariants}>
                                                <OffersOffer
                                                    title="💰 Highest Payout Offers"
                                                    offers={highestPayoutOffers}
                                                    highlight={true}
                                                    glowEffect={true}
                                                    isLoading={loading}
                                                    badge={unlockedBadges.includes('highPayout') ? '🏆' : null}
                                                />
                                            </motion.div>

                                            <motion.div variants={itemVariants}>
                                                <OffersOffer
                                                    title="✨ Featured Offers"
                                                    offers={allOffers}
                                                    pulseOnHover={true}
                                                    isLoading={loading}
                                                    badge={unlockedBadges.includes('featured') ? '⭐' : null}
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            className="offerwalls-section"
                                            variants={itemVariants}
                                        >
                                            <OfferWalls isLoading={loading} />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default EarnPage;