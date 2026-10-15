// CUSTOMER ROUTES

import receiveTcaData from "../controllers/AmatechWebhookController.js";
import createTokens from "../controllers/CreateAmatechToken.js";


import express from "express";
import authMiddleware from "../middleware/authMiddileware.js";
const router = express.Router();

 
router.post("/create-tokens",createTokens)
router.post("/webhook",authMiddleware,receiveTcaData)

export default  router;
