import HeaderSection from "../component/HeaderSection.jsx";
import OfferWalls from "../component/offerwalls/OfferWalls.jsx";
import "../assets/css/earnPage.css";
import Footer from "../component/footer/Footer.jsx";
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
            <section className="offerwalls mb-5 pb-5">
                    <div className="container-fluid">
                        <div className="row m-0 p-0">
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
                                <OfferWalls />
                            </div>
                        </div>

                </div>
            </section>
            <Footer />
        </>
    );
}

export default Offerwalls;
