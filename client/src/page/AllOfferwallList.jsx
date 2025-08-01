import React from "react";
import HeaderSection from "../component/HeaderSection.jsx";
import Footer from "../component/footer/Footer.jsx";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const offerwalls = [
    { name: "Upwall", url: "https://upwall.net" },
    { name: "Admantium", url: "https://cp.admantium.net/" },
    { name: "Adbreakmedia", url: "https://adbreakmedia.com/" },
    // Add more if needed
];

function AllOfferwallList() {
    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard!");
    };

    return (
        <>
            <HeaderSection />

            <div className="container my-5">
                <h2 className="text-center mb-4">Offerwalls URL</h2>
                <p className="text-info text-center">Just click the copy URL button to copy Offerwall link and paste a new tab</p>
                <div className="list-group">
                    {offerwalls.map((offer, index) => (
                        <div
                            key={index}
                            className="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-2"
                        >
                            <div>
                                <strong>{offer.name}</strong> — <span className="text-info">{offer.url}</span>
                            </div>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleCopy(offer.url)}
                            >
                                Copy URL
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
            <ToastContainer position="bottom-center" />
        </>
    );
}

export default AllOfferwallList;
