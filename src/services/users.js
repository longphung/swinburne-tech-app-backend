import User, { USERS_ROLE } from "#models/users.js";
import Users from "#models/users.js";
import { createIdToken } from "#src/services/auth.js";

/**
 * Performs pagination, sorting, and filtering on the list of users and returns the result along with the total count in x-total-count header
 * @param {{
 *    _start: number;
 *    _end: number;
 *    _sort: string;
 *    _order: string;
 *    // filter
 *    q?: string
 * }} pagination Pagination, sorting, and filtering parameters
 * @param currUser
 */
export const getUsersList = async (pagination, currUser) => {
  const { _start, _end, _sort, _order, q = "", role } = pagination;
  const query = {};
  if (q) {
    query.$text = { $search: q };
  }
  if (role) {
    if (role === USERS_ROLE.ADMIN && !currUser.role.includes(USERS_ROLE.ADMIN)) {
      throw new Error("Forbidden");
    }
    if (
      role === USERS_ROLE.TECHNICIAN &&
      !(currUser.role.includes(USERS_ROLE.ADMIN) || currUser.role.includes(USERS_ROLE.TECHNICIAN))
    ) {
      throw new Error("Forbidden");
    }
    query.role = role;
  }
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await Users.paginate(query, {
    projection: {
      password: 0,
    },
    sort,
    limit: _end - _start,
    offset: _start,
    pagination: !role,
  });
};

/**
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const getUser = async (userId) => {
  const user = await User.findById(userId, { password: 0 });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Update user, if updater is the same user, then return the updated user with token
 * @param userId
 * @param userData
 * @param currUser
 */
export const updateUser = async (userId, userData, currUser) => {
  const user = await Users.findByIdAndUpdate(userId, userData, {
    new: true,
    projection: { password: 0 },
  });
  if (!user) {
    throw new Error("User not found");
  }
  let token;
  if (currUser.id === userId) {
    token = await createIdToken(user);
  }
  return { user, token };
};

export const deleteUser = async (userId) => {
  const user = await Users.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const addStripeCustomerId = async (userId, stripeCustomerId) => {
  const user = await Users.findByIdAndUpdate(userId, { stripeCustomerId }, { new: true, projection: { password: 0 } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getTechnicianReport = async () => {
  // Returns technicians, assigned tickets, and completed tickets
  const result = await Users.aggregate()
    .match({
      role: {
        $elemMatch: { $eq: USERS_ROLE.TECHNICIAN },
      },
    })
    .lookup({
      from: "tickets",
      localField: "_id",
      foreignField: "assignedTo",
      as: "tickets",
    })
    .project({
      password: 0,
    })
    .group({
      _id: "$_id",
      technician: {
        $first: {
          _id: "$_id",
          name: "$name",
        },
      },
      tickets: { $push: "$tickets" },
      completedTickets: {
        $sum: {
          $size: {
            $filter: {
              input: "$tickets",
              as: "ticket",
              cond: { $eq: ["$$ticket.status", "COMPLETE"] },
            },
          },
        },
      },
    });
  return result;
};
