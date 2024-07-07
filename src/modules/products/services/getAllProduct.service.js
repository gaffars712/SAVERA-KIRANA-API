const Product = require('../product.modal');

const getAllProductService = async (filters, search, pageNum, limitNum, sort) => {
    try {
        const query = buildQuery(filters, search, sort)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const products = await query.exec();
        const totalCount = await buildQuery(filters, search).countDocuments();

        const totalPages = Math.ceil(totalCount / limitNum);
        const start = (pageNum - 1) * limitNum + 1;
        const length = products.length;

        return {
            data: {
                products,
                totalResults: totalCount,
                totalPages,
                page: start,
                limit: length
            },
            status: true,
            code: 200
        };
    } catch (error) {
        return {
            data: error.message,
            status: false,
            code: 500,
        };
    }
};

const buildQuery = (filters, search, sort) => {
    let query = Product.find();

    if (filters) {
        applyFilters(query, filters);
    }

    if (search) {
        applySearch(query, search);
    }

    if (sort) {
        query.sort(sort);
    }

    return query;
};

const applyFilters = (query, filters) => {
    for (const key in filters) {
        const filterValue = filters[key];
        if (Array.isArray(filterValue) && filterValue.length > 0) {
            const caseInsensitiveValues = filterValue.map(value => new RegExp(`^${value}$`, 'i'));
            query.where(key).in(caseInsensitiveValues);
        } else if (typeof filterValue === 'string') {
            query.where(key).regex(new RegExp(`^${filterValue}$`, 'i'));
        }
    }
};


const applySearch = (query, search) => {
    const searchConditions = [];

    for (const key in search) {
        if (typeof search[key] === 'string') {
            searchConditions.push({ [key]: { $regex: new RegExp(search[key], 'i') } });
        }
    }

    if (searchConditions.length > 0) {
        query.and(searchConditions);
    }
};

module.exports = getAllProductService;
