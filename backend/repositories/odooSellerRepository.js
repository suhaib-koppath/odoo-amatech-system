import odoo from "../config/odoo.js";

const COMPANY_MODEL = "/json/2/res.company";


// Get seller details
export const getSellerByCompanyId = async ({companyId}) => {
  const {data:response} = await odoo.post(`${COMPANY_MODEL}/read`, {
    ids: [Number(companyId)],
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