import mongoose from "mongoose";

const offerwallSchema = new mongoose.Schema({
    offerWallName: {
        type: String,
        required: true,
    },
    offerWallLogo: {
        type: String,
        required: true,
    },
    offerwallCategory:{
        type:String,
        default:"offerwall",
    },
    offerWallIfreamUrl: {
        type: String,
        required: true,
    },
    offerWallRating: {
        type: Number,
        default:5,
    },
    offerwallStatus:{
        type:Boolean,
        default:true,
    }
}, {
    timestamps: true,
    versionKey: false
});

const OfferwallModel = mongoose.model("Offerwalls", offerwallSchema);
export default OfferwallModel;