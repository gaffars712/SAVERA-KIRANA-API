const mongoose = require("mongoose");
const Cart = require('../cart.model');

const updateCartStatus = async (data, cartId) => {
    try {

        const findedCart = await Cart.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(cartId), status: 'active' }, { status: data?.status }, { new: true })
        if (findedCart) {
            console.log('finded', findedCart)
            return { data: findedCart, status: true, code: 200 };
        }else{
            return{ data: 'Cart Not Found', status:false , code:400}
        }
    } catch (error) {
        console.error("Error while adding cart:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = updateCartStatus;
