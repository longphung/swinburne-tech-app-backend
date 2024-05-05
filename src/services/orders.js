import Orders from "#models/orders.js";

export const getOrdersList = async (pagination) => {
  const { _start, _end, _sort, _order, customerId } = pagination;
  const query = {};
  if (customerId) {
    query.customerId = customerId;
  }
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await Orders.paginate(query, {
    sort,
    populate: [
      {
        path: "customerId",
        select: "name",
      },
      {
        path: "tickets",
        select: "serviceId",
        populate: {
          path: "serviceId",
          select: "title",
        },
        transform: (ticket) => ({
          _id: ticket._id,
          service: ticket.serviceId.title,
        }),
      },
    ],
    limit: _end - _start,
    offset: _start,
  });
};

export const getOrder = async (query) => {
  const order = await Orders.findOne(query).populate({
    path: "customerId",
    select: "name",
  });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

export const updateOrder = async (query, orderData) => {
  const order = await Orders.findOneAndUpdate(query, orderData, { new: true });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

export const cancelOrder = async (query) => {
  const order = await Orders.findOneAndUpdate(query, { status: "cancelled" }, { new: true });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};
