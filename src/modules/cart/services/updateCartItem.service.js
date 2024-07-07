const mongoose = require("mongoose");
const Cart = require('../cart.model');

const updateCartItemService = async (userId, body) => {
    try {
        const {productId, quantity} = body;

        const cart = await Cart.findOne({userId: new mongoose.Types.ObjectId(userId), status: 'active'})

        if (!cart) {
            return { data: 'Cart Not Found', status: false, code: 400 };
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return { data: 'Item Not Found in Cart', status: false, code: 400 };
        }

        cart.items[itemIndex].quantity = quantity;

        const updatedCart = await cart.save();

        return { data: updatedCart, status: true, code: 200 };
    } catch (error) {
        console.error("Error while Updating Item:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = updateCartItemService;
