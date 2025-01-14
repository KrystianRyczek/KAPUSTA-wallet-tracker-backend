import User from '../models/user.js';

export const  fetchAddUser = async (newUser ) => {
    newUser.save()
}

export const fetchFind = (filter) => {
    return User.findOne(filter)
}

export const fetchFindAndUpdate= (filter, update) => {     
    return User.findOneAndUpdate(filter, update, {new:true}) 
}