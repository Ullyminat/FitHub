import { Router } from "express";
import trainerController from "../controllers/trainerController.mjs";
import { authToken } from "../middleware/authToken.mjs";

const trainerRouter = Router();
trainerRouter.post('/login', trainerController.login);
trainerRouter.get('/get_users', authToken, trainerController.getUsers);
trainerRouter.put('/update', authToken, trainerController.update);
trainerRouter.delete('/delete', authToken, trainerController.delete);
trainerRouter.put('/change_password', authToken, trainerController.changePassword);


export default trainerRouter;