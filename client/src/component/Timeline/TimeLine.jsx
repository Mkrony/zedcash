import React, { useState, useEffect, memo, useCallback } from 'react';
import styled from './Timeline.module.css';
import useZedStore from "../zedstore/ZedStore.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faXmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import zedStore from "../zedstore/ZedStore.jsx";
import Cookies from "js-cookie";

const TimeLine = memo(() => {
    const { timelineData, getTimelineData } = useZedStore();
    const [selectedItem, setSelectedItem] = useState(null);
    const [userCompletedTasks, setUserCompletedTasks] = useState([]);
    const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [fakeData, setFakeData] = useState([]);
    const toggleLoginPopup = zedStore((state) => state.toggleLoginPopup);

    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(3);
    const token = Cookies.get('token');

    const generateFakeTimeline = useCallback((count = 50) => {
        const offerWalls = ['AdGate', 'OfferToro', 'AdGem', 'BitLabs', 'Lootably', 'Notik', 'torox'];
        const fakeNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'];
        const fakeOffers = [
            "Play Puzzle Game", "Install App", "Sign Up on Website",
            "Watch Video", "Complete Survey", "Download Trial", "Join Beta"
        ];

        return Array.from({ length: count }, (_, index) => {
            const fakeCompletedTasks = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, taskIndex) => ({
                _id: `fake-task-${index}-${taskIndex}`,
                offerWallName: offerWalls[Math.floor(Math.random() * offerWalls.length)],
                offerName: fakeOffers[Math.floor(Math.random() * fakeOffers.length)],
                currencyReward: (Math.random() * 200).toFixed(2),
                createdAt: new Date(Date.now() - Math.random() * 1e7).toISOString()
            }));

            return {
                id: `fake-${index}-${Date.now()}`,
                userName: fakeNames[Math.floor(Math.random() * fakeNames.length)],
                offerWallName: offerWalls[Math.floor(Math.random() * offerWalls.length)],
                currencyReward: (Math.random() * 1000).toFixed(2),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1e8)).toISOString(),
                userID: `fake-user-${index}`,
                fakeCompletedTasks,
                type: Math.random() < 0.5 ? 'task' : 'withdrawal'
            };
        });
    }, []);

    const getInitial = useCallback((username) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    }, []);

    const offerWallIcons = {
        Paypal: "https://play-lh.googleusercontent.com/xOKbvDt362x1uzW-nnggP-PgO9HM4L1vwBl5HgHFHy_n1X3mqeBtOSoIyNJzTS3rrj70",
        Binance: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe9rjRtIJJM5o6xP2LqfQFFcWejwFgRA1rag&s",
        Bitcoin: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
        Litecoin: "https://s3.coinmarketcap.com/static/img/portraits/630c5fcaf8184351dc5c6ee5.png",
        Dogecoin: "https://www.simplilearn.com/ice9/free_resources_article_thumb/Shyamli/Dogecoin.png",
        default: "https://www.creativefabrica.com/wp-content/uploads/2020/10/26/paper-money-cash-vector-illustration-Graphics-6296757-1-1-580x386.jpg",
        Notik: "https://notik.me/build/assets/dark_logo-a53e7e19.png",
        Primewall: "https://primewall.io/asset/home_1/img/primewalllogo.svg",
        Wannads: "https://affi-plat.s3.us-east-2.amazonaws.com/platforms/wannads-ogotipo-naranja.png",
        WannadsSurvey: "https://affi-plat.s3.us-east-2.amazonaws.com/platforms/wannads/landing/images/wannads-white.png",
    };

    const renderAvatar = (item, size = 'small') => {
        const src = offerWallIcons[item.offerWallName] || offerWallIcons.default;
        return (
            <img
                src={src}
                alt={item.offerWallName || "wallet"}
                loading="lazy"
                onError={(e) => { e.target.src = offerWallIcons.default; }}
                className={size === 'large' ? styled.avatar_img_large : styled.avatar_img}
            />
        );
        return <span>{getInitial(item.userName)}</span>;
    };

    const handleItemClick = useCallback(async (item) => {
        if (!token) {
            toggleLoginPopup(true);
            return;
        }

        setSelectedItem(item);
        document.body.style.overflow = "hidden";
        setModalLoading(true);

        if (item.id?.startsWith("fake-")) {
            const fakeTasks = item.fakeCompletedTasks || [];
            const totalFakeCoins = fakeTasks.reduce((sum, task) => sum + (parseFloat(task.currencyReward) || 0), 0);
            setUserCompletedTasks(fakeTasks);
            setTotalCoinsEarned(totalFakeCoins);
            setCurrentPage(1);
            setModalLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getusercompletedtasks/${item.userID}`,{
                withCredentials:true,
            });
            const completedTasks = response.data.offers || [];
            const totalCoins = completedTasks.reduce((sum, task) => sum + (parseFloat(task.currencyReward) || 0), 0);
            setUserCompletedTasks(completedTasks);
            setTotalCoinsEarned(totalCoins);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching completed tasks:", error);
            setUserCompletedTasks([]);
            setTotalCoinsEarned(0);
        } finally {
            setModalLoading(false);
        }
    }, [token, toggleLoginPopup]);

    const closeModal = useCallback(() => {
        setSelectedItem(null);
        document.body.style.overflow = "auto";
    }, []);

    // Sort tasks by date in descending order (newest first)
    const sortedCompletedTasks = [...userCompletedTasks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = sortedCompletedTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(sortedCompletedTasks.length / tasksPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [configResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/timeline`,{
                        withCredentials:true,
                    }),
                    getTimelineData()
                ]);
                await configResponse.json();

                if (!isMounted) return;
                if (!timelineData.length) {
                    setFakeData(generateFakeTimeline(50));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                if (isMounted) setFakeData(generateFakeTimeline(50));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [getTimelineData, generateFakeTimeline, timelineData.length]);

    const finalTimelineData = timelineData.length ? [...timelineData].reverse() : fakeData;

    const SkeletonLoader = () => (
        <div className={styled.timeline_grid}>
            {Array.from({ length: finalTimelineData.length }).map((_, index) => (
                <div key={`skeleton-${index}`} className={styled.timeline_box_container}>
                    <div className={`${styled.timeline_box} ${styled.skeleton_box} shadow ${styled.zoom_in}`}>
                        <div className={styled.timeline_avatar}>
                            <div className={`${styled.avatar_initial} ${styled.skeleton_avatar}`}></div>
                        </div>
                        <div className={styled.timeline_nameandofferwall}>
                            <div className={`${styled.timeline_username} ${styled.skeleton_text}`}></div>
                            <div className={`${styled.timeline_offerwall} ${styled.skeleton_text}`}></div>
                        </div>
                        <div className={`${styled.timeline_amount} ${styled.skeleton_amount} p-2 rounded`}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading && !timelineData.length) return <SkeletonLoader />;

    return (
        <>
            <div className={styled.timeline_grid}>
                {finalTimelineData.map((item, index) => (
                    <div
                        key={item.id || `item-${index}`}
                        className={styled.timeline_box_container}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div
                            className={`${styled.timeline_box} shadow ${styled.zoom_in}`}
                            onClick={() => handleItemClick(item)}
                            role="button"
                            tabIndex={0}
                            aria-label={`View ${item.userName}'s activity`}
                            onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                        >
                            <div className={styled.timeline_avatar}>
                                <div className={styled.avatar_initial}>
                                    {renderAvatar(item)}
                                </div>
                            </div>
                            <div className={styled.timeline_nameandofferwall}>
                                <div className={styled.timeline_username}>
                                    <p className="m-0 p-0">{item.userName}</p>
                                </div>
                                <div className={styled.timeline_offerwall}>
                                    <p className="m-0 p-0 ">{item.offerWallName}</p>
                                </div>
                            </div>
                            <div className={`${styled.timeline_amount} p-2 rounded`}>
                                <p className="m-0 p-0 fw-semibold">{item.currencyReward}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className={styled.modal_container}>
                    <div
                        className={styled.modal_outer_div}
                        onClick={closeModal}
                        role="button"
                        tabIndex={0}
                        aria-label="Close modal"
                        onKeyDown={(e) => e.key === 'Enter' && closeModal()}
                    ></div>
                    <div className={styled.new_modal_card} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <button
                            title="Close"
                            onClick={closeModal}
                            className={styled.new_modal_close_btn}
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>

                        <div className={styled.profile_header}>
                            <div className={styled.avatar_ring}>
                                <div className={styled.avatar_initial_large}>
                                    {renderAvatar(selectedItem, 'large')}
                                </div>
                            </div>
                            <div className={styled.modal_headertwo}>
                                <h3 id="modal-title" className={styled.username}>
                                    {selectedItem.userName || "Unknown User"}
                                </h3>
                                <span className={styled.level_badge}>Level 1</span>
                                <span className={styled.type_badge}>{selectedItem.type}</span>
                            </div>
                        </div>

                        <div className={styled.profile_stats}>
                            <div>
                                <p>Offers Completed</p>
                                <h4>{sortedCompletedTasks.length}</h4>
                            </div>
                            <div>
                                <p>Coins Earned</p>
                                <h4>{totalCoinsEarned.toFixed(2)}</h4>
                            </div>
                            <div>
                                <p>Users Referred</p>
                                <h4>0</h4>
                            </div>
                        </div>

                        <div className={styled.profile_activity}>
                            <h5 className={styled.task_heading}>Completed Tasks : </h5>

                            {modalLoading ? (
                                <div className={styled.activity_loading}>
                                    <div className={styled.activity_item_loading}>
                                        <div className={styled.loading_line} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {currentTasks.length > 0 ? (
                                        <>
                                            {currentTasks.map((task, index) => (
                                                <div key={task._id || index} className={styled.activity_item}>
                                                    <p className={styled.activity_name}>
                                                        <span className="me-2"> 💰 </span>
                                                        {task.offerWallName} - {
                                                        task.offerName.length > 20
                                                            ? `${task.offerName.slice(0, 7)}.....${task.offerName.slice(-5)}`
                                                            : task.offerName
                                                    }
                                                    </p>
                                                    <p className={styled.activity_time}>
                                                        {(() => {
                                                            const d = new Date(task.createdAt);
                                                            const day = d.getDate();
                                                            const sfx = (n) => (n > 3 && n < 21) ? 'th' : ['st','nd','rd'][n % 10 - 1] || 'th';
                                                            return `${day}${sfx(day)} ${d.toLocaleString('en-US', { month: 'long' })}`;
                                                        })()}
                                                    </p>
                                                    <div className={styled.activity_reward}>
                                                        <FontAwesomeIcon className={'me-1'} icon={faCoins}/> {task.currencyReward}
                                                    </div>
                                                </div>
                                            ))}

                                            {sortedCompletedTasks.length > tasksPerPage && (
                                                <div className={styled.pagination_controls}>
                                                    <button
                                                        onClick={() => paginate(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className={styled.pagination_button}
                                                        aria-label="Previous page"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronLeft} />
                                                    </button>

                                                    <div className={styled.pagination_numbers}>
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                            <button
                                                                key={number}
                                                                onClick={() => paginate(number)}
                                                                className={`${styled.pagination_number} ${currentPage === number ? styled.active : ''}`}
                                                                aria-label={`Page ${number}`}
                                                            >
                                                                {number}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={() => paginate(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className={styled.pagination_button}
                                                        aria-label="Next page"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronRight} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className={styled.no_activities}>No completed activities found</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default TimeLine;