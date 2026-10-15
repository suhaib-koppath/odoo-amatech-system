import { getInvoiceProductDetailsById } from "../repositories/odooInvoiceProductDetailsRepository.js";
import { getProductDetailsById } from "../repositories/odooProductDetailsRepository.js";

export const fetchInvoiceLinesByIds = async ({ invoice }) => {
  const lines = [];
  for (const line_id of invoice.invoice_line_ids) {
    const invoiceLineIdItem = await getInvoiceProductDetailsById({
      id: line_id,
    });
    
    const product = await getProductDetailsById({
      productId: invoiceLineIdItem.product_id[0],
    });

    const itemNetPrice =
      (invoiceLineIdItem.price_unit * (100 - invoiceLineIdItem.discount)) / 100;
    const lineNetAmount =
      invoiceLineIdItem.quantity *
      invoiceLineIdItem.price_unit *
      (1 - invoiceLineIdItem.discount / 100);


    lines.push({
      line_id: Number(invoiceLineIdItem.id).toFixed(0) || null,
      note: "note",
      invoiced_quantity: Number(invoiceLineIdItem.quantity).toFixed(2),
      invoiced_quantity_unit_of_measure_code: "EA",
      line_net_amount: Number(lineNetAmount).toFixed(2),
      purchase_order_line_reference:null,
        // sales_order_lines?.[0]?.display_name || null,
      item_net_price: Number(itemNetPrice).toFixed(2) || null,
      item_price_base_quantity: product?.base_unit_count
        ? Number(product?.base_unit_count).toFixed(2)
        : "1",
      item_price_base_quantity_unit_of_measure_code: "EA",
      item_name: product?.name ||null,
      item_description: "goods description",
      item_sellers_identifier: invoiceLineIdItem.company_id[1],
      item_country_of_origin: "AE",
      line_amount_in_aed: Number(invoiceLineIdItem.price_subtotal).toFixed(2),

      vat_line_amount_in_aed: Number(
        invoiceLineIdItem.price_total - invoiceLineIdItem.price_subtotal,
      ).toFixed(2),
      vat_info: [
        {
          vat_category_code: "S",
          vat_rate: "5.00",
          tax_scheme: "VAT",
        },
      ],
      // classifications: [
      //   {
      //     classification_identifier: "49019900",
      //     classification_identifier_scheme: "HS",
      //     classification_identifier_scheme_version: "2022",
      //   },
      // ],
    });
  }
  if (!lines || lines.length === 0) {
    throw new Error("Invoice not found");
  }
  return lines;
};

function getTypeItem(type) {
  switch (type) {
    case "goods" || "Goods":
      return "G";
    case "services" || "Services":
      return "S";
    case "both" || "Both":
      return "B";
    default:
      return null;
  }
}
