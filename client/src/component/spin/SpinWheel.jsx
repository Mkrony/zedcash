import React, { useEffect, useRef, useState } from "react";
import styles from "./SpinWheel.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import HeaderSection from "../HeaderSection.jsx";
import Footer from "../footer/Footer.jsx";
import ZedStore from "../zedstore/ZedStore.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const SEGMENT_COLORS = [
    "#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93",
    "#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93",
    "#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93",
    "#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"
];

const SpinWheel = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [rewardWon, setRewardWon] = useState(null);
    const [rewards, setRewards] = useState([]);
    const { userDetails, userDetailsRequested } = ZedStore();
    const userId = userDetails?._id?.toString();

    if (!token) {
        navigate("/");
        toast.error("Login to continue");
        return null;
    }

    // Initialize wheel
    useEffect(() => {
        const fetchWheelConfig = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/spin/config`,
                    { withCredentials: true }
                );
                setRewards(response.data.rewards);
                setHasSpun(response.data.hasSpun);
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load wheel");
                console.error("Config fetch failed:", err);
            }
        };

        fetchWheelConfig();
    }, []);

    const drawWheel = () => {
        if (!rewards.length || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const size = canvas.width;
        const center = size / 2;
        const angle = (2 * Math.PI) / rewards.length;
        const textRadius = center - 30;

        ctx.clearRect(0, 0, size, size);

        rewards.forEach((reward, i) => {
            const startAngle = i * angle;
            const endAngle = startAngle + angle;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, center, startAngle, endAngle);
            ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            ctx.fill();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + angle / 2);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(`${reward}`, textRadius, 5);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(center, center, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
    };

    const spin = async () => {
        if (isSpinning || hasSpun || !userId) return;

        try {
            setIsSpinning(true);

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/spin`,
                { userId },
                { withCredentials: true }
            );

            const { prizeIndex, prizeAmount } = response.data;
            setRewardWon(prizeAmount);

            // Calculate rotation
            const anglePerSlice = 360 / rewards.length;
            const rotations = 5;
            const targetAngle = rotations * 360 + (rewards.length - prizeIndex - 0.5) * anglePerSlice;
            setRotation(prev => prev + targetAngle);

            setTimeout(async () => {
                // First show the modal
                setShowModal(true);
                setHasSpun(true);
                setIsSpinning(false);

                try {
                    // Then refresh user details
                    await userDetailsRequested();

                    // Finally show toast with updated balance (after 500ms delay)
                    setTimeout(() => {
                        if (prizeAmount > 0) {
                            toast.success(`🎉 You won ${prizeAmount} coins!}`);
                        } else {
                            toast.info("😞 Better luck next time!");
                        }
                    }, 500);
                } catch (err) {
                    console.error("Failed to refresh user details:", err);
                    toast.error("Failed to update balance");
                }

                setTimeout(() => setShowModal(false), 3000);
            }, 5200); // Match this with CSS transition duration

        } catch (err) {
            setIsSpinning(false);
            toast.error(err.response?.data?.message || "Spin failed");
            console.error("Spin failed:", err);
        }
    };

    useEffect(() => {
        drawWheel();
    }, [rewards]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.style.transition = isSpinning
            ? "transform 5.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none";
        canvas.style.transform = `rotate(${rotation}deg)`;
    }, [rotation, isSpinning]);

    return (
        <>
            <HeaderSection />

            <div className={styles.spinContainer}>
                <div className={styles.wheelWrapper}>
                    <div className={styles.pointer}></div>
                    <canvas
                        ref={canvasRef}
                        width="500"
                        height="500"
                        className={styles.canvasWheel}
                        aria-label="Spin wheel with rewards"
                    />
                </div>

                <div className={styles.spinInfo}>
                    <button
                        className={`${styles.spinBtn} ${isSpinning ? styles.spinning : ''}`}
                        onClick={spin}
                        disabled={isSpinning || hasSpun}
                        aria-label={hasSpun ? "Already spun" : isSpinning ? "Spinning" : "Spin now"}
                    >
                        {hasSpun ? "Already Spun" : isSpinning ? "Spinning..." : "Spin Now"}
                    </button>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    {rewardWon > 0 && <div className={styles.fireworks}></div>}
                    <div className={styles.modal} role="alertdialog">
                        {rewardWon > 0 ? (
                            <>
                                <h3>Congratulations! 🎉</h3>
                                <p>You won {rewardWon} coins!</p>
                            </>
                        ) : (
                            <>
                                <h3>Better luck next time!</h3>
                                <p>You didn't win this time.</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default SpinWheel;