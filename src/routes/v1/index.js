const express = require('express');
const config = require('../../config/config');
const authRoute = require('./auth.route');
const userRoute = require("./user.route");
const productRoute = require("./product.route")
const cartRoute = require("./cart.route")
const notificationRoute = require("./notification.route")
const docsRoute = require('./docs.route');
const auctionRoute = require('./auction.route');
const serviceProviderRoute = require("./serviceProvider.route")
const ratingRoute = require("./rating.route")
const orderRoute = require("./order.route")
const { uploadFile } = require('../../utils/fileUpload');
const deleteFile = require('../../utils/deleteFile');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/auctions',
    route: auctionRoute,
  },
  {
    path: '/service-provider',
    route: serviceProviderRoute,
  },
  {
    path: '/notification',
    route: notificationRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/order',
    route: orderRoute,
  },
  {
    path: '/rating',
    route: ratingRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

router.route('/upload-file').post(uploadFile);


router.route('/delete-file').post(async (req, res) => {deleteFile(req,res)});


/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
