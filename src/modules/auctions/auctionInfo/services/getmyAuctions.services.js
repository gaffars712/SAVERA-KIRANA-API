const mongoose  = require("mongoose");
const AuctionDetailsInformationModel = require("../../createAuctionForm/generalInformation/generalInformation.model");

const getmyAuctionbyId = async (id,auctionType) => {
    console.log("auctiontype",auctionType);
    try {
        const filterQuery = {
            active: true,
            serviceProviderId: new mongoose.Types.ObjectId(id),
            auctionType: auctionType, 
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

        const serviceProvider = await AuctionDetailsInformationModel.aggregate(aggregateQuery);
        if (!serviceProvider) {
            return { data: "auction Not Found", status: false, code: 400 };
        } else {
            return { data: serviceProvider, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getmyAuctionbyId;
