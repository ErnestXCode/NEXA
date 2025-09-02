const mongoose = require("mongoose");

const gradeScaleSchema = new mongoose.Schema({
  min: { type: Number, required: true },  // e.g., 80
  max: { type: Number, required: true },  // e.g., 100
  grade: { type: String, required: true }, // e.g., "A"
  remark: { type: String } // e.g., "Excellent"
});

const classLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g., "Grade 1" or "Form 2"
  streams: [{ type: String }]              // e.g., ["North", "South"] or ["A", "B"]
});

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String },

  // --- Academic structure ---
  classLevels: [classLevelSchema], // all grades + streams
  gradingSystem: [gradeScaleSchema], // default is Kenyan system

  // --- Optional extras ---
  modules: {
    exams: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    feeTracking: { type: Boolean, default: true },
    communication: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Kenyan default grading system
schoolSchema.statics.defaultGradingSystem = function () {
  return [
    { min: 80, max: 100, grade: "A", remark: "Excellent" },
    { min: 75, max: 79, grade: "A-", remark: "Very Good" },
    { min: 70, max: 74, grade: "B+", remark: "Good" },
    { min: 65, max: 69, grade: "B", remark: "Above Average" },
    { min: 60, max: 64, grade: "B-", remark: "Average" },
    { min: 55, max: 59, grade: "C+", remark: "Satisfactory" },
    { min: 50, max: 54, grade: "C", remark: "Fair" },
    { min: 45, max: 49, grade: "C-", remark: "Below Average" },
    { min: 40, max: 44, grade: "D+", remark: "Weak" },
    { min: 35, max: 39, grade: "D", remark: "Poor" },
    { min: 0, max: 34, grade: "E", remark: "Fail" }
  ];
};

module.exports = mongoose.model("School", schoolSchema);
