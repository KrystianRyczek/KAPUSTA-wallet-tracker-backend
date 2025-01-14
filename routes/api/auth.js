import express from "express";
import dotenv from "dotenv";
import { loginUser, logoutUser, registerUser } from "../../controllers/user-controllers.js";
import { authenticateToken } from "../../middlewares/authToken.js"

dotenv.config();

const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authenticateToken, logoutUser)

export default router;
