const mongoose = require("mongoose");
const Cart = require('../cart.model');

const getMyCart = async (user) => {
    try {
        const userId = new mongoose.Types.ObjectId(user);

        const cartRresult = await Cart.aggregate([
            { $match: { userId, status: 'active' } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$items.productId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                        { $project: { _id: 1, name: 1, price: 1, description: 1, bannerImage: 1  } } 
                    ],
                    as: "productDetails"
                }
            },
            {
                $addFields: {
                    productDetails: { $ifNull: ["$productDetails", []] }
                }
            },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    items: {
                        $push: {
                            productId: "$items.productId",
                            quantity: "$items.quantity",
                            price: "$items.price",
                            productDetails: "$productDetails"
                        }
                    },
                    status: { $first: "$status" },
                    totalQuantity: { $first: "$totalQuantity" },
                    totalPrice: { $first: "$totalPrice" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    seqId: { $first: "$seqId" },
                    __v: { $first: "$__v" }
                }
            }
        ]);
        if (cartRresult) {
            return { data: cartRresult[0] || [], status: true, code: 200 };
        } else {
            return { data: 'Cart Not Found', status: false, code: 400 }
        }
    } catch (error) {
        console.error("Error while adding cart:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = getMyCart;
