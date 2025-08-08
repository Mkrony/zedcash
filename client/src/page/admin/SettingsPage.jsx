import {
    faFloppyDisk,
    faStar,
    faTrash,
    faCog,
    faMoneyBillWave,
    faAd,
    faEnvelope,
    faShieldAlt,
    faGlobe,
    faBell,
    faEdit,
    faXmark,
    faToggleOn,
    faToggleOff,
    faTasks
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import Footer from "../../component/footer/Footer.jsx";
import HeaderSection from "../../component/HeaderSection.jsx";
import "./settings.css";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [cashoutLoading, setCashoutLoading] = useState(true);
    const [offerwallLoading, setOfferwallLoading] = useState(true);
    const [smtpLoading, setSmtpLoading] = useState(true);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    // Edit states
    const [editingCashout, setEditingCashout] = useState(null);
    const [editingOfferwall, setEditingOfferwall] = useState(null);

    const token = Cookies.get("token");
    const navigate = useNavigate();

    // Authentication check
    useEffect(() => {
        const confirmAdmin = async () => {
            if (!token) {
                toast.error("You must be logged in");
                navigate("/signin");
                return;
            }
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    toast.error("Session expired. Please log in again.");
                    navigate("/signin");
                    return;
                }
                const userId = decodedToken.id;
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userbyid/${userId}`,{
                    withCredentials:true,
                });
                const role = response.data.user.role;

                if (role !== "admin") {
                    toast.error("You must be an admin");
                    navigate("/");
                }
            } catch (err) {
                console.error("Admin validation error:", err.message);
                toast.error("Failed to validate user. Please log in again.");
                Cookies.remove("token");
                navigate("/signin");
            }
        };

        confirmAdmin();
    }, [token, navigate]);

    // Basic settings state
    const [basicSettings, setBasicSettings] = useState({
        registrationEmailConfirmation: false,
        allowMultipleAccountsSameIP: false,
        ipChangeProtection: false,
        ipQualityCheck: false,
        ipQualityApiKey: '',
        sendWithdrawEmail: false
    });

    // Cashout settings state
    const [cashoutMethods, setCashoutMethods] = useState([]);
    const [newMethod, setNewMethod] = useState({
        name: '',
        imageLink: '',
        minWithdrawAmount: ''
    });

    // Offerwall settings state
    const [offerwalls, setOfferwalls] = useState([]);
    const [newOfferwall, setNewOfferwall] = useState({
        name: '',
        logoUrl: '',
        offerwallCategory: 'Select Category',
        iframeUrl: '',
        rating: 0,
        offerwallStatus: true
    });

    // SMTP settings state
    const [smtpSettings, setSmtpSettings] = useState({
        host: '',
        port: '',
        secure: false,
        username: '',
        password: '',
        fromEmail: '',
        fromName: ''
    });

    // Pending tasks settings state
    const [pendingSettings, setPendingSettings] = useState({
        maxCoinPerTask: 0,
        maxDays: 0,
        minCoinPerTask: 0,
        minDays: 0,
        pendingOfferIds: [],
        newPendingOfferId: '',
        newPendingOfferDays: 7,
        allTasksPending: false,
        allTasksDays: 0
    });

    // Fetch existing settings
    const getBasicSettingsData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-basic-settings`,{
                withCredentials:true,
            });
            setBasicSettings(response.data.data || {
                registrationEmailConfirmation: false,
                allowMultipleAccountsSameIP: false,
                ipChangeProtection: false,
                ipQualityCheck: false,
                ipQualityApiKey: '',
                sendWithdrawEmail: false
            });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch cashout methods
    const getCashoutMethods = async () => {
        try {
            setCashoutLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-cashout-methods`,{
                withCredentials:true,
            });
            setCashoutMethods(response.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCashoutLoading(false);
        }
    };

    // Fetch offerwalls
    const getOfferwalls = async () => {
        try {
            setOfferwallLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-offerwalls`,{
                withCredentials:true,
            });
            setOfferwalls(response.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setOfferwallLoading(false);
        }
    };

    // Fetch SMTP settings
    const getSmtpSettings = async () => {
        try {
            setSmtpLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-smtp-settings`,{
                withCredentials:true,
            });
            setSmtpSettings(response.data.data || {
                host: '',
                port: '',
                secure: false,
                username: '',
                password: '',
                fromEmail: '',
                fromName: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSmtpLoading(false);
        }
    };

    // Fetch pending settings
    const getPendingSettings = async () => {
        try {
            setPendingLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/get-pending-settings`,
                { withCredentials: true }
            );
            const data = Array.isArray(response.data.data) && response.data.data.length > 0
                ? response.data.data[0]
                : {};
            setPendingSettings({
                maxCoinPerTask: data.maxCoinPerTask || data.maxCoinPerDay || 0,
                maxDays: data.maxDays || 0,
                minCoinPerTask: data.minCoinPerTask || data.minCoinPerDay || 0,
                minDays: data.minDays || 0,
                pendingOfferIds: data.pendingOfferIds || [],
                newPendingOfferId: '',
                newPendingOfferDays: 7,
                allTasksPending: data.allTasksPending || false,
                allTasksDays: data.allTasksDays || 0
            });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setPendingLoading(false);
        }
    };

    useEffect(() => {
        getBasicSettingsData();
        if (activeTab === 'cashout') {
            getCashoutMethods();
        } else if (activeTab === 'offerwalls') {
            getOfferwalls();
        } else if (activeTab === 'smtp') {
            getSmtpSettings();
        } else if (activeTab === 'pending') {
            getPendingSettings();
        }
    }, [activeTab]);

    // Handle basic settings form submit
    const saveBasicSettings = async (settingsToSave = null) => {
        try {
            setLoading(true);
            const settings = settingsToSave || basicSettings;
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/basic-settings`, settings,{
                withCredentials: true,
            });
            toast.success(response.data.message);
            getBasicSettingsData();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-save for switches
    const handleSwitchChange = async (field, value) => {
        const updatedSettings = {
            ...basicSettings,
            [field]: value
        };
        setBasicSettings(updatedSettings);
        await saveBasicSettings(updatedSettings);
    };

    // Handle cashout settings form submit
    const handleCashoutSubmit = async (event) => {
        event.preventDefault();
        try {
            setCashoutLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cashout-methods`, newMethod,{
                withCredentials: true,
            });
            toast.success(response.data.message);
            setNewMethod({
                name: '',
                imageLink: '',
                minWithdrawAmount: ''
            });
            getCashoutMethods();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCashoutLoading(false);
        }
    };

    // Handle offerwall settings form submit
    const handleOfferwallSubmit = async (event) => {
        event.preventDefault();
        try {
            setOfferwallLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/add-offerwalls`, newOfferwall,{
                withCredentials: true,
            });
            toast.success(response.data.message);
            setNewOfferwall({
                name: '',
                logoUrl: '',
                offerwallCategory: 'offerwall',
                iframeUrl: '',
                rating: 0,
                offerwallStatus: true
            });
            getOfferwalls();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setOfferwallLoading(false);
        }
    };

    // Handle SMTP settings form submit
    const handleSmtpSubmit = async (event) => {
        event.preventDefault();
        try {
            setSmtpLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/smtp-settings`, smtpSettings,{
                withCredentials: true,
            });
            toast.success(response.data.message);
            getSmtpSettings();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSmtpLoading(false);
        }
    };

    // Handle pending settings form submit
    const savePendingSettings = async () => {
        try {
            setPendingLoading(true);
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/UpdatePendingSettings`,
                pendingSettings,
                { withCredentials: true }
            );
            toast.success(response.data.message);
            getPendingSettings();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setPendingLoading(false);
        }
    };

    // Test SMTP connection
    const testSmtpConnection = async () => {
        try {
            setSmtpLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/test-smtp`,{},{
                withCredentials: true,
            });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to test SMTP connection");
        } finally {
            setSmtpLoading(false);
        }
    };

    const handleCashoutInputChange = (e) => {
        const { name, value } = e.target;
        setNewMethod(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOfferwallInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewOfferwall(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSmtpInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSmtpSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePendingInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPendingSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Edit cashout method handler
    const handleEditCashout = (method) => {
        setEditingCashout(method);
    };

    // Update cashout method handler
    const handleUpdateCashout = async (e) => {
        e.preventDefault();
        try {
            setCashoutLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/update-cashout/${editingCashout.id}`, editingCashout,{
                withCredentials:true,
            });
            toast.success(response.data.message);
            setEditingCashout(null);
            getCashoutMethods();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCashoutLoading(false);
        }
    };

    // Edit offerwall handler
    const handleEditOfferwall = (offerwall) => {
        setEditingOfferwall({
            ...offerwall,
            offerwallStatus: offerwall.offerwallStatus !== false
        });
    };

    // Update offerwall handler
    const handleUpdateOfferwall = async (e) => {
        e.preventDefault();
        try {
            setOfferwallLoading(true);
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/update-offerwalls/${editingOfferwall._id}`, editingOfferwall,{
                withCredentials:true,
            });
            toast.success(response.data.message);
            setEditingOfferwall(null);
            getOfferwalls();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setOfferwallLoading(false);
        }
    };

    const deleteMethod = async (id) => {
        try {
            setCashoutLoading(true);
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/delete-cashout-methods/${id}`,{
                withCredentials:true,
            });
            toast.success(response.data.message);
            getCashoutMethods();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCashoutLoading(false);
        }
    };

    const deleteOfferwall = async (id) => {
        try {
            setOfferwallLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delete-offerwalls/${id}`,{
                withCredentials:true,
            });
            toast.success(response.data.message);
            getOfferwalls();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setOfferwallLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={i <= rating ? "text-warning" : "text-secondary"}
                />
            );
        }
        return stars;
    };

    const closeModal = () => {
        setEditingCashout(null);
        setEditingOfferwall(null);
    };

    // Add pending offer ID with days
    const addPendingOfferId = () => {
        if (pendingSettings.newPendingOfferId.trim()) {
            setPendingSettings({
                ...pendingSettings,
                pendingOfferIds: [
                    ...pendingSettings.pendingOfferIds,
                    {
                        id: pendingSettings.newPendingOfferId,
                        days: pendingSettings.newPendingOfferDays
                    }
                ],
                newPendingOfferId: '',
                newPendingOfferDays: 7
            });
        }
    };

    // Remove pending offer ID
    const removePendingOfferId = (index) => {
        const updatedIds = [...pendingSettings.pendingOfferIds];
        updatedIds.splice(index, 1);
        setPendingSettings({
            ...pendingSettings,
            pendingOfferIds: updatedIds
        });
    };

    // Update pending offer days
    const updatePendingOfferDays = (index, days) => {
        const updatedIds = [...pendingSettings.pendingOfferIds];
        updatedIds[index] = {
            ...updatedIds[index],
            days: parseInt(days) || 0
        };
        setPendingSettings({
            ...pendingSettings,
            pendingOfferIds: updatedIds
        });
    };

    // Skeleton Loading Components
    const BasicSettingsSkeleton = () => (
        <div className="settings-tab">
            <div className="row">
                {[1, 2, 3, 4].map((item) => (
                    <div className="col-md-6 mb-4" key={`basic-skeleton-${item}`}>
                        <div className="card h-100">
                            <div className="card-header skeleton-header"></div>
                            <div className="card-body">
                                {[1, 2].map((setting) => (
                                    <div className="setting-item skeleton-setting" key={`setting-skeleton-${setting}`}>
                                        <div className="setting-info">
                                            <div className="skeleton-text" style={{width: '70%'}}></div>
                                            <div className="skeleton-text" style={{width: '90%'}}></div>
                                        </div>
                                        <div className="skeleton-switch"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="card-footer">
                                <div className="skeleton-button" style={{width: '150px', height: '30px'}}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const CashoutSkeleton = () => (
        <div className="settings-tab card">
            <div className="card-header skeleton-header"></div>
            <div className="card-body">
                <div className="row">
                    {[1, 2].map((item) => (
                        <div className="col-md-6" key={`cashout-input-skeleton-${item}`}>
                            <div className="skeleton-input"></div>
                        </div>
                    ))}
                </div>
                <div className="row mt-3">
                    <div className="col-md-6">
                        <div className="skeleton-input"></div>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <div className="skeleton-button" style={{width: '200px', height: '40px'}}></div>
                </div>

                <div className="existing-methods mt-5">
                    <div className="skeleton-text" style={{width: '200px', height: '24px', marginBottom: '20px'}}></div>
                    <div className="table-responsive">
                        <table className="table modern-table">
                            <thead>
                            <tr>
                                {['Name', 'Image', 'Min Amount', 'Action'].map((th, index) => (
                                    <th key={`cashout-th-skeleton-${index}`}>
                                        <div className="skeleton-text"></div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {[1, 2, 3].map((row) => (
                                <tr key={`cashout-row-skeleton-${row}`}>
                                    <td><div className="skeleton-text"></div></td>
                                    <td><div className="skeleton-image" style={{width: '50px', height: '30px'}}></div></td>
                                    <td><div className="skeleton-text"></div></td>
                                    <td>
                                        <div className="d-flex">
                                            <div className="skeleton-button" style={{width: '30px', height: '30px', marginRight: '10px'}}></div>
                                            <div className="skeleton-button" style={{width: '30px', height: '30px'}}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const OfferwallSkeleton = () => (
        <div className="settings-tab card">
            <div className="card-header skeleton-header"></div>
            <div className="card-body">
                <div className="row">
                    {[1, 2].map((item) => (
                        <div className="col-md-6" key={`offerwall-input-skeleton-${item}`}>
                            <div className="skeleton-input"></div>
                        </div>
                    ))}
                </div>
                <div className="row mt-3">
                    <div className="col-md-8">
                        <div className="skeleton-input"></div>
                    </div>
                    <div className="col-md-4">
                        <div className="skeleton-input"></div>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <div className="skeleton-button" style={{width: '200px', height: '40px'}}></div>
                </div>

                <div className="existing-offerwalls mt-5">
                    <div className="skeleton-text" style={{width: '200px', height: '24px', marginBottom: '20px'}}></div>
                    <div className="table-responsive">
                        <table className="table modern-table">
                            <thead>
                            <tr>
                                {['Name', 'Logo', 'Iframe', 'Rating', 'Status', 'Category', 'Action'].map((th, index) => (
                                    <th key={`offerwall-th-skeleton-${index}`}>
                                        <div className="skeleton-text"></div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {[1, 2, 3].map((row) => (
                                <tr key={`offerwall-row-skeleton-${row}`}>
                                    <td><div className="skeleton-text"></div></td>
                                    <td><div className="skeleton-image" style={{width: '50px', height: '30px'}}></div></td>
                                    <td><div className="skeleton-badge" style={{width: '80px', height: '24px'}}></div></td>
                                    <td><div className="skeleton-stars"></div></td>
                                    <td><div className="skeleton-badge" style={{width: '80px', height: '24px'}}></div></td>
                                    <td><div className="skeleton-text"></div></td>
                                    <td>
                                        <div className="d-flex">
                                            <div className="skeleton-button" style={{width: '30px', height: '30px', marginRight: '10px'}}></div>
                                            <div className="skeleton-button" style={{width: '30px', height: '30px'}}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const SmtpSkeleton = () => (
        <div className="settings-tab card">
            <div className="card-header skeleton-header"></div>
            <div className="card-body">
                <div className="row">
                    {[1, 2].map((item) => (
                        <div className="col-md-6" key={`smtp-input-skeleton-${item}`}>
                            <div className="skeleton-input"></div>
                        </div>
                    ))}
                </div>
                <div className="form-group mt-3">
                    <div className="skeleton-switch"></div>
                </div>
                <div className="row mt-3">
                    {[1, 2].map((item) => (
                        <div className="col-md-6" key={`smtp-auth-skeleton-${item}`}>
                            <div className="skeleton-input"></div>
                        </div>
                    ))}
                </div>
                <div className="row mt-3">
                    {[1, 2].map((item) => (
                        <div className="col-md-6" key={`smtp-from-skeleton-${item}`}>
                            <div className="skeleton-input"></div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                    <div className="d-flex justify-content-center">
                        <div className="skeleton-button" style={{width: '180px', height: '40px', marginRight: '15px'}}></div>
                        <div className="skeleton-button" style={{width: '180px', height: '40px'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const PendingSkeleton = () => (
        <div className="settings-tab">
            <div className="row">
                {[1, 2].map((item) => (
                    <div className="col-md-6 mb-4" key={`pending-skeleton-${item}`}>
                        <div className="card h-100">
                            <div className="card-header skeleton-header"></div>
                            <div className="card-body">
                                {[1, 2].map((setting) => (
                                    <div className="setting-item skeleton-setting" key={`pending-setting-${setting}`}>
                                        <div className="setting-info">
                                            <div className="skeleton-text" style={{width: '70%'}}></div>
                                        </div>
                                        <div className="skeleton-input" style={{width: '100px'}}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header skeleton-header"></div>
                        <div className="card-body">
                            <div className="skeleton-text" style={{width: '200px', height: '24px'}}></div>
                            <div className="skeleton-input mt-3"></div>
                            <div className="skeleton-button mt-3" style={{width: '150px', height: '30px'}}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header skeleton-header"></div>
                        <div className="card-body">
                            <div className="skeleton-switch"></div>
                            <div className="skeleton-input mt-3" style={{width: '100px'}}></div>
                        </div>
                        <div className="card-footer">
                            <div className="skeleton-button" style={{width: '150px', height: '30px'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <HeaderSection />
            <div className="settings-page">
                <div className="container">
                    <div className="row">
                        <div className="page-title text-center pb-3">
                            <h2 className="text-gradient">Application Settings</h2>
                            <p className="text-info">Manage your application configuration</p>
                        </div>
                    </div>

                    <div className="row mt-md-4">
                        <div className="col-md-3">
                            <div className="settings-sidebar card p-3">
                                <button
                                    className={`sidebar-btn ${activeTab === 'basic' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('basic')}
                                >
                                    <FontAwesomeIcon icon={faCog} className="me-2" />
                                    Basic Settings
                                </button>
                                <button
                                    className={`sidebar-btn ${activeTab === 'cashout' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('cashout')}
                                >
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                    Withdrawls Options
                                </button>
                                <button
                                    className={`sidebar-btn ${activeTab === 'offerwalls' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('offerwalls')}
                                >
                                    <FontAwesomeIcon icon={faAd} className="me-2" />
                                    Offerwalls
                                </button>
                                <button
                                    className={`sidebar-btn ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    <FontAwesomeIcon icon={faTasks} className="me-2" />
                                    Pending Tasks
                                </button>
                                <button
                                    className={`sidebar-btn ${activeTab === 'smtp' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('smtp')}
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                    SMTP Settings
                                </button>
                            </div>
                        </div>

                        <div className="col-md-9">
                            {/* Basic Settings Tab */}
                            {activeTab === 'basic' && (
                                loading ? <BasicSettingsSkeleton /> : (
                                    <div className="settings-tab">
                                        <div className="row">
                                            {/* Security Settings Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                                            Security Settings
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {/* Registration Email Confirmation */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>Email Confirmation</h6>
                                                                <p className="text-info small">Require email verification</p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={basicSettings.registrationEmailConfirmation}
                                                                    onChange={(e) => handleSwitchChange('registrationEmailConfirmation', e.target.checked)}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>

                                                        {/* Allow Multiple Accounts Same IP */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>Multiple Accounts</h6>
                                                                <p className="text-info small">Allow from same IP</p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={basicSettings.allowMultipleAccountsSameIP}
                                                                    onChange={(e) => handleSwitchChange('allowMultipleAccountsSameIP', e.target.checked)}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => saveBasicSettings()}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Security Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Regional Settings Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faGlobe} className="me-2" />
                                                            Regional Settings
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {/* IP Change Protection */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>IP Change Protection</h6>
                                                                <p className="text-info small">Restrict on IP change</p>
                                                                <p className="text-danger small">User will auto ban when IP changed</p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={basicSettings.ipChangeProtection}
                                                                    onChange={(e) => handleSwitchChange('ipChangeProtection', e.target.checked)}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => saveBasicSettings()}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Regional Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* IP Quality Check Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                                            IP Quality Check
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {/* Enable IP Quality Check */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>IP Quality Check</h6>
                                                                <p className="text-info small">Enable IP reputation check</p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={basicSettings.ipQualityCheck}
                                                                    onChange={(e) => handleSwitchChange('ipQualityCheck', e.target.checked)}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>

                                                        {/* IPQualityScore API Key */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>API Key</h6>
                                                                <p className="text-info small">IPQualityScore key</p>
                                                            </div>
                                                            <div className="setting-control">
                                                                <input
                                                                    type="password"
                                                                    className="form-control form-control-sm"
                                                                    value={basicSettings.ipQualityApiKey || ''}
                                                                    onChange={(e) => setBasicSettings({
                                                                        ...basicSettings,
                                                                        ipQualityApiKey: e.target.value
                                                                    })}
                                                                    placeholder="API key"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => saveBasicSettings()}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save IP Quality Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notification Settings Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faBell} className="me-2" />
                                                            Notifications
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        {/* Send Withdraw Email */}
                                                        <div className="setting-item">
                                                            <div className="setting-info">
                                                                <h6>Withdraw Emails</h6>
                                                                <p className="text-info small">Send withdrawal notifications</p>
                                                            </div>
                                                            <label className="toggle-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={basicSettings.sendWithdrawEmail}
                                                                    onChange={(e) => handleSwitchChange('sendWithdrawEmail', e.target.checked)}
                                                                />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => saveBasicSettings()}
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Notification Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Withdrawls Options Settings Tab */}
                            {activeTab === 'cashout' && (
                                cashoutLoading ? <CashoutSkeleton /> : (
                                    <div className="settings-tab card">
                                        <div className="card-header">
                                            <h3 className="m-0">
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                                Withdrawls Options
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleCashoutSubmit}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Method Name</label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={newMethod.name}
                                                                onChange={handleCashoutInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="First word should be capitalized"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Image Link</label>
                                                            <input
                                                                type="text"
                                                                name="imageLink"
                                                                value={newMethod.imageLink}
                                                                onChange={handleCashoutInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="URL to payment method logo"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Minimum Withdraw Amount</label>
                                                            <input
                                                                type="number"
                                                                name="minWithdrawAmount"
                                                                value={newMethod.minWithdrawAmount}
                                                                onChange={handleCashoutInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="Minimum amount in coins"
                                                                required
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary-gradient"
                                                        disabled={cashoutLoading}
                                                    >
                                                        {cashoutLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                                Add Payment Method
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>

                                            <div className="existing-methods mt-5">
                                                <h4 className="section-subtitle">Existing Withdrawls Methods</h4>

                                                {cashoutMethods.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table modern-table">
                                                            <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Image</th>
                                                                <th>Min Amount</th>
                                                                <th>Action</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {cashoutMethods.map((method) => (
                                                                <tr key={method._id}>
                                                                    <td>{method.name}</td>
                                                                    <td>
                                                                        {method.imageUrl && (
                                                                            <img
                                                                                src={method.imageUrl}
                                                                                alt={method.name}
                                                                                className="payment-method-img"
                                                                                style={{maxWidth: '50px'}}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td>{method.minAmount}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-primary btn-sm me-2"
                                                                            onClick={() => handleEditCashout(method)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEdit} />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-danger btn-sm"
                                                                            onClick={() => deleteMethod(method.id)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="alert alert-info">
                                                        No cashout methods added yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Offerwall Settings Tab */}
                            {activeTab === 'offerwalls' && (
                                offerwallLoading ? <OfferwallSkeleton /> : (
                                    <div className="settings-tab card">
                                        <div className="card-header">
                                            <h3 className="m-0">
                                                <FontAwesomeIcon icon={faAd} className="me-2" />
                                                Offerwall Settings
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleOfferwallSubmit}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Offerwall Name</label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={newOfferwall.name}
                                                                onChange={handleOfferwallInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="AdGate, OfferToro, etc."
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Logo URL</label>
                                                            <input
                                                                type="text"
                                                                name="logoUrl"
                                                                value={newOfferwall.logoUrl}
                                                                onChange={handleOfferwallInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="URL to offerwall logo"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Category</label>
                                                            <select
                                                                name="offerwallCategory"
                                                                value={newOfferwall.offerwallCategory}
                                                                onChange={handleOfferwallInputChange}
                                                                className="form-control modern-input"
                                                                required
                                                            >
                                                                <option value="Select Category">Select Category</option>
                                                                <option value="offerwall">Offerwall</option>
                                                                <option value="survey">Survey</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Rating</label>
                                                            <select
                                                                name="rating"
                                                                value={newOfferwall.rating}
                                                                onChange={handleOfferwallInputChange}
                                                                className="form-control modern-input"
                                                                required
                                                            >
                                                                <option value="0">Select rating</option>
                                                                <option value="1">1 Star</option>
                                                                <option value="2">2 Stars</option>
                                                                <option value="3">3 Stars</option>
                                                                <option value="4">4 Stars</option>
                                                                <option value="5">5 Stars</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>URL with API key</label>
                                                            <input
                                                                type="text"
                                                                name="iframeUrl"
                                                                value={newOfferwall.iframeUrl}
                                                                onChange={handleOfferwallInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="https://offerwall.com/api_key/"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Status</label>
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    type="checkbox"
                                                                    name="offerwallStatus"
                                                                    checked={newOfferwall.offerwallStatus}
                                                                    onChange={handleOfferwallInputChange}
                                                                    className="form-check-input"
                                                                    id="offerwallStatus"
                                                                />
                                                                <label className="form-check-label" htmlFor="offerwallStatus">
                                                                    {newOfferwall.offerwallStatus ? (
                                                                        <span className="text-success">
                                                                            <FontAwesomeIcon icon={faToggleOn} className="me-2" />
                                                                            Enabled
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-danger">
                                                                            <FontAwesomeIcon icon={faToggleOff} className="me-2" />
                                                                            Disabled
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary-gradient"
                                                        disabled={offerwallLoading}
                                                    >
                                                        {offerwallLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                                Add Offerwall
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>

                                            <div className="existing-offerwalls mt-5">
                                                <h4 className="section-subtitle">Existing Offerwalls</h4>

                                                {offerwalls.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table modern-table">
                                                            <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Logo</th>
                                                                <th>Iframe</th>
                                                                <th>Rating</th>
                                                                <th>Status</th>
                                                                <th>Category</th>
                                                                <th>Action</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {offerwalls.map((offerwall) => (
                                                                <tr key={offerwall._id}>
                                                                    <td>{offerwall.offerWallName}</td>
                                                                    <td>
                                                                        {offerwall.offerWallLogo && (
                                                                            <img
                                                                                src={offerwall.offerWallLogo}
                                                                                alt={offerwall.offerWallName}
                                                                                className="offerwall-logo-img"
                                                                                style={{maxWidth: '50px'}}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-info">Configured</span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="star-rating">
                                                                            {renderStars(offerwall.offerWallRating)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {offerwall.offerwallStatus !== false ? (
                                                                            <span className="badge bg-success">Enabled</span>
                                                                        ) : (
                                                                            <span className="badge bg-danger">Disabled</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {offerwall.offerwallCategory === 'survey' ? (
                                                                            <span className="badge bg-success">Survey</span>
                                                                        ) : (
                                                                            <span className="badge bg-primary">Offerwall</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-primary btn-sm me-2"
                                                                            onClick={() => handleEditOfferwall(offerwall)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEdit} />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-danger btn-sm"
                                                                            onClick={() => deleteOfferwall(offerwall._id)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="alert alert-info">
                                                        No offerwalls added yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* SMTP Settings Tab */}
                            {activeTab === 'smtp' && (
                                smtpLoading ? <SmtpSkeleton /> : (
                                    <div className="settings-tab card">
                                        <div className="card-header">
                                            <h3 className="m-0">
                                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                                SMTP Email Settings
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleSmtpSubmit}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>SMTP Host</label>
                                                            <input
                                                                type="text"
                                                                name="host"
                                                                value={smtpSettings.host}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="smtp.example.com"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>SMTP Port</label>
                                                            <input
                                                                type="number"
                                                                name="port"
                                                                value={smtpSettings.port}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="587"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group mt-3">
                                                    <div className="form-check form-switch">
                                                        <input
                                                            type="checkbox"
                                                            name="secure"
                                                            checked={smtpSettings.secure}
                                                            onChange={handleSmtpInputChange}
                                                            className="form-check-input"
                                                            id="secureCheck"
                                                        />
                                                        <label className="form-check-label" htmlFor="secureCheck">
                                                            Use SSL/TLS (usually port 465)
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>SMTP Username</label>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                value={smtpSettings.username}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="your@email.com"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>SMTP Password</label>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                value={smtpSettings.password}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="••••••••"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>From Email</label>
                                                            <input
                                                                type="email"
                                                                name="fromEmail"
                                                                value={smtpSettings.fromEmail}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="noreply@yourdomain.com"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>From Name</label>
                                                            <input
                                                                type="text"
                                                                name="fromName"
                                                                value={smtpSettings.fromName}
                                                                onChange={handleSmtpInputChange}
                                                                className="form-control modern-input"
                                                                placeholder="Your App Name"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary-gradient me-3"
                                                        disabled={smtpLoading}
                                                    >
                                                        {smtpLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                                Save SMTP Settings
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-success-gradient"
                                                        onClick={testSmtpConnection}
                                                        disabled={smtpLoading}
                                                    >
                                                        {smtpLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Testing...
                                                            </>
                                                        ) : (
                                                            "Test SMTP Connection"
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Pending Tasks Settings Tab */}
                            {activeTab === 'pending' && (
                                pendingLoading ? <PendingSkeleton /> : (
                                    <div className="settings-tab">
                                        <div className="row">
                                            {/* Max Coin/Task Settings Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                                            Maximum Coin Pending Settings
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-group mb-3">
                                                            <label>Max Coins Per Task</label>
                                                            <input
                                                                type="number"
                                                                className="form-control modern-input"
                                                                value={pendingSettings.maxCoinPerTask}
                                                                onChange={(e) => setPendingSettings({
                                                                    ...pendingSettings,
                                                                    maxCoinPerTask: e.target.value
                                                                })}
                                                                min="0"
                                                            />
                                                            <small className="text-info">Tasks with coins above this amount will go to pending</small>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Pending Days</label>
                                                            <input
                                                                type="number"
                                                                className="form-control modern-input"
                                                                value={pendingSettings.maxDays}
                                                                onChange={(e) => setPendingSettings({
                                                                    ...pendingSettings,
                                                                    maxDays: e.target.value
                                                                })}
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={savePendingSettings}
                                                            disabled={pendingLoading}
                                                        >
                                                            {pendingLoading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Max Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Min Coin/Task Settings Card */}
                                            <div className="col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                                                            Minimum Pending Settings
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-group mb-3">
                                                            <label>Min Coins Per Task</label>
                                                            <input
                                                                type="number"
                                                                className="form-control modern-input"
                                                                value={pendingSettings.minCoinPerTask}
                                                                onChange={(e) => setPendingSettings({
                                                                    ...pendingSettings,
                                                                    minCoinPerTask: e.target.value
                                                                })}
                                                                min="0"
                                                            />
                                                            <small className="text-info">Tasks with coins below this amount will go to pending</small>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Pending Days</label>
                                                            <input
                                                                type="number"
                                                                className="form-control modern-input"
                                                                value={pendingSettings.minDays}
                                                                onChange={(e) => setPendingSettings({
                                                                    ...pendingSettings,
                                                                    minDays: e.target.value
                                                                })}
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={savePendingSettings}
                                                            disabled={pendingLoading}
                                                        >
                                                            {pendingLoading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Min Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending Offer IDs */}
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faTasks} className="me-2" />
                                                            Pending by Offer ID
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Offer ID</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control modern-input"
                                                                        value={pendingSettings.newPendingOfferId}
                                                                        onChange={(e) => setPendingSettings({
                                                                            ...pendingSettings,
                                                                            newPendingOfferId: e.target.value
                                                                        })}
                                                                        placeholder="Enter Offer ID"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label>Pending Days</label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control modern-input"
                                                                        value={pendingSettings.newPendingOfferDays}
                                                                        onChange={(e) => setPendingSettings({
                                                                            ...pendingSettings,
                                                                            newPendingOfferDays: e.target.value
                                                                        })}
                                                                        min="1"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2 d-flex align-items-end">
                                                                <button
                                                                    className="btn btn-primary w-100"
                                                                    type="button"
                                                                    onClick={addPendingOfferId}
                                                                    disabled={!pendingSettings.newPendingOfferId.trim()}
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {pendingSettings.pendingOfferIds.length > 0 && (
                                                            <div className="mt-4">
                                                                <h6>Current Pending Offer IDs:</h6>
                                                                <div className="table-responsive">
                                                                    <table className="table modern-table">
                                                                        <thead>
                                                                        <tr>
                                                                            <th>Offer ID</th>
                                                                            <th>Pending Days</th>
                                                                            <th>Action</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        {pendingSettings.pendingOfferIds.map((offer, index) => (
                                                                            <tr key={index}>
                                                                                <td>{offer.id}</td>
                                                                                <td>
                                                                                    <input
                                                                                        type="number"
                                                                                        className="form-control form-control-sm"
                                                                                        value={offer.days}
                                                                                        onChange={(e) => updatePendingOfferDays(index, e.target.value)}
                                                                                        min="1"
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-danger btn-sm"
                                                                                        onClick={() => removePendingOfferId(index)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={savePendingSettings}
                                                            disabled={pendingLoading}
                                                        >
                                                            {pendingLoading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save Offer IDs
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* All Tasks Pending */}
                                        <div className="row mt-4">
                                            <div className="col-md-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="m-0">
                                                            <FontAwesomeIcon icon={faTasks} className="me-2" />
                                                            All Tasks Pending
                                                        </h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-check form-switch mb-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="allTasksPending"
                                                                checked={pendingSettings.allTasksPending}
                                                                onChange={(e) => setPendingSettings({
                                                                    ...pendingSettings,
                                                                    allTasksPending: e.target.checked
                                                                })}
                                                            />
                                                            <label className="form-check-label" htmlFor="allTasksPending">
                                                                Enable Pending for All Tasks
                                                            </label>
                                                        </div>

                                                        {pendingSettings.allTasksPending && (
                                                            <div className="form-group">
                                                                <label>Pending Days for All Tasks</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control modern-input"
                                                                    value={pendingSettings.allTasksDays}
                                                                    onChange={(e) => setPendingSettings({
                                                                        ...pendingSettings,
                                                                        allTasksDays: e.target.value
                                                                    })}
                                                                    min="0"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="card-footer text-end">
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={savePendingSettings}
                                                            disabled={pendingLoading}
                                                        >
                                                            {pendingLoading ? (
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                                                            )}
                                                            Save All Tasks Settings
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Cashout Method Modal */}
            {editingCashout && (
                <div className="modal_container">
                    <div
                        className="modal_outer_div"
                        onClick={closeModal}
                        role="button"
                        tabIndex={0}
                        aria-label="Close modal"
                        onKeyDown={(e) => e.key === 'Enter' && closeModal()}
                    ></div>
                    <div className="new_modal_card" role="dialog" aria-modal="true" aria-labelledby="cashout-modal-title">
                        <button
                            title="Close"
                            onClick={closeModal}
                            className="new_modal_close_btn"
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>

                        <div className="profile_header">
                            <h3 id="cashout-modal-title" className="username">
                                Edit Withdrawal Method
                            </h3>
                        </div>

                        <div className="profile_activity">
                            <form onSubmit={handleUpdateCashout}>
                                <div className="form-group mb-3">
                                    <label>Method Name</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={editingCashout.name}
                                        onChange={(e) => setEditingCashout({
                                            ...editingCashout,
                                            name: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Image Link</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={editingCashout.imageUrl}
                                        onChange={(e) => setEditingCashout({
                                            ...editingCashout,
                                            imageUrl: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label>Minimum Withdraw Amount</label>
                                    <input
                                        type="number"
                                        className="form-control modern-input"
                                        value={editingCashout.minAmount}
                                        onChange={(e) => setEditingCashout({
                                            ...editingCashout,
                                            minAmount: e.target.value
                                        })}
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary-gradient w-100"
                                        disabled={cashoutLoading}
                                    >
                                        {cashoutLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Method'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Offerwall Modal */}
            {editingOfferwall && (
                <div className="modal_container">
                    <div
                        className="modal_outer_div"
                        onClick={closeModal}
                        role="button"
                        tabIndex={0}
                        aria-label="Close modal"
                        onKeyDown={(e) => e.key === 'Enter' && closeModal()}
                    ></div>
                    <div className="new_modal_card" role="dialog" aria-modal="true" aria-labelledby="offerwall-modal-title">
                        <button
                            title="Close"
                            onClick={closeModal}
                            className="new_modal_close_btn"
                            aria-label="Close modal"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>

                        <div className="profile_header">
                            <h3 id="offerwall-modal-title" className="username">
                                Edit Offerwall
                            </h3>
                        </div>

                        <div className="profile_activity">
                            <form onSubmit={handleUpdateOfferwall}>
                                <div className="form-group mb-3">
                                    <label>Offerwall Name</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={editingOfferwall.offerWallName}
                                        onChange={(e) => setEditingOfferwall({
                                            ...editingOfferwall,
                                            offerWallName: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Logo URL</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={editingOfferwall.offerWallLogo}
                                        onChange={(e) => setEditingOfferwall({
                                            ...editingOfferwall,
                                            offerWallLogo: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label>Category</label>
                                    <select
                                        className="form-control modern-input"
                                        value={editingOfferwall.offerwallCategory || ''}
                                        onChange={(e) => setEditingOfferwall({
                                            ...editingOfferwall,
                                            offerwallCategory: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="offerwall">Offerwall</option>
                                        <option value="survey">Survey</option>
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label>Status</label>
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={editingOfferwall.offerwallStatus !== false}
                                            onChange={(e) => setEditingOfferwall({
                                                ...editingOfferwall,
                                                offerwallStatus: e.target.checked
                                            })}
                                            id="editOfferwallStatus"
                                        />
                                        <label className="form-check-label" htmlFor="editOfferwallStatus">
                                            {editingOfferwall.offerwallStatus !== false ? (
                                                <span className="text-success">
                                                    <FontAwesomeIcon icon={faToggleOn} className="me-2" />
                                                    Enabled
                                                </span>
                                            ) : (
                                                <span className="text-danger">
                                                    <FontAwesomeIcon icon={faToggleOff} className="me-2" />
                                                    Disabled
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label>URL with API key</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={editingOfferwall.offerWallIfreamUrl}
                                        onChange={(e) => setEditingOfferwall({
                                            ...editingOfferwall,
                                            offerWallIfreamUrl: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label>Rating</label>
                                    <select
                                        className="form-control modern-input"
                                        value={editingOfferwall.offerWallRating}
                                        onChange={(e) => setEditingOfferwall({
                                            ...editingOfferwall,
                                            offerWallRating: parseInt(e.target.value)
                                        })}
                                        required
                                    >
                                        <option value="1">1 Star</option>
                                        <option value="2">2 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="5">5 Stars</option>
                                    </select>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary-gradient w-100"
                                        disabled={offerwallLoading}
                                    >
                                        {offerwallLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Offerwall'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default SettingsPage;