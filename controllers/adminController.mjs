import User from './../model/user.mjs'
import Trainer from './../model/trainer.mjs'
import Area from '../model/area.mjs';
import { configDotenv } from 'dotenv';
import bcrypt from "bcrypt";
import Order from '../model/order.mjs';

configDotenv();
export default class adminController{
    static async createTrainer(req,res){
        try{
            const {name,surname,patronymic,telephone,password,cost} = req.body;
            if (!name || name.trim().length === 0) {
                return res.status(400).json({ msg: `Имя не может быть пустым` });
            }
            if (!/^[А-Яа-яЁё]{1,20}$/.test(name)) {
                return res.status(400).json({ msg: "Имя может содержать только буквы кириллицы, без пробелов, и быть не длиннее 20 символов" });
            }            
            if (!surname || surname.trim().length === 0) {
                return res.status(400).json({ msg: `Фамилия не может быть пустым` });
            }
            if (!/^[А-Яа-яЁё]{1,20}$/.test(surname)) {
                return res.status(400).json({ msg: "Фамилия может содержать только буквы кириллицы, без пробелов, и быть не длиннее 20 символов" });
            }
            if (!/^[А-Яа-яЁё]{0,20}$/.test(patronymic)) {
                return res.status(400).json({ msg: "Отчество может содержать только буквы кириллицы, без пробелов, и быть не длиннее 20 символов" });
            }
            if (!telephone || telephone.trim().length === 0) {
                return res.status(400).json({ msg: `Телефонный номер не может быть пустым` });
            }
            if (!/^\d{10,15}$/.test(telephone)) {
                return res.status(400).json({ msg: "Телефонный номер должен содержать только цифры и быть длиной от 10 до 15 символов" });
            }
            if (!password || password.trim().length === 0) {
                return res.status(400).json({ msg: `Пароль не может быть пустым` });
            }
            if (!/^[a-zA-Z0-9!@#$%^&*()]{4,15}$/.test(password)) {
                return res.status(400).json({ msg: "Пароль должен содержать 4-15 символов и может включать буквы, цифры и специальные символы !" });
            }
            if (!cost || cost.trim().length <= 0) {
                return res.status(400).json({ msg: `Стоимость не может быть пустым или быть равным 0` });
            }
            const hashed = await bcrypt.hash(password,5);
            const trainer = new Trainer({
                name,
                surname,
                patronymic,
                telephone,
                password:hashed,
                cost,
                picture: req.file.filename,
            });
            await trainer.save();
            res.status(201).json({msg:'Создан тренер'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async makeAdmin(req,res) {
        try {
            const {id} = req.params;
            const {role} = req.body;
            await User.findByIdAndUpdate(id,{role},{new:true})
            return res.status(200).json({msg: 'Вы успешно выдали роль администратора'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async loadTrainers(req, res) {
        try {
            const alldata = await Trainer.find()
            res.json(alldata)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateTrainer(req,res) {
        try {
            const {id} = req.params;
            const {name,surname,patronymic,telephone,cost} = req.body;
            await Trainer.findByIdAndUpdate(id,{name,surname,patronymic,telephone,cost},{new:true})
            return res.status(200).json({msg: 'Данные тренера обновлены'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteTrainer(req, res) {
        try {
            const {id} = req.params;
            await Trainer.findByIdAndDelete(id);
            return res.status(200).json({msg: 'Тренер удалён'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const {id} = req.params;
            await User.findByIdAndDelete(id);
            return res.status(200).json({msg: 'Пользователь удалён'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async createArea(req,res) {
        try {
            const {area,cost} = req.body;
            const areazone = new Area({
                area,
                cost,
                picture: req.file.filename,
            });
            await areazone.save();
            res.status(201).json({msg:'Создана зона посещения'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async findUser(req,res) {
        try {
            const {telephone} = req.body;
            const findedUser = await User.find({telephone: telephone});
            res.json(findedUser)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async findTrainer(req,res) {
        try {
            const {surname} = req.body;
            const findedTrainer = await Trainer.find({surname: surname});
            res.json(findedTrainer)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateArea(req,res) {
        try {
            const {id} = req.params;
            const {cost,area} = req.body;
            await Area.findByIdAndUpdate(id,{cost,area},{new:true})
            return res.status(200).json({msg: 'Данные обновлены'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteArea(req,res) {
        try {
            const {id} = req.params;
            await Area.findByIdAndDelete(id)
            return res.status(200).json({msg: 'Успешно удалён!'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }
}