import { useState, useEffect } from "react";
import OfferwallBox from "./offerwallsBox/OfferwallBox.jsx";
import OfferWallModal from "../modal/OfferWallModal.jsx";
import styles from './Offerwalls.module.css';
import zedStore from "../zedstore/ZedStore.jsx";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import 'react-tooltip/dist/react-tooltip.css';
import axios from "axios";

function OfferWalls() {
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    const userDetails = zedStore((state) => state.userDetails);
    const [modalTitle, setModalTitle] = useState("");
    const [modalUrl, setModalUrl] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [offerwalls, setOfferwalls] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [error, setError] = useState(null);

    const getUserId = () => {
        const token = Cookies.get("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.id;
            } catch (error) {
                console.error("Error decoding token:", error);
                return "guest";
            }
        }
        return "guest";
    };

    useEffect(() => {
        const fetchOfferwalls = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const userId = getUserId();
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/get-offerwalls`,
                    { withCredentials: true }
                );

                if (!response.data) {
                    throw new Error("No data received from server");
                }

                const { status, data, message } = response.data;

                if (status === "success") {
                    const activeOfferwalls = [];
                    const activeSurveys = [];

                    data.forEach(offerwall => {
                        // Check if offerwall is active (offerwallStatus not explicitly false)
                        // Default to true if field doesn't exist (for backward compatibility)
                        const isActive = offerwall.offerwallStatus !== false;

                        if (isActive) {
                            const formattedItem = {
                                id: offerwall._id,
                                imgSrc: offerwall.offerWallLogo,
                                altText: offerwall.offerWallName,
                                rating: offerwall.offerWallRating,
                                description: offerwall.offerwallCategory === "survey"
                                    ? "Earn coins by completing surveys"
                                    : "Earn coins by completing offers",
                                url: `${offerwall.offerWallIfreamUrl}${userId}`,
                                featured: true,
                                offerwallCategory: offerwall.offerwallCategory || "offerwall",
                                offerwallStatus: offerwall.offerwallStatus !== false
                            };

                            if (formattedItem.offerwallCategory === "survey") {
                                activeSurveys.push(formattedItem);
                            } else {
                                activeOfferwalls.push(formattedItem);
                            }
                        }
                    });

                    setOfferwalls(activeOfferwalls);
                    setSurveys(activeSurveys);

                    if (activeOfferwalls.length === 0 && activeSurveys.length === 0) {
                        setError("No active offerwalls available at the moment");
                    }
                } else {
                    setError(message || "Failed to fetch offerwalls");
                }
            } catch (err) {
                console.error("Offerwalls fetch error:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load offerwalls. Please try again later."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchOfferwalls();
    }, []);

    const openModal = (altText, url) => {
        setModalTitle(altText);
        setModalUrl(url);
        setIsLoading(true);
        setIsModalOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = "auto";
    };

    const handleOfferwallClick = (altText, url) => {
        if (!userDetails) {
            toggleLoginPopup(true);
            return;
        }
        openModal(altText, url);
    };

    const renderOfferwallBoxes = (items, title) => {
        if (items.length === 0) return null;

        return (
            <>
                <div className="section-title mb-2 mt-4">
                    <h4>💰 {title}</h4>
                </div>
                <div className={styles.our_offerwall_partner}>
                    {items.map((item) => (
                        <OfferwallBox
                            key={item.id}
                            imgSrc={item.imgSrc}
                            altText={item.altText}
                            rating={item.rating}
                            url={item.url}
                            description={item.description}
                            featured={item.featured}
                            onClick={() => handleOfferwallClick(item.altText, item.url)}
                        />
                    ))}
                </div>
            </>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className={styles.loading}>Loading offerwalls...</div>;
        }

        if (error) {
            return <div className={styles.error}>{error}</div>;
        }

        return (
            <>
                {renderOfferwallBoxes(offerwalls, "Offerwalls")}
                {renderOfferwallBoxes(surveys, "Survey Walls")}
            </>
        );
    };

    return (
        <section className={styles.offerwallsSection}>
            {renderContent()}
            <OfferWallModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                isLoading={isLoading}
                modalUrl={modalUrl}
                setIsLoading={setIsLoading}
                modalTitle={modalTitle}
            />
        </section>
    );
}

export default OfferWalls;