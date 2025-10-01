const mongoose = require("mongoose");

const feeTransactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  academicYear: { type: String, required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },

  amount: { type: Number, required: true },
 type: { 
  type: String, 
  enum: ["payment", "adjustment", "fine", "refund", "opening"], 
  default: "payment" 
},
  method: { type: String, enum: ["cash", "mpesa", "card", "bank", "system"], default: "cash" },

  note: String,
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  receiptNo: { type: String }, // optional, can be auto-generated
}, { timestamps: true });

module.exports = mongoose.model("FeeTransaction", feeTransactionSchema);
