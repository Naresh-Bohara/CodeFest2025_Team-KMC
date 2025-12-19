import { Router } from "express";

import authRouter from "../modules/auth/auth.router.js";
import municipalityRouter from "../modules/municipalities/municipality.router.js";
import emergencyRouter from "../modules/emergency-services/emergency-services.router.js";
import sponsorRouter from "../modules/sponsors/sponsor.router.js";
import reportRouter from "../modules/reports/report.router.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/municipalities", municipalityRouter);
router.use("/emergency-services", emergencyRouter);
router.use("/sponsors", sponsorRouter);
router.use("/reports", reportRouter);

export default router;
