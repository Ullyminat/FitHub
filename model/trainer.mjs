import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    surname:{
        type:String,
        required:true,
    },
    patronymic:{
        type:String,
    },
    telephone:{
        type:Number,
        required:true,
        unique: true,
    },
    password:{
        type:String,
        required:true
    },
    cost: {
        type: Number,
        min: 0
    },
    picture: {
        type:String,
        required:true
    },
});
const Trainer = mongoose.model('Trainer',trainerSchema);
export default Trainer;