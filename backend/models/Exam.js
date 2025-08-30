const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classLevel: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
