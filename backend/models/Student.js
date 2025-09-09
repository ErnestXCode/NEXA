const mongoose = require("mongoose");
const School = require("./School"); // your School model

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    dateOfBirth: { type: Date, required: true },
    classLevel: {
      type: String,
      required: true,
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },


    stream: {
      type: String,
    },

    subjects: [{ type: String }],

    guardian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    payments: [
      {
        term: {
          type: String,
          enum: ["Term 1", "Term 2", "Term 3"],
          required: true,
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        category: {
          type: String,
          enum: ["payment", "adjustment"],
          required: true,
        },
        type: {
          type: String,
          enum: ["cash", "mpesa", "card"],
          default: "cash",
        },
        note: String,
      },
    ],

    examResults: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        term: String,
        subjects: [{ name: String, score: Number }],
        total: Number,
        average: Number,
        grade: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "suspended", "graduated", "transferred"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ---------------- VALIDATION HOOK ----------------
studentSchema.pre("save", async function (next) {
  try {
    if (!this.school) throw new Error("Student must belong to a school");

    // 1️⃣ Validate classLevel
    const classValidation = await School.validateClassLevel(this.school, this.classLevel);
    if (!classValidation.valid) throw new Error(`Invalid classLevel: ${classValidation.reason}`);

    // 2️⃣ Validate each subject
    for (let subj of this.subjects || []) {
      const subjectValidation = await School.validateSubject(this.school, subj);
      if (!subjectValidation.valid) throw new Error(`Invalid subject "${subj}": ${subjectValidation.reason}`);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Student", studentSchema);
