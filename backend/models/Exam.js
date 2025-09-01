const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  classes: [{ type: String, required: true }],
  date: { type: Date, required: true },
  maxScore: { type: Number, default: 100 }, // keep for compatibility
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
