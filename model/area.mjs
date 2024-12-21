import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        min: 0,
    },
    picture: {
        type:String,
        required:true
    },
});

const Area = mongoose.model('Area', areaSchema);
export default Area;