// models/ManualPayment.js
const mongoose = require("mongoose");

const manualPaymentSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  plan: { type: String, required: true }, // Starter, Professional, etc
  amount: { type: Number, required: true },
  mpesaCode: { type: String, required: true, unique: true }, // M-Pesa ref code (must be unique)
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
});

module.exports = mongoose.model("ManualPayment", manualPaymentSchema);
