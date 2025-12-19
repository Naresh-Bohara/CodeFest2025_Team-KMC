import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js";
import sponsorRouter from "../modules/sponsors/sponsor.router.js";


const router = Router();
router.use("/auth", authRouter);

router.use("/sponsors", sponsorRouter);



export default router;