import odoo from "../config/odoo.js";

const INVOICE_MODEL = "/json/2/account.move";

export const getInvoiceByName = async ({ invoiceName, moveType }) => {
    
  const {data:response} = await odoo.post(
    `${INVOICE_MODEL}/search_read`,
    {
      domain: [
        ["name", "=", invoiceName],
        ["move_type", "=", moveType],
      ],
    //   fields: [
    //     "id",
    //     "name",
    //     "type_name",
    // "issue_date",
    //     "move_type",
    //     "state",
    //     "partner_id",
    //     "invoice_date",
    //     "invoice_date_due",
    //     "currency_id",
    //     "invoice_line_ids",
    //     "amount_total",
    //   ],
      limit: 1,
    }
  );
  return response;
  
};

export const getInvoiceById = async ({ invoiceId }) => {
    
  const {data:response} = await odoo.post(
    `${INVOICE_MODEL}/read`,
    {
          ids: [Number(invoiceId)],

    //   fields: [
    //     "id",
    //     "name",
    //     "type_name",
    // "issue_date",
    //     "move_type",
    //     "state",
    //     "partner_id",
    //     "invoice_date",
    //     "invoice_date_due",
    //     "currency_id",
    //     "invoice_line_ids",
    //     "amount_total",
    //   ],
    }
  );
  return Array.isArray(response) ? response[0] : response;
  
};

export const OdooCustomerInvoiceUpdate=async ({ invoiceId, data }) =>{
  try {
    const response = await odoo.post(
      `${INVOICE_MODEL}/write`,
      {
        ids: [invoiceId],
        vals: data,
      }
    );

    // if (response.data?.error) {
    //   console.error("Odoo Error Details:", response.data?.error);
    //   return false;
    // }
    console.log("Update Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Axios Request Failed:");
    console.error(error.response?.data || error.message);
    return false;
  }
}