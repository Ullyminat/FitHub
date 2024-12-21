import { Router } from "express";
import { authToken } from "../middleware/authToken.mjs";
import userRouter from "./userRouter.mjs";
import { roleCheck } from "../middleware/roleCheck.mjs";
import adminRouter from "./adminRouter.mjs";
import trainerRouter from "./trainerRouter.mjs";

const router = Router();
router.use('/user', userRouter);
router.use('/admin', authToken, roleCheck('admin'), adminRouter)
router.use('/trainer', trainerRouter)

export default router;