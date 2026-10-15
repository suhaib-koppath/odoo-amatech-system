import odoo from "../config/odoo.js";

const COMPANY_MODEL = "/json/2/res.partner";

// Get buyer details
export const getBuyerByPartnerId = async ({ partnerId }) => {
 
  const { data: response } = await odoo.post(`${COMPANY_MODEL}/read`, {
    ids: [Number(partnerId)],
    // fields: [
    //   "id",
    //   "name",
    //   "vat",
    //   "company_registry",
    //   "street",
    //   "street2",
    //   "city",
    //   "zip",
    //   "state_id",
    //   "country_id",
    //   "phone",
    //   "email",
    //   "website",
    // ],
  });
  return response;
};
