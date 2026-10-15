import odoo from "../config/odoo.js";


const MODEL = "/json/2/account.payment";
async function getIvoicePaymnetDetails({paymentId}) {
  const { data:response } = await odoo.post(`${MODEL}/read`, {
    ids: paymentId,
    // fields: [
    //   "id",
    //   "name",
    //   "payment_type", // 'inbound' or 'outbound'
    //   "amount",
    //   "date",
    //   "journal_id",
    //   "payment_method_line_id",
    //   "state",
    // ],
  });

  // Odoo read method returns an array of records
  return Array.isArray(response) ? response[0] : response ;
}

 
export default  getIvoicePaymnetDetails

