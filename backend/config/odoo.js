import axios from "axios";
import "dotenv/config";

const odoo = axios.create({
  baseURL: process.env.ODOO_URL,
  headers: {
    Authorization: `bearer ${process.env.ODOO_API_KEY}`,
    "Content-Type": "application/json",
    "X-Odoo-Database": process.env.ODOO_DATABASE,
  },
});

export default odoo
