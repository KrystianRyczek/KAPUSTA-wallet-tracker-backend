import User from '../models/user.js';
import Session from '../models/session.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Transaction from '../models/transaction.js';

const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userLoginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(409).json({ message: 'Username is already taken' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    user: {
      username: newUser.username,
      email: newUser.email,
      id: newUser._id,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { error } = userLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWTSEC,
    {
      expiresIn: '1h',
    }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWTSEC,
    { expiresIn: '7d' }
  );

  const transactions = await Transaction.find({ owner: user._id })
    .select(' description category amount date _id typeOfTransaction')
    .sort({ date: -1 });

  user.token = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  const userData = {
    username: user.username,
    email: user.email,
    balance: user.newBalance || 0,
    id: user._id,
    verify: user.isVerified,
    color: user.avatarColor,
    transactions: transactions.map((transaction) => ({
      typeOfTransaction: transaction.typeOfTransaction,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      _id: transaction._id,
    })),
  };

  res.status(200).json({
    accessToken,
    refreshToken,
    userData,
  });
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = req.user;

    const expiresAt = new Date(decoded.exp * 1000);

    await Session.create({ token, expiresAt });
    res.status(200).json({ message: 'Logout successfuly' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while logging out' });
  }
};

export const updateBalance = async (req, res, next) => {
  const { newBalance } = req.body;

  if (typeof newBalance !== 'number' || newBalance < 0) {
    return res
      .status(400)
      .json({
        error: 'Bad request (invalid request body) / No token provided',
      });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { newBalance },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Invalid user / Invalid session' });
    }

    res
      .status(200)
      .json({ message: 'Successful operation', newBalance: user.newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error due to balance update' });
    next(error);
  }
};

export const getAllUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Invalid user / Invalid session' });
    }

    const transactions = await Transaction.find({ owner: req.user.id });

    res.status(200).json({
      email: user.email,
      balance: user.newBalance,
      transaction: transactions.map((transaction) => ({
        type: transaction.typeOfTransaction,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        _id: transaction._id,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error due to balance update' });
    next(error);
  }
};
