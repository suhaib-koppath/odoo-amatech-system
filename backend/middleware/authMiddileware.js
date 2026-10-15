import tca from "../config/tca.js";
import { getTcaToken, saveOrUpdateTcaToken } from "../repositories/mongoDbRepository.js";
import isTokenValid from "../utils/isTokenValid.js";


const authMiddleware = async (req, res, next) => {
  const fileData = await getTcaToken();

  const isValid = await isTokenValid(fileData.expires_at);
  if (
    !fileData?.expires_at ||
    !fileData?.refresh_token ||
    !fileData?.access_token
  )
    res.status(401).json({
      message: "please generate your access token",
    });

  if (!isValid) {
    const { data } = await tca.post("/oauth/token/refresh", {
      refresh_token: fileData.refresh_token,
    });

    const tokenData = {
      ...data,
      expires_at: Date.now() + data.expires_in * 1000,
    };
    await saveOrUpdateTcaToken({ data: tokenData });

    req.user = {
      token: tokenData.access_token
    };
    next();
  } else {
    req.user = {
      token: fileData.access_token
    };
    next();
  }
};

export default authMiddleware;
