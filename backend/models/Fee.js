const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["payment", "adjustment"], default: "payment" },
  note: { type: String },
  date: { type: Date, default: Date.now },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
