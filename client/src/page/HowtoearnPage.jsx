import React from "react";
import { BarChart, CheckCircle, Share2, DollarSign, Send } from "lucide-react";
import { motion } from "framer-motion";
import HeaderSection from "../component/HeaderSection.jsx";
import Footer from "../component/footer/Footer.jsx";

function HowtoearnPage() {
    const steps = [
        {
            icon: <BarChart className="text-blue-500 w-8 h-8" />,
            title: "1. Explore Offerwalls",
            desc: "Browse offerwalls like AdGem, CPX, and OfferToro. Complete tasks, surveys, or app installs to earn coins.",
        },
        {
            icon: <CheckCircle className="text-green-500 w-8 h-8" />,
            title: "2. Instant Rewards",
            desc: "Your coins are credited instantly after successful completion. Transparent tracking and no delays.",
        },
        {
            icon: <Share2 className="text-purple-500 w-8 h-8" />,
            title: "3. Refer Friends",
            desc: "Share your referral link and earn a lifetime commission from their offer completions.",
        },
        {
            icon: <DollarSign className="text-yellow-500 w-8 h-8" />,
            title: "4. Track Earnings",
            desc: "Access your dashboard to monitor your offer history, referral income, and daily performance.",
        },
        {
            icon: <Send className="text-red-500 w-8 h-8" />,
            title: "5. Withdraw Easily",
            desc: "Cash out via PayPal, Crypto, or Gift Cards once you meet the minimum withdrawal threshold.",
        },
    ];

    return (
        <>
            <HeaderSection/>
            <div className="login-area d-flex align-items-center justify-content-center vh-90 text-white py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h1 className="fw-bold display-4 text-white">How to Earn</h1>
                        <p className="text-info">
                            Learn the simple steps to start earning with our platform.
                        </p>
                    </div>

                    <div className="row g-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="col-md-6 col-lg-4"
                            >
                                <div className="p-4 rounded-4 bg-dark border border-secondary h-100 shadow-sm hover-shadow transition">
                                    <div className="d-flex align-items-center mb-3">
                                        {step.icon}
                                        <h5 className="ms-3 mb-0 text-white">{step.title}</h5>
                                    </div>
                                    <p className="text-light opacity-75">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default HowtoearnPage;
