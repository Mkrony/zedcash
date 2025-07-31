import React, { useState } from "react";
import styled from "../AllWithdraw/allwithdrawalspopup.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faRotateLeft, faXmark} from "@fortawesome/free-solid-svg-icons";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";

const SelectedUserCompletedTasks = ({ selectedUserCompletedTasks, userName, closeModal }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 10; // Number of tasks per page

    const totalTasks = selectedUserCompletedTasks.length;
    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    // Calculate the displayed tasks
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = selectedUserCompletedTasks.slice(indexOfFirstTask, indexOfLastTask);

    // Pagination controls
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={styled.modal_container}>
            {/* Overlay */}
            <div className={styled.modal_outer_div} onClick={closeModal}></div>
            {/* Modal Content */}
            <div className={styled.modal_content}>
                {/* Close Button */}
                <button
                    title="Close"
                    onClick={closeModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                {/* Modal Body */}
                <div className={`${styled.modal_body} p-3`}>
                    <div className="popup-title mt-2 mb-5 text-center text-capitalize">
                        <h3>{userName ? userName : "This user"}'s completed Tasks</h3>
                        <h4 className="green mt-3 fw-semibold text-capitalize">
                            {userName ? userName : "This user"} has {totalTasks} completed tasks
                        </h4>
                    </div>
                    {totalTasks === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center">
                            <NotFoundAnimation />
                            <p>No completed tasks found for {userName}.</p>
                        </div>
                    ) : (
                        <div className="tasks_details_popup">
                            <div className={styled.table_container}>
                                <table
                                    className={`${styled.custom_table} custom_table text-center`}
                                >
                                    <thead>
                                    <tr>
                                        <th>Offerwall Name</th>
                                        <th>Task Name</th>
                                        <th>Task ID</th>
                                        <th>Coin</th>
                                        <th>Amount</th>
                                        <th>Revenue</th>
                                        <th>Transaction ID</th>
                                        <th>Completion Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentTasks.map((task, index) => (
                                        <tr key={index}>
                                            <td>{task.offerWallName}</td>
                                            <td>{task.offerName}</td>
                                            <td>{task.offerID}</td>
                                            <td>{task.currencyReward}</td>
                                            <td>{task.currencyReward.toLocaleString() / 1000}</td>
                                            <td>{task.revenue.toLocaleString()}</td>
                                            <td>{task.transactionID}</td>
                                            <td>
                                                {new Date(task.createdAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination-container mt-3">
                            <ul className="pagination justify-content-center">
                                {[...Array(totalPages)].map((_, pageIndex) => (
                                    <li
                                        key={pageIndex}
                                        className={`page-item ${
                                            currentPage === pageIndex + 1 ? "active" : ""
                                        }`}
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
            </div>
        </div>
    );
};

export default SelectedUserCompletedTasks;
