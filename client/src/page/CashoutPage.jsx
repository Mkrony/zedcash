import HeaderSection from "../component/HeaderSection.jsx";
import LiveCashout from "../component/liveCashout/LiveCashout.jsx";
import PaymentPartners from "../component/paymentPertners/PaymentPartners.jsx";
import Footer from "../component/footer/Footer.jsx";
import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import TimeLine from "../component/Timeline/TimeLine.jsx";

function CashoutPage() {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    if (!token) {
        navigate("/");
        toast.error("Login to continue")
    }
    return (
        <>
            <HeaderSection/>
            <div className="container-fluid">
                <div className="row">
                    <TimeLine/>
                </div>
            </div>
            <section className="hero-section">
                <div className="container-fluid">
                    <div className="row m-0 p-0">
                        <div className="col-md-12 col-12">
                            <div className="section-title mb-5 ms-3">
                                <h4>Our Payment Partners</h4>
                            </div>
                            <PaymentPartners/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row mt-5">
                        <LiveCashout/>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    )
}

export default CashoutPage
