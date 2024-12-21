import Trainer from "../model/trainer.mjs";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import Order from "../model/order.mjs";

configDotenv();
export default class trainerController{
    static async login(req,res){
        try {
            const {telephone,password} = req.body;
            const finded = await Trainer.findOne({telephone:telephone});
            if(!finded){
                return res.status(404).json({msg:'Не найден'});
            }
            const findedByPassword = await bcrypt.compare(password,finded.password);
            if(!findedByPassword){
                return res.status(404).json({msg:'Не найден'});
            }
            const payload = {
                _id:finded._id,
                telephone:finded.telephone
            };
            const token = await jwt.sign(payload,process.env.SECRET,{expiresIn:'10h'});
            return res.status(200).json({ user: { telephone: finded.telephone, _id: finded._id }, token });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async getUsers(req,res){
        const userId = req.user._id;
        try {
            const findedUsers = await Order.find({trainer: userId});
            res.json(findedUsers)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req,res) {
        const userId = req.user._id;
        try {
            const {name,surname,patronymic,telephone,cost} = req.body;
            await Trainer.findByIdAndUpdate(userId,{name,surname,patronymic,telephone,cost},{new:true})
            return res.status(200).json({msg: 'Данные обновлены'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        const userId = req.user._id;
        try {
            await Trainer.findByIdAndDelete(userId);
            return res.status(200).json({msg: 'Тренер удалён'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user._id;
            const { newPassword } = req.body;
            const user = await Trainer.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: "Пользователь не найден" });
            }
            if (!newPassword || newPassword.trim().length === 0) {
                return res.status(400).json({ msg: `Пароль не может быть пустым` });
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{4,15}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ msg: "Пароль должен содержать 4-15 символов и включать хотя бы одну строчную букву, одну заглавную букву, одну цифру и один специальный символ" });
            }
            user.password = await bcrypt.hash(newPassword, 5);
            await user.save();
            return res.status(200).json({ msg: "Пароль успешно изменен!" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }
}