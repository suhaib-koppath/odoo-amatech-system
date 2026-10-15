// ACCOUNT RECEVABLE CONTROLLERS

import axios from "axios";
import tca from "../config/tca.js";
import { updateDbInvoiceById } from "../repositories/mongoDbRepository.js";
import { OdooCustomerInvoiceUpdate } from "../repositories/odooInvoiceRepository.js";


function replaceWhitespaceWithUnderscore(text) {
  // Replaces all types of whitespace (spaces, tabs, newlines) with an underscore
  return text.replace(/[\s/]+/g, "_");
}

const CustomerInvoiceController = async (req, res) => {
  try {
    const { invoice, token, invoiceId } = req.user;
    if (!invoice.name) throw new Error("Odoo Invoices Is Not Founded");

    console.log(invoice.name);

    // STEP 1
    const { data: fileUploadingSlot } = await tca.post(
      "/documents",
      {
        name: `${replaceWhitespaceWithUnderscore(invoice.name)}`,
        extension: "json",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("STEP 1 COMPLETED");

    // STEP 2
    const { path: filePath, upload_url: uploadUrl } = fileUploadingSlot;

    await axios.put(uploadUrl, invoice);
    console.log("STEP 2 COMPLETED");

    // STEP 3
    const { data: responseInvoice } = await tca.post(
      "/invoices",
      {
        ...invoice,
        source: filePath,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("STEP 3 COMPLETED");
    console.log(responseInvoice);

    await updateDbInvoiceById(invoiceId, {
      status: "complete",
      platformInvoiceId: responseInvoice.id,
      platformSentDate: responseInvoice.created_at,
    });

    await OdooCustomerInvoiceUpdate({
      invoiceId: invoiceId,
      data: { x_studio_inovice_send: true },
    });
    return res.status(200).json({
      success: true,
      message: "success",
      invoice

    });
  } catch (error) {
    console.error("Get Invoices error:");
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Invoices",
      error: error.response?.data || error.message || "",
    });
  }
};

export default CustomerInvoiceController;
