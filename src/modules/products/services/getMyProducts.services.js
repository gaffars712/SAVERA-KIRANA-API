const mongoose = require("mongoose");
const product = require("../../products/product.modal");

const getmyProduct = async (id, limit = 10, page = 1, search = "") => {
    console.log("id", id);
    try {
        const filterQuery = {
            active: true,
            serviceProviderId: new mongoose.Types.ObjectId(id),
        };

        // If search is provided, add the condition to filter by product name
        if (search) {
            filterQuery.name = { $regex: search, $options: "i" };
        }

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the products with pagination
        const serviceProvider = await product
            .find(filterQuery)
            .skip(skip)
            .limit(limit);

        // Fetch the total count of documents
        const totalDocuments = await product.countDocuments(filterQuery);

        if (serviceProvider.length === 0) {
            return { data: "Product Not Found", status: false, code: 400 };
        } else {
            console.log("serviceProvider", serviceProvider);
            return {
                data: serviceProvider,
                status: true,
                code: 200,
                pagination: {
                    totalDocuments,
                    totalPages: Math.ceil(totalDocuments / limit),
                    currentPage: page,
                    limit
                }
            };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getmyProduct;
