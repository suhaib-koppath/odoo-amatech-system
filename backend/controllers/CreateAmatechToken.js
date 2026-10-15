import tca from "../config/tca.js";
import { saveOrUpdateTcaToken } from "../repositories/mongoDbRepository.js";

const createTokens = async (req, res) => {
  try {
    const { data } = await tca.post("/oauth/token", {
      client_id: process.env.TCA_CLIENT_ID,
      client_secret: process.env.TCA_CLIENT_SECRET,
    });

    const tokenData = {
      ...data,
      expires_at: Date.now() + (data.expires_in * 1000 - 3000),
    };

    await saveOrUpdateTcaToken({data:tokenData});
    return res.status(200).json({
      success: true,
      tokenData,
      message: "Token Generated",
    });
  } catch (error) {
    console.error("Get Invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to Tokens",
      error: error.response?.data || error.message,
    });
  }
};

export default createTokens
