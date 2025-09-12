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

    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

    stream: { type: String },
    subjects: [{ type: String }],
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 💰 Payments made
    payments: [
      {
        academicYear: { type: String, required: true }, // 🔹 string format 2025/2026
        term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        category: { type: String, enum: ["payment", "adjustment"], required: true },
        type: { type: String, enum: ["cash", "mpesa", "card", "bank"], default: "cash" },
        note: String,
      },
    ],

    // 📊 Fee expectations (student-level overrides if any)
    feeStructures: [
      {
        academicYear: { type: String, required: true },
        term: { type: String, enum: ["Term 1", "Term 2", "Term 3"], required: true },
        expected: { type: Number, required: true },
      },
    ],

    // 📚 Exam results
    examResults: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        academicYear: { type: String }, // 🔹 added
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

module.exports = mongoose.model("Student", studentSchema);
