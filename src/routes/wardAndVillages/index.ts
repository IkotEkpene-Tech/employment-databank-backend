import express from "express";
import addWardController from "../../controllers/wardAndVillages/addWardController";
import {
  inputValidator,
  addWardValidation,
  addVillagesToWardValidation,
} from "../../validations/joi/joi.validations";
import { getAllWardsController, getAllWardsAndVillagesControllers } from "../../controllers/wardAndVillages/getAllWardsControllers";
import addVillageToWardController from "../../controllers/wardAndVillages/addVillagesToWardController";

const router = express.Router();

router.post("/add-wards", inputValidator(addWardValidation), addWardController);
router.get("/all-wards", getAllWardsController);
router.get('/all-wards-villages', getAllWardsAndVillagesControllers)
router.post(
  "/add-ward-villages",
  inputValidator(addVillagesToWardValidation),
  addVillageToWardController,
);


export default router;
