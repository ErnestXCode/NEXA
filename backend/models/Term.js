const mongoose = require("mongoose");

const termSchema = new mongoose.Schema({
  name: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  academicYear: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  classFees: [
    {
      classLevel: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Term", termSchema);
