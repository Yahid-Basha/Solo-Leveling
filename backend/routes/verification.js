import dotenv from "dotenv";
import express from "express";
import {} from "../controllers/questsController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { verifyTask } from "../controllers/tasksController.js";

const router = express.Router();

router.post("/", authenticate, verifyTask);

dotenv.config();

export default router;
