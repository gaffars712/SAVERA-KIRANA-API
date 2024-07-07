const mongoose = require("mongoose");
const storeModel = require("../../../serviceProvider/storeDetails/storeDetail.model");
const AuctionDetailsInformationModel = require("../../createAuctionForm/generalInformation/generalInformation.model");

const getmyAuctionbyId = async (id) => {
    try {
        const filterQuery = {
            active: true,
            _id: new mongoose.Types.ObjectId(id),
        };

        const customPipeline = [
            {
                $match: filterQuery,
            },
            {
                $lookup: {
                    from: 'time-payment-informations',
                    localField: '_id',
                    foreignField: 'auctionId',
                    as: 'time-payment-info'
                }
            },
            {
                $lookup: {
                    from: 'warehouse-addresses',
                    localField: '_id',
                    foreignField: 'auctionId',
                    as: 'warehouse-addresses'
                }
            },
            {
                $lookup: {
                    from: 'store-details', // assuming the collection name is 'stores'
                    localField: 'serviceProviderId',
                    foreignField: 'serviceProviderId',
                    as: 'store-info'
                }
            },
            {
                $unwind: {
                    path: "$time-payment-info",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$warehouse-addresses",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$store-info",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    "time-payment-info.startDate": 1,
                    "time-payment-info.endDate": 1,
                    "warehouse-addresses": 1,
                    "procurementType": 1,
                    "status": 1,
                    "auctionType": 1,
                    "commodity": 1,
                    "commodityImages": 1,
                    "qualityCertificate": 1,
                    "priceInformation": 1,
                    "productSpecification": 1,
                    "active": 1,
                    "userId": 1,
                    "serviceProviderId": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "seqId": 1,
                    "__v": 1,
                    "store-info.profileImage": 1,
                    "store-info.storeName": 1
                }
            }
        ];

        const serviceProvider = await AuctionDetailsInformationModel.aggregate(customPipeline);
        console.log("serviceProvider", serviceProvider);
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
