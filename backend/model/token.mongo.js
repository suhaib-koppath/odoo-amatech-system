import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    access_token: {
      type: String,
      required: true,
    },

    refresh_token: {
      type: String,
      required: true,
    },

    token_type: {
      type: String,
      default: "Bearer",
    },

    expires_in: {
      type: Number,
      required: true,
    },

    expires_at: {
      type: Number,
      required: true,
    },
    ref: {
      type: String,
      required: true,
    },
    organization: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },

    client_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
const TcaToken =  mongoose.model("TcaToken", tokenSchema);

export default  TcaToken;