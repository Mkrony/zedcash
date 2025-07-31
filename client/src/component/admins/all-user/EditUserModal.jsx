import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import "sweetalert2/dist/sweetalert2.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./alluserspopup.module.css";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import zedStore from "../../zedstore/ZedStore.jsx";

const EditUserModal = ({ user, isOpen, onClose, onUpdate }) => {
    const { allUsers, getAllUsers} = zedStore();
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
        level: user.level,
        isBanned: user.isBanned,
        isVerified: user.isVerified,
        referredBy: user.referredBy,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/updateuser/${user._id}`, formData,{
                withCredentials:true,
            });
            const updatedUser = response.data.user;
            onUpdate(updatedUser);
            setIsLoading(false);
            onClose();
            toast.success("User updated successfully.");
            // recall api
            getAllUsers();
        } catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
           setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_container}>
            <div className={styles.modal_outer_div} onClick={onClose}></div>
            <div className={`${styles.modal_content} overflow-scroll`}>
                <button
                    title="Close"
                    onClick={onClose}
                    className={styles.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styles.modal_body}>
                    <div className={"text-center"}>
                        <h3 className="mb-4">Edit {user.username}'s details</h3>
                    </div>
                    <form onSubmit={handleSubmit} className={styles.edit_user_form}>
                        {/* Username (Read-only) */}
                        <div className="form-group mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                readOnly
                                className="form-control custom-input"
                                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div className="form-group mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="form-control custom-input"
                                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                            />
                        </div>

                        {/* Role (Select Tag) */}
                        <div className="form-group mb-3">
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-control custom-input"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </div>

                        {/* Balance */}
                        <div className="form-group mb-3">
                            <label className="form-label">Balance</label>
                            <input
                                type="text"
                                name="balance"
                                value={formData.balance}
                                onChange={handleChange}
                                className="form-control custom-input"
                            />
                        </div>

                        {/* Level */}
                        <div className="form-group mb-3">
                            <label className="form-label">Level</label>
                            <input
                                type="text"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="form-control custom-input"
                            />
                        </div>

                        {/* Referred By (Read-only) */}
                        <div className="form-group mb-3">
                            <label className="form-label">Referred By</label>
                            <input
                                type="text"
                                name="referredBy"
                                value={formData.referredBy}
                                readOnly
                                className="form-control custom-input"
                                style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                            />
                        </div>

                        {/* Banned */}
                        <div className="form-group mb-3">
                            <label className="form-label">Banned</label>
                            <select
                                name="isBanned"
                                value={formData.isBanned}
                                onChange={handleChange}
                                className="form-control custom-input"
                            >
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                            </select>
                        </div>

                        {/* Verified */}
                        <div className="form-group mb-4">
                            <label className="form-label">Verified</label>
                            <select
                                name="isVerified"
                                value={formData.isVerified}
                                onChange={handleChange}
                                className="form-control custom-input"
                            >
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="btn custom-btn px-5 py-2 fw-bold w-25"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isLoading && (
                <div className="loading-spinner text-center small-spinner position-absolute">
                    <SpinnerAnimation/>
                </div>
            )}
        </div>
    );
};

EditUserModal.propTypes = {
    user: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default EditUserModal;