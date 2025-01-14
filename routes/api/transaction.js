import express from "express";
import dotenv from "dotenv";
import {
  deleteTransaction,
  getIncomeCategories,
  getExpenseCategories,
  getTransactionsPeriod,
  addTransaction,
  getAllIncomess,
  getAllExpensess,
} from "../../controllers/transaction-controllers.js";
import { authenticateToken } from "../../middlewares/authToken.js";

dotenv.config();

const router = express.Router();

router.post("/income", authenticateToken, addTransaction);
router.get("/income", authenticateToken, getAllIncomess);
router.post("/expense", authenticateToken, addTransaction);
router.get("/expense", authenticateToken, getAllExpensess);
router.delete("/:id", authenticateToken, deleteTransaction);
router.get("/income-categories", authenticateToken, getIncomeCategories);
router.get("/expense-categories", authenticateToken, getExpenseCategories);
router.get("/period-data", authenticateToken, getTransactionsPeriod);

export default router;
