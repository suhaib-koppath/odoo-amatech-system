import tca from "../config/tca";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const receiveTcaData = (req, res) => {
  const { token } = req.user;
  const { event, invoice_id, invoice_name } = req.body || {};

  if (!invoice_id) {
    return res.status(400).json({
      success: false,
      message: "Missing invoice_id in webhook payload",
    });
  }

  if (event !== "invoice.received") {
    return res.status(201);
    // .json({
    //   success: true,
    //   message: `Ignored event: ${event}`,
    // });
  }

  console.log(
    `Webhook received: ${event} for Invoice: ${invoice_name} (${invoice_id})`,
  );
  res.status(200).json({
    success: true,
    message: "Webhook received and acknowledged",
  });

  setImmediate(async () => {
    try {
      let TcaInvoice = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        await sleep(3000);

        try {
            
          console.log(
            `🔄 Fetching invoice ${invoice_id} (Attempt ${attempt})...`,
          );
          TcaInvoice = await tca.get(`/invoices/${invoice_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (TcaInvoice.data) break;
        } catch (fetchErr) {
          console.warn(
            `⚠️ Attempt ${attempt} failed:`,
            fetchErr.response?.data || fetchErr.message,
          );
        }
      }

      if (!TcaInvoice || !TcaInvoice?.data) {
        console.error("❌ Could not fetch invoice after 3 attempts.");
        return;
      }

      console.log("✅ Successfully fetched invoice from TCA:", TcaInvoice.data.name);

      // Vendor
    //   const vender = await mapOdooVender(TcaInvoice.detail.seller);
    //   console.log("✅ Mapped Vendor:", vender);
    //   const products = await mapOdooProduct(TcaInvoice.detail.lines);
    //   console.log("✅ Mapped Products:", products);
    } catch (bgError) {
      console.error(
        "🔥 Background Webhook Processing Error:",
        bgError.response?.data || bgError.message || bgError,
      );
    }
  });
};

export default receiveTcaData;
