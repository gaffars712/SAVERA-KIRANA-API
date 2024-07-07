const User = require("../../../models/user.model");


const getUsersServices = async (page, limit, filter, sort) => {

	try {
		const length = limit && parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
		const start = page && parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
		const skip = (start - 1) * length;
        
		const filterQuery = {
			active: true,
		};


		if (filter && filter.search !== undefined && filter.search !== "") {
			var searchRegex = new RegExp(`.*${filter.search}.*`, "i")
			filterQuery.$or = [
				{ name: { $regex: searchRegex } },
			]
		}

		if (filter && filter.brand !== undefined && filter.brand !== "") {

			filterQuery.brand = filter.brand;
		}
	
		let sortQuery = { _id: -1 };

		for (let key in sort) {

			if (sort.hasOwnProperty(key)) {

				let value = sort[key];
				let numericValue = Number(value);
				if (!isNaN(numericValue)) {
					sort[key] = numericValue;

				}
			}
		}
		if (sort != null) {
			sortQuery = sort;
		}
		let ProductList

		ProductList = await User.find(filterQuery)
			.skip(skip)
			.limit(length)
			.sort(sortQuery)
			.lean();

		const totalResults = await User.countDocuments(filterQuery);

		const totalPages = Math.ceil(totalResults / length);
		return {
			data: ProductList,
			totalPages,
			totalResults,
			page: start,
			limit: length,
			status: true,
			code: 200,
		};
	} catch (error) {
		console.log("Error while getting product list :", error)
		return { status: false, code: 500, msg: error }
	}
}

module.exports = getUsersServices;
