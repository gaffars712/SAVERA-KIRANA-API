const AuctionDetailsInformationModel = require("../../createAuctionForm/generalInformation/generalInformation.model");

const getAllAuction = async () => {

    const checkExpiredAuctions =(data)=>{
        const today = new Date();
        data.forEach(item => {
            const endDate = new Date(item.auctionFrom.endDate);
            if (endDate < today) {
                item.status = "expired";
            }
        });
        return data;
    }

    try {
        let filterQuery = {
            $and: [
                { active: true },
                {
                    status: { $in: ['live', 'expired'] },
                }
            ]
        };

        const aggregateQuery = [
            {
                $match: filterQuery,
            },
            {
                $lookup: {
                    from: 'store-details',
                    localField: 'serviceProviderId',
                    foreignField: 'serviceProviderId',
                    as: 'storeDetails'
                }
            },
            {
                $lookup: {
                    from: 'warehouse-addresses',
                    localField: '_id',
                    foreignField: 'auctionId',
                    as: 'warehouseAddresses'
                }
            },
            {
                $lookup: {
                    from: 'time-payment-informations',
                    localField: '_id',
                    foreignField: 'auctionId',
                    as: 'auctionFrom'
                }
            },
            {
                $unwind: {
                    path: "$storeDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$warehouseAddresses",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$auctionFrom",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    createdBy: 1,
                    createdAt: 1,
                    seqId: 1,
                    status: 1,
                    serviceProviderId:1,
                    "storeDetails.profileImage": 1,
                    "storeDetails.storeName": 1,
                    "warehouseAddresses.address":1,
                    "warehouseAddresses.nameOfWarehouse":1,
                    "auctionFrom.startDate":1,
                    "auctionFrom.endDate":1,
                    procurementType: 1,
                    auctionType: 1,
                    commodity: 1,
                    commodityImages: 1,
                    priceInformation: 1,
                },
            },
        ];

        const AuctionDetailsInformation = await AuctionDetailsInformationModel.aggregate(aggregateQuery);
        if (!AuctionDetailsInformation) {
            return { data: "Auctions Information Not Found", status: false, code: 400 };
        } else {
            const dataAll = checkExpiredAuctions(AuctionDetailsInformation)
            return { data: dataAll, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getAllAuction;