import Invoice from "../model/invoice.mongo.js";
import TcaToken from "../model/token.mongo.js";

export const saveOrUpdateTcaToken = async ({ data}) => {
  const ref = process.env.TCA_TOKES_REF

  if (!ref) throw new Error("ref is not exist");

  const token = await TcaToken.findOneAndUpdate(
    {
      ref: ref,
    },
    {
      $set: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        expires_at: data.expires_at,
        organization: data.organization,
        client_name: data.client_name,
        ref: ref,
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
  return token;
};

export const getTcaToken = async () => {
  const ref = process.env.TCA_TOKES_REF

  if (!ref) throw new Error("ref is not exist");
  const token = await TcaToken.findOne({
    ref,
  });
  console.log(token.organization.name);

  return token;
};

export const createInvoice = async ({
  odooInvoiceId,
  odooInvoiceCreateDate,
  odooInvoiceName,
  platformInvoiceId,
  platformSentDate,
  type
}) => {
  const existingInvoice = await Invoice.findOne({
    odooInvoiceId,
  });

  if (existingInvoice?.status == "complete") {
    throw new Error("Invoice Already Existed");
  } else if (existingInvoice?.status == "pending") {
    return;
  }

  const invoice = await Invoice.create({
    odooInvoiceId,
    odooInvoiceCreateDate,
    odooInvoiceName,
    platformInvoiceId,
    platformSentDate,
    type
  });

  return invoice;
};

export const updateDbInvoiceById = async (odooInvoiceId, data) => {
  await Invoice.findOneAndUpdate(
    { odooInvoiceId },
    { $set: data },
    { returnDocument: "after" },
  );
};
