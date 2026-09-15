import express from "express";
import webhook from "./controllers/webhook";

const router = express.Router();

// Fixed URL, already configured in the Paystack dashboard — kept stable here
// even though the user-facing payment flow now lives under
// /employment-access/*, so it doesn't need re-configuring on every change.
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

export default router;
