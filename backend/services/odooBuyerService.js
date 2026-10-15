import { getBuyerByPartnerId } from "../repositories/odooBuyerRepository.js";

export const fetchBuyerByPartnerId = async ({partnerId}) => {
  const buyer = await getBuyerByPartnerId({partnerId});

   if (!buyer || buyer.length === 0) {
    throw new Error("Invoice not found");
  }

  return buyer[0];
};