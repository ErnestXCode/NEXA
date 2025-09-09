const mongoose = require("mongoose");

const gradeScaleSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  grade: { type: String, required: true },
  remark: { type: String },
});

const feeExpectationSchema = new mongoose.Schema({
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  amount: { type: Number, required: true, default: 0 },
});

// fee rule for ranges
const feeRuleSchema = new mongoose.Schema({
  fromClass: { type: String, required: true },
  toClass: { type: String, required: true },
  term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
  amount: { type: Number, required: true },
});

// subjects rule for ranges
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

    // fallback general expectations
    feeExpectations: {
      type: [feeExpectationSchema],
      default: [
        { term: "Term 1", amount: 20000 },
        { term: "Term 2", amount: 18000 },
        { term: "Term 3", amount: 22000 },
      ],
    },

    // feeRules allow ranges like Grade1-Grade3 → amount per term
    feeRules: { type: [feeRuleSchema], default: [] },

    // subjectsByClass allow ranges with custom subject lists
    subjectsByClass: { type: [subjectsRuleSchema], default: [] },

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

// ---------------- STATIC DEFAULTS ----------------
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

// ---------------- UTILITY FUNCTION ----------------
const isClassInRange = (className, fromClass, toClass, allClasses = []) => {
  const idx = allClasses.findIndex((c) => c.name === className);
  const fromIdx = allClasses.findIndex((c) => c.name === fromClass);
  const toIdx = allClasses.findIndex((c) => c.name === toClass);
  if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
  const min = Math.min(fromIdx, toIdx);
  const max = Math.max(fromIdx, toIdx);
  return idx >= min && idx <= max;
};

// ---------------- VALIDATOR STATIC ----------------
schoolSchema.statics.validateClassLevel = async function (schoolId, className) {
  const school = await this.findById(schoolId);
  if (!school) return { valid: false, reason: "School not found" };

  // 1️⃣ Check class exists
  const cls = school.classLevels.find(c => c.name === className);
  if (!cls) return { valid: false, reason: "Class level does not exist" };

  // 2️⃣ Check subjects exist (either class-specific, by range, or global)
  const subjectsByRange = school.subjectsByClass.filter(r =>
    isClassInRange(className, r.fromClass, r.toClass, school.classLevels)
  );
  const subjects = Array.from(new Set([
    ...(cls.subjects || []),
    ...(subjectsByRange.flatMap(r => r.subjects || [])),
    ...(school.subjects || [])
  ]));
  if (!subjects.length) return { valid: false, reason: "No subjects assigned for this class" };

  // 3️⃣ Optional: check fee rules coverage
  const feeRuleExists = school.feeRules.some(r => isClassInRange(className, r.fromClass, r.toClass, school.classLevels));
  if (school.feeRules.length && !feeRuleExists) return { valid: false, reason: "No fee rule covers this class" };

  return { valid: true, subjects };
};


// ---------------- SUBJECT VALIDATION ----------------
/**
 * Validate that a given subject exists for a school, either globally or in any class/range
 * @param {String} schoolId - the School _id
 * @param {String} subject - the subject name to validate
 * @returns {Promise<{ valid: Boolean, reason?: String }>}
 */
schoolSchema.statics.validateSubject = async function (schoolId, subject) {
  const school = await this.findById(schoolId);
  if (!school) return { valid: false, reason: "School not found" };
  if (!subject) return { valid: false, reason: "No subject provided" };

  // 1️⃣ Check global subjects
  if ((school.subjects || []).includes(subject)) return { valid: true };

  // 2️⃣ Check class-specific subjects (if any)
  const classSubjects = school.classLevels.flatMap(c => c.subjects || []);
  if (classSubjects.includes(subject)) return { valid: true };

  // 3️⃣ Check subjects by class range
  const rangeSubjects = school.subjectsByClass.flatMap(r => r.subjects || []);
  if (rangeSubjects.includes(subject)) return { valid: true };

  return { valid: false, reason: "Subject does not exist in this school" };
};


const School = mongoose.model("School", schoolSchema);
module.exports = School;
