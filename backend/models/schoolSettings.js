const mongoose = require("mongoose");

const gradingSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
});

const classLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String }],
});

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    classLevels: [classLevelSchema],
    streams: [{ type: String }],
    gradingSystem: [gradingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolSettings", schoolSettingsSchema);
