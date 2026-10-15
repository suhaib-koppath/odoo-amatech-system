// CUSTOMER ROUTES

import createTokens from "../controllers/CreateAmatechToken.js";


import express from "express";
const router = express.Router();

// GET ALL BILL 
router.post("/create-tokens",createTokens)

export default  router;
