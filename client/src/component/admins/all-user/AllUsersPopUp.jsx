import { faBan, faEye, faFaceSmile, faPencilAlt, faTrash, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import PropTypes from "prop-types";
import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import styled from "./alluserspopup.module.css";
import EveryUserDetailsModal from "./EveryUserDetailsModal.jsx";
import EditUserModal from "./EditUserModal.jsx";

const AllUsersPopUp = ({ showModal, closeModal, allUsers, getAllUsers }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const filteredUsers = allUsers.filter((user) =>
        [user._id, user.username, user.email, user.role, user.balance, user.ip_address]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
    const viewUserDetails = async (userId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userbyid/${userId}`, {
                withCredentials: true
            });
            setSelectedUser(response.data.user);
            document.body.style.overflow = "hidden";
        } catch (error) {
            console.error("Error fetching user details:", error);
            Swal.fire("Error", "Failed to load user details", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserAction = async (action, userId) => {
        const result = await Swal.fire({
            title: `Are you sure you want to ${action} this user?`,
            icon: action === "delete" ? "warning" : "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${action} user!`,
        });
        if (!result.isConfirmed) return;
        setLoading(true);
        try {
            let endpoint = "";
            switch (action) {
                case "delete":
                    endpoint = `/api/deleteuser/${userId}`;
                    break;
                case "ban":
                    endpoint = `/api/banuser/${userId}`;
                    break;
                case "unban":
                    endpoint = `/api/unbanuser/${userId}`;
                    break;
                default:
                    throw new Error("Invalid action");
            }

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`,{},{
                withCredentials: true,
            });
            await getAllUsers();
            Swal.fire("Success!", `User ${action}ed successfully!`, "success");
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            Swal.fire("Error", `Failed to ${action} user`, "error");
        } finally {
            setLoading(false);
        }
    };
    const handleEditUser = (user) => {
        setUserToEdit(user);
        setEditUserModalOpen(true);
    };
    const handleUpdateUser = async (updatedUser) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/updateuser/${updatedUser._id}`, updatedUser,{
                withCredentials:true,
            });
            await getAllUsers(); // Refresh the users list
            setEditUserModalOpen(false);
            Swal.fire("Success!", "User updated successfully!", "success");
        } catch (error) {
            console.error("Error updating user:", error);
            Swal.fire("Error", "Failed to update user", "error");
        }
    };
    if (!showModal){
        document.body.style.overflow = "auto";
        return null
    }else{
        document.body.style.overflow = "hidden";
    };
    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={closeModal}></div>

            <div className={styled.modal_content}>
                <button
                    title="Close"
                    onClick={closeModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className={styled.modal_body}>
                    <div className="text-center py-3">
                        <h3 className="text-center">All Users</h3>
                    </div>
                    <div className={`${styled.users_search} mb-1 text-center`}>
                        <input
                            type="text"
                            placeholder="Start Typing to Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control m-auto custom-input`}
                        />
                    </div>
                    {filteredUsers.length === 0 ? (
                        <div className={`${styled.no_users_found} d-md-flex flex-column justify-content-center align-items-center text-center`}>
                            <NotFoundAnimation />
                        </div>
                    ) : (
                        <div>
                            <div className={`${styled.custom_table_container}`}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Balance</th>
                                        <th>Referred By</th>
                                        <th>IP</th>
                                        <th>Country</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentUsers.map((user, index) => (
                                        <tr key={user._id}>
                                            <td>{indexOfFirstUser + index + 1}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{user.balance || "0.00"}</td>
                                            <td>{user.referredBy || "N/A"}</td>
                                            <td>{user.ip_address || "N/A"} </td>
                                            <td>{user.country || "N/A"}</td>
                                            <td>
                                                {
                                                    user.isBanned ? (
                                                        <span className="text-danger">Banned</span>
                                                    ) : (
                                                        <span className="text-white">Active</span>
                                                    )
                                                }
                                            </td>
                                            <td>
                                                <div className={`${styled.buttons} d-flex align-items-center justify-content-center`}>
                                                    <button
                                                        onClick={() => viewUserDetails(user._id)}
                                                        className="btn btn-sm btn-info text-white"
                                                        title={"View User Details"}
                                                    >
                                                        <FontAwesomeIcon icon={faEye}/>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-dark ms-2"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                    </button>
                                                    {user.isBanned ? (
                                                        <button
                                                            onClick={() => handleUserAction("unban", user._id)}
                                                            className="btn btn-sm btn-warning mx-2"
                                                            title={"Unban User"}
                                                        >
                                                            <FontAwesomeIcon icon={faFaceSmile}/>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUserAction("ban", user._id)}
                                                            className="btn btn-sm btn-success mx-2"
                                                            title={"Ban User"}
                                                        >
                                                            <FontAwesomeIcon icon={faBan}/>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUserAction("delete", user._id)}
                                                        className="btn btn-sm mx-2 btn-danger"
                                                        title={"Delete User"}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length > usersPerPage && (
                                <div className="pagination-container mt-1">
                                    <ul className="pagination justify-content-center">
                                        {[...Array(totalPages)].map((_, pageIndex) => (
                                            <li
                                                key={pageIndex}
                                                className={`page-item ${currentPage === pageIndex + 1 ? "active" : ""}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pageIndex + 1)}
                                                >
                                                    {pageIndex + 1}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <EveryUserDetailsModal
                    isOpen={!!selectedUser}
                    user={selectedUser}
                    onClose={() => {
                        setSelectedUser(null);
                        document.body.style.overflow = "";
                    }}
                />
            )}

            {editUserModalOpen && (
                <EditUserModal
                    user={userToEdit}
                    isOpen={editUserModalOpen}
                    onClose={() => setEditUserModalOpen(false)}
                    onUpdate={handleUpdateUser}
                />
            )}

            {isLoading && (
                <div className={`${styled.loading_animation} bike-load text-center small-spinner position-absolute`}>
                    <SpinnerAnimation />
                </div>
            )}

            {loading && (
                <div className={`${styled.loading_animation} bike-load text-center small-spinner position-absolute`}>
                    <SpinnerAnimation />
                </div>
            )}
        </div>
    );
};

AllUsersPopUp.propTypes = {
    showModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    allUsers: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            role: PropTypes.string,
            balance: PropTypes.string,
            ip_address: PropTypes.string,
            referredBy: PropTypes.string,
            level: PropTypes.string,
            isBanned: PropTypes.bool,
            isVerified: PropTypes.bool,
            country: PropTypes.string,
        })
    ).isRequired,
    getAllUsers: PropTypes.func.isRequired,
};

export default AllUsersPopUp;