const mongoose = require('mongoose');
const { User } = require("../../../models");

const updateProfile = async (name, email, userId) => {

    try{
        let filterQuery = { _id: new mongoose.Types.ObjectId(userId), active: true }
        const bodyData = {name, email}

        const isEmailTaken = await User.findOne({email: email, active: true})
        if(isEmailTaken && !(userId == isEmailTaken._id)){
            return { msg: "Email is already taken", status: false, code: 400 };
        }
        const updatedResult = await User.findOneAndUpdate(filterQuery, bodyData , { new: true })
        if (updatedResult) {
            return { data: updatedResult, status: true, code: 200 };
        }
        else {
            return { msg: "User not found", status: false, code: 400 };
        }

    }catch(error){
        return { msg: error.message, status: false, code: 500 };
    }
}

module.exports = updateProfile
