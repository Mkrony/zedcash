import BasicSettingsModel from "../model/BasicSettingsModel.js";

export const saveBasicSettings = async (req, res) => {
    try {
        const {
            registrationEmailConfirmation,
            allowMultipleAccountsSameIP,
            ipChangeProtection,
            sendWithdrawEmail,
            ipQualityCheck,
            ipQualityApiKey,
        } = req.body;

        // Validate IPQualityScore API key if IP Quality Check is enabled
        if (ipQualityCheck && (!ipQualityApiKey || ipQualityApiKey.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: "IPQualityScore API key is required when IP Quality Check is enabled"
            });
        }

        const settingsData = {
            registrationEmailConfirmation: Boolean(registrationEmailConfirmation),
            allowMultipleAccountsSameIP: Boolean(allowMultipleAccountsSameIP),
            ipChangeProtection: Boolean(ipChangeProtection),
            sendWithdrawEmail: Boolean(sendWithdrawEmail),
            ipQualityCheck: Boolean(ipQualityCheck),
            ipQualityApiKey: ipQualityApiKey || '',
        };

        const settings = await BasicSettingsModel.findOneAndUpdate(
            {},
            settingsData,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
        return res.status(200).json({
            success: true,
            message: "Settings saved successfully",
            data: settings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getBasicSettings = async (req, res) => {
    try {
        let settings = await BasicSettingsModel.findOne({})
            .select('-__v -createdAt -updatedAt')
            .lean();

        if (!settings) {
            // Create default settings if none exist
            settings = {
                registrationEmailConfirmation: false,
                allowMultipleAccountsSameIP: false,
                ipChangeProtection: false,
                sendWithdrawEmail: false,
                ipQualityCheck: false,
                ipQualityApiKey: '',
            };

            await BasicSettingsModel.create(settings);
        }

        // Mask the API key in the response
        if (settings.ipQualityApiKey) {
            settings.ipQualityApiKey = maskApiKey(settings.ipQualityApiKey);
        }

        return res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get settings",
            error: error.message
        });
    }
};

// Helper function to mask API key in responses
function maskApiKey(key) {
    if (!key || key.length < 8) return '••••••••';
    return key.substring(0, 3) + '••••••' + key.slice(-3);
}

// SMTP settings
// Get SMTP settings
export const GetSmtpSettings = async (req, res) => {
    try {
        const smtpConfig = await SmtpModel.getSmtpConfig();
        if (!smtpConfig) {
            return res.status(404).json({
                success: false,
                message: 'SMTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: smtpConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch SMTP settings',
            error: error.message
        });
    }
};

// Save SMTP settings
export const SaveSmtpSettings = async (req, res) => {
    try {
        // Check if config already exists
        const existingConfig = await SmtpModel.getSmtpConfig();

        let smtpConfig;
        if (existingConfig) {
            // Update existing config
            smtpConfig = await SmtpModel.findByIdAndUpdate(
                existingConfig._id,
                req.body,
                { new: true, runValidators: true }
            );
        } else {
            // Create new config
            smtpConfig = await SmtpModel.create(req.body);
        }

        res.status(200).json({
            success: true,
            message: 'SMTP settings saved successfully',
            data: smtpConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to save SMTP settings',
            error: error.message
        });
    }
};

// Test SMTP connection
export const TestSmtpConnection = async (req, res) => {
    try {
        const smtpConfig = await SmtpModel.getSmtpConfig();
        if (!smtpConfig) {
            return res.status(400).json({
                success: false,
                message: 'SMTP configuration not found'
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password
            }
        });

        // Verify connection
        await transporter.verify();

        res.status(200).json({
            success: true,
            message: 'SMTP connection successful'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'SMTP connection failed',
            error: error.message
        });
    }
};
