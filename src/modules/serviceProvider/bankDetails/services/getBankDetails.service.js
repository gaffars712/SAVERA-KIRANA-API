const mongoose = require("mongoose");
const BankModal = require("../bankDetail.model");

const getBankDetailsService = async (bankId) => {
    try {
        const bankSearchQuery = {
            active: true,
            userId: new mongoose.Types.ObjectId(bankId),
        };

        const bank = await BankModal.find(bankSearchQuery);
        if (!bank) {
            return { data: "Bank Not Found", status: false, code: 400 };
        } else {
            return { data: bank, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getBankDetailsService;
