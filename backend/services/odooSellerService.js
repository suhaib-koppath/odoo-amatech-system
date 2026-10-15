import {
  getSellerByCompanyId,
} from "../repositories/odooSellerRepository.js";

export const fetchSellerByCompanyId = async ({companyId}) => {
  const seller = await getSellerByCompanyId({companyId});

   if (!seller || seller.length === 0) {
    throw new Error("Invoice not found");
  }

  return seller[0];
};