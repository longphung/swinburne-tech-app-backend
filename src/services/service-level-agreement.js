import ServiceLevelAgreement from "#models/service-level-agreements.js";
import mongoose from "mongoose";

/**
 * @param {{
 *   _start: number;
 *   _end: number;
 *   _sort: string;
 *   _order: string;
 *   // filter
 *   q?: string;
 *   type: "completion" | "response";
 * }} pagination
 * @returns {Promise<*>}
 */
export const getServicesLevelAgreementList = async (pagination) => {
  const { _start, _end, _sort, _order, q = "", type } = pagination;
  const query = {};
  if (q) {
    query.$text = { $search: q };
  }
  query.type = type;
  const sort = {};
  if (_sort && _order) {
    sort[_sort] = _order?.toLowerCase();
  }
  return await ServiceLevelAgreement.paginate(query, {
    sort,
    limit: _end - _start,
    offset: _start,
  });
};

export const getServiceLevelAgreement = async (id) => {
  const sla = await ServiceLevelAgreement.findById(id);
  if (!sla) {
    throw new Error("Service Level Agreement not found");
  }
  return sla;
};

export const createServiceLevelAgreement = async (slaData) => {
  return await ServiceLevelAgreement.create({
    ...slaData,
    // TODO: Move this to a schema method
    fixedPrice: mongoose.Type.Decimal128(slaData.fixedPrice || 0),
  });
};

export const updateServiceLevelAgreement = async (id, slaData) => {
  const sla = await ServiceLevelAgreement.findByIdAndUpdate(
    id,
    {
      ...slaData,
      fixedPrice: mongoose.Type.Decimal128(slaData.fixedPrice || 0),
    },
    { new: true },
  );
  if (!sla) {
    throw new Error("Service Level Agreement not found");
  }
  return sla;
};

/**
 * @param {string} id
 */
export const deleteServiceLevelAgreement = async (id) => {
  const sla = await ServiceLevelAgreement.findByIdAndDelete(id);
  if (!sla) {
    throw new Error("Service Level Agreement not found");
  }
  return sla;
};
