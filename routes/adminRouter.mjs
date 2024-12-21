import { Router } from "express";
import adminController from "../controllers/adminController.mjs";
import { upload } from './../config/multerConfig.mjs'

const adminRouter = Router();
adminRouter.post('/create_trainer', upload.single('picture'), adminController.createTrainer);
adminRouter.get('/load_trainers', adminController.loadTrainers);
adminRouter.put('/update_trainer/:id', adminController.updateTrainer);
adminRouter.delete('/delete_trainer/:id', adminController.deleteTrainer);
adminRouter.delete('/delete_user/:id', adminController.deleteUser);
adminRouter.post('/create_area', upload.single('picture'), adminController.createArea);
adminRouter.get('/find_user', adminController.findUser);
adminRouter.put('/update_area/:id', adminController.updateArea);
adminRouter.delete('/delete_trainer/:id', adminController.deleteArea);
adminRouter.get('/find_trainer', adminController.findTrainer);
adminRouter.put('/make_admin/:id', adminController.makeAdmin);

export default adminRouter;