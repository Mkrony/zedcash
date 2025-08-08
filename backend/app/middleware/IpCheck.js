import axios from 'axios';
import BasicSettingsModel from "../model/BasicSettingsModel.js";

// Cache settings to reduce DB queries
let cachedSettings = null;
let lastSettingsFetch = 0;

const getSettings = async () => {
    const now = Date.now();
    // Refresh settings every 5 minutes (300000 ms)
    if (!cachedSettings || now - lastSettingsFetch > 300000) {
        cachedSettings = await BasicSettingsModel.findOne();
        lastSettingsFetch = now;
    }
    return cachedSettings;
};

const ipCheckMiddleware = async (req, res, next) => {
    try {
        // 1. Get client IP safely
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket.remoteAddress;
        // 2. Skip check for localhost/trusted IPs (optional)
        const trustedIPs = ['::1', '127.0.0.1'];
        if (trustedIPs.includes(clientIP)) {
            return next();
        }

        // 3. Get settings
        const settings = await getSettings();
        const apiKey = settings?.ipQualityApiKey;
        const ipCheckOn = settings?.ipQualityCheck;
        const fraudThreshold = settings?.ipFraudThreshold || 75;

        // 4. Skip if IP check is disabled or no API key
        if (!ipCheckOn || !apiKey) {
            return next();
        }
        // 5. Call IPQualityScore API
        const response = await axios.get(
            `https://ipqualityscore.com/api/json/ip/${apiKey}/${clientIP}`,
            { timeout: 2000 } // Add timeout
        );

        const ipData = response.data;

        // 6. Check for blocking conditions
        const isBlocked = ipData.proxy ||
            ipData.vpn ||
            ipData.tor ||
            ipData.active_vpn ||
            ipData.recent_abuse ||
            ipData.fraud_score >= fraudThreshold;

        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Suspicious IP detected",
                reason: {
                    proxy: ipData.proxy,
                    vpn: ipData.vpn,
                    tor: ipData.tor,
                    fraudScore: ipData.fraud_score,
                    country: ipData.country_code,
                    isp: ipData.ISP,
                    city: ipData.city
                }
            });
        }

        // 7. Attach sanitized data to request
        req.ipInfo = {
            fraudScore: ipData.fraud_score,
            country: ipData.country_code,
            isp: ipData.ISP,
            city: ipData.city,
            mobile: ipData.mobile
        };

        next();

    } catch (error) {
        console.error("IP check error:", error.message);

        // Option 1: Fail open (allow request)
        // next();

        // Option 2: Fail closed (block request)
        return res.status(403).json({
            success: false,
            message: "IP verification service unavailable",
            error: error.message
        });
    }
};

export default ipCheckMiddleware;