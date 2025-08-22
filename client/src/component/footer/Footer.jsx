import React, {memo, useState} from "react";
import {Link, NavLink} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faComment, faEnvelope, faMessage, faStar} from "@fortawesome/free-solid-svg-icons";
import styles from "./Footer.module.css";
import LiveChat from "../liveChat/LiveChat.jsx";
import SupportEmail from "../supports/SupportEmail.jsx";
import zedStore from "../zedstore/ZedStore.jsx";

function Footer() {
    const {userDetails,userDetailsRequested,} = zedStore();
    const siteName = "ZedCash";
    const [supportEmailPopup, setSupportEmailPopup] = useState(false);
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    return (
        <>
        <footer className={styles.footer}>
            <div className={styles.top_footer}>
                <div className="container-fluid">
                    <LiveChat/>
                    <div className="row">
                        {/* Logo and Description */}
                        <div className="col-md-3">
                            <div className={`${styles.footer_logo} m-md-0 m-auto`}>
                                <Link to="/">
                                    <img src="img/logo.png" alt={`${siteName} Logo`} />
                                </Link>
                            </div>
                            <div className={styles.top_footer_paragraph}>
                                <p>
                                    {siteName} – Your ultimate earning platform! Complete tasks, play games, take surveys,
                                    and more to earn coins. Convert your coins into real money effortlessly!
                                </p>
                            </div>
                        </div>
                        {/* Social Media Links */}
                        <div className="col-md-3">
                            <div className={`${styles.footer_essential_link}`}>
                                <h2 className={"green"}>{siteName}</h2>
                                <NavLink to={"/earn"} className={"text-decoration-none m-1"}>Earn</NavLink>
                                <NavLink to={"/cashout"} className={"text-decoration-none m-1"}>Cashout</NavLink>
                                <NavLink to={"/profile"} className={"text-decoration-none m-1"}>Profile</NavLink>
                            </div>
                        </div>
                        {/* eassential Links */}
                        <div className="col-md-3">
                            <div className={`${styles.footer_essential_link}`}>
                                <h2 className={"green"}>Essential Links</h2>
                                <NavLink to={"/offerwall-list"} className={"text-decoration-none m-1"}>All Offerwall URL</NavLink>
                                <NavLink to={"/privacy"} className={"text-decoration-none m-1"}>Privacy-Policy</NavLink>
                                <NavLink to={"/terms"} className={"text-decoration-none m-1"}>Terms of Service</NavLink>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="col-md-3">
                            <div className={`${styles.top_footer_review}`}>
                                <h2 className={"green"}>Do you need urgent Support ?</h2>
                                <div className={styles.star}>
                                    {/* Email to admin */}
                                    <FontAwesomeIcon
                                        title="Email to admin"
                                        onClick={() => setSupportEmailPopup(true)}
                                        className="cursor-pointer"
                                        icon={faEnvelope}
                                    />

                                    {/* Support ticket */}
                                    {!userDetails ? (
                                        <span
                                            onClick={() => toggleLoginPopup(true)}
                                            title="Create a ticket"
                                            className="cursor-pointer ms-2"
                                        >
      <FontAwesomeIcon icon={faMessage} />
    </span>
                                    ) : (
                                        <NavLink
                                            title="Create a ticket"
                                            to="/ticket"
                                            className="text-decoration-none ms-2"
                                        >
                                            <FontAwesomeIcon icon={faMessage} />
                                        </NavLink>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Copyright Section */}
            <div className={styles.bottom_footer}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className={`${styles.bottom_footer_copyright} text-center mt-5`}>
                                <p>
                                    © {new Date().getFullYear()}{" "}
                                    <span className="green ms-1">
                                        <Link
                                            to="https://facebook.com/webdevrony"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {siteName}
                                        </Link>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
            {
                supportEmailPopup &&(
                    <SupportEmail onClose={() => setSupportEmailPopup(false)} />
                )
            }

        </>
    );
}

export default memo(Footer); // Optimize re-renders with React.memo