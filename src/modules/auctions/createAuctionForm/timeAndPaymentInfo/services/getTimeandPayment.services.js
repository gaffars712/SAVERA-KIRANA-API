const { default: mongoose } = require('mongoose');
const TimeAndPayment = require('../timeAndPaymentInfo.model');

/**
 * Get all shipping data
 * @returns {Promise<Object>} Result object
 */
const getTimeandPayment = async (auctionId) => {
	const filterQuery = {
		active: true,
		auctionId: new mongoose.Types.ObjectId(auctionId)
	};

	try {
		const result = await TimeAndPayment.findOne(filterQuery);
		if (result) {
			return { data: result, status: true, code: 200 };
		} else {
			return { data: "Time and Payment Info data not found", status: false, code: 404 };
		}

	} catch (error) {
		console.log("error", error);
		return { data: error.message, status: false, code: 500 };
	}
}

module.exports = getTimeandPayment;
