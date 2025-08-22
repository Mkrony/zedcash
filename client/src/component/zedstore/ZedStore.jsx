import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

const ZedStore = create((set, get) => ({
    // Initial states
    token: Cookies.get("token") || null,
    timelineData: [],
    userDetails: null,
    allUsers: [],
    userWithdrawals: [],
    userTasks: [],
    userChargebacks: [],
    allCompletedOffers: [],
    allUserWithdrawals: [],
    allChargebacks: [],
    allPendingTasks: [],
    userNotifications: [],
    unreadNotifications: [],
    totalRevenues: 0,
    todayRevenues: 0,
    todayPendingRevenues:0,
    totalPendingRevenues:0,
    todayChargeback:0,
    totalChargeback:0,
    totalSupportEmail:0,
    loading: false,
    error: null,
    pollingIntervals: {},
    loginPopup: false,

    // Update token in cookies and state
    setToken: async (newToken) => {
        if (newToken) {
            Cookies.set("token", newToken, { expires: 30, secure: true });
        } else {
            Cookies.remove("token");
        }
        set({ token: newToken });
        return Promise.resolve();
    },

    // Check if user is banned and logout if true
    checkUserBanStatus: () => {
        const { userDetails } = get();
        if (userDetails?.isBanned) {
            Cookies.remove("token");
            set({ token: null, userDetails: null });
        }
    },

    // Get today's chargeback
    getTodayChargeback: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for today's revenue request");
            return set({ todayRevenues: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/todayChargeback`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.data?.success) {
                return set({
                    todayChargeback: response.data.todayChargeback || 0,
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Today's chargeback fetch error:", error.message);
            return set({
                todayChargeback: 0,
                error: error.response?.data?.message || "Failed to fetch today's chargeback",
                loading: false
            });
        }
    },

    //Get Total Chargeback
    getTotalChargeback: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for revenue request");
            return set({ totalRevenues: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/totalChargeback`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.data?.success) {
                return set({
                    totalChargeback: response.data.totalChargeback || 0,
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Chargeback fetch error:", error.message);
            return set({
                totalChargeback: 0,
                error: error.response?.data?.message || "Failed to fetch total chargeback",
                loading: false
            });
        }
    },

    // Get total revenue from all completed tasks
    getTotalRevenues: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for revenue request");
            return set({ totalRevenues: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/totalRevenue`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.data?.success) {
                return set({
                    totalRevenues: response.data.totalRevenue || 0,
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Revenue fetch error:", error.message);
            return set({
                totalRevenues: 0,
                error: error.response?.data?.message || "Failed to fetch total revenue",
                loading: false
            });
        }
    },

    // Get today's revenue from completed tasks
    getTodayRevenues: async () => {
    const { token } = get();
    if (!token) {
        console.warn("No token available for today's revenue request");
        return set({ todayRevenues: 0, error: "Authentication required" });
    }
    set({ loading: true });
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/todayRevenue`, {
            withCredentials:true,
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });
        if (response.data?.success) {
            return set({
                todayRevenues: response.data.todayRevenue || 0,
                error: null,
                loading: false
            });
        }
        throw new Error("Invalid response format");
    } catch (error) {
        console.error("Today's revenue fetch error:", error.message);
        return set({
            todayRevenues: 0,
            error: error.response?.data?.message || "Failed to fetch today's revenue",
            loading: false
        });
    }
},

    // Get total pending revenue from all pending tasks
    getTotalPendingRevenues: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for revenue request");
            return set({ totalPendingRevenues: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/totalPendingRevenue`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.data?.success) {
                return set({
                    totalPendingRevenues: response.data.totalPendingRevenue || 0,
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Revenue fetch error:", error.message);
            return set({
                totalPendingRevenues: 0,
                error: error.response?.data?.message || "Failed to fetch total revenue",
                loading: false
            });
        }
    },

    // Get today's pending revenue from pending tasks
    gettodayPendingRevenues: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for today's revenue request");
            return set({ todayPendingRevenues: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/todayPendingRevenue`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.data?.success) {
                return set({
                    todayPendingRevenues: response.data.todayPendingRevenue || 0,
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Today's revenue fetch error:", error.message);
            return set({
                todayPendingRevenues: 0,
                error: error.response?.data?.message || "Failed to fetch today's revenue",
                loading: false
            });
        }
    },

    // Get timeline data
    getTimelineData: async () => {
        try {
            set({ loading: true });
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/timeline`, {
                withCredentials:true,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            set({
                timelineData: response.data.timeline || [],
                error: null,
                loading: false
            });
            return response.data.timeline;
        } catch (error) {
            set({
                timelineData: [],
                error: error.message,
                loading: false
            });
            return [];
        }
    },

    // Fetch user Notification
    fetchUserNotifications: async () => {
        const { token } = get();
        if (!token) return;

        set({ loading: true });
        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-notifications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            set({
                userNotifications: response.data.notifications,
                error: null
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            set({
                userNotifications: [],
                error: "Failed to load notifications"
            });
        } finally {
            set({ loading: false });
        }
    },

    // Fetch unread notifications
    fetchUnreadNotifications: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/unread-notifications/${userId}`, {
                withCredentials:true,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            set({ unreadNotifications: response.data.notifications });
            // Mark each notification as read
            for (const notification of response.data.notifications) {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/readed-notifications/${notification._id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials:true,
                    }
                );
            }
        } catch (error) {
            set({ unreadNotifications: [] });
        }
    },

    // Fetch all chargebacks
    getAllChargeback: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chargebacks`,{
                withCredentials:true,
            });
            set({ allChargebacks: response.data.chargebacks });
        } catch (error) {
            set({ allChargebacks: [] });
        }
    },

    // Fetch user chargeback
    getUserChargeback: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userchargeback`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            set({ userChargebacks: response.data.offers });
        } catch (error) {
            set({ userChargebacks: [] });
        }
    },

    // Get all pending tasks
    getAllPendingTasks: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/allPendingTasks`,{
                withCredentials:true,
            });
            set({ allPendingTasks: response.data.pendingTasks || [] });
        } catch (error) {
            console.error("Error fetching pending tasks:", error);
            set({ allPendingTasks: [] });
        }
    },
    // Fetch user details
    userDetailsRequested: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available. Cannot fetch user details.");
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            set({ userDetails: response.data.user });
            // Check ban status after updating user details
            get().checkUserBanStatus();
        } catch (error) {
            set({ userDetails: null });
        }
    },
    // Fetch withdrawals
    getWithdrawals: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-withdrawals`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            set({ userWithdrawals: response.data.withdrawals });
        } catch (error) {
            set({ userWithdrawals: [] });
        }
    },
    // Fetch user tasks
    getUserTasks: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userCompletedTask`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials:true,
            });
            set({ userTasks: response.data.offers });
        } catch (error) {
            set({ userTasks: [] });
        }
    },
    // Fetch all withdrawals for admin
    getAllWithdrawals: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/withdrawals`,{
                withCredentials:true,
            });
            set({ allUserWithdrawals: response.data.allWithdrawals });
        } catch (error) {
            set({ allUserWithdrawals: [] });
        }
    },
    // Fetch all completed offers
    getAllCompletedOffers: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/completed-offers`,
                {
                    withCredentials:true,
                });
            set({ allCompletedOffers: response.data.offers });
        } catch (error) {
            set({ allCompletedOffers: [] });
        }
    },
    // Fetch all users for admin
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/allusers`,{
                withCredentials:true,
            });
            set({ allUsers: response.data.users });
        } catch (error) {
            set({ allUsers: [] });
        }
    },

    // Get total support emails
    getTotalSupportEmail: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for support email request");
            return set({ totalSupportEmail: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/total-support-message`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                    }
                }
            );
            if (response.data?.success) {
                return set({
                    totalSupportEmail: response.data.data.total || 0,
                    supportEmailStats: response.data.data.byStatus || {},
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Support email count error:", error);
            return set({
                totalSupportEmail: 0,
                supportEmailStats: {},
                error: error.response?.data?.message || "Failed to fetch support email stats",
                loading: false
            });
        }
    },

    // Get total support ticket
    getTotalSupportTicket: async () => {
        const { token } = get();
        if (!token) {
            console.warn("No token available for support ticket request");
            return set({ totalSupportTicket: 0, error: "Authentication required" });
        }

        set({ loading: true });
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/total-support-ticket`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                    }
                }
            );
            if (response.data?.success) {
                return set({
                    totalSupportTicket: response.data.data.total || 0, // Just the open count
                    error: null,
                    loading: false
                });
            }
            throw new Error("Invalid response format");
        } catch (error) {
            console.error("Support ticket count error:", error);
            return set({
                totalSupportTicket: 0,
                error: error.response?.data?.message || "Failed to fetch support ticket count",
                loading: false
            });
        }
    },
    // Start polling for a specific key
    startPolling: (key, fetchFunction, interval = 6000) => {
        const { pollingIntervals } = get();
        if (pollingIntervals[key]) {
            console.warn(`Polling for '${key}' is already active.`);
            return;
        }
        const intervalId = setInterval(async () => {
            try {
                await fetchFunction();
            } catch (error) {
                console.error(`Error during polling for '${key}':`, error);
            }
        }, interval);
        set((state) => ({
            pollingIntervals: { ...state.pollingIntervals, [key]: intervalId },
        }));
    },
    // Stop polling for a specific key
    stopPolling: (key) => {
        const { pollingIntervals } = get();
        if (pollingIntervals[key]) {
            clearInterval(pollingIntervals[key]);
            set((state) => {
                const updatedIntervals = { ...state.pollingIntervals };
                delete updatedIntervals[key];
                return { pollingIntervals: updatedIntervals };
            });
        }
    },
    // Start polling for timeline and notifications only
    startAllPolling: () => {
        const { startPolling, getTimelineData, fetchUnreadNotifications } = get();
        // Fetch immediately and then start polling
        getTimelineData().then(() => {
            startPolling("timelineData", getTimelineData);
        });
        startPolling("unreadNotifications", fetchUnreadNotifications);
    },
    // Toggle login popup visibility
    toggleLoginPopup: (value) => set({ loginPopup: value }),
    // Stop polling for all data
    stopAllPolling: () => {
        const { pollingIntervals, stopPolling } = get();
        Object.keys(pollingIntervals).forEach(key => stopPolling(key));
    },
}));

export default ZedStore;