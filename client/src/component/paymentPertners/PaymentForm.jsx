import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./PaymentPertners.module.css";
import Cookies from "js-cookie";
import CashoutAnimation from "../Animations/CashoutAnimation.jsx";
import zedStore from "../zedstore/ZedStore.jsx";

const PaymentForm = ({ partner, closePaymentForm }) => {
    const { userDetails, userDetailsRequested } = zedStore();
    const [loadingStates, setLoadingStates] = useState({
        withdrawLoading: false,
        apiLoading: false
    });
    const [formData, setFormData] = useState({
        amount: '',
        walletAddress: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const token = Cookies.get("token");

    useEffect(() => {
        if (!token) {
            toast.error("Session expired. Please login again.");
            closePaymentForm();
        }
    }, [token, closePaymentForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        const amount = parseFloat(formData.amount);

        if (!formData.amount || isNaN(amount)) {
            errors.amount = "Please enter a valid amount";
        } else if (amount < partner.minWithdrawal) {
            errors.amount = `Minimum withdrawal is ${partner.minWithdrawal} coins`;
        } else if (amount > userDetails.balance) {
            errors.amount = "Insufficient balance";
        }

        if (!formData.walletAddress.trim()) {
            errors.walletAddress = "Wallet address is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const withdrawFormSubmitted = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoadingStates(prev => ({ ...prev, withdrawLoading: true }));

        const payload = {
            amount: parseFloat(formData.amount),
            walletAddress: formData.walletAddress,
            wallet: partner.name
        };

        try {
            setLoadingStates(prev => ({ ...prev, apiLoading: true }));
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/withdraw-coin`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });

            if (response.data.status === "success") {
                toast.success(response.data.message);
                userDetails.balance -= payload.amount;
                userDetailsRequested(true);
                closePaymentForm();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                "An error occurred during withdrawal.";
            toast.error(errorMessage);
        } finally {
            setLoadingStates({ withdrawLoading: false, apiLoading: false });
        }
    };

    return (
        <div className={styles.payment_form}>
            <div className={`${styles.form_body} p-3`}>
                {loadingStates.apiLoading ? (
                    <div className="h200-spinner text-center d-flex flex-column align-items-center justify-content-center" role="alert">
                        <CashoutAnimation />
                        <h4 className="withdraw-spinning-text fw-semibold">Withdrawal is processing...</h4>
                    </div>
                ) : (
                    <>
                        <div className={styles.payment_method_header}>
                            <h2 className="text-center fw-bold">{partner.name}</h2>
                        </div>

                        <p className="text-center m-0 text-info">
                            Minimum withdrawal amount is <span className="green">{partner.minAmount}</span> coins
                        </p>
                        <form className="p-2" onSubmit={withdrawFormSubmitted}>
                            <div className="form-group">
                                <label htmlFor="amount">Amount (coins)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    id="amount"
                                    className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`}
                                    placeholder={`Minimum ${partner.minAmount} coins`}
                                    min={partner.minWithdrawal}
                                    max={userDetails?.balance}
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.amount && (
                                    <div className="invalid-feedback">{validationErrors.amount}</div>
                                )}
                            </div>

                            <div className="form-group pt-2">
                                <label htmlFor="walletAddress">{partner.wallet} Address</label>
                                <input
                                    name="walletAddress"
                                    type="text"
                                    id="walletAddress"
                                    className={`form-control ${validationErrors.walletAddress ? 'is-invalid' : ''}`}
                                    placeholder={`Enter your ${partner.name} address`}
                                    value={formData.walletAddress}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.walletAddress && (
                                    <div className="invalid-feedback">{validationErrors.walletAddress}</div>
                                )}
                            </div>

                            <div className={`${styles.submit_btn} mt-4`}>
                                <button
                                    type="submit"
                                    className="btn custom-btn w-100 fw-semibold fa-2x"
                                    disabled={loadingStates.withdrawLoading}
                                    aria-busy={loadingStates.withdrawLoading}
                                >
                                    {loadingStates.withdrawLoading ? "Processing..." : "Withdraw Now"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

PaymentForm.propTypes = {
    partner: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        wallet: PropTypes.string.isRequired,
        minWithdrawal: PropTypes.number.isRequired
    }).isRequired,
    closePaymentForm: PropTypes.func.isRequired
};

export default PaymentForm;