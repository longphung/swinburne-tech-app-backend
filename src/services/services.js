import Services from "#models/services.js";

/**
 * Performs pagination, sorting, and filtering on the list of services and returns the result along with the total count in x-total-count header
 * @param {{
 *   _start: number;
 *   _end: number;
 *   _sort: string;
 *   _order: string;
 *   // filter
 *   q?: string
 * }} pagination
 */
export const getServicesList = async (pagination) => {
  const { _start, _end, _sort, _order, category, serviceType, q = "" } = pagination;
  const query = {};
  if (q) {
    query.$text = { $search: q };
  }
  if (category) {
    query.category = category;
  }
  if (serviceType) {
    query.serviceType = serviceType;
  }
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await Services.paginate(query, {
    sort,
    limit: _end - _start,
    offset: _start,
  });
};

/**
 * @param {string} serviceId
 */
export const getService = async (serviceId) => {
  const service = await Services.findById(serviceId);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

/**
 * @param {{
 *   title: string;
 *   label: string;
 *   price: mongoose.Decimal128;
 *   category: 1 | 2 | 3 | 4 | 5 | 6;
 *   serviceType: "onsite" | "remote" | "both";
 *   description: string;
 *   imageUrl?: string;
 * }} serviceData
 */
export const createService = async (serviceData) => {
  return await Services.create(serviceData);
};

/**
 * @param {string} serviceId
 * @param {{
 *   title?: string;
 *   label?: string;
 *   price?: mongoose.Decimal128;
 *   category?: 1 | 2 | 3 | 4 | 5 | 6;
 *   serviceType?: "onsite" | "remote" | "both";
 *   description?: string;
 * }} serviceData
 */
export const updateService = async (serviceId, serviceData) => {
  const service = await Services.findByIdAndUpdate(serviceId, serviceData, { new: true });
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

/**
 * @param {string} serviceId
 */
export const deleteService = async (serviceId) => {
  const service = await Services.findByIdAndDelete(serviceId);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

