export const createMonthStats = (arrayOfTransactions) => {

    const monthStats = {
            "January": 0,
            "February": 0,
            "March": 0,
            "April": 0,
            "May": 0,
            "June": 0,
            "July": 0,
            "August": 0,
            "September": 0,
            "October": 0,
            "November": 0,
            "December": 0
    };
    
    const monthNames = Object.keys(monthStats);

        
        arrayOfTransactions.forEach(transaction => {
            const date = new Date(transaction.date); 
            const month = date.getMonth(); 
    
            monthStats[monthNames[month]] += transaction.amount;
        });
    
    return monthStats;
}

export const incomeCategories = [
    "Salary",
    "Add. Income",
  ];
  
export const expenseCategories = [
    "Products",
    "Alcohol",
    "Entertainment",
    "Health",
    "Transport",
    "Housing",
    "Technique",
    "Communal, communication",
    "Sports, hobbies",
    "Education",
    "Other"
  ];