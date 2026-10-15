import odoo from "../config/odoo.js";

// മോഡലുകളുടെ URL പാത്തുകൾ എളുപ്പത്തിനായി വേരിയബിളുകളാക്കാം
const PARTNER_MODEL = "/json/2/res.partner";
const COUNTRY_MODEL = "/json/2/res.country";
const PRODUCT_MODEL = "/json/2/product.product";
const TAX_MODEL = "/json/2/account.tax";
const MOVE_MODEL = "/json/2/account.move";

export const createInvoiceFromFtaData = async (payload) => {
  try {
    const detail = payload.detail || {};
    const sellerData = detail.seller || {};

    console.log("1. Checking Partner...");
    // const vatNumber = sellerData.vat_identifier;
    const partnerName = sellerData.name;
    let partnerId = null;

    // let { data: partners } = await odoo.post(`${PARTNER_MODEL}/search_read`, {
    //   domain: [["vat", "=", vatNumber]],
    //   limit: 1,
    //   fields: ["id"],
    // });

    // if ((!partners || partners.length === 0) && vatNumber) {
      const { data: partnersByName } = await odoo.post(`${PARTNER_MODEL}/search_read`, {
        domain: [["name", "ilike", partnerName]],
        limit: 1,
        fields: ["id"],
      });
      let partners = partnersByName;
    // }

    if (partners && partners.length > 0) {
      partnerId = partners[0].id;
    } else {
      console.log("Partner not found, creating new partner...");
      
      const { data: countries } = await odoo.post(`${COUNTRY_MODEL}/search_read`, {
        domain: [["code", "=", sellerData.country_code]],
        limit: 1,
        fields: ["id"],
      });
      const countryId = countries && countries.length > 0 ? countries[0].id : false;

      const { data: newPartner } = await odoo.post(`${PARTNER_MODEL}/create`, {
        vals_list: [{
          name: partnerName,
          vat: vatNumber,
          street: sellerData.address_line_1,
          city: sellerData.city,
          zip: sellerData.post_code,
          country_id: countryId,
          is_company: true,
        }]
      });
      partnerId = Array.isArray(newPartner) ? newPartner[0] : newPartner;
    }

    console.log("2. Processing Lines & Products...");
    const moveLines = [];
    const lines = detail.lines || [];

    for (const line of lines) {
      const itemName = line.item_name;
      let productId = null;

      const { data: products } = await odoo.post(`${PRODUCT_MODEL}/search_read`, {
        domain: [["name", "=", itemName]],
        limit: 1,
        fields: ["id"],
      });

      if (products && products.length > 0) {
        productId = products[0].id;
      } else {
        console.log(`Creating new product: ${itemName}`);
        const { data: newProduct } = await odoo.post(`${PRODUCT_MODEL}/create`, {
          vals_list: [{
            name: itemName,
            type: "consu",
          }]
        });
        productId = Array.isArray(newProduct) ? newProduct[0] : newProduct;
      }

      let vatRate = 0.0;
      if (line.vat_info && line.vat_info.length > 0) {
        vatRate = parseFloat(line.vat_info[0].vat_rate);
      }

      const { data: taxes } = await odoo.post(`${TAX_MODEL}/search_read`, {
        domain: [
          ["amount", "=", vatRate],
          ["type_tax_use", "=", "purchase"] // If it is a customer invoice, change this to "sale".
        ],
        limit: 1,
        fields: ["id"],
      });
      const taxIds = taxes && taxes.length > 0 ? [taxes[0].id] : [];

// Invoice line format using the Odoo One2many command (0, 0, {values}).
      moveLines.push([0, 0, {
        product_id: productId,
        name: line.item_description || itemName,
        quantity: parseFloat(line.invoiced_quantity || 1.0),
        price_unit: parseFloat(line.item_net_price || 0.0),
        tax_ids: taxIds.length > 0 ? [ [6, 0, taxIds] ] : false,
      }]);
    }

    console.log("3. Creating Account Move (Invoice/Credit Note)...");
    const invoiceTypeCode = payload.invoice_type_code;
    const moveType = invoiceTypeCode === "381" ? "in_refund" : "in_invoice";

    const { data: newMove } = await odoo.post(`${MOVE_MODEL}/create`, {
      vals_list: [{
        move_type: moveType,
        partner_id: partnerId,
        invoice_date: payload.issue_date,
        ref: payload.invoice_number,
        invoice_line_ids: moveLines,
      }]
    });

    const moveId = Array.isArray(newMove) ? newMove[0] : newMove;
    console.log(`Success! Created Move ID: ${moveId}`);
    console.log(newMove);
    
    return { success: true, move_id: moveId };

  } catch (error) {
    console.error("Error creating invoice in Odoo:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};