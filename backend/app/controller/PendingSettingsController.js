import PendingSettingsSettingsModel from "../model/PendingSettingsModel.js";
import PendingSettingsModel from "../model/PendingSettingsModel.js";

export const GetPendingSettings = async (req, res)=>{
    try{
        const settings = await PendingSettingsSettingsModel.find();
        if(!settings) {
            return res.status(404).json({
                status: false,
                message: "Try again later, server busy !",
            })
        }
        return res.status(200).json({
            status:"success",
            message:"Pending settings fetched successfully",
            data:settings
        })
    }
    catch(err){
        return res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}

// insert or update pending settings Data
export const UpdatePendingSettings = async (req, res) =>{
    try{
        let settings = await PendingSettingsModel.findOne();
        if (!settings) {
            settings = await PendingSettingsModel.create(req.body);
        } else {
            settings = await PendingSettingsModel.findOneAndUpdate(
                {},
                req.body,
                { new: true, runValidators: true }
            );
        }
        return res.status(200).json({
            status:"success",
            message:"Pending Tasks settings saved"
        })
    }
    catch (e) {
        return res.status(500).json({
            status:false,
            message:e.message,
        })
    }

}
// delete

export const DeletePendingOfferId = async(req, res)=>{
    return res.status(200);
}