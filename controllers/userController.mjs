import User from './../model/user.mjs'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import Area from '../model/area.mjs';
import Trainer from '../model/trainer.mjs';
import Order from '../model/order.mjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

configDotenv();
export default class UserController{
    static async create(req,res){
        try{
            const {name,surname,patronymic,telephone,password} = req.body;
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
            if (patronymic && !/^[А-Яа-яЁё]{0,20}$/.test(patronymic)) {
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
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{4,15}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ msg: "Пароль должен содержать 4-15 символов и включать хотя бы одну строчную букву, одну заглавную букву, одну цифру и один специальный символ" });
            }
            
            const hashed = await bcrypt.hash(password,5);
            const user = new User({
                name,
                surname,
                patronymic,
                telephone,
                password:hashed,
                picture: req.file.filename,
            });
            await user.save();
            res.status(201).json({msg:'Создан'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { telephone, password, otp } = req.body;
            const user = await User.findOne({ telephone });
            if (!user) {
                return res.status(404).json({ msg: 'Не найден' });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(404).json({ msg: 'Не найден' });
            }
    
            if (user.twoFactorEnabled) {
                const verified = speakeasy.totp.verify({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                    token: otp,
                });
    
                if (!verified) {
                    return res.status(403).json({ msg: 'Неверный OTP' });
                }
            }
    
            const payload = {
                _id: user._id,
                telephone: user.telephone,
            };
            const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '10h' });
            return res.status(200).json({ user: { telephone: user.telephone, _id: user._id }, token });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async createOrder(req, res) {
        const userId = req.user._id;
        try {
            const { areas, trainer, valid_period } = req.body;
    
            const areaCosts = await Promise.all(areas.map(areaId => Area.findById(areaId)));
            const totalAreaCost = areaCosts.reduce((sum, area) => sum + area.cost, 0);
    
            const trainerCost = await Trainer.findById(trainer);
            const totalTrainerCost = trainerCost ? trainerCost.cost : 0;
    
            const periodCost = valid_period * 20;
            const totalAmount = totalAreaCost + totalTrainerCost + periodCost;
            
            let valid_until = new Date();
            valid_until.setDate(valid_until.getDate() + Number(valid_period));
            valid_until = String(valid_until.getDate() + '.' + (valid_until.getMonth() + 1) + '.' +valid_until.getFullYear())
    
            const newOrder = new Order({
                user: userId,
                date_purchase: Date.now(),
                amount: totalAmount,
                valid_period,
                valid_until,
                areas,
                trainer,
            });
    
            await newOrder.save();
            return res.status(201).json({ msg: 'Заказ успешно создан', order: newOrder });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async getOrders(req,res) {
        const userId = req.user._id;
        try {
            const findedOrders = await Order.find({user: userId});
            res.json(findedOrders);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req,res) {
        const userId = req.user._id;
        try {
            const {name,surname,patronymic,telephone} = req.body;
            await User.findByIdAndUpdate(userId,{name,surname,patronymic,telephone},{new:true})
            return res.status(200).json({msg: 'Данные обновлены'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        const userId = req.user._id;
        try {
            await User.findByIdAndDelete(userId);
            return res.status(200).json({msg: 'Пользователь удалён'});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user._id;
            const { newPassword } = req.body;
            const user = await User.findById(userId);
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

    static async findArea(req,res) {
        try {
            const {area} = req.body;
            const findedArea = await Area.find({area: area});
            res.json(findedArea)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    }

    static async enable2FA(req, res) {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: "Пользователь не найден" });
            }

            const secret = speakeasy.generateSecret({ length: 20 });

            user.twoFactorSecret = secret.base32;
            await user.save();

            QRCode.toDataURL(secret.otpauth_url, (err, dataURL) => {
                if (err) {
                    return res.status(500).json({ msg: "Ошибка при генерации QR-кода" });
                }
                res.json({ qrCode: dataURL, secret: secret.base32 });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async verify2FA(req, res) {
        try {
            const userId = req.user._id;
            const { token } = req.body;
            const user = await User.findById(userId);
    
            if (!user || !user.twoFactorSecret) {
                return res.status(404).json({ msg: "Пользователь не найден или 2FA не включен" });
            }
    
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
            });
    
            if (verified) {
                user.twoFactorEnabled = true;
                await user.save();
                return res.json({ verified: true, msg: "2FA успешно подтверждён" });
            } else {
                return res.json({ verified: false, msg: "Неверный OTP" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async disable2FA(req, res) {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user || !user.twoFactorEnabled) {
                return res.status(404).json({ msg: "Пользователь не найден или 2FA не включен" });
            }

            user.twoFactorSecret = null;
            user.twoFactorEnabled = false;
            await user.save();

            return res.json({ msg: "2FA отключен" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: error.message });
        }
    }
}