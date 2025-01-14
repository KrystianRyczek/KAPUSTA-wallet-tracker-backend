import express from "express";
import dotenv from "dotenv";
import {
  getAllUserInfo,
  updateBalance,
} from "../../controllers/user-controllers.js";
import { authenticateToken } from "../../middlewares/authToken.js";

dotenv.config();

const router = express.Router();

router.patch("/balance", authenticateToken, updateBalance);
router.get("/", authenticateToken, getAllUserInfo);

export default router;
