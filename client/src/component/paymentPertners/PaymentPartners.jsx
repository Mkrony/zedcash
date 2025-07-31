import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styled from "../offers/Offersoffer.module.css";
import zedStore from "../zedstore/ZedStore.jsx";
import PaymentForm from "./PaymentForm.jsx";
import styles from './PaymentPertners.module.css';

const skeletonArray = Array(6).fill(0);

const PaymentPartners = () => {
    const [paymentPartners, setPaymentPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpenPaymentForm, setIsOpenPaymentForm] = useState(false);
    const [currentPartner, setCurrentPartner] = useState(null);

    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);
    const userDetails = zedStore((state) => state.userDetails);

    useEffect(() => {
        const fetchPaymentPartners = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-cashout-methods`, {
                    withCredentials: true,
                });
                setPaymentPartners(response.data.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to load payment options");
                toast.error("Failed to load payment options");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentPartners();
    }, []);

    const openPaymentForm = (partner) => {
        setIsOpenPaymentForm(true);
        setCurrentPartner(partner);
        document.body.style.overflow = "hidden";
    };

    const closePaymentForm = () => {
        setIsOpenPaymentForm(false);
        document.body.style.overflow = "auto";
    };

    return (
        <>
            <div className={styles.payment_partners_container}>
                <div className={styles.payment_partners_boxes}>
                    {loading ? (
                        skeletonArray.map((_, idx) => (
                            <div key={idx} className={styles.payment_partners_box + " " + styles.skeleton}></div>
                        ))
                    ) : error ? (
                        <div className={styles.errorContainer}>{error}</div>
                    ) : paymentPartners.length === 0 ? (
                        <div className={styles.no_data_text}>No Payment partners added.</div>
                    ) : (
                        paymentPartners.map((partner) => (
                            <div
                                key={partner._id}
                                className={styles.payment_partners_box}
                                onClick={userDetails ? () => openPaymentForm(partner) : () => toggleLoginPopup(true)}
                                title={`Withdraw via ${partner.name}`}
                            >
                                <img
                                    src={partner.imageUrl}
                                    alt={partner.name}
                                    onError={(e) => {
                                        e.target.src = '/img/payment/default-method.png';
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isOpenPaymentForm && currentPartner && (
                <div className={styles.modal_container}>
                    <div className={styles.modal_outer_div} onClick={closePaymentForm}></div>
                    <div className={styles.modal_content}>
                        <button
                            title="Close"
                            onClick={closePaymentForm}
                            className={styled.modal_close_btn}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <div className={styles.payment_form}>
                            <PaymentForm
                                partner={currentPartner}
                                closePaymentForm={closePaymentForm}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentPartners;
