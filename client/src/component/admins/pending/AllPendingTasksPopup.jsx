import { faCheck, faEye, faRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import NotFoundAnimation from "../../Animations/NotFoundAnimation.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import SpinnerAnimation from "../../Animations/SpinnerAnimation.jsx";
import styled from "../tasks/allcompletedofferspopup.module.css"
const AllPendingTasksPopup = ({
                                  showModal,
                                  closeModal,
                                  allPendingTasks,
                                  fetchPendingTasks,
                                  fetchCompletedOffers
                              }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const tasksPerPage = 10;

    // Filter tasks based on search query
    const filteredTasks = useMemo(() => {
        // Sort tasks in descending order based on createdAt
        const sortedTasks = [...allPendingTasks].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Filter sorted tasks based on search query
        return sortedTasks.filter((task) =>
            [task._id ,task.userId, task.userName, task.offerName,task.offerID,task.ip,task.updatedAt,task.transactionID, task.currencyReward, task.status, task.completedAt]
                .map((field) => (field ? field.toString().toLowerCase() : ""))
                .some((value) => value.includes(searchQuery.toLowerCase()))
        );
    }, [allPendingTasks, searchQuery]);

    // Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = useMemo(() => filteredTasks.slice(indexOfFirstTask, indexOfLastTask), [
        filteredTasks,
        indexOfFirstTask,
        indexOfLastTask,
    ]);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    // Handle page change
    const handlePageChange = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }, []);

    // Close modal and reset states
    const handleCloseModal = useCallback(() => {
        closeModal();
        setSearchQuery("");
        setCurrentPage(1);
        setSelectedTask(null);
    }, [closeModal]);

    if (!showModal) {
        document.body.style.overflow = "auto";
        return null;
    } else {
        document.body.style.overflow = "hidden";
    }

    const setTaskCompleted = async (taskId) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/setendingtocompletedtask/${taskId}`,{},{
                withCredentials: true,
            });
            toast.success(response.data.message);
            // Refresh both pending and completed tasks lists
            await fetchPendingTasks();
            await fetchCompletedOffers();
        } catch (error) {
            toast.error(error.message || "Failed to set task as completed.");
        } finally {
            setLoading(false);
            setSelectedTask(null);
        }
    };

    const setTaskChargeback = async (taskId) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/setendingtochargeback/${taskId}`,{},{
                withCredentials: true,
            });
            toast.success(response.data.message);
            // Refresh pending tasks list
            await fetchPendingTasks();
        } catch (error) {
            toast.error(error.message || "Failed to set task as chargeback.");
        } finally {
            setLoading(false);
            setSelectedTask(null);
        }
    };

    return (
        <div className={styled.modal_container}>
            <div className={styled.modal_outer_div} onClick={handleCloseModal}></div>
            <div className={styled.modal_content}>
                <button
                    title="Close"
                    onClick={handleCloseModal}
                    className={styled.modal_close_btn}
                    aria-label="Close Modal"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className={styled.modal_body}>
                    <h2 className="text-center my-3">All Pending Tasks</h2>
                    <div className={`${styled.search_bar} my-3`}>
                        <input
                            type="text"
                            placeholder="Search pending tasks..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${styled.search_input} form-control input-search w-50 m-auto custom-input`}
                        />
                    </div>
                    {filteredTasks.length === 0 ? (
                        <div className={`${styled.not_found} d-flex flex-column justify-content-center align-items-center text-center`}>
                            <NotFoundAnimation />
                        </div>
                    ) : (
                        <>
                            <div className={styled.table_container}>
                                <table className={`${styled.custom_table} text-center`}>
                                    <thead>
                                    <tr>
                                        <th>S.N</th>
                                        <th>Username</th>
                                        <th>Offerwall</th>
                                        <th>Offer Name</th>
                                        <th>Offer ID</th>
                                        <th>Transaction ID</th>
                                        <th>Coin</th>
                                        <th>USD</th>
                                        <th>Revenue</th>
                                        <th>IP</th>
                                        <th>Country</th>
                                        <th>Date</th>
                                        <th>Release Date</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentTasks.map((task, index) => (
                                        <tr key={task.id}>
                                            <td>{indexOfFirstTask + index + 1}</td>
                                            <td>{task.userName}</td>
                                            <td>{task.offerWallName}</td>
                                            <td>{task.offerName}</td>
                                            <td>{task.offerID}</td>
                                            <td>{task.transactionID}</td>
                                            <td>{task.currencyReward.toLocaleString()}</td>
                                            <td>${(task.currencyReward / 1000).toFixed(2)}</td>
                                            <td>${task.revenue.toLocaleString()}</td>
                                            <td>{task.ip}</td>
                                            <td>{task.country}</td>
                                            <td>
                                                {new Date(task.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                {new Date(task.releaseDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour:"numeric"
                                                })}
                                            </td>
                                            <td>
                                                <button
                                                    title="View Details"
                                                    className="btn btn-sm btn-info mx-1"
                                                    onClick={() => setSelectedTask(task)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    title="Approve Task"
                                                    className="btn btn-sm btn-success mx-1"
                                                    onClick={() => setTaskCompleted(task._id)}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>
                                                <button
                                                    title="Set to Chargeback"
                                                    className="btn btn-sm btn-danger mx-1"
                                                    onClick={() => setTaskChargeback(task._id)}
                                                >
                                                    <FontAwesomeIcon icon={faRotateLeft} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedTask && (
                                <TaskDetailsModal
                                    selectedTask={selectedTask}
                                    onClose={() => setSelectedTask(null)}
                                />
                            )}
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
                <div className={`${styled.loading_animation} bike-load text-center small-spinner position-absolute`}>
                    <SpinnerAnimation />
                </div>
            )}
        </div>
    );
};

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
                                <th>Offer Name</th>
                                <td>{selectedTask.offerName}</td>
                            </tr>
                            <tr>
                                <th>Offer ID</th>
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
                                <th>Release Date</th>
                               <td>
                                    {new Date(selectedTask.releaseDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour:"2-digit"
                                    })}
                                </td>
                            </tr>
                            <tr>
                                <th>Created Date</th>
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

AllPendingTasksPopup.propTypes = {
    showModal: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    allPendingTasks: PropTypes.array.isRequired,
    fetchPendingTasks: PropTypes.func.isRequired,
    fetchCompletedOffers: PropTypes.func.isRequired,
};

export default React.memo(AllPendingTasksPopup);