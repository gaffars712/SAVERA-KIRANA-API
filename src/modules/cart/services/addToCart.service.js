const mongoose = require("mongoose");
const Cart = require('../cart.model');
const Products = require('../../products/product.modal');

const addToCart = async (data, userId) => {
    try {
        const findedCart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId), status:'active' })
        if (findedCart) {
            console.log('finded', findedCart)
            const productIds = data?.items.map((item) => new mongoose.Types.ObjectId(item?.productId));

            const aggregationPipeline = [
                {
                    $match: { _id: { $in: productIds } }
                },
                {
                    $lookup: {
                        from: 'products', // collection name in MongoDB
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $addFields: {
                        price: '$productDetails.price.sellingCost'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        price: 1,
                        productId: '$_id'
                    }
                }
            ];

            const findedProducts = await Products.aggregate(aggregationPipeline);
            console.log('finded products', findedProducts);

            // if (findedProducts.length === 0) {
            //     return { data: "No products found", status: false, code: 400 };
            // }

            const updatedItems = data.items.map(item => {
                const foundProduct = findedProducts.find(finded => finded?.productId.equals(item?.productId));
                if (foundProduct) {
                    return {
                        ...item,
                        price: foundProduct?.price,
                        total: item?.quantity * foundProduct?.price
                    };
                } else {
                    return item;
                }
            });

            // Calculate the total price
            const totalPrice = updatedItems.reduce((acc, item) => acc + item.total, 0);
            const updatedCart = await Cart.updateOne(
                { userId: userId },
                {
                    $set: {
                        items: updatedItems,
                        totalQuantity: updatedItems?.length ? updatedItems?.length : 0,
                        totalPrice: totalPrice
                    }
                },
                { upsert: true, new: true }
            );

            return { data: updatedCart, status: true, code: 200 };
            return
        } else {
            const productIds = data?.items.map((item) => new mongoose.Types.ObjectId(item?.productId));

            const aggregationPipeline = [
                {
                    $match: { _id: { $in: productIds } }
                },
                {
                    $lookup: {
                        from: 'products', // collection name in MongoDB
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $addFields: {
                        price: '$productDetails.price.sellingCost'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        price: 1,
                        productId: '$_id'
                    }
                }
            ];

            const findedProducts = await Products.aggregate(aggregationPipeline);
            console.log('finded products', findedProducts);

            if (findedProducts.length === 0) {
                return { data: "No products found", status: false, code: 400 };
            }

            const updatedItems = data.items.map(item => {
                const foundProduct = findedProducts.find(finded => finded?.productId.equals(item?.productId));
                if (foundProduct) {
                    return {
                        ...item,
                        price: foundProduct?.price,
                        total: item?.quantity * foundProduct?.price
                    };
                } else {
                    return item;
                }
            });

            // Calculate the total price
            const totalPrice = updatedItems.reduce((acc, item) => acc + item.total, 0);

            const newCart = new Cart({
                userId: userId,
                items: updatedItems ? updatedItems : [],
                totalQuantity: updatedItems?.length ? updatedItems?.length : 0,
                totalPrice: totalPrice ? totalPrice : 0
            });

            const addResult = await newCart.save();
            return { data: addResult, status: true, code: 200 };
        }
    } catch (error) {
        console.error("Error while adding cart:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = addToCart;
