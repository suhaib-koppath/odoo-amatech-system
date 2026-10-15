
import axios from "axios";
import "dotenv/config";

const tca = axios.create({
  baseURL: process.env.TCA_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default  tca;
