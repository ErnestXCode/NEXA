// models/Exam.js
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  type: { type: String, enum: ["Opening", "Midterm", "Endterm"], required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  date: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
