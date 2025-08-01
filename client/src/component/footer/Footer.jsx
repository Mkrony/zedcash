import React, { memo } from "react";
import {Link, NavLink} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import {
    faFacebookSquare,
    faTelegram,
    faLinkedinIn,
    faFacebookMessenger,
} from "@fortawesome/free-brands-svg-icons";
import styles from "./Footer.module.css";

function Footer() {
    const siteName = "ZedCash";
    return (
        <footer className={styles.footer}>
            <div className={styles.top_footer}>
                <div className="container-fluid">
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
                            <div className={`${styles.top_footer_nav_social} text-center`}>
                                <h2>Join Our Community</h2>
                                <ul>
                                    <li>
                                        <Link to="#" aria-label="Facebook">
                                            <FontAwesomeIcon icon={faFacebookSquare} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="#" aria-label="Telegram">
                                            <FontAwesomeIcon icon={faTelegram} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="#" aria-label="LinkedIn">
                                            <FontAwesomeIcon icon={faLinkedinIn} />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* eassential Links */}
                        <div className="col-md-3">
                            <div className={`${styles.footer_essential_link} text-center`}>
                                <h2>Essential Links</h2>
                                <NavLink to={"/offerwall-list"} className={"btn btn-sm btn-success m-1"}>All Offerwall URL</NavLink>
                                <NavLink to={"/offerwall-list"} className={"btn btn-sm btn-success m-1"}>All Offerwall URL</NavLink>
                                <NavLink to={"/offerwall-list"} className={"btn btn-sm btn-success m-1"}>All Offerwall URL</NavLink>
                                <NavLink to={"/offerwall-list"} className={"btn btn-sm btn-success m-1"}>All Offerwall URL</NavLink>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="col-md-3">
                            <div className={`${styles.top_footer_review} text-md-end`}>
                                <h2>We Are Awesome</h2>
                                <div className={styles.star}>
                                    {[...Array(5)].map((_, index) => (
                                        <span key={index}>
                                            <FontAwesomeIcon icon={faStar} />
                                        </span>
                                    ))}
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
    );
}

export default memo(Footer); // Optimize re-renders with React.memo