import express from "express";
import authRouter from "../auth/auth.routes";
import paymentsRouter from "../payments/payments.routes";
import employmentAccessRouter from "../employmentAccess/employment-access.routes";
import applicantsRouter from "../applicants/applicants.routes";
import wardsAndVillagesRouter from "../wardsAndVillages/wards-and-villages.routes";
import complaintsRouter from "../complaints/complaints.routes";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/payments", paymentsRouter);
router.use("/employment-access", employmentAccessRouter);
router.use("/applicants", applicantsRouter);
router.use("/wards-and-villages", wardsAndVillagesRouter);
router.use("/complaints", complaintsRouter);

export default router;
