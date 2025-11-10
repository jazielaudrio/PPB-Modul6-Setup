import express from "express";
import { HumidityReadingsController } from "../controllers/humidityReadingsController.js"; // Diubah

const router = express.Router();

router.get("/", HumidityReadingsController.list); // Diubah
router.post("/", HumidityReadingsController.create); // Diubah
router.get("/latest", HumidityReadingsController.latest); // Diubah

export default router;