import User from "#models/users.js";
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
 */
export const getUsersList = async (pagination) => {
  const { _start, _end, _sort, _order, q = "" } = pagination;
  const query = {};
  if (q) {
    query.$text = { $search: q };
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
