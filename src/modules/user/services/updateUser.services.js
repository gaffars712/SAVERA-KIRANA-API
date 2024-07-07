const userModel = require("../../../models/user.model");
const mongoose = require("mongoose");

const updateUser = async ({ body, id }) => {
    try {
        const objectId = new mongoose.Types.ObjectId(id);

        const filterQuery = {
            _id: objectId,
            active: true
        };

        const find = await userModel.findById(objectId);
        if (!find) {
            return {
                code: 404,
                status: false,
                data: "Sorry, no data was found for the provided ID."
            };
        } else {
            const result = await userModel.findOneAndUpdate(
                filterQuery,
                body,
                { new: true }
            );
            if (result) {
                return {
                    code: 200,
                    status: true,
                    data: result
                };
            } else {
                return {
                    code: 500,
                    status: false,
                    data: "Something went wrong, please try again later."
                };
            }
        }
    } catch (error) {
        console.error('Error updating user information:', error.message);
        return {
            code: 500,
            status: false,
            data: "An error occurred while updating the user information."
        };
    }
};

module.exports = updateUser;
