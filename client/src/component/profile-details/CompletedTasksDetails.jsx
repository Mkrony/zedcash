import React, { useState } from "react";
import styled from "./UserDetailsModal.module.css"; // Reuse the same styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../Animations/NotFoundAnimation.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import SpinnerAnimation from "../Animations/SpinnerAnimation.jsx";

function CompletedTasksDetails({ isOpen, closeModal, type, tasks }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const tasksPerPage = 10;
    if (!isOpen) return null;
    // Filter tasks based on search query
    const filteredTasks = tasks.filter((task) =>
        [
            task.taskName,
            task.amount,
            task.status,
            task.userName,
            task.offerWallName,
            task.offerName,
            task.offerID,
            task.transactionID,
            task.currencyReward,
            task.revenue,
            task.ip,
            task.country,
            new Date(task.createdAt).toLocaleString("en-US",{
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            })
        ]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((value) => value.includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page when searching
    };

    // Close modal and reset states
    const handleCloseModal = () => {
        closeModal();
        setSearchQuery("");
        setCurrentPage(1);
        setSelectedTask(null);
    };
    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={handleCloseModal}></div>
            <div className={`${styled.modal_content} overflow-hidden`}>
                <button
                    title="Close"
                    onClick={handleCloseModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">Completed Tasks</h2>
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search completed tasks..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control input-search w-50 m-auto custom-input`}
                        />
                    </div>
                    {filteredTasks.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center">
                            <NotFoundAnimation />
                        </div>
                    ) : (
                        <>
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Offerwall</th>
                                        <th>Task Name</th>
                                        <th>Task ID</th>
                                        <th>Transaction ID</th>
                                        <th>Coin</th>
                                        <th>USD</th>
                                        <th>IP</th>
                                        <th>Country</th>
                                        <th>Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentTasks.map((task, index) => (
                                        <tr key={task.id}>
                                            <td>{indexOfFirstTask + index + 1}</td>
                                            <td>{task.offerWallName}</td>
                                            <td>{task.offerName}</td>
                                            <td>{task.offerID}</td>
                                            <td>{task.transactionID}</td>
                                            <td>{task.currencyReward.toLocaleString()}</td>
                                            <td>${(task.currencyReward / 1000).toFixed(2)}</td>
                                            <td>{task.ip}</td>
                                            <td>{task.country}</td>
                                            <td>
                                                {new Date(task.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Loading Animation */}
            {loading && (
                <div className="bike-load loading-spinner small-spinner text-center position-absolute">
                    <SpinnerAnimation />
                </div>
            )}
        </div>
    );
}

// Reusable Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination-container mt-3">
            <ul className="pagination justify-content-center">
                {[...Array(totalPages)].map((_, pageIndex) => (
                    <li
                        key={pageIndex}
                        className={`page-item ${currentPage === pageIndex + 1 ? "active" : ""}`}
                    >
                        <button className="page-link" onClick={() => onPageChange(pageIndex + 1)}>
                            {pageIndex + 1}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Reusable Task Details Modal Component
const TaskDetailsModal = ({ selectedTask, onClose }) => {
    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={onClose}></div>
            <div className={styled.modal_half_content}>
                <button
                    title="Close"
                    onClick={onClose}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={`${styled.modal_body} p-3`}>
                    <div className="popup-title mt-2 mb-5 text-center">
                        <h3>{selectedTask.userName}'s Task Details</h3>
                    </div>
                    <div className={styled.table_container}>
                        <table className={`${styled.custom_table} custom_table table-bordered`}>
                            <tbody>
                            <tr>
                                <th>ID</th>
                                <td>{selectedTask._id}</td>
                            </tr>
                            <tr>
                                <th>User ID</th>
                                <td>{selectedTask.userID}</td>
                            </tr>
                            <tr>
                                <th>Username</th>
                                <td>{selectedTask.userName}</td>
                            </tr>
                            <tr>
                                <th>Offerwall Name</th>
                                <td>{selectedTask.offerWallName}</td>
                            </tr>
                            <tr>
                                <th>Task Name</th>
                                <td>{selectedTask.offerName}</td>
                            </tr>
                            <tr>
                                <th>Task ID</th>
                                <td>{selectedTask.offerID}</td>
                            </tr>
                            <tr>
                                <th>Amount Earned</th>
                                <td>{selectedTask.currencyReward}</td>
                            </tr>
                            <tr>
                                <th>Revenue</th>
                                <td>${selectedTask.revenue}</td>
                            </tr>
                            <tr>
                                <th>Transaction ID</th>
                                <td>{selectedTask.transactionID}</td>
                            </tr>
                            <tr>
                                <th>IP</th>
                                <td>{selectedTask.ip}</td>
                            </tr>
                            <tr>
                                <th>Country</th>
                                <td>{selectedTask.country}</td>
                            </tr>
                            <tr>
                                <th>Completed Date</th>
                                <td>
                                    {new Date(selectedTask.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </td>
                            </tr>
                            <tr>
                                <th>Updated At</th>
                                <td>
                                    {new Date(selectedTask.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletedTasksDetails;