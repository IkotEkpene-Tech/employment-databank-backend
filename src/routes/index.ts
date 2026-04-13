import express from "express";
import wardsAndVillageRouter from "./wardAndVillages";
import applicantsRouter from "./applicantRoutes";
import paymentRouter from "./paymentRoutes";

const router = express.Router();

router.use("/wards-and-villages", wardsAndVillageRouter);
router.use("/applicants", applicantsRouter);
router.use("/payments", paymentRouter);

export default router;
