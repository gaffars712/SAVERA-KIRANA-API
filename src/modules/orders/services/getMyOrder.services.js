const mongoose = require("mongoose");
const Order = require('../order.model');

const getMyOrder = async (user) => {
    try {
        const userId = new mongoose.Types.ObjectId(user);

        const findedOrder = await Order.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: "carts",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails"
                }
            },
            { $unwind: "$cartDetails" },
            { $unwind: "$cartDetails.items" },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $lookup: {
                    from: "ratings",
                    let: { userId: "$userId", productId: "$cartDetails.items.productId" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$userId", "$$userId"] }, { $eq: ["$productId", "$$productId"] } ] } } }
                    ],
                    as: "ratingDetails"
                }
            },
            { $unwind: { path: "$ratingDetails", preserveNullAndEmptyArrays: true } }, // To handle products without ratings
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    cartId: { $first: "$cartId" },
                    cartTotalAmount: { $first: "$cartTotalAmount" }, // Assuming these fields exist in your Order schema
                    deliveryCharge: { $first: "$deliveryCharge" },
                    packagingCharge: { $first: "$packagingCharge" },
                    discountAmount: { $first: "$discountAmount" },
                    address: { $first: "$address" },
                    status: { $first: "$status" },
                    totalAmount: { $first: "$totalAmount" },
                    orderDate: { $first: "$orderDate" },
                    deliveryExpectedDate: { $first: "$deliveryExpectedDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    __v: { $first: "$__v" },
                    items: {
                        $push: {
                            productId: "$cartDetails.items.productId",
                            quantity: "$cartDetails.items.quantity",
                            price: "$cartDetails.items.price",
                            productDetails: {
                                $mergeObjects: ["$productDetails", { ratingDetails: "$ratingDetails" }]
                            }
                        }
                    }
                }
            }
        ]);

        if (findedOrder.length) {
            return { data: findedOrder, status: true, code: 200 };
        } else {
            return { data: 'Cart Not Found', status: false, code: 400 }
        }
    } catch (error) {
        console.error("Error while fetching order:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = getMyOrder;
