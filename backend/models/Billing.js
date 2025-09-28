const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    merchant_ref: { type: String, required: true, unique: true }, // UUID from Pesapal
    plan: { type: String, required: true }, // e.g. "basic", "premium"
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
