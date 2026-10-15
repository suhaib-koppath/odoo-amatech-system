import { getInvoiceByName } from "../repositories/odooInvoiceRepository.js";

export const fetchInvoiceByName = async ({invoiceName,moveType}) => {
  const invoices = await getInvoiceByName({invoiceName,moveType});

  if (!invoices || invoices.length === 0) {
    throw new Error("Invoice not found");
  }

  return invoices[0];
};