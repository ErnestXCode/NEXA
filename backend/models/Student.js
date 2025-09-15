const mongoose = require("mongoose");
const School = require("./School");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    dateOfBirth: { type: Date, required: true },
    classLevel: { type: String, required: true },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    stream: { type: String },
    subjects: [{ type: String }],
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 💰 Payments made
    payments: [
      {
        academicYear: { type: String, required: true }, // 🔹 string format 2025/2026
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
          enum: ["cash", "mpesa", "card", "bank"],
          default: "cash",
        },
        note: String,
      },
    ],

    // 📊 Fee expectations (student-level overrides if any)
    feeStructures: [
      {
        academicYear: { type: String, required: true },
        term: {
          type: String,
          enum: ["Term 1", "Term 2", "Term 3"],
          required: true,
        },
        expected: { type: Number, required: true },
      },
    ],

    // 📚 Exam results
    // 📚 Exam results
    examResults: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        academicYear: { type: String },
        term: String,
        subjects: [
          {
            name: String,
            score: Number,
            grade: String, // 🔹 CBC grade e.g. ME1
            remark: String, // 🔹 remark from grading system
          },
        ],
        // Transitional totals (for schools still used to 8-4-4 style)
        total: Number,
        average: Number,
        grade: String, // overall grade (optional in CBC, keep for now)
        remark: String, // overall remark
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

module.exports = mongoose.model("Student", studentSchema);
