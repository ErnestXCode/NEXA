const mongoose = require("mongoose");

const gradeScaleSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  grade: { type: String, required: true },
  remark: { type: String },
});

const feeExpectationSchema = new mongoose.Schema({
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  academicYear: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const feeRuleSchema = new mongoose.Schema({
  fromClass: { type: String, required: true },
  toClass: { type: String, required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  academicYear: { type: String, required: true },
  amount: { type: Number, required: true },
});

const subjectsRuleSchema = new mongoose.Schema({
  fromClass: { type: String, required: true },
  toClass: { type: String, required: true },
  subjects: [{ type: String }],
});

const classLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  streams: [{ type: String }],
  feeExpectations: { type: [feeExpectationSchema], default: [] },
});

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },

    classLevels: {
      type: [classLevelSchema],
      default: () => School.defaultCBCLevels(),
    },
    gradingSystem: {
      type: [gradeScaleSchema],
      default: () => School.defaultGradingSystem(),
    },
    subjects: { type: [String], default: () => School.defaultSubjects() },

    // global expectations
    feeExpectations: {
      type: [feeExpectationSchema],
      default: () => School.defaultFeeExpectations(),
    },

    feeRules: { type: [feeRuleSchema], default: [] },
    subjectsByClass: { type: [subjectsRuleSchema], default: [] },

    modules: {
      exams: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      feeTracking: { type: Boolean, default: true },
      communication: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

schoolSchema.statics.defaultFeeExpectations = function () {
  const year = new Date().getFullYear();
  return [
    { term: "Term 1", academicYear: `${year}/${year + 1}`, amount: 20000 },
    { term: "Term 2", academicYear: `${year}/${year + 1}`, amount: 18000 },
    { term: "Term 3", academicYear: `${year}/${year + 1}`, amount: 22000 },
  ];
};

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
    { name: "PP1", streams: [] },
    { name: "PP2", streams: [] },
    { name: "Grade 1", streams: [] },
    { name: "Grade 2", streams: [] },
    { name: "Grade 3", streams: [] },
    { name: "Grade 4", streams: [] },
    { name: "Grade 5", streams: [] },
    { name: "Grade 6", streams: [] },
    { name: "Grade 7", streams: [] },
    { name: "Grade 8", streams: [] },
    { name: "Grade 9", streams: [] },
    { name: "Grade 10", streams: [] },
  ];
};

schoolSchema.statics.defaultCBCSubjectsByClass = function () {
  return [
    {
      fromClass: "PP1",
      toClass: "PP1",
      subjects: [
        "Language Activities",
        "Mathematical Activities",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Environmental Activities",
      ],
    },
    {
      fromClass: "PP2",
      toClass: "PP2",
      subjects: [
        "Language Activities",
        "Mathematical Activities",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Environmental Activities",
      ],
    },
    {
      fromClass: "Grade 1",
      toClass: "Grade 3",
      subjects: [
        "English",
        "Kiswahili",
        "Mathematical Activities",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Environmental Activities",
      ],
    },
    {
      fromClass: "Grade 4",
      toClass: "Grade 4",
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Social Studies",
        "Science & Technology",
        "Agriculture",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Arabic",
        "French",
      ],
    },
    {
      fromClass: "Grade 5",
      toClass: "Grade 6",
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Social Studies",
        "Science & Technology",
        "Agriculture",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Arabic",
      ],
    },
    {
      fromClass: "Grade 7",
      toClass: "Grade 8",
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Agriculture",
        "Pre-Technical Studies",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Arabic",
      ],
    },
    {
      fromClass: "Grade 9",
      toClass: "Grade 9",
      subjects: [
        "English",
        "Kiswahili",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Agriculture",
        "Pre-Technical Studies",
        "Christian Religious Education",
        "Islamic Religious Education",
        "Arabic",
        "French",
      ],
    },
  ];
};


schoolSchema.statics.defaultSubjects = function () {
  // Get all subjects from CBC mapping
  const allCBCSubjects = School.defaultCBCSubjectsByClass()
    .flatMap(rule => rule.subjects);

  // Add extra global subjects
  const extras = ["Creative Arts", "Physical Education"];

  // Deduplicate + return sorted for consistency
  return [...new Set([...allCBCSubjects, ...extras])].sort();
};



schoolSchema.statics.currentAcademicYear = function () {
  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
};

const School = mongoose.model("School", schoolSchema);
module.exports = School;
