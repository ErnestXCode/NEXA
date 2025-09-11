const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  academicYear: { type: String, required: true }, // new
  date: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
