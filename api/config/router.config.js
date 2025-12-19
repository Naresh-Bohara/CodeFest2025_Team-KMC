import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js";
import municipalityRouter from "../modules/municipalities/municipality.router.js";
import emergencyRouter from "../modules/emergency-services/emergency-services.router.js";
const router = Router();
router.use("/auth", authRouter);

router.use("/municipalities", municipalityRouter);
router.use("/emergency-services", emergencyRouter);

export default router;