import axios from 'axios';
import BasicSettingsModel from "../model/BasicSettingsModel.js";

const ipCheckMiddleware = async (req, res, next) => {
    try {
        // 1. Get client IP safely (supports x-forwarded-for and fallback)
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

        // 2. Skip check for localhost (for dev testing)
        if (clientIP === '::1' || clientIP === '127.0.0.1') {
            console.log("Skipping IP check for localhost:", clientIP);
            return next();
        }

        // 3. Fetch IP Quality Score settings from DB
        const settings = await BasicSettingsModel.findOne();
        const apiKey = settings?.ipQualityApiKey;
        const ipCheckOn = settings?.ipQualityCheck;

        let ipData = null; // Declared outside for logging use

        // 4. Proceed only if IP check is enabled and API key exists
        if (apiKey && ipCheckOn) {
            // Call IPQualityScore API
            const response = await axios.get(`https://ipqualityscore.com/api/json/ip/${apiKey}/${clientIP}`);
            ipData = response.data;

            // 5. Block if proxy, VPN, or fraud score is high
            if (ipData.proxy || ipData.vpn || ipData.fraud_score > 75) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: Suspicious IP detected.",
                    reason: ipData
                });
            }

            // 6. Attach data to request object
            req.ipInfo = ipData;
        }

        // 7. Logging (for testing/debugging)
        console.log("Client IP:", clientIP);
        console.log("IPQS Result:", ipData);

        // Continue to next middleware/route
        next();

    } catch (error) {
        console.error("IP check error:", error?.response?.data || error.message);
        next(); // Continue even if API fails
    }
};

export default ipCheckMiddleware;
