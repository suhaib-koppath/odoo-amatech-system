import { fetchBuyerByPartnerId } from "../services/odooBuyerService.js";
import { fetchInvoiceByName } from "../services/odooInvoiceService.js";
import { fetchSellerByCompanyId } from "../services/odooSellerService.js";
import { mapinvoiceToTca } from "../utils/filedMapping.js";

export const mapInvoice = async (req, res) => {
  try {
    const {name:invoiceName,move_type:moveType} = req.body;

    //     moveType values:
    //     - out_invoice — Customer Invoice
    //     - out_refund — Customer Credit Note
    //     - in_invoice — Vendor Bill
    //     - in_refund — Vendor Credit Note

    if (!invoiceName || !moveType) {
      return res.status(400).json({
        success: false,
        message: "Odoo invoice invoiceName(name) and moveType(move_type) are required",
      });
    }

    const invoice = await fetchInvoiceByName({invoiceName,moveType}); 
    console.log("invoice fetch");
    const seller = await fetchSellerByCompanyId({companyId:invoice.company_id[0]})
    console.log("seller fetch");
    const buyer = await fetchBuyerByPartnerId({partnerId:invoice.partner_id[0]})
    console.log("buyer fetch");

    const mappedInvoice =await mapinvoiceToTca({invoice,seller,buyer});

    return res.status(200).json({
      success: true,
      message: "Invoice mapped successfully",
      check:invoice,
      data: mappedInvoice,
    });
  } catch (error) {
    console.error("MapInvoice Error = ",error.response?.data || error.message );
    return res.status( error.response?.status || 500).json({
      success: false,
      message: "Invoice mapping failed",
      error: error.message,
    });
  }
};