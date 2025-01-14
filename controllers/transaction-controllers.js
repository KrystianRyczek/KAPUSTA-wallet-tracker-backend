import {
  removeTransaction,
  fetchPeriod,
} from "../service/transaction-service.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import { createMonthStats, incomeCategories, expenseCategories } from "../helpers/transactions.js";

export const addTransaction = async (req, res, next) => {
  const { description, amount, date, category, typeOfTransaction } = req.body;
  const owner = req.user.id;

  try {
    const user = await User.findById(owner);

    if (!user) {
      return res.status(404).json({ error: "Invalid user or session" });
    }
    const newTransaction = new Transaction({
      typeOfTransaction,
      description,
      amount,
      date,
      category,
      owner,
    });

    await newTransaction.save();

    if (typeOfTransaction === "income") {
      user.totalIncome += amount;
    } else if (typeOfTransaction === "expense") {
      user.totalExpense += amount;
    }

    user.newBalance = user.totalIncome - user.totalExpense;

    await user.save();

    return res.status(200).json({
      newBalance: user.newBalance,
      transaction: {
        type: newTransaction.typeOfTransaction,
        description: newTransaction.description,
        amount: newTransaction.amount,
        date: newTransaction.date,
        category: newTransaction.category,
        _id: newTransaction._id,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getAllIncomess = async (req, res, next) => {
  try {
    const incomes = await Transaction.find({
      typeOfTransaction: "income",
      owner: req.user.id,
    });
    const monthStats = createMonthStats(incomes);
    res.status(200).json({
      incomes: incomes,
      monthStats: monthStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllExpensess = async (req, res, next) => {
  try {
    const expenses = await Transaction.find({
      typeOfTransaction: "expense",
      owner: req.user.id,
    });
    const monthStats = createMonthStats(expenses);
    res.status(200).json({
      expense: expenses,
      monthStats: monthStats,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await removeTransaction(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getIncomeCategories = async (req, res, next) => {
  try {
    res.status(200).json(incomeCategories);
  } catch (error) {
    next(error);
  }
};

export const getExpenseCategories = async (req, res, next) => {
  try {
    res.status(200).json(expenseCategories);
  } catch (error) {
    next(error);
  }
};

export const getTransactionsPeriod = async (req, res, next) => {
  const { monthIndex, year } = req.query;
  if (!monthIndex || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }
  const currentDate = new Date();
  const selectedMonth = parseInt(monthIndex, 10) || currentDate.getMonth();
  const selectedYear = parseInt(year, 10) || currentDate.getFullYear();
  if (
    isNaN(selectedMonth) ||
    isNaN(selectedYear) ||
    selectedMonth < 0 ||
    selectedMonth > 11
  ) {
    return res.status(400).json({ message: "Invalid month or year" });
  }
  const startOfMonth = new Date(selectedYear, selectedMonth, 1); // Pierwszy dzień miesiąca
  const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0); // Ostatni dzień miesiąca
  endOfMonth.setHours(23, 59, 59, 999); // Ustaw godzinę na koniec dnia
  try {
    const period = await fetchPeriod(startOfMonth, endOfMonth);
    if (!period || period.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(period);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    next(error);
  }
};
