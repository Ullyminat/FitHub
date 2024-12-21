import { Router } from "express";
import UserController from "../controllers/userController.mjs";
import { authToken } from "../middleware/authToken.mjs";
import { upload } from "../config/multerConfig.mjs";

const userRouter = Router();
userRouter.post('/create', upload.single('picture'), UserController.create);
userRouter.post('/login', UserController.login);
userRouter.post('/create_order', authToken, UserController.createOrder);
userRouter.get('/get_orders', authToken, UserController.getOrders);
userRouter.put('/update', authToken, UserController.update);
userRouter.delete('/delete', authToken, UserController.delete);
userRouter.put('/change_password', authToken, UserController.changePassword);
userRouter.get('/find_area', authToken, UserController.findArea);
userRouter.post('/enable_2fa', authToken, UserController.enable2FA);
userRouter.post('/verify_2fa', authToken, UserController.verify2FA);
userRouter.post('/disable_2fa', authToken, UserController.disable2FA);

export default userRouter;