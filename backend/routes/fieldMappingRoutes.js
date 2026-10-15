import express from "express";
import { mapInvoice } from "../controllers/fieldMappingController.js";

const router = express.Router();

router.post("/map-invoice", mapInvoice);

export default router;