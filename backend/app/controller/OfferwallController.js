import OfferwallModel from "../model/OfferwallModel.js";

export const AddNewOfferwall = async (req, res) => {
    try{
        const { name, logoUrl,offerwallCategory, iframeUrl, rating,offerwallStatus } = req.body;
        // create offerwall
        const addNewOfferwall = await OfferwallModel.create({
            offerWallName: name,
            offerWallLogo: logoUrl,
            offerwallCategory:offerwallCategory,
            offerWallIfreamUrl: iframeUrl,
            offerWallRating: rating,
            offerwallStatus:offerwallStatus
        });
        return res.status(200).json({
            status: 'success',
            message: 'Offerwall added successfully',
        });
    }
    catch(err){
        return res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}

// get offerwalls

export const GetOfferwall = async (req, res) => {
    try{
        const offerwalls = await OfferwallModel.find();
        return res.status(200).json({
            status: 'success',
            message: 'Offerwalls fetched successfully',
            data: offerwalls
        });
    }
    catch(err){
        return res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}

// Delete offerwall
export const DeleteOfferwall = async (req, res) => {
    const offerwallId = req.params.id
    try{
        const deletedOfferwall = await OfferwallModel.findByIdAndDelete({_id: offerwallId});
        return res.status(200).json({
            status: 'success',
            message: 'Offerwall deleted successfully',
        })
    }
    catch(err){
        return res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}

// Update offerwall
export const UpdateOfferwall = async (req, res) => {
        const { id } = req.params;
        const { offerWallName, offerWallLogo, offerwallCategory, offerWallIframe, offerWallRating,offerwallStatus } = req.body;

        try {
            const updatedOfferwall = await OfferwallModel.findByIdAndUpdate(
                id,
                {
                    offerWallName: offerWallName,
                    offerWallLogo: offerWallLogo,
                    offerwallCategory:offerwallCategory,
                    offerWallIfreamUrl: offerWallIframe,
                    offerWallRating: offerWallRating,
                    offerwallStatus:offerwallStatus
                },
                { new: true }
            );

            if (!updatedOfferwall) {
                return res.status(404).json({
                    success: false,
                    message: "Offerwall not found"
                });
            }
            if (updatedOfferwall) {
                return res.status(200).json({
                    success: true,
                    message: "Offerwall updated successfully",
                });
            }
        } catch (error) {
            console.error("Error updating offerwall:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };