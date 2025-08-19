import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./alluserspopup.module.css";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import Swal from "sweetalert2";
import axios from "axios";
import CarAnimations from "../../Animations/CarAnimations.jsx";
import SelectedUserWithdrawals from "../AllWithdraw/SelectedUserWithdrawals.jsx";
import SelectedUserCompletedTasks from "../tasks/SelectedUserCompletedTasks.jsx";
import { toast } from "react-toastify";
import EditUserModal from "./EditUserModal.jsx";
import zedStore from "../../zedstore/ZedStore.jsx";

const EveryUserDetailsModal = ({ isOpen, user, onClose }) => {
    const { allUsers, getAllUsers} = zedStore();
    const [avatarLoading, setAvatarLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedUserWithdrawals, setSelectedUserWithdrawals] = useState(null);
    const [selectedUserCompletedTasks, setSelectedUserCompletedTasks] = useState(null);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleAvatarLoad = () => setAvatarLoading(false);

    const confirmAction = async (action, userId) => {
        const result = await Swal.fire({
            title: `Are you sure you want to ${action} this user?`,
            icon: action === "delete" ? "warning" : "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        });

        if (!result.isConfirmed) return;

        setLoading(true);

        try {
            const endpointMap = {
                delete: `/api/deleteuser/${userId}`,
                ban: `/api/banuser/${userId}`,
                unban: `/api/unbanuser/${userId}`,
            };

            const endpoint = endpointMap[action];

            if (!endpoint) {
                Swal.fire("Error", "Invalid action", "error");
                setLoading(false);
                return;
            }

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {}, { withCredentials: true });

            const actionPastTense = {
                delete: "deleted",
                ban: "banned",
                unban: "unbanned",
            }[action] || action + "ed";

            Swal.fire("Success!", `The user has been ${actionPastTense}.`, "success");

            onClose();
            getAllUsers();

        } catch (error) {
            console.error(`Error during ${action} user:`, error);
            Swal.fire("Error", `There was a problem trying to ${action} this user.`, "error");
        } finally {
            setLoading(false);
        }
    };


    const fetchUserWithdrawals = async (userId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getuserwithdrawal/${userId}`,{
                withCredentials:true,
            });
            setSelectedUserWithdrawals(data.withdrawals);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCompletedTasks = async (userId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getusercompletedtasks/${userId}`,{
                withCredentials:true,
            });
            setSelectedUserCompletedTasks(data.offers);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleUserRole = async (userId, role) => {
        try {
            setLoading(true);
            const endpoint = role === "admin" ? `/api/makeadmin/${userId}` : `/api/makeuser/${userId}`;
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`,{},{
                withCredentials:true,
            });
            toast.success(response.data.message);
            setLoading(false);
                onClose();
            // recall api to get all users
            getAllUsers();
        } catch (error) {
            toast.error(error.message);
            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 3000);
        }
        finally {
            setLoading(false);
        }
    };

    const handleEditUser = () => {
        setUserToEdit(user);
        setEditUserModalOpen(true);
    };

    const handleUpdateUser = async (updatedUser) => {
            setEditUserModalOpen(false);
            onClose();
    };
    return (
        <div className={styles.user_details_modal}>
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

                <div className="text-center mt-4">
                    {avatarLoading && (
                        <div className="loading-spinner small-spinner">
                            <SpinnerAnimation />
                        </div>
                    )}
                    <img
                        src={user.avatar || "../img/avatar.png"}
                        className={`${styles.avatar} rounded-circle`}
                        alt="User Avatar"
                        onLoad={handleAvatarLoad}
                        style={{ display: avatarLoading ? "none" : "block" }}
                    />
                </div>

                <div className="username text-center py-2 mx-5 rounded mt-4 mb-2">
                    <h4 className="text-center fw-bold text-capitalize">{user.username}</h4>
                </div>

                {user.isBanned && (
                    <h4 className="text-center text-danger mt-1 fw-bold">
                        {user.username} is banned.
                    </h4>
                )}

                <div className={`${styles.user_details_div} px-5`}>
                    <h6>ID: {user._id}</h6>
                    <h6>User Name : {user.username}</h6>
                    <h6>Email: {user.email}</h6>
                    <h6>Balance: {user.balance || "0.00"}</h6>
                    <h6>Total Earnings : {user.total_earnings || "0.00"}   </h6>
                    <h6>Level: {user.level || "N/A"}</h6>
                    <h6>Role: {user.role}</h6>
                    <h6>Status : {user.status}</h6>
                    <h6>Ip : {user.ip_address}</h6>
                    <h6>Country : {user.country}</h6>
                    <h6>Device Id : {user.device_id}</h6>
                    <h6>User Agent : {user.user_agent}</h6>
                    <h6>Verified: {user.isVerified ? "Yes" : "No"}</h6>
                    <h6>Spin Used: {user.hasSpin ? "Yes" : "No"} </h6>
                    <h6>
                        Joined:{" "}
                        {new Date(user.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            year: "numeric",
                            month: "long",
                        })}
                    </h6>
                    <h6>
                        Last Login:{" "}
                        {user.last_login
                            ? new Date(user.last_login).toLocaleString("en-GB", {
                                day: "numeric",
                                year: "numeric",
                                month: "long",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })
                            : "N/A"}
                    </h6>

                    <div className="buttons d-flex justify-content-center gap-3 my-5">
                        <button className="btn btn-primary" onClick={handleEditUser}>
                            <FontAwesomeIcon icon={faPencilAlt} /> Edit User
                        </button>
                        {user.role === "user" ? (
                            <button className="btn btn-danger" onClick={() => toggleUserRole(user._id, "admin")}>
                                Make Admin
                            </button>
                        ) : (
                            <button className="btn btn-danger" onClick={() => toggleUserRole(user._id, "user")}>
                                Make User
                            </button>
                        )}

                        <button
                            className={`btn ${user.isBanned ? "btn-danger" : "btn-warning"}`}
                            onClick={() => confirmAction(user.isBanned ? "unban" : "ban", user._id)}
                        >
                            {user.isBanned ? "Unban User" : "Ban User"}
                        </button>
                        <button className="btn btn-info" onClick={() => confirmAction("delete", user._id)}>
                            Delete User
                        </button>
                        <button className="btn btn-success" onClick={() => fetchUserWithdrawals(user._id)}>
                            Withdrawls
                        </button>
                        <button className="btn btn-success" onClick={() => fetchUserCompletedTasks(user._id)}>
                            Completed Tasks
                        </button>
                    </div>
                </div>
            </div>

            {selectedUserWithdrawals && (
                <SelectedUserWithdrawals
                    selectedUserWithdrawals={selectedUserWithdrawals}
                    userName={user.username}
                    closeModal={() => setSelectedUserWithdrawals(null)}
                />
            )}

            {selectedUserCompletedTasks && (
                <SelectedUserCompletedTasks
                    selectedUserCompletedTasks={selectedUserCompletedTasks}
                    userName={user.username}
                    closeModal={() => setSelectedUserCompletedTasks(null)}
                />
            )}

            {loading && (
                <div className="bike-load flex-column medium-spinner text-center position-absolute">
                    <SpinnerAnimation />
                </div>
            )}
            {editUserModalOpen && (
                <EditUserModal
                    user={userToEdit}
                    isOpen={editUserModalOpen}
                    onClose={() => setEditUserModalOpen(false)}
                    onUpdate={handleUpdateUser}
                />
            )}

            {updateLoading && (
                <div className="update-loading-spinner text-center position-absolute">
                    <SpinnerAnimation />
                    <h4 className="fw-semibold text-center mt-4">Updating User...</h4>
                </div>
            )}
        </div>
    );
};

EveryUserDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.shape({
        avatar: PropTypes.string,
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        balance: PropTypes.string,
        level: PropTypes.string,
        role: PropTypes.string.isRequired,
        isVerified: PropTypes.bool,
        isBanned: PropTypes.bool,
        created_at: PropTypes.string.isRequired,
        last_login: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
};

export default EveryUserDetailsModal;