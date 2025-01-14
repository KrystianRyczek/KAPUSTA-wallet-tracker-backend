import Transaction from "../models/transaction.js";

export const removeTransaction = (id) => Transaction.deleteOne({ _id: id });

export const fetchCategories = (typeOfTransaction) => {
  return Transaction.distinct("category", {
    typeOfTransaction,
  });
};

export const fetchTransaction = (filter) => {
  return Transaction.find(filter)
};

//uwaga miesiące mają index od 0 do 11
export const fetchPeriod = (startOfMonth, endOfMonth) => {
  return Transaction.find({
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  });
};
