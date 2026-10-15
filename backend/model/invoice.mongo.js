import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema(
  {
    odooInvoiceId: {
      type: Number,
      default: null,
    },

    odooInvoiceCreateDate: {
      type: Date,
      default: null,
    },

    odooInvoiceName: {
      type: String,
      default: null,
    },

    platformInvoiceName: {
      type: String,
      default: null,
    },

    platformInvoiceId: {
      type: String,
      default: null,
    },

    platformCreatedData: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ["out_invoice", "out_refund", "in_invoice", "in_refund"],
      default:null
    },
    status: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
