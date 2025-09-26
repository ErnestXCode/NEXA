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
    // add payment stuff like paybill as optional
    email: { type: String },

    paidPesapal: { type: Boolean, default: false },
    isPilotSchool: {type: Boolean, default: false},
    isFreeTrial: {type: Boolean, default: false},

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
    subjectsByClass: {
      type: [subjectsRuleSchema],
      default: () => School.defaultCBCSubjectsByClass(),
    },

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
    { min: 90, max: 100, grade: "EE1", remark: "Exceeding Expectation - High" },
    { min: 75, max: 89, grade: "EE2", remark: "Exceeding Expectation - Low" },
    { min: 58, max: 74, grade: "ME1", remark: "Meeting Expectation - High" },
    { min: 41, max: 57, grade: "ME2", remark: "Meeting Expectation - Low" },
    {
      min: 31,
      max: 40,
      grade: "AE1",
      remark: "Approaching Expectation - High",
    },
    { min: 21, max: 30, grade: "AE2", remark: "Approaching Expectation - Low" },
    { min: 11, max: 20, grade: "BE1", remark: "Below Expectation - High" },
    { min: 1, max: 10, grade: "BE2", remark: "Below Expectation - Low" },
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
  const allCBCSubjects = School.defaultCBCSubjectsByClass().flatMap(
    (rule) => rule.subjects
  );

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
