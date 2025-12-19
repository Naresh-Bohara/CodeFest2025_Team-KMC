import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js";
import municipalityRouter from "../modules/municipalities/municipality.router.js";
const router = Router();
router.use("/auth", authRouter);
router.use("/municipalities", municipalityRouter);


export default router;