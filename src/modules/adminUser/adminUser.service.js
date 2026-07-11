const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { User, Order, Cart, Address } = require('../../models');
const ApiError = require('../../utils/ApiError');

/**
 * Super-admin view of the customer base — used by the Users page in the admin
 * panel. Aggregates `Order` to bring back per-user spend + order count so the
 * list can be sorted / filtered without paging through every order.
 */
const listUsers = async (filter = {}) => {
  const page = Math.max(1, parseInt(filter.page, 10) || 1);
  const limit = Math.min(100, parseInt(filter.limit, 10) || 20);

  const match = {};
  if (filter.q) {
    const rx = new RegExp(filter.q, 'i');
    match.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  if (filter.active === 'true') match.active = true;
  if (filter.active === 'false') match.active = false;

  const pipeline = [
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'orders',
        let: { uid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$user', '$$uid'] } } },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              delivered: {
                $sum: {
                  $cond: [{ $in: ['$status', ['delivered', 'picked_up']] }, 1, 0],
                },
              },
              totalSpend: {
                $sum: {
                  $cond: [
                    { $in: ['$status', ['delivered', 'picked_up']] },
                    '$total',
                    0,
                  ],
                },
              },
              lastOrderAt: { $max: '$createdAt' },
            },
          },
        ],
        as: 'stats',
      },
    },
    { $addFields: { stats: { $arrayElemAt: ['$stats', 0] } } },
    { $addFields: {
        orderCount: { $ifNull: ['$stats.orders', 0] },
        deliveredCount: { $ifNull: ['$stats.delivered', 0] },
        totalSpend: { $ifNull: ['$stats.totalSpend', 0] },
        lastOrderAt: '$stats.lastOrderAt',
      },
    },
    { $project: { stats: 0, __v: 0 } },
    { $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalArr: [{ $count: 'total' }],
      },
    },
  ];

  const [{ items, totalArr }] = await User.aggregate(pipeline);
  const total = totalArr[0]?.total || 0;
  return {
    items: items.map((i) => ({ ...i, id: String(i._id) })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Detailed 360° view for a single customer — profile + full order history +
 * current cart + address book + total spend. Used by the User detail page.
 */
const getUser = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const uid = new mongoose.Types.ObjectId(id);
  const [orders, cart, addresses, aggr] = await Promise.all([
    Order.find({ user: uid })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('rider', 'name phone')
      .lean(),
    Cart.findOne({ user: uid })
      .populate('items.product', 'name slug images')
      .lean(),
    Address.find({ user: uid }).lean(),
    Order.aggregate([
      { $match: { user: uid } },
      {
        $group: {
          _id: null,
          totalSpend: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'picked_up']] },
                '$total',
                0,
              ],
            },
          },
          orderCount: { $sum: 1 },
          deliveredCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['delivered', 'picked_up']] }, 1, 0],
            },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          codOrders: {
            $sum: { $cond: [{ $eq: ['$payment.method', 'cod'] }, 1, 0] },
          },
          totalItems: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'picked_up']] },
                { $ifNull: ['$itemCount', 0] },
                0,
              ],
            },
          },
          totalDiscount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['delivered', 'picked_up']] },
                {
                  $add: [
                    { $ifNull: ['$itemDiscount', 0] },
                    { $ifNull: ['$coupon.discount', 0] },
                  ],
                },
                0,
              ],
            },
          },
          couponsUsed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['delivered', 'picked_up']] },
                    { $gt: [{ $ifNull: ['$coupon.discount', 0] }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const stats = aggr[0] || {
    totalSpend: 0,
    orderCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    codOrders: 0,
    totalItems: 0,
    totalDiscount: 0,
    couponsUsed: 0,
  };

  return {
    user: { ...user, id: String(user._id) },
    stats,
    orders,
    cart: cart || null,
    addresses,
  };
};

const setActive = async (id, active) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  user.active = !!active;
  await user.save();
  return user;
};

module.exports = { listUsers, getUser, setActive };
