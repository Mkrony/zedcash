import CashoutModel from "../model/CashoutModel.js";
// Get cashout method
export const GetCashoutMethod = async (req, res) => {
    try {
        // Extract query parameters
        const { activeOnly = 'true', sortBy = 'minCoins', sortOrder = 'asc' } = req.query;

        // Build query
        const query = {};
        if (activeOnly === 'true') {
            query.isActive = true;
        }

        // Build sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get cashout methods from database
        const methods = await CashoutModel.find(query)
            .sort(sortOptions)
            .select('-__v -updatedAt'); // Exclude unnecessary fields

        // Format response
        const formattedMethods = methods.map(method => ({
            id: method._id,
            name: method.methodName,
            imageUrl: method.imageUrl,
            minAmount: method.minCoins,
            processingTime: method.processingTime,
            fee: method.feePercentage,
            isActive: method.isActive,
            createdAt: method.createdAt
        }));

        res.status(200).json({
            success: true,
            count: methods.length,
            data: formattedMethods
        });

    } catch (error) {
        console.error("Error fetching cashout methods:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cashout methods",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Add cashout method
export const CashoutMethodAdd = async (req, res) => {
    try {
        const { name, imageLink, minWithdrawAmount } = req.body;

        // Validate required fields
        if (!name || !imageLink || !minWithdrawAmount) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: name, imageLink, minWithdrawAmount"
            });
        }

        // Check if method already exists
        const existingMethod = await CashoutModel.findOne({ methodName: name });
        if (existingMethod) {
            return res.status(409).json({
                success: false,
                message: "Cashout method with this name already exists"
            });
        }

        // Create new cashout method
        const newMethod = await CashoutModel.create({
            methodName: name,
            imageUrl: imageLink,
            minCoins: Number(minWithdrawAmount),
            isActive: true // Default to active
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: "Cashout method added successfully",
            data: newMethod
        });

    } catch (error) {
        console.error("Error adding cashout method:", error);

        // Handle specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// Delete cashout method
export const CashoutMethodDelete = async (req, res) => {
    const cashoutMethodId = req.params.id;
    try {
        // Perform deletion
        const deleteResult = await CashoutModel.findByIdAndDelete(cashoutMethodId);
        if (deleteResult) {
            return res.status(200).json({
                success: true,
                message: "Cashout method deleted successfully",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to delete cashout method"
            });
        }
    } catch (error) {
        console.error("Error deleting cashout method:", error);

        // Handle specific errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid cashout method ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Update cashout method
export const CashoutMethodUpdate = async (req, res) => {
    const { id } = req.params;
    const { name, imageUrl, minAmount } = req.body;

    try {
        const updatedMethod = await CashoutModel.findByIdAndUpdate(
            id,
            {
                methodName:name,
                imageUrl:imageUrl,
                minCoins:minAmount
            },
            { new: true }
        );

        if (!updatedMethod) {
            return res.status(404).json({
                success: false,
                message: "Cashout method not found"
            });
        }
        if (updatedMethod) {
            return res.status(200).json({
                success: true,
                message: "Cashout method updated successfully",
                data: updatedMethod
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};