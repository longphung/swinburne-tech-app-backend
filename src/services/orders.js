import Orders from "#models/orders.js";

export const getOrdersList = async (pagination) => {
  const { _start, _end, _sort, _order } = pagination;
  const query = {};
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

export const getOrder = async (id) => {
  const order = await Orders.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

export const updateOrder = async (id, orderData) => {
  const order = await Orders.findByIdAndUpdate(id, orderData, { new: true });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};
