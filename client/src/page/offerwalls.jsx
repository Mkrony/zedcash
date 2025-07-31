import React, { useEffect, useState } from "react";
import HeaderSection from "../component/HeaderSection.jsx";
import OfferWalls from "../component/offerwalls/OfferWalls.jsx";
import "../assets/css/earnPage.css";
import Footer from "../component/footer/Footer.jsx";
import Sidebar from "../component/sidebar/Sidebar.jsx";
import TimeLine from "../component/Timeline/TimeLine.jsx";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWallet} from "@fortawesome/free-solid-svg-icons";
function Offerwalls() {
    return (
        <>
            <HeaderSection />
            <div className="container-fluid">
                <div className="row">
                    <TimeLine/>
                </div>
            </div>
            <section className="offerwalls">
                    <div className="container-fluid">
                        <div className="row m-0 p-0">
                            {/*<div className="col-md-2 ps-0">*/}
                            {/*    <Sidebar />*/}
                            {/*</div>*/}
                            <div className="col-md-12 col-12">
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

                                <div className="section-title mt-5">
                                    <h2>Offerwalls</h2>
                                    <p className="mt-3 mb-5 ms-2">
                                        Each offer wall contains hundreds of tasks to complete.
                                        Choose from one of them to start earning coins.
                                    </p>
                                </div>
                                <OfferWalls />
                                <div className="mt-5 pt-5">
                                    <Footer />
                                </div>
                            </div>
                        </div>

                </div>
            </section>
        </>
    );
}

export default Offerwalls;
