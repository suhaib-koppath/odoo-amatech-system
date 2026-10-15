
import { createInvoice } from "../repositories/mongoDbRepository.js";
import { getInvoiceById } from "../repositories/odooInvoiceRepository.js";
import { fetchBuyerByPartnerId } from "../services/odooBuyerService.js";
import { fetchSellerByCompanyId } from "../services/odooSellerService.js";
import { mapinvoiceToTca } from "../utils/filedMapping.js";

const InvoiceMap = async (req, res, next) => {
  try {
    console.log("Webhook Callback");
    console.log(req.body);

    const { token } = req.user;
    const { _action, _id: invoiceId } = req.body;

    if (!token || !invoiceId) {
      res.status(400).json({
        message: "failed",
        error: "invoiceId (_id) or token is not founded",
      });
    }

    const invoice = await getInvoiceById({ invoiceId });
    console.log("invoice fetch");
    const seller = await fetchSellerByCompanyId({
      companyId: invoice.company_id[0],
    });
    console.log("seller fetch");
    const buyer = await fetchBuyerByPartnerId({
      partnerId: invoice.partner_id[0],
    });
    console.log("buyer fetch");
    const formatInvoice = await mapinvoiceToTca({ invoice,seller,buyer });

    await createInvoice({
      odooInvoiceId: invoice.id,
      odooInvoiceCreateDate: invoice?.invoice_date,
      odooInvoiceName: invoice?.name,
      type:invoice?.move_type
    });

console.log(formatInvoice);

    req.user = {
      token,
      invoice:formatInvoice,
      invoiceId: invoice.id,
    };
    next();
    // res.status(203).json({
    //   formatInvoice
    // })
  } catch (error) {
    res.status(400).json({
      message: "failed",
      error: error.response?.data || error.message,
    });
  }
};

export default InvoiceMap;
