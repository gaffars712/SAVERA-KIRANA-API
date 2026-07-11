const { Order, Product, User } = require('../../models');

const startOfDay = (d = new Date()) => new Date(new Date(d).setHours(0, 0, 0, 0));
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
};

const revenue = async (start, end) => {
  const [r] = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end }, status: { $nin: ['cancelled'] } } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  return { total: r?.total || 0, count: r?.count || 0 };
};

const dashboard = async () => {
  const today = startOfDay();
  const yesterday = daysAgo(1);

  const [
    todayR, yesterdayR,
    newCustomersToday, newCustomersYesterday,
    statusAgg,
    topAgg,
    lowStockProds,
  ] = await Promise.all([
    revenue(today, new Date()),
    revenue(yesterday, today),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo(30) } } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: daysAgo(30) }, status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.sellingPrice', '$items.qty'] } },
      } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Product.find({ status: 'published' })
      .select('name variants images')
      .lean(),
  ]);

  const aov = todayR.count ? Math.round(todayR.total / todayR.count) : 0;
  const yAov = yesterdayR.count ? Math.round(yesterdayR.total / yesterdayR.count) : 0;

  const delta = (curr, prev) => {
    if (!prev) return curr > 0 ? '+100%' : '0%';
    const p = ((curr - prev) / prev) * 100;
    return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
  };

  const kpis = [
    { key: 'revenue', label: "Today's Revenue", value: '₹' + todayR.total.toLocaleString('en-IN'), delta: delta(todayR.total, yesterdayR.total), up: todayR.total >= yesterdayR.total },
    { key: 'orders', label: 'Orders Today', value: String(todayR.count), delta: delta(todayR.count, yesterdayR.count), up: todayR.count >= yesterdayR.count },
    { key: 'customers', label: 'New Customers', value: String(newCustomersToday), delta: delta(newCustomersToday, newCustomersYesterday), up: newCustomersToday >= newCustomersYesterday },
    { key: 'aov', label: 'Avg Order Value', value: '₹' + aov.toLocaleString('en-IN'), delta: delta(aov, yAov), up: aov >= yAov },
  ];

  // 7-day revenue series
  const revenueSeries = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = daysAgo(i);
    const dayEnd = daysAgo(i - 1);
    // eslint-disable-next-line no-await-in-loop
    const r = await revenue(dayStart, dayEnd);
    revenueSeries.push({
      day: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
      value: r.total,
    });
  }

  // Order status donut
  const statusLabels = {
    placed: 'Placed', packed: 'Packed', out_for_delivery: 'Out for delivery',
    delivered: 'Delivered', preparing: 'Preparing', ready: 'Ready',
    picked_up: 'Picked up', cancelled: 'Cancelled',
  };
  const orderStatusDonut = statusAgg.map((s) => ({
    key: s._id,
    label: statusLabels[s._id] || s._id,
    value: s.value,
  }));

  const topProducts = topAgg.map((t) => ({
    name: t.name,
    sold: t.sold,
    revenue: '₹' + Math.round(t.revenue).toLocaleString('en-IN'),
  }));

  const lowStock = [];
  lowStockProds.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.stock <= (v.lowStockThreshold || 5)) {
        lowStock.push({
          name: `${p.name} · ${v.label}`,
          stock: v.stock,
          threshold: v.lowStockThreshold || 5,
        });
      }
    });
  });
  lowStock.sort((a, b) => a.stock - b.stock);
  const lowStockTop = lowStock.slice(0, 8);

  // Recent orders
  const recent = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name phone')
    .lean();

  return {
    kpis,
    revenueSeries,
    orderStatusDonut,
    topProducts,
    lowStock: lowStockTop,
    recentOrders: recent.map((o) => ({
      id: o._id,
      code: o.code,
      customer: o.user?.name || 'Guest',
      itemCount: o.itemCount || o.items?.length,
      amount: o.total,
      fulfillment: o.fulfillmentType,
      status: o.status,
    })),
  };
};

module.exports = { dashboard };
