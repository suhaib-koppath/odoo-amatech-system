import { Router } from "express";
import CustomerInvoiceController from "../controllers/CustomerInvoiceController.js";
import InvoiceMap from "../middleware/invoiceMap.js";
import authMiddleware from "../middleware/authMiddileware.js";

const router = Router();
router.use(authMiddleware)
router.post("/customer-invoice-created",InvoiceMap, CustomerInvoiceController);

export default router;