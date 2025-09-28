const mongoose = require('mongoose')

const PaymentProofSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: Number,
  method: { type: String, enum: ["mpesa", "bank", "cash"] },
  txnCode: String,
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentProof', PaymentProofSchema)
