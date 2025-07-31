import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPen, faPenToSquare, faXmark,faFloppyDisk} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import styled from "./UserDetailsModal.module.css";
import Cookies from "js-cookie";
import axios from "axios";
import MoneyRingAnimation from "../Animations/MoneyRingAnimation.jsx";
import ReactCountryFlag from "react-country-flag"; // Import the flag component
import { byCountry } from "country-code-lookup"; // Import the lookup function

function UserDetailsModal({ isModalOpen, userDetails, closeModal, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...userDetails, password: "" });
    const [formSaving, setformSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isModalOpen || !userDetails) return null;

    // Convert full country name to ISO code (e.g., "Bangladesh" -> "BD")
    const getCountryCode = (countryName) => {
        const countryData = byCountry(countryName); // Lookup country data
        return countryData ? countryData.iso2 : null; // Return ISO code or null if not found
    };

    const countryCode = getCountryCode(userDetails.country); // Get ISO code for the country

    // Generate the flag image URL using flagcdn.com
    const flagImageUrl = countryCode
        ? `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`
        : null;

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
        setFormData({ ...userDetails, password: "" }); // Reset form data and clear password on toggle
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async () => {
        setformSaving(true);
        setLoading(true); // Start the spinner animation
        const token = Cookies.get("token");
        if (!token) {
            toast.error("Authorization token not found. Please log in again.");
            setLoading(false);
            return;
        }

        const updatedData = {
            avatar: formData.avatar || userDetails.avatar,
            password: formData.password || null,
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/update-profile`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });

            if (response.data?.status?.toLowerCase() === "success") {
                setTimeout(() => setLoading(false), 3000); // Simulate spinner duration
                toast.success(response.data.message || "Profile updated successfully.");

                // Call the onSave callback to update userDetails in the parent
                if (onSave) {
                    onSave(updatedData);
                }
            } else {
                throw new Error(response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "An error occurred.");
            setLoading(false); // Stop spinner on error
        } finally {
            setformSaving(false);
            setIsEditing(false); // Exit editing mode
            setTimeout(() => closeModal(), 4000);
        }
    };

    const {
        avatar,
        username,
        email,
        balance,
        pending_balance,
        total_earnings,
        level,
        country,
        created_at,
        role,
        isVerified,
        last_login,
    } = userDetails;

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            <div className={styled.modal_content}>
                <button
                    title="Close"
                    onClick={closeModal}
                    className={styled.modal_close_btn}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div
                    className={styled.modal_header}
                    style={{
                        backgroundImage: flagImageUrl
                            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${flagImageUrl})`
                            : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "20px",
                        borderRadius: "10px 10px 0 0",
                        position: "relative",
                    }}
                >
                    <img
                        src={formData.avatar || "../img/avatar.png"}
                        className={`${styled.avatar} ${styled.square_image} rounded-circle bordered`}
                    />
                    <h3 className={"fw-bold text-capitalize pb-2"}>{username}</h3>
                    <h3 className={"fw-semibold p-1 rounded d-flex align-items-center justify-content-center"}>
                        {/* Display country flag and short code */}
                        {countryCode ? (
                            <>
                                <ReactCountryFlag
                                    countryCode={countryCode}
                                    svg
                                    style={{
                                        width: "1.5em",
                                        height: "1.5em",
                                        marginRight: "0.5em",
                                    }}
                                    title={countryCode} // Tooltip with country code
                                />
                                {countryCode} {/* Display country code (e.g., "BD") */}
                            </>
                        ) : (
                            country // Fallback to full country name if code not found
                        )}
                    </h3>
                </div>
                {loading ? (
                    <div className="loading-spinner profile-saving-spinner text-center medium-spinner" role="alert">
                        <MoneyRingAnimation />
                        {/*<h4 className={"gold fw-bold fa-2xl text-center mt-4"}>Updating Profile...</h4>*/}
                    </div>
                ) : (
                    !isEditing ? (
                        <div className={styled.modal_body}>
                            <h4>Email: {email}</h4>
                            <h4>Balance: {balance.toLocaleString()}</h4>
                            <h4>Pending Balance: {pending_balance.toLocaleString()}</h4>
                            <h4>Total Earnings: {total_earnings.toLocaleString()}</h4>
                            <h4>Role: {role}</h4>
                            <h4>Verified: {isVerified ? "Yes" : "No"}</h4>
                            <h4>
                                Joined:{" "}
                                {new Date(created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </h4>
                            <h4>
                                Last Login: {new Date(last_login).toLocaleString("en-US",{
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    hour12: true,
                                    minute: "numeric",
                            })}
                            </h4>
                        </div>
                    ) : (
                        <div className={`${styled.modal_body} profile_details`}>
                            <label>Avatar URL:</label>
                            <input
                                type="text"
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleChange}
                                className={"form-control"}
                            />

                            <label>Password:</label>
                            <input
                                type="text"
                                name="password"
                                placeholder="Add a new password"
                                value={formData.password}
                                onChange={handleChange}
                                className={"form-control"}
                            />

                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={"form-control"}
                                readOnly
                            />

                            <label>Balance:</label>
                            <input
                                type="text"
                                name="balance"
                                value={formData.balance.toLocaleString()}
                                onChange={handleChange}
                                className={"form-control"}
                                readOnly
                            />

                            <label>Role:</label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={"form-control"}
                                readOnly
                            />
                        </div>
                    )
                )}

                <div className="update-btn text-center">
                    {!isEditing ? (
                        <button
                            className={"mt-3 btn btn-danger fw-semibold"}
                            onClick={handleEditToggle}
                        >
                            <FontAwesomeIcon icon={faPenToSquare}/>
                        </button>
                    ) : (
                        <>
                            <button
                                className={"mt-3 btn btn-success fw-semibold me-2"}
                                onClick={handleSave}
                            >
                                {formSaving ? "Saving..." : <FontAwesomeIcon icon={faFloppyDisk}/>}
                            </button>
                            <button
                                className={"mt-3 btn btn-secondary fw-semibold"}
                                onClick={handleEditToggle}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDetailsModal;