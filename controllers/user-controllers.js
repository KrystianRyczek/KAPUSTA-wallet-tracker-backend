import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {userValidationSchema, userLoginValidationSchema} from '../helpers/validationSchema.js'
import {fetchAddUser, fetchFind, fetchFindAndUpdate} from '../service/user-service.js'
import { createMonthStats } from "../helpers/transactions.js";
import { fetchTransaction } from '../service/transaction-service.js';

export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return next(error)
  }
  try{
    const user = await fetchFind({email: email})
    if(user){
      throw new Error('Email is taken!')
    }
  }catch(error){
    error.name = "OcupatedEmail"
    return next(error)
  }

  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    });
    await fetchAddUser(newUser)
    return res.status(201).json(newUser)
    
  }catch(error){
    next(error)
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = userLoginValidationSchema.validate(req.body);
  if(error){
    return next(error)
  }
  try{
    const user = await fetchFind({email})
    if(user){
      const isPassCorrect = await bcrypt.compare(password, user.password)
      if (isPassCorrect){
        const payload = { id: user._id, email: user.email, role: user.role }
        const accessToken = jwt.sign(
                                      payload,
                                      process.env.JWTSEC,
                                      {
                                      expiresIn: '1h',
                                      }
                                    );
        const refreshToken = jwt.sign(
                                      payload,
                                      process.env.JWTSEC,
                                      { expiresIn: '7d' }
                                     );

        const newUser = await fetchFindAndUpdate({email: email}, {accessToken: accessToken, refreshToken: refreshToken}) 
        console.log(newUser)                   
        return res.status(201).json(accessToken)
      }
    }
    throw new Error('Incorrect user credentials!')
  }catch(error){
    error.name = "IncorrectCredentials"
      return next(error)  
  }
};

export const logoutUser = async (req, res, next) => {
  try{
    const token = req.headers.authorization.replace("Bearer ", "");
    await fetchFindAndUpdate({token: token}, {token: null})
    return res.status(200).json({ message: "Logout successfuly" });
  }catch(error){
    error.name = "IncorrectCredentials"
    return next(error)  
  }
};


export const updateBalance = async (req, res, next) => {
  const { newBalance } = req.body;
  try {
    if (typeof newBalance !== 'number' || newBalance < 0) {
      throw new Error('Incorrect body data!')
    }
    const user = await fetchFindAndUpdate(
      {_id:req.user.id},
      { newBalance, initBalance: true},
      { new: true }
    );
    console.log(user)
    res.status(200).json({ message: 'Balance update succeed!', newBalance: user.newBalance });
  } catch (error) {
    error.name = "IncorrectData"
    next(error);
  }
};

export const getAllUserInfo = async (req, res, next) => {
  try {
    const user = await fetchFind({_id:req.user.id});
    const transactions = await fetchTransaction({owner: req.user.id});

    const income =  transactions.map((transaction) => {
      if(transaction.typeOfTransaction="income"){
          return transaction
      }
    })
    const expenses =  transactions.map((transaction) => {
      if(transaction.typeOfTransaction="expense"){
        return transaction
      }
    })
    const incomeStats = createMonthStats(income);
    const expensesStats = createMonthStats(expenses);

    res.status(200).json({
      id: user._id,
      balance: user.newBalance,
      incomeStats: incomeStats,
      expensesStats: expensesStats,
      income: income,
      expenses: expenses
    })

  }catch (error) {
    next(error);
  }
};
