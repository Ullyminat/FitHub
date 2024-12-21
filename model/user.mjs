import mongoose from "mongoose";
import Order from "./order.mjs";

const userSchema = new mongoose.Schema({
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
    role:{
        type:String,
        default: 'user',
        enum: ["user", "admin"],
    },
    picture: {
            type:String,
            required:true
    },
    twoFactorSecret: {
        type: String,
        default: null,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    });

userSchema.pre('findOneAndDelete', async function(next) {
    await Order.deleteMany({user: this._conditions._id});
    next();
});

const User = mongoose.model('User',userSchema);
export default User;