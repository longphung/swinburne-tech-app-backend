import User from "#models/users.js";
import Users from "#models/users.js";

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
  const result = await Users.paginate(
    {
      $text: { $search: q },
    },
    {
      projection: {
        password: 0,
      },
      sort: { [_sort]: _order.toLowerCase() },
      limit: _end - _start,
      offset: _start,
    },
  );
  return result;
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

export const updateUser = async (userId, userData) => {
  const user = await Users.findByIdAndUpdate(userId, userData, {
    new: true,
    projection: { password: 0 },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
