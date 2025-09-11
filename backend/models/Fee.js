const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  academicYear: { type: String, required: true }, // new
  classLevel: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["payment", "adjustment"], default: "payment" },
  method: { type: String, enum: ["cash", "mpesa", "card"], default: "cash" },
  note: { type: String },
  date: { type: Date, default: Date.now },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  receiptGenerated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
