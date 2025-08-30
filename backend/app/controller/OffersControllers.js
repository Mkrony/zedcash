import CompletededTasksModel from "../model/ComleteTaskModel.js";
export const CompletedOffers = async (req, res) => {
    try {
        const offers = await CompletededTasksModel.find();
        return res.status(200).json({
            success: true,
            offers: offers,
        });
    }
    catch (error) {
        return res.status(500).send(error);
    }
};
//  completed offers by user id
export const GetUserCompletedTasksByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const offers = await CompletededTasksModel.find({ userID: userId});
        return res.status(200).json({
            success: true,
            offers: offers
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};
//  completed offers by logedin users
export const UserCompletedTask = async (req, res) => {
    try {
        const userId = req.headers.user_id;
        const offers = await CompletededTasksModel.find({ userID: userId});
        return res.status(200).json({
            success: true,
            offers: offers
        });
    } catch (error) {
        return res.status(500).send(error);
    }
}

// Total Revenue Count
export const TotalRevenues = async (req, res) => {
    try {
        const result = await CompletededTasksModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" }
                }
            }
        ]);
        const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
        return res.status(200).json({
            success: true,
            totalRevenue: totalRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
// Today's Total Revenue
export const TodayTotalRevenue = async (req, res) => {
    try {
        // Get start and end of current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const result = await CompletededTasksModel.aggregate([
            {
                $match: {
                    createdAt: { // assuming you have createdAt field
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" }
                }
            }
        ]);

        const todayRevenue = result.length > 0 ? result[0].totalRevenue : 0;

        return res.status(200).json({
            success: true,
            todayRevenue: todayRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
// Delete Completed Task
export const DeleteCompletedTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;

        // Validate ObjectId (optional but recommended if you're using MongoDB)
        if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        const result = await CompletededTasksModel.deleteOne({ _id: taskId });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or already deleted'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Task successfully deleted'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
