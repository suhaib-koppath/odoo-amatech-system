
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// IMPRORT ROUTES PATH 
import fieldMappingRoutes from "./routes/fieldMappingRoutes.js";
import odooWebhookRoutes from "./routes/odooWebhookRoutes.js";
import amatechRoutes from "./routes/amatechRoutes.js";
import connectDB from "./config/connectDB.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB CONNECTION 
connectDB()

// HTTPS certificate and private key
const httpsOptions = {
  key: fs.readFileSync(
    path.join(__dirname, "certs", "localhost+2-key.pem")
  ),
  cert: fs.readFileSync(
    path.join(__dirname, "certs", "localhost+2.pem")
  ),
};

// TEST FILED MAPPING ROUTES
app.use("/api/field-mapping", fieldMappingRoutes);
// ODOO WEBHOOK URLS
app.use("/api/odoo/webhook",odooWebhookRoutes)
// AMA_TECH URLS
app.use("/api/amatech",amatechRoutes)

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HTTPS server is running",
  });
});

// Start HTTPS server
const PORT = process.env.PORT || 5000;

https.createServer(httpsOptions, app).listen(PORT,'0.0.0.0', () => {
  console.log(`HTTPS server running at https://localhost:${PORT}`);
});
