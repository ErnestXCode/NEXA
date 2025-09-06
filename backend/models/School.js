const mongoose = require("mongoose");

const gradeScaleSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  grade: { type: String, required: true },
  remark: { type: String },
});

const classLevelSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Grade 1"
  streams: [{ type: String }], // e.g., ["North", "South"]
});

const feeExpectationSchema = new mongoose.Schema({
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  amount: { type: Number, required: true, default: 0 },
});

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },

    // --- Academic structure ---
    classLevels: {
      type: [classLevelSchema],
      default: () => School.defaultCBCLevels(),
    },
    gradingSystem: {
      type: [gradeScaleSchema],
      default: () => School.defaultGradingSystem(),
    },
    subjects: { type: [String], default: () => School.defaultSubjects() },
    feeExpectations: {
      type: [feeExpectationSchema],
      default: [
        { term: "Term 1", amount: 20000 },
        { term: "Term 2", amount: 18000 },
        { term: "Term 3", amount: 22000 },
      ],
    },

    // --- Optional modules ---
    modules: {
      exams: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      feeTracking: { type: Boolean, default: true },
      communication: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

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
    { min: 0, max: 34, grade: "E", remark: "Fail" },
  ];
};

schoolSchema.statics.defaultCBCLevels = function () {
  return [
    { name: "Pre-Primary 1 (PP1)", streams: [] },
    { name: "Pre-Primary 2 (PP2)", streams: [] },
    { name: "Grade 1", streams: [] },
    { name: "Grade 2", streams: [] },
    { name: "Grade 3", streams: [] },
    { name: "Grade 4", streams: [] },
    { name: "Grade 5", streams: [] },
    { name: "Grade 6", streams: [] },
    { name: "Grade 7 (JSS1)", streams: [] },
    { name: "Grade 8 (JSS2)", streams: [] },
    { name: "Grade 9 (JSS3)", streams: [] },
    { name: "Senior 1", streams: [] },
    { name: "Senior 2", streams: [] },
    { name: "Senior 3", streams: [] },
  ];
};

schoolSchema.statics.defaultSubjects = function () {
  return [
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "Religious Education",
    "Creative Arts",
    "Physical Education",
  ];
};

const School = mongoose.model("School", schoolSchema);
module.exports = School;
