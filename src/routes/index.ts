import express from "express";
import wardsAndVillageRouter from "./wardAndVillages";
import applicantsRouter from "./applicantRoutes";
import paymentRouter from "./paymentRoutes";
import complaintRouter from "./complaintRoutes";

const router = express.Router();

router.use("/wards-and-villages", wardsAndVillageRouter);
router.use("/applicants", applicantsRouter);
router.use("/payments", paymentRouter);
router.use("/complaints", complaintRouter);

export default router;
