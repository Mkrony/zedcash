import React, { useEffect, useRef, useState } from 'react';
import LoginForm from "../component/login/LoginForm.jsx";
import '../assets/css/herosectioncss.css';
import '../assets/css/HomePage.css';
import '../assets/css/main.css';
import HeaderSection from "../component/HeaderSection.jsx";
import { NavLink } from "react-router-dom";
import CoinAnimation from "../component/Animations/CoinAnimation.jsx";
import GameBoxAnimation from "../component/Animations/GameBoxAnimation.jsx";
import OverView from "../component/overview/OverView.jsx";
import HowWeWork from "../component/howWeWork/HowWeWork.jsx";
import Faq from "../component/faq/Faq.jsx";
import Footer from "../component/footer/Footer.jsx";
import LiveCashout from "../component/liveCashout/LiveCashout.jsx";
import PaymentPartners from "../component/paymentPertners/PaymentPartners.jsx";
import DanceAnimation from "../component/Animations/DanceAnimation.jsx";
import useZedStore from "../component/zedstore/ZedStore";
import Cookies from "js-cookie";
import TimeLine from "../component/Timeline/TimeLine.jsx";
import WheelAnnimation from "../component/Animations/WheelAnnimation.jsx";

function HomePage() {
    const typewriterWords = ["Testing apps", "Games & Surveys", "Watching movies", "And many more"];
    const [typedWord, setTypedWord] = useState("");
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const typingSpeed = 100;
    const pauseDuration = 1500;
    const toggleLoginPopup = useZedStore((state) => state.toggleLoginPopup);

    useEffect(() => {
        const handleTyping = () => {
            const currentWord = typewriterWords[currentWordIndex];
            if (isDeleting) {
                setTypedWord((prev) => prev.slice(0, -1));
                if (typedWord === "") {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
                }
            } else {
                setTypedWord((prev) => currentWord.slice(0, prev.length + 1));
                if (typedWord === currentWord) {
                    setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? typingSpeed / 2 : typingSpeed);
        return () => clearTimeout(timer);
    }, [typedWord, isDeleting, currentWordIndex, typewriterWords]);

    const token = Cookies.get("token");

    // Scroll animation
    const useIntersectionObserver = (elements, options) => {
        useEffect(() => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, options);
            elements.forEach((el) => el && observer.observe(el));
            return () => {
                elements.forEach((el) => el && observer.unobserve(el));
            };
        }, [elements, options]);
    };

    const sections = useRef([]);
    useIntersectionObserver(sections.current, { threshold: 0.1 });

    // Fetch user details
    const { userDetails, userDetailsRequested } = useZedStore();
    useEffect(() => {
        userDetailsRequested();
    }, [userDetailsRequested]);

    const {
        avatar,
        username,
        email,
        balance,
        pending_balance,
        total_earnings,
        level,
        isVerified,
        isBanned,
    } = userDetails || {};

    if (isBanned) {
        Cookies.remove("token");
    }

    // Skeleton Loading Component
    const ProfileSkeleton = () => (
        <div className="home-logedin-profile shadow text-center skeleton-container">
            <div className="skeleton-avatar rounded-circle"></div>
            <div className="skeleton-text mt-3 mx-auto" style={{width: '70%', height: '24px'}}></div>
            <div className="skeleton-button mt-4 mx-auto" style={{width: '60%', height: '40px'}}></div>
        </div>
    );

    return (
        <>
            <HeaderSection />
            {/* Hero section */}
            <div className="container-fluid">
                <div className="row">
                    <TimeLine/>
                </div>
            </div>
            <div className="hero-section pt-2">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6">
                            <div className="styled-text text-center my-md-3">
                                <h1 className="fw-semibold fa-3x">
                                    <span className="green">Get Paid </span> For
                                </h1>
                                <h1 className="fw-semibold fa-3x mx-2">
                                    <span>{typedWord}</span>
                                    <span className="blinking-cursor">|</span>
                                </h1>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 offset-md-2 mt-5">
                            {!userDetails ? (
                                <LoginForm newAccText="Create a new account" />
                            ) : (
                                <div className="home-logedin-profile shadow text-center">
                                    {!avatar ? (
                                        <div className="skeleton-avatar rounded-circle"></div>
                                    ) : (
                                        <img
                                            src={avatar || "../img/avatar.png"}
                                            className="rounded-circle p-2 bordered profile-avatar"
                                            alt="User Avatar"
                                        />
                                    )}
                                    <h4 className={"my-2 pt-3"}>
                                        {!username ? (
                                            <div className="skeleton-text mx-auto" style={{width: '70%', height: '24px'}}></div>
                                        ) : (
                                            <span className="fw-bold">{username}</span>
                                        )}
                                    </h4>
                                    <NavLink
                                        to="/earn"
                                        className="d-inline-block text-white text-decoration-none bg-danger rounded home-profile-btn mt-4"
                                    >
                                        Start Earning
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* After hero section */}
            <div className="after-hero-section">
                <div className="container-fluid">
                    <div
                        className="row align-items-center my-md-5 py-md-5 fade-in-section"
                        ref={(el) => (sections.current[2] = el)}
                    >
                        <div className="col-12 col-md-6">
                            <div className="after-hero-section-left-area">
                                <h2 className="mb-3 fw-semibold">
                                    Want to earn free <span className="green">Reward</span> within minutes? <span className="green">Here's how</span>
                                </h2>
                                <p>
                                    Find out more about the best deals and discounts on Netflix, Games & Surveys, and more.
                                </p>
                                <div className="animated-box-right mt-5">
                                    <NavLink
                                        to={"/howtoearn"}
                                        className="btn custom-btn px-4 py-2 fw-bold fa-2x"
                                    >
                                        Learn How To Earn
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 offset-md-2">
                            <div className="after-hero-section-right-area animated-box">
                                <CoinAnimation />
                            </div>
                        </div>
                    </div>
                </div>

                {/* How we work section */}
                <div className="container-fluid">
                    <div
                        className="row align-items-center row-gap-3 my-md-5 py-md-5 fade-in-section"
                        ref={(el) => (sections.current[6] = el)}
                    >
                        <HowWeWork />
                    </div>
                </div>
            </div>

            <div className="fade-in-section" ref={(el) => (sections.current[12] = el)}>
                <div className="container-fluid">
                    <div className="row my-5 py-5">
                        <div className="col-12">
                            <div className="new_user_spin">
                                <div className="row align-items-center">
                                    <div className="col-12 col-md-8">
                                        <div className="new_user_spin_box">
                                            <h2>
                                               <span className="green">New User Reward Spin</span>  – Get a Chance to Win Big!
                                            </h2>
                                            <p>
                                               <span className="green"> 🎉 Welcome to our platform!</span> New users get one chance to spin the reward wheel and win up to 1000 coins instantly! 🪙 Out of 30 segments, 10 offer real coin rewards. Sign up, spin once, and start your journey with a surprise bonus. Try your luck now! 🎯
                                            </p>
                                            <div className="animated-box">
                                            <NavLink
                                                to="/spin" className="btn custom-btn mt-3">Try Your Spin </NavLink>
                                             </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="new_user_spin_box spin_box text-end">
                                            <WheelAnnimation/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fade-in-section animated-background" ref={(el) => (sections.current[3] = el)}>
                <div className="container-fluid">
                    <div className="row my-md-5 py-md-5">
                        <div className="col-12">
                            <div className="homepage-login-promotion text-center content">
                                <h1 className="fw-semibold">
                                    Earn money in the <span className="green">next 15 minutes</span>
                                </h1>
                                <h4 className="my-md-5">
                                    Join the fast-growing community of gamers and developers who are making games and apps available to everyone.
                                </h4>
                                <div className="animated-box">
                                    {!userDetails ? (
                                        <button
                                            className="d-inline-block text-white text-decoration-none bg-danger rounded home-profile-btn mt-4"
                                            onClick={() => {
                                                toggleLoginPopup(true);}}
                                        >
                                            Start Earning Now
                                        </button>
                                    ) : (
                                        <NavLink
                                            to={"/earn"}
                                            className="btn custom-btn px-4 py-2 fw-bold fa-2x my-3"
                                        >
                                            Start Earning Now
                                        </NavLink>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                <div
                    className="row align-items-center my-md-5 py-md-5 fade-in-section"
                    ref={(el) => (sections.current[4] = el)}
                >
                    <div className="col-12 col-md-4">
                        <div className="after-hero-section-right-area">
                            <DanceAnimation />
                        </div>
                    </div>
                    <div className="col-12 col-md-6 offset-md-2">
                        <div className="after-hero-section-left-area">
                            <h2 className="mb-md-3 fw-bold">
                                Discover <span className="green">new</span> games and apps <span className="green">every day</span>
                            </h2>
                            <p>Join the growing community of gamers and developers who are making games and apps available to everyone.</p>
                            <div className="icon">
                                <GameBoxAnimation />
                            </div>
                            <h4 className={"text-center green my-5 fw-bold"}>Lets play some games</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview section */}
            <div className="container-fluid">
                <div
                    className="row align-items-center row-gap-3 my-md-5 py-md-5 fade-in-section"
                    ref={(el) => (sections.current[5] = el)}
                >
                    <OverView />
                </div>
            </div>

            {/* Cashout methods */}
            <div className="container-fluid">
                <div className="row align-items-center my-md-5 py-md-5">
                    <div className="col-12">
                        <div className="section-title mb-md-5 my-5">
                            <h2 className="fw-semibold">Our Payment Partners</h2>
                        </div>
                        <PaymentPartners />
                    </div>
                </div>
            </div>

            {/* Live cashout section */}
            <div className="container">
                <LiveCashout />
            </div>

            {/* FAQ */}
            <div className="container-fluid">
                <div
                    className="row align-items-center my-md-5 py-md-5 fade-in-section"
                    ref={(el) => (sections.current[7] = el)}
                >
                    <Faq />
                </div>
            </div>

            <Footer />
        </>
    );
}

export default HomePage;