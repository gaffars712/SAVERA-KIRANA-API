const Product = require("../product.modal");

const getProductByIdService = async (id) => {
    try {
        let result = await Product.findById(id);

        if (result) {
            return {
                data: result,
                status: true,
                code: 200,
            };
        }
    } catch (error) {
        return {
            data: error.message,
            status: false,
            code: 500,
        };
    }
};

module.exports = getProductByIdService;
