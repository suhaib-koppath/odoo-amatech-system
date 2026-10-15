import odoo from "../config/odoo.js";

const MOVELINE = "/json/2/account.move.line";
export const getInvoiceProductDetailsById = async ({id}) => {
  const { data: response } = await odoo.post(`${MOVELINE}/read`, {
    ids: id,
    // fields: [
    //   "id",
    //   "move_id",
    //   "product_id",
    //   "name",
    //   "quantity",
    //   "product_uom_id",
    //   "price_unit",
    //   "discount",
    //   "tax_ids",
    //   "price_subtotal",
    //   "price_total",
    // ],
  });

  // Odoo read method returns an array of records
  
    return Array.isArray(response) ? response[0] : response;
};
